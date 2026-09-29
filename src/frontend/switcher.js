import { TranslationController } from './translation/controller';
import { detectPreferredLanguage } from './locale-detect';
import { getLangFromUrl, setLangInUrl, propagateLangToLinks } from './url-lang';

/**
 * Wires every `[data-simpletrad-switcher]` block on the page to a single
 * shared `TranslationController`, resolves the initial language (URL param
 * → browser detection → source language) and keeps every switcher instance
 * (in case the shortcode is used more than once) in sync.
 */
function bootSwitcher() {
	const config = window.SimpleTradConfig;

	if ( ! config ) {
		return;
	}

	const switchers = document.querySelectorAll( '[data-simpletrad-switcher]' );

	if ( ! switchers.length ) {
		return;
	}

	const availableCodes = config.targetLanguages.map( ( lang ) => lang.code );
	const controller = new TranslationController( config );

	const setButtonsState = ( { language, status } ) => {
		switchers.forEach( ( switcherEl ) => {
			switcherEl
				.querySelectorAll( '.simpletrad-language' )
				.forEach( ( button ) => {
					const code = button.getAttribute( 'data-simpletrad-lang' );
					const isActive = code === language;

					button.classList.toggle( 'is-active', isActive );
					button.setAttribute(
						'aria-pressed',
						isActive ? 'true' : 'false'
					);
					button.classList.toggle(
						'is-loading',
						isActive && status === 'loading'
					);
				} );
		} );
	};

	controller.onStateChange( setButtonsState );

	const activateLanguage = async ( code ) => {
		const changed = await controller.setLanguage( code );

		if ( changed ) {
			const urlLang = code === config.sourceLanguage ? null : code;
			setLangInUrl( urlLang, config.queryParam );
			propagateLangToLinks( urlLang, config.queryParam );
		}
	};

	switchers.forEach( ( switcherEl ) => {
		switcherEl
			.querySelectorAll( '.simpletrad-language' )
			.forEach( ( button ) => {
				button.addEventListener( 'click', () => {
					const code = button.getAttribute( 'data-simpletrad-lang' );

					if ( code !== controller.currentLanguage ) {
						activateLanguage( code );
					}
				} );
			} );
	} );

	// 1) explicit ?lang=xx always wins; 2) browser preference if enabled;
	// 3) otherwise the original source language stays untouched.
	const urlLang = getLangFromUrl( config.queryParam );
	let initialLanguage = null;

	if (
		urlLang &&
		( urlLang === config.sourceLanguage ||
			availableCodes.includes( urlLang ) )
	) {
		initialLanguage = urlLang;
	} else if ( config.autoDetect ) {
		initialLanguage = detectPreferredLanguage( availableCodes );
	}

	setButtonsState( {
		language: initialLanguage || config.sourceLanguage,
		status: 'idle',
	} );

	if ( initialLanguage && initialLanguage !== config.sourceLanguage ) {
		activateLanguage( initialLanguage );
	} else {
		controller.startObserving();
	}
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', bootSwitcher );
} else {
	bootSwitcher();
}
