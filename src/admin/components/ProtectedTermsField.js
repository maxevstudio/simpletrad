import { FormTokenField } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Free-text list of brand names, proper nouns or expressions that must
 * reach the visitor exactly as written in the source text, regardless of
 * the language displayed. Distinct from CSS exclusions (which skip an
 * entire element): a protected term only shields that specific substring
 * while the rest of the sentence around it is still translated normally.
 * @param root0
 * @param root0.value
 * @param root0.onChange
 */
export default function ProtectedTermsField( { value, onChange } ) {
	return (
		<FormTokenField
			label={ __( 'Termes protégés', 'simpletrad' ) }
			value={ value }
			onChange={ onChange }
			placeholder="Maxev, SimpleTrad, Hôtel Martinez…"
			__experimentalExpandOnFocus={ false }
			__experimentalShowHowTo={ false }
		/>
	);
}
