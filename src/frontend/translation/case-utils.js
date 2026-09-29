/**
 * Case detection/preservation for translated strings.
 *
 * Translation engines often normalize casing (e.g. turning an all-caps
 * source into sentence case, or losing an initial capital). This module
 * detects a coarse, whole-string "case pattern" from the *original* text
 * and reapplies only that pattern to the *translated* text — it never
 * tries to reproduce the source casing word-by-word or character-by-
 * character, which would corrupt mixed-case brand-like words such as
 * "iPhone" or "eCommerce" (see `detectCasePattern` below).
 */

/**
 * Strips a string down to just its Unicode letters, discarding spaces,
 * punctuation and digits, which are irrelevant to case detection.
 *
 * @param {string} text Any text.
 * @return {string} Only the letter characters of `text`.
 */
function getLetters( text ) {
	return ( text.match( /\p{L}/gu ) || [] ).join( '' );
}

/**
 * Detects a whole-string case pattern for `text`, one of:
 *
 * - `'upper'`       — every letter is uppercase (e.g. "CONTACT", "RÉSERVER MAINTENANT").
 * - `'lower'`       — every letter is lowercase (e.g. "contact").
 * - `'capitalized'` — the very first letter is uppercase and the string
 *                     isn't fully uppercase (covers plain "Bonjour" as well
 *                     as sentence-case phrases like "Découvrir nos chambres").
 * - `'mixed'`       — anything else: the first letter is lowercase but the
 *                     string still contains uppercase letters elsewhere
 *                     (e.g. "iPhone", "eCommerce", "Wi-Fi" written as
 *                     "wi-Fi"). Deliberately left untouched: forcing a
 *                     pattern here would corrupt these mixed-case tokens.
 * - `'none'`        — no letters at all (numbers, punctuation…).
 *
 * @param {string} text Original (source-language) text.
 * @return {'upper'|'lower'|'capitalized'|'mixed'|'none'}
 */
export function detectCasePattern( text ) {
	const letters = getLetters( text );

	if ( ! letters ) {
		return 'none';
	}

	const upper = letters.toUpperCase();
	const lower = letters.toLowerCase();

	if ( letters === upper && letters !== lower ) {
		return 'upper';
	}

	if ( letters === lower && letters !== upper ) {
		return 'lower';
	}

	const firstLetterMatch = text.match( /\p{L}/u );

	if ( firstLetterMatch ) {
		const firstLetter = firstLetterMatch[ 0 ];

		if (
			firstLetter === firstLetter.toUpperCase() &&
			firstLetter !== firstLetter.toLowerCase()
		) {
			return 'capitalized';
		}
	}

	return 'mixed';
}

/**
 * Reapplies the case pattern detected from `originalText` onto
 * `translatedText`, without ever mapping casing word-by-word:
 *
 * - `'upper'` forces the whole translated string to uppercase (this is the
 *   one case where whole-string transformation is safe — see the case-utils
 *   module doc comment and controller.js for why this can't corrupt an
 *   already-restored protected term).
 * - `'capitalized'` only forces the first letter of the translated string
 *   to uppercase; everything else is left exactly as the engine returned
 *   it (never re-capitalizing every word).
 * - `'lower'`, `'mixed'` and `'none'` never modify the translated text: the
 *   engine's own output is trusted as-is.
 *
 * @param {string} originalText   Original (source-language) text.
 * @param {string} translatedText Text returned by the translation engine.
 * @return {string} The translated text with its case pattern corrected.
 */
export function applyCasePattern( originalText, translatedText ) {
	const pattern = detectCasePattern( originalText );

	if ( pattern === 'upper' ) {
		return translatedText.toUpperCase();
	}

	if ( pattern === 'capitalized' ) {
		const match = translatedText.match( /\p{L}/u );

		if ( ! match ) {
			return translatedText;
		}

		const index = match.index;

		return (
			translatedText.slice( 0, index ) +
			translatedText.charAt( index ).toUpperCase() +
			translatedText.slice( index + 1 )
		);
	}

	return translatedText;
}
