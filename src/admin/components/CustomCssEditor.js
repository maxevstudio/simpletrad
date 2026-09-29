import { TextareaControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * A deliberately lightweight CSS editor for the switcher: a native
 * `TextareaControl` (monospace, no destructive auto-formatting) rather than
 * bundling a heavyweight code editor library. WordPress's own block editor
 * "Additional CSS" panel similarly relies on a code-friendly textarea for
 * simple cases; a full CodeMirror integration would be disproportionate for
 * this amount of admin-authored CSS.
 * @param root0
 * @param root0.value
 * @param root0.onChange
 */
export default function CustomCssEditor( { value, onChange } ) {
	const handleReset = () => {
		// A native confirm() keeps this lightweight; a full
		// @wordpress/components dialog would be disproportionate for a
		// single destructive action.
		// eslint-disable-next-line no-alert
		const confirmed = window.confirm(
			__(
				'Réinitialiser le CSS personnalisé du switcher ?',
				'simpletrad'
			)
		);

		if ( confirmed ) {
			onChange( '' );
		}
	};

	return (
		<div className="simpletrad-css-editor">
			<TextareaControl
				label={ __( 'CSS personnalisé du switcher', 'simpletrad' ) }
				help={ __(
					'Ce CSS est appliqué immédiatement à l’aperçu ci-dessous et chargé sur le front, uniquement sur les pages où le switcher est affiché.',
					'simpletrad'
				) }
				value={ value }
				onChange={ onChange }
				rows={ 10 }
				className="simpletrad-css-editor__textarea"
				spellCheck="false"
				__nextHasNoMarginBottom
			/>
			<Button
				variant="tertiary"
				isDestructive
				onClick={ handleReset }
				disabled={ ! value }
			>
				{ __( 'Réinitialiser le CSS', 'simpletrad' ) }
			</Button>
		</div>
	);
}
