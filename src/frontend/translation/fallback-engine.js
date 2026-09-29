/**
 * Optional local WebAssembly fallback, used only when the native browser
 * `Translator` API is unavailable (see `native-engine.js`).
 *
 * IMPORTANT — read `AUDIT.md` before touching this file.
 *
 * SimpleTrad does not bundle any WASM engine or language model itself: the
 * canonical Mozilla/Bergamot model distribution moved to infrastructure that
 * is not suited for redistribution inside a lightweight WordPress plugin
 * (see AUDIT.md for the full technical audit and licensing notes). Instead,
 * this class defines a small, self-contained protocol that a self-hosted
 * (or future companion) WASM package can implement:
 *
 *   GET  {fallbackModelsUrl}/manifest.json
 *        → { "worker": "worker.js", "pairs": ["fr-en", "fr-es", ...] }
 *
 *   new Worker({fallbackModelsUrl}/{manifest.worker})
 *        postMessage({ type: 'translate', sourceLanguage, targetLanguage, texts })
 *        → onmessage { type: 'result', texts: [...] }
 *
 * If no `fallbackModelsUrl` is configured, or the manifest/pair isn't found,
 * this engine reports itself as unavailable and SimpleTrad simply keeps
 * showing the original content — it never fakes a translation.
 */
export class WasmTranslationFallback {
	/**
	 * @param {string} baseUrl Admin-configured base URL hosting the manifest + worker + models.
	 */
	constructor( baseUrl ) {
		this.baseUrl = ( baseUrl || '' ).replace( /\/$/, '' );
		this.manifestPromise = null;
		this.worker = null;
		this.pendingRequests = new Map();
		this.requestId = 0;
	}

	get id() {
		return 'wasm-fallback';
	}

	/**
	 * Fetches (and memoizes) the manifest describing which pairs the
	 * self-hosted fallback actually supports.
	 *
	 * @return {Promise<object|null>}
	 */
	async getManifest() {
		if ( ! this.baseUrl ) {
			return null;
		}

		if ( ! this.manifestPromise ) {
			this.manifestPromise = fetch( `${ this.baseUrl }/manifest.json` )
				.then( ( response ) =>
					response.ok ? response.json() : null
				)
				.catch( () => null );
		}

		return this.manifestPromise;
	}

	/**
	 * Whether the self-hosted fallback declares support for this pair.
	 *
	 * @param {string} sourceLanguage Source BCP 47 code.
	 * @param {string} targetLanguage Target BCP 47 code.
	 * @return {Promise<boolean>}
	 */
	async isAvailable( sourceLanguage, targetLanguage ) {
		const manifest = await this.getManifest();

		if ( ! manifest || ! Array.isArray( manifest.pairs ) ) {
			return false;
		}

		return manifest.pairs.includes(
			`${ sourceLanguage }-${ targetLanguage }`
		);
	}

	/**
	 * Lazily spins up the translation Worker declared by the manifest. The
	 * worker script — and therefore the WASM engine and models it may load —
	 * is only fetched the first time a translation is actually requested.
	 *
	 * @return {Promise<Worker>}
	 */
	async getWorker() {
		if ( this.worker ) {
			return this.worker;
		}

		const manifest = await this.getManifest();

		if ( ! manifest || ! manifest.worker ) {
			throw new Error(
				'SimpleTrad: no WASM fallback worker configured.'
			);
		}

		this.worker = new Worker( `${ this.baseUrl }/${ manifest.worker }` );
		this.worker.addEventListener( 'message', ( event ) => {
			const { id, texts, error } = event.data || {};
			const pending = this.pendingRequests.get( id );

			if ( ! pending ) {
				return;
			}

			this.pendingRequests.delete( id );

			if ( error ) {
				pending.reject( new Error( error ) );
			} else {
				pending.resolve( texts );
			}
		} );

		return this.worker;
	}

	/**
	 * Translates a batch of strings through the self-hosted worker.
	 *
	 * @param {string[]} texts          Source strings.
	 * @param {string}   sourceLanguage Source BCP 47 code.
	 * @param {string}   targetLanguage Target BCP 47 code.
	 * @return {Promise<string[]>}
	 */
	async translateBatch( texts, sourceLanguage, targetLanguage ) {
		const worker = await this.getWorker();
		const id = ++this.requestId;

		return new Promise( ( resolve, reject ) => {
			this.pendingRequests.set( id, { resolve, reject } );
			worker.postMessage( {
				type: 'translate',
				id,
				sourceLanguage,
				targetLanguage,
				texts,
			} );
		} );
	}
}
