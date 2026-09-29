/**
 * Protected-terms placeholder pipeline: temporarily replaces brand names,
 * proper nouns or expressions the admin never wants translated with unique
 * placeholders before sending text to a translation engine, then restores
 * the exact original substring (with its exact original casing, as found in
 * the DOM — not the settings value) once translation is done.
 *
 * This sits *above* the TranslationEngine abstraction (see
 * translation/controller.js): the engines themselves know nothing about
 * protected terms.
 */

const PLACEHOLDER_PREFIX = '__SIMPLETRAD_TERM_';
const PLACEHOLDER_SUFFIX = '__';

/**
 * Escapes a string for safe use inside a `RegExp`.
 *
 * @param {string} text Raw string.
 * @return {string} Regex-escaped string.
 */
function escapeRegExp( text ) {
	return text.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

/**
 * Replaces every occurrence of every protected term found in `text` with a
 * unique placeholder, matching case-insensitively (so a term configured as
 * "Maxev" still protects "MAXEV" if that's how it appears on the page), but
 * remembering the *actual* matched substring — with its real casing — for
 * an exact restoration later.
 *
 * Terms are matched longest-first so a term entirely contained in a longer
 * one (e.g. "Hôtel" inside "Hôtel Martinez") can never partially clash with
 * it: once the longer match is replaced by a placeholder, the shorter term
 * simply can't be found inside it anymore.
 *
 * @param {string}   text  Original (source-language) text.
 * @param {string[]} terms Protected terms configured in the admin.
 * @return {{ text: string, restoreMap: Map<string, string> }}
 */
export function protectTerms( text, terms ) {
	const restoreMap = new Map();

	if ( ! Array.isArray( terms ) || ! terms.length ) {
		return { text, restoreMap };
	}

	let result = text;
	let placeholderIndex = 0;

	const sortedTerms = terms
		.filter( Boolean )
		.sort( ( a, b ) => b.length - a.length );

	sortedTerms.forEach( ( term ) => {
		const lowerTerm = term.toLowerCase();

		if ( ! lowerTerm ) {
			return;
		}

		let searchFrom = 0;

		// eslint-disable-next-line no-constant-condition -- bounded by the string shrinking as matches are consumed below.
		while ( true ) {
			const lowerResult = result.toLowerCase();
			const matchIndex = lowerResult.indexOf( lowerTerm, searchFrom );

			if ( -1 === matchIndex ) {
				break;
			}

			const matchedSubstring = result.slice(
				matchIndex,
				matchIndex + term.length
			);
			const placeholder = `${ PLACEHOLDER_PREFIX }${ placeholderIndex++ }${ PLACEHOLDER_SUFFIX }`;

			restoreMap.set( placeholder, matchedSubstring );

			result =
				result.slice( 0, matchIndex ) +
				placeholder +
				result.slice( matchIndex + term.length );
			searchFrom = matchIndex + placeholder.length;
		}
	} );

	return { text: result, restoreMap };
}

/**
 * Restores every placeholder in `text` back to its original substring.
 * Matching is case-insensitive since some translation engines may alter
 * the placeholder's casing (e.g. lowercasing unknown tokens); this ensures
 * the exact original term is restored regardless.
 *
 * @param {string}              text       Translated text, still containing placeholders.
 * @param {Map<string, string>} restoreMap Placeholder → original substring, from `protectTerms()`.
 * @return {string} Text with every placeholder replaced by its protected term.
 */
export function restoreTerms( text, restoreMap ) {
	let result = text;

	restoreMap.forEach( ( original, placeholder ) => {
		const pattern = new RegExp( escapeRegExp( placeholder ), 'gi' );

		result = result.replace( pattern, () => original );
	} );

	return result;
}
