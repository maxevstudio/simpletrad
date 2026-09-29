/**
 * Shared helpers for turning the SimpleTrad language catalogue into
 * FormTokenField-friendly labels, and back into BCP 47 codes.
 *
 * The label intentionally embeds the native name, the French name and the
 * ISO/BCP 47 code so that typing any of the three (e.g. "ita", "italien",
 * "italiano") surfaces the right suggestion, per the plugin specification.
 */

/**
 * Builds the display label for one catalogue entry.
 *
 * @param {{code: string, name_fr: string, name_native: string}} entry Catalogue entry.
 * @return {string}
 */
export function labelFor( entry ) {
	return `${ entry.name_native } (${
		entry.name_fr
	}) — ${ entry.code.toUpperCase() }`;
}

/**
 * Builds the two lookup maps needed by the token field: code → label and
 * label → code.
 *
 * @param {Array<{code: string, name_fr: string, name_native: string}>} catalog Full language catalogue.
 * @return {{codeToLabel: Map<string,string>, labelToCode: Map<string,string>}}
 */
export function buildLookups( catalog ) {
	const codeToLabel = new Map();
	const labelToCode = new Map();

	catalog.forEach( ( entry ) => {
		const label = labelFor( entry );
		codeToLabel.set( entry.code, label );
		labelToCode.set( label, entry.code );
	} );

	return { codeToLabel, labelToCode };
}
