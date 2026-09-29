import { ToggleControl, RadioControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Groups the "how the switcher looks and behaves" settings: display mode,
 * orientation, and browser auto-detection — kept deliberately small for the
 * V1 scope (no extra variants). Uses only stable `@wordpress/components`
 * (`RadioControl`, `ToggleControl`) rather than experimental APIs.
 *
 * @param {Object}   props                    Component props.
 * @param {boolean}  props.autoDetect         Whether browser auto-detection is enabled.
 * @param {Function} props.onAutoDetectChange Called with the new boolean value.
 * @param {string}   props.display            Current switcher display mode.
 * @param {Function} props.onDisplayChange    Called with the new display mode.
 * @param {string}   props.layout             Current switcher layout.
 * @param {Function} props.onLayoutChange     Called with the new layout.
 * @return {JSX.Element} The rendered settings group.
 */
export default function SwitcherSettings( {
	autoDetect,
	onAutoDetectChange,
	display,
	onDisplayChange,
	layout,
	onLayoutChange,
} ) {
	return (
		<>
			<ToggleControl
				label={ __(
					'Détecter automatiquement la langue du navigateur',
					'simpletrad'
				) }
				help={ __(
					'Utilise navigator.languages / navigator.language. Ignoré si ?lang= est présent dans l’URL.',
					'simpletrad'
				) }
				checked={ autoDetect }
				onChange={ onAutoDetectChange }
				__nextHasNoMarginBottom
			/>

			<div className="simpletrad-field-group">
				<RadioControl
					label={ __( 'Affichage', 'simpletrad' ) }
					selected={ display }
					onChange={ onDisplayChange }
					options={ [
						{
							value: 'name',
							label: __( 'Nom de la langue', 'simpletrad' ),
						},
						{
							value: 'code',
							label: __( 'Code court (FR, EN…)', 'simpletrad' ),
						},
						{
							value: 'flag_name',
							label: __( 'Drapeau + nom', 'simpletrad' ),
						},
						{
							value: 'flag',
							label: __( 'Drapeau seul', 'simpletrad' ),
						},
					] }
				/>
				<p className="simpletrad-field-group__hint">
					{ __(
						'Une langue n’est pas un pays : les drapeaux restent une option purement visuelle.',
						'simpletrad'
					) }
				</p>
			</div>

			<div className="simpletrad-field-group">
				<RadioControl
					label={ __( 'Orientation', 'simpletrad' ) }
					selected={ layout }
					onChange={ onLayoutChange }
					options={ [
						{
							value: 'horizontal',
							label: __( 'Horizontal', 'simpletrad' ),
						},
						{
							value: 'dropdown',
							label: __( 'Vertical / liste', 'simpletrad' ),
						},
					] }
				/>
			</div>
		</>
	);
}
