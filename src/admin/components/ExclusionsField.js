import { FormTokenField } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Free-text list of CSS selectors that must never be translated, in
 * addition to the standard `.simpletrad-no-translate` class and the
 * `translate="no"` attribute (always honored, regardless of this list).
 * @param root0
 * @param root0.value
 * @param root0.onChange
 */
export default function ExclusionsField( { value, onChange } ) {
	return (
		<FormTokenField
			label={ __( 'Sélecteurs CSS à ne jamais traduire', 'simpletrad' ) }
			value={ value }
			onChange={ onChange }
			placeholder=".logo, .brand-name, .no-translate…"
			__experimentalExpandOnFocus={ false }
			__experimentalShowHowTo={ false }
		/>
	);
}
