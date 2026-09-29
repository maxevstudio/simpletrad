/**
 * Normalizes a BCP 47 / browser locale down to its base language subtag.
 *
 * `en-GB` → `en`, `fr-FR` → `fr`, `zh-Hant` is kept distinct on purpose only
 * where the catalogue itself distinguishes script variants; for the purpose
 * of browser-preference matching we only ever compare base subtags.
 *
 * @param {string} locale Raw locale string.
 * @return {string} Normalized, lowercase base language code.
 */
export function normalizeLocale( locale ) {
	if ( ! locale ) {
		return '';
	}

	return String( locale ).trim().toLowerCase().split( /[-_]/ )[ 0 ];
}

/**
 * Detects the visitor's preferred language among the languages SimpleTrad
 * actually offers, using only `navigator.languages` / `navigator.language`
 * (declared browser preference — never IP-based geolocation).
 *
 * @param {string[]} availableCodes Language codes enabled in SimpleTrad.
 * @return {string|null} A matching code, or null if none matched.
 */
export function detectPreferredLanguage( availableCodes ) {
	const normalizedAvailable = availableCodes.map( normalizeLocale );

	const candidates =
		Array.isArray( navigator.languages ) && navigator.languages.length
			? navigator.languages
			: [ navigator.language ];

	for ( const candidate of candidates ) {
		const normalized = normalizeLocale( candidate );
		const index = normalizedAvailable.indexOf( normalized );

		if ( index !== -1 ) {
			return availableCodes[ index ];
		}
	}

	return null;
}
