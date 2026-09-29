/**
 * Wraps the native, on-device browser `Translator` API
 * (https://developer.mozilla.org/en-US/docs/Web/API/Translator).
 *
 * The API is feature-detected before every use — it is currently only
 * available in Chrome (desktop) 138+ behind a secure context, so this class
 * must degrade to "unavailable" everywhere else without throwing.
 */
export class NativeBrowserTranslator {
	constructor() {
		this.translators = new Map();
	}

	/**
	 * Human-readable identifier, used for admin diagnostics only.
	 */
	get id() {
		return 'native-browser';
	}

	/**
	 * Whether the browser exposes the Translator API at all.
	 *
	 * @return {boolean}
	 */
	static isSupported() {
		return typeof self !== 'undefined' && 'Translator' in self;
	}

	/**
	 * Checks whether a given source→target pair can actually be translated
	 * right now (already available, or downloadable).
	 *
	 * @param {string} sourceLanguage Source BCP 47 code.
	 * @param {string} targetLanguage Target BCP 47 code.
	 * @return {Promise<'available'|'downloadable'|'unavailable'>}
	 */
	static async availability( sourceLanguage, targetLanguage ) {
		if ( ! NativeBrowserTranslator.isSupported() ) {
			return 'unavailable';
		}

		try {
			// eslint-disable-next-line no-undef
			return await Translator.availability( {
				sourceLanguage,
				targetLanguage,
			} );
		} catch ( error ) {
			return 'unavailable';
		}
	}

	/**
	 * Lazily creates (and memoizes) a `Translator` instance for a language
	 * pair. Must be invoked from within a user gesture handler if the model
	 * still needs to be downloaded — the browser enforces this itself and
	 * rejects the promise with `NotAllowedError` otherwise, which callers
	 * must catch and treat as "temporarily unavailable", never as a crash.
	 *
	 * @param {string}   sourceLanguage Source BCP 47 code.
	 * @param {string}   targetLanguage Target BCP 47 code.
	 * @param {Function} [onProgress]   Optional `(ratio:number) => void` download progress callback.
	 * @return {Promise<object>} A ready-to-use Translator instance.
	 */
	async getTranslator( sourceLanguage, targetLanguage, onProgress ) {
		const key = `${ sourceLanguage }:${ targetLanguage }`;

		if ( this.translators.has( key ) ) {
			return this.translators.get( key );
		}

		// eslint-disable-next-line no-undef
		const translator = await Translator.create( {
			sourceLanguage,
			targetLanguage,
			monitor: ( monitorTarget ) => {
				monitorTarget.addEventListener(
					'downloadprogress',
					( event ) => {
						if ( typeof onProgress === 'function' ) {
							onProgress( event.loaded / ( event.total || 1 ) );
						}
					}
				);
			},
		} );

		this.translators.set( key, translator );

		return translator;
	}

	/**
	 * Translates a batch of independent strings. Requests run with a small
	 * concurrency cap so the UI stays responsive without hammering the
	 * engine with hundreds of simultaneous calls.
	 *
	 * @param {string[]} texts          Source strings (already deduplicated by the caller).
	 * @param {string}   sourceLanguage Source BCP 47 code.
	 * @param {string}   targetLanguage Target BCP 47 code.
	 * @param {Function} [onProgress]   Optional download progress callback.
	 * @return {Promise<string[]>} Translated strings, same order as `texts`.
	 */
	async translateBatch( texts, sourceLanguage, targetLanguage, onProgress ) {
		const translator = await this.getTranslator(
			sourceLanguage,
			targetLanguage,
			onProgress
		);
		const concurrency = 4;
		const results = new Array( texts.length );
		let cursor = 0;

		async function worker() {
			while ( cursor < texts.length ) {
				const index = cursor++;
				results[ index ] = await translator.translate( texts[ index ] );
			}
		}

		await Promise.all(
			Array.from(
				{ length: Math.min( concurrency, texts.length ) },
				worker
			)
		);

		return results;
	}
}
