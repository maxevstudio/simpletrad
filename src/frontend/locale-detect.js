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

const STORAGE_KEY = 'simpletrad-lang';

/**
 * Remembers the language the visitor explicitly picked, so that going back
 * to the source language (whose URL carries no `?lang=`) is not undone by
 * browser auto-detection on the next page.
 *
 * @param {string} code Chosen language code.
 */
export function rememberLanguage( code ) {
	try {
		window.localStorage.setItem( STORAGE_KEY, code );
	} catch ( error ) {
		// Storage can be disabled (private mode…): auto-detection then
		// simply keeps applying, which is the previous behaviour.
	}
}

/**
 * Returns the language the visitor explicitly picked earlier, if any.
 *
 * @return {string|null}
 */
export function getRememberedLanguage() {
	try {
		return window.localStorage.getItem( STORAGE_KEY );
	} catch ( error ) {
		return null;
	}
}

/**
 * Detects the visitor's preferred language among the languages SimpleTrad
 * actually offers, using only `navigator.languages` / `navigator.language`
 * (declared browser preference — never IP-based geolocation).
 *
 * The source language must be part of `availableCodes`: a French visitor
 * whose browser also lists English must stay on the French original rather
 * than skip French and match English further down the list.
 *
 * @param {string[]} availableCodes Language codes offered, source included.
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
