import { TranslationEngineRegistry } from './engine';
import {
	collectTranslatables,
	applyTranslation,
	restoreOriginals,
} from './dom-walker';
import { protectTerms, restoreTerms } from './protect-terms';
import { applyCasePattern } from './case-utils';

const MUTATION_DEBOUNCE_MS = 200;

/**
 * Owns the page's translation state: which language is active, the cache of
 * original DOM values, and reacting to dynamically added content (Elementor
 * popups, AJAX, mobile menus, etc.) via a debounced `MutationObserver`.
 *
 * Always translates from the original source text (never chains
 * FR → EN → ES) since `registry.originals` keeps the pristine values for
 * the whole lifetime of the page.
 *
 * Translation pipeline for each collected string:
 * original text → protect terms → translate → restore terms → fix case → DOM.
 */
export class TranslationController {
	/**
	 * @param {Object} config Localized `SimpleTradConfig` object.
	 */
	constructor( config ) {
		this.config = config;
		this.engines = new TranslationEngineRegistry(
			config.fallbackModelsUrl
		);
		this.registry = new Map(); // node → Map(kind → original value)
		this.currentLanguage = config.sourceLanguage;
		this.listeners = new Set();
		this.observer = null;
		this.mutationQueue = [];
		this.mutationTimer = null;
	}

	/**
	 * Subscribes to state changes (`{ language, status }`), used by the
	 * switcher UI to reflect loading/active states.
	 *
	 * @param {Function} listener Callback.
	 * @return {Function} Unsubscribe function.
	 */
	onStateChange( listener ) {
		this.listeners.add( listener );
		return () => this.listeners.delete( listener );
	}

	emit( state ) {
		this.listeners.forEach( ( listener ) => listener( state ) );
	}

	/**
	 * Starts observing the document for dynamically inserted content once
	 * the initial translation pass (if any) has completed.
	 */
	startObserving() {
		if ( this.observer ) {
			return;
		}

		this.observer = new MutationObserver( ( mutations ) => {
			mutations.forEach( ( mutation ) => {
				mutation.addedNodes.forEach( ( node ) => {
					if (
						node.nodeType === Node.ELEMENT_NODE ||
						node.nodeType === Node.TEXT_NODE
					) {
						this.mutationQueue.push( node );
					}
				} );
			} );

			if ( this.mutationQueue.length ) {
				clearTimeout( this.mutationTimer );
				this.mutationTimer = setTimeout(
					() => this.flushMutationQueue(),
					MUTATION_DEBOUNCE_MS
				);
			}
		} );

		this.observer.observe( document.body, {
			childList: true,
			subtree: true,
		} );
	}

	/**
	 * Translates any newly queued nodes into the currently active language.
	 * A no-op while the source language is active, which keeps the observer
	 * cheap and avoids retranslating content that is already correct.
	 */
	async flushMutationQueue() {
		const nodes = this.mutationQueue.splice( 0 );

		if (
			this.currentLanguage === this.config.sourceLanguage ||
			! nodes.length
		) {
			return;
		}

		for ( const node of nodes ) {
			if ( node.isConnected ) {
				// eslint-disable-next-line no-await-in-loop
				await this.translateRoot( node, this.currentLanguage );
			}
		}
	}

	/**
	 * Translates a DOM subtree into `targetLanguage`, applying results in
	 * place. Safe to call on the whole document or on a single freshly
	 * inserted node.
	 *
	 * @param {Node}   root           Root node to scan and translate.
	 * @param {string} targetLanguage Target BCP 47 code.
	 * @return {Promise<boolean>} Whether translation actually happened.
	 */
	async translateRoot( root, targetLanguage ) {
		const groups = collectTranslatables(
			root,
			this.config.noTranslateClass,
			this.config.excludedSelectors,
			this.registry
		);

		if ( ! groups.size ) {
			return true;
		}

		const resolved = await this.engines.resolve(
			this.config.sourceLanguage,
			targetLanguage
		);

		if ( ! resolved ) {
			return false;
		}

		const texts = Array.from( groups.keys() );

		// Protected terms and case correction sit *above* the
		// TranslationEngine abstraction: engines only ever see placeholder
		// text and never know about brands/casing at all. Always translate
		// from the pristine source text (never the previously translated
		// result), matching the rest of the plugin's FR → EN / FR → ES
		// (never FR → EN → ES) guarantee.
		const protectedEntries = texts.map( ( text ) =>
			protectTerms( text, this.config.protectedTerms || [] )
		);
		const textsToTranslate = protectedEntries.map(
			( entry ) => entry.text
		);

		let translated;

		try {
			translated = await resolved.engine.translateBatch(
				textsToTranslate,
				this.config.sourceLanguage,
				targetLanguage,
				( ratio ) =>
					this.emit( {
						language: targetLanguage,
						status: 'downloading',
						progress: ratio,
					} )
			);
		} catch ( error ) {
			// Browser gesture/permission errors, network errors, etc. must
			// never break the page: keep whatever was already displayed.
			if ( window.WP_DEBUG || process.env.NODE_ENV !== 'production' ) {
				// eslint-disable-next-line no-console
				console.warn(
					'SimpleTrad: translation failed, keeping existing content.',
					error
				);
			}
			return false;
		}

		texts.forEach( ( text, index ) => {
			const restored = restoreTerms(
				translated[ index ],
				protectedEntries[ index ].restoreMap
			);
			const finalText = applyCasePattern( text, restored );

			applyTranslation( groups.get( text ), finalText );
		} );

		return true;
	}

	/**
	 * Switches the whole page to `targetLanguage`, or restores the original
	 * source content when `targetLanguage` is the source language itself.
	 *
	 * @param {string} targetLanguage Target BCP 47 code.
	 * @return {Promise<boolean>} Whether the switch succeeded.
	 */
	async setLanguage( targetLanguage ) {
		if ( targetLanguage === this.config.sourceLanguage ) {
			restoreOriginals( this.registry );
			this.currentLanguage = this.config.sourceLanguage;
			this.emit( { language: this.currentLanguage, status: 'idle' } );
			return true;
		}

		this.emit( { language: targetLanguage, status: 'loading' } );

		const success = await this.translateRoot(
			document.body,
			targetLanguage
		);

		if ( success ) {
			this.currentLanguage = targetLanguage;
			this.startObserving();
			this.emit( { language: targetLanguage, status: 'idle' } );
		} else {
			this.emit( {
				language: this.currentLanguage,
				status: 'unavailable',
				requestedLanguage: targetLanguage,
			} );
		}

		return success;
	}
}
