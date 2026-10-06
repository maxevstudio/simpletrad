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

const WORD_PATTERN = /\p{L}[\p{L}\p{M}'’-]*/gu;
const SENTENCE_END = /[.!?…:]\s*$/u;

/**
 * Lists the words of `text` with, for each one, whether it starts a
 * sentence (first word, or right after `.`, `!`, `?`, `…` or `:`).
 *
 * @param {string} text Any text.
 * @return {Array<{word: string, index: number, initial: boolean}>}
 */
function listWords( text ) {
	return Array.from( text.matchAll( WORD_PATTERN ), ( match, position ) => ( {
		word: match[ 0 ],
		index: match.index,
		initial:
			position === 0 || SENTENCE_END.test( text.slice( 0, match.index ) ),
	} ) );
}

/**
 * Whether a word is written "Capitalized" (upper first letter, lowercase
 * rest) — the shape title-casing produces.
 *
 * @param {string} word A single word.
 * @return {boolean}
 */
function isCapitalizedWord( word ) {
	const rest = word.slice( 1 );

	return (
		word[ 0 ] !== word[ 0 ].toLowerCase() &&
		rest === rest.toLowerCase() &&
		/\p{Ll}/u.test( rest )
	);
}

/**
 * Share of non-sentence-initial words that are Capitalized.
 *
 * @param {Array} words Output of `listWords()`.
 * @return {{count: number, ratio: number}}
 */
function midSentenceCapitals( words ) {
	const mid = words.filter( ( entry ) => ! entry.initial );
	const count = mid.filter( ( entry ) =>
		isCapitalizedWord( entry.word )
	).length;

	return { count, ratio: mid.length ? count / mid.length : 0 };
}

/**
 * Undoes casing the translation engine invented on its own, so the
 * translated page keeps the source's typography. On-device engines working
 * on short fragments (a heading split by `<br>`, an `<em>`…) sometimes
 * answer in FULL CAPS or In Title Case although the source was neither.
 *
 * - Source not fully uppercase but translation fully uppercase → lowercased.
 * - A translated sentence where most mid-sentence words are Capitalized
 *   while the source isn't written that way → those words are lowercased.
 *
 * Words that appear verbatim in the source (proper nouns kept as-is such
 * as "Cannes", acronyms such as "UE") are never touched. Runs before
 * `applyCasePattern()`, which then re-applies the source's own pattern.
 *
 * @param {string} originalText   Original (source-language) text.
 * @param {string} translatedText Text returned by the translation engine.
 * @return {string} The translated text without engine-invented casing.
 */
export function normalizeEngineCasing( originalText, translatedText ) {
	const sourceWords = new Set(
		listWords( originalText ).map( ( entry ) => entry.word )
	);
	const translatedLetters = getLetters( translatedText );

	if (
		detectCasePattern( originalText ) !== 'upper' &&
		translatedLetters.length > 3 &&
		translatedLetters === translatedLetters.toUpperCase() &&
		translatedLetters !== translatedLetters.toLowerCase()
	) {
		return translatedText.replace( WORD_PATTERN, ( word ) =>
			sourceWords.has( word ) ? word : word.toLowerCase()
		);
	}

	if ( midSentenceCapitals( listWords( originalText ) ).ratio >= 0.5 ) {
		// The source itself is Title Cased: the engine's casing is faithful.
		return translatedText;
	}

	return translatedText
		.split( /(?<=[.!?…])(\s+)/u )
		.map( ( sentence ) => {
			const words = listWords( sentence );
			const { count, ratio } = midSentenceCapitals( words );

			if ( count < 2 || ratio < 0.6 ) {
				return sentence;
			}

			let result = sentence;

			words.forEach( ( { word, index, initial } ) => {
				if (
					! initial &&
					isCapitalizedWord( word ) &&
					! sourceWords.has( word )
				) {
					result =
						result.slice( 0, index ) +
						word.toLowerCase() +
						result.slice( index + word.length );
				}
			} );

			return result;
		} )
		.join( '' );
}
