import { FormTokenField } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { buildLookups } from '../language-labels';

/**
 * Multi-language picker using the native `FormTokenField`: typing a French
 * name, a native name, or an ISO/BCP 47 code all surface matching
 * suggestions, and selected languages become removable tokens. There is no
 * artificial cap on how many languages can be selected.
 * @param root0
 * @param root0.catalog
 * @param root0.sourceLanguage
 * @param root0.value
 * @param root0.onChange
 */
export default function TargetLanguagesField( {
	catalog,
	sourceLanguage,
	value,
	onChange,
} ) {
	const selectableCatalog = catalog.filter(
		( entry ) => entry.code !== sourceLanguage
	);
	const { codeToLabel, labelToCode } = buildLookups( selectableCatalog );

	const tokens = value
		.map( ( code ) => codeToLabel.get( code ) )
		.filter( Boolean );
	const suggestions = Array.from( labelToCode.keys() );

	const handleChange = ( newTokens ) => {
		const codes = newTokens
			.map( ( token ) => labelToCode.get( token ) )
			.filter( Boolean );

		// Deduplicate in case the same language was somehow tokenized twice.
		onChange( Array.from( new Set( codes ) ) );
	};

	return (
		<FormTokenField
			label={ __( 'Langues proposées aux visiteurs', 'simpletrad' ) }
			value={ tokens }
			suggestions={ suggestions }
			onChange={ handleChange }
			placeholder={ __(
				'Rechercher : anglais, english, en…',
				'simpletrad'
			) }
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
		/>
	);
}
