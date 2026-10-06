import { ToggleControl, RadioControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Settings for the optional floating language button: a button fixed in a
 * bottom corner of every page which opens the switcher in a small panel,
 * with an optional "back to top" button sliding in underneath.
 *
 * @param {Object}   props                   Component props.
 * @param {boolean}  props.enabled           Whether the floating button is shown.
 * @param {Function} props.onEnabledChange   Called with the new boolean value.
 * @param {string}   props.position          `bottom-right` or `bottom-left`.
 * @param {Function} props.onPositionChange  Called with the new position.
 * @param {boolean}  props.backToTop         Whether the back-to-top button is shown.
 * @param {Function} props.onBackToTopChange Called with the new boolean value.
 * @return {JSX.Element} The rendered settings group.
 */
export default function FloatingSettings( {
	enabled,
	onEnabledChange,
	position,
	onPositionChange,
	backToTop,
	onBackToTopChange,
} ) {
	return (
		<>
			<ToggleControl
				label={ __(
					'Afficher la pastille flottante sur tout le site',
					'simpletrad'
				) }
				help={ __(
					'Un bouton fixé en bas de l’écran ouvre un petit panneau avec le choix des langues. Indépendant du shortcode, qui reste utilisable.',
					'simpletrad'
				) }
				checked={ enabled }
				onChange={ onEnabledChange }
				__nextHasNoMarginBottom
			/>

			{ enabled && (
				<>
					<div className="simpletrad-field-group">
						<RadioControl
							label={ __( 'Position', 'simpletrad' ) }
							selected={ position }
							onChange={ onPositionChange }
							options={ [
								{
									value: 'bottom-right',
									label: __(
										'En bas à droite',
										'simpletrad'
									),
								},
								{
									value: 'bottom-left',
									label: __(
										'En bas à gauche',
										'simpletrad'
									),
								},
							] }
						/>
					</div>

					<div className="simpletrad-field-group">
						<ToggleControl
							label={ __(
								'Ajouter un bouton « Retour en haut »',
								'simpletrad'
							) }
							help={ __(
								'Apparaît sous la pastille dès que le visiteur fait défiler la page.',
								'simpletrad'
							) }
							checked={ backToTop }
							onChange={ onBackToTopChange }
							__nextHasNoMarginBottom
						/>
					</div>

					<p className="simpletrad-admin__hint">
						{ __(
							'Couleurs et tailles personnalisables via les variables CSS --simpletrad-fab-* (voir la référence CSS ci-dessus), par exemple : .simpletrad-fab { --simpletrad-fab-bg: #7a1f3d; }',
							'simpletrad'
						) }
					</p>
				</>
			) }
		</>
	);
}
