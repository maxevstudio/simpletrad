import { ComboboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Searchable source-language selector (native `ComboboxControl`, matching
 * the WordPress admin's own look and feel, no custom UI framework).
 * @param root0
 * @param root0.catalog
 * @param root0.value
 * @param root0.onChange
 */
export default function SourceLanguageSelect( { catalog, value, onChange } ) {
	const options = catalog.map( ( entry ) => ( {
		value: entry.code,
		label: `${ entry.name_fr } — ${ entry.name_native }`,
	} ) );

	return (
		<ComboboxControl
			label={ __( 'Langue originale du site', 'simpletrad' ) }
			help={ __(
				'La langue dans laquelle votre contenu WordPress est réellement rédigé.',
				'simpletrad'
			) }
			value={ value }
			onChange={ onChange }
			options={ options }
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
}
