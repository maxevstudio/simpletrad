import { NativeBrowserTranslator } from './native-engine';
import { WasmTranslationFallback } from './fallback-engine';

/**
 * Chooses, at runtime, the best available translation engine for a given
 * language pair — native on-device API first, self-hosted WASM fallback
 * second — without ever coupling the rest of the plugin to a specific
 * provider. If neither engine can handle the pair, callers receive `null`
 * and must leave the original content untouched (progressive enhancement).
 */
export class TranslationEngineRegistry {
	/**
	 * @param {string} fallbackModelsUrl Admin-configured base URL for the optional WASM fallback.
	 */
	constructor( fallbackModelsUrl ) {
		this.native = new NativeBrowserTranslator();
		this.fallback = new WasmTranslationFallback( fallbackModelsUrl );
	}

	/**
	 * Resolves the engine to use for a language pair, or `null`.
	 *
	 * @param {string} sourceLanguage Source BCP 47 code.
	 * @param {string} targetLanguage Target BCP 47 code.
	 * @return {Promise<{engine: object, status: string}|null>}
	 */
	async resolve( sourceLanguage, targetLanguage ) {
		const nativeStatus = await NativeBrowserTranslator.availability(
			sourceLanguage,
			targetLanguage
		);

		if ( 'available' === nativeStatus || 'downloadable' === nativeStatus ) {
			return { engine: this.native, status: nativeStatus };
		}

		if (
			await this.fallback.isAvailable( sourceLanguage, targetLanguage )
		) {
			return { engine: this.fallback, status: 'available' };
		}

		return null;
	}
}
