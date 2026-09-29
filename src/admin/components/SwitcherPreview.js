import { __ } from '@wordpress/i18n';

/**
 * Purely visual, non-functional preview of the front-end switcher: it
 * reacts to the selected languages and display/layout settings but never
 * actually translates the admin screen itself.
 *
 * The custom CSS is rendered here through a plain `<style>` element reusing
 * the exact same markup and class names as the real front-end switcher
 * (`.simpletrad-switcher`, `.simpletrad-language`…) — there is no second,
 * preview-specific styling system to keep in sync.
 * @param root0
 * @param root0.catalog
 * @param root0.sourceLanguage
 * @param root0.targetLanguages
 * @param root0.display
 * @param root0.layout
 * @param root0.customCss
 */
export default function SwitcherPreview( {
	catalog,
	sourceLanguage,
	targetLanguages,
	display,
	layout,
	customCss,
} ) {
	const byCode = new Map( catalog.map( ( entry ) => [ entry.code, entry ] ) );

	const codes = [ sourceLanguage, ...targetLanguages ];

	const renderLabel = ( code ) => {
		const entry = byCode.get( code );
		const name = entry ? entry.name_native : code;

		return (
			<>
				{ ( display === 'flag' || display === 'flag_name' ) && (
					<span
						className="simpletrad-language-flag"
						aria-hidden="true"
					/>
				) }
				{ display === 'code' && (
					<span className="simpletrad-language-code">
						{ code.toUpperCase() }
					</span>
				) }
				{ display !== 'flag' && display !== 'code' && (
					<span className="simpletrad-language-label">{ name }</span>
				) }
			</>
		);
	};

	return (
		<div className="simpletrad-preview">
			<p className="simpletrad-preview__title">
				{ __( 'Aperçu', 'simpletrad' ) }
			</p>
			{ customCss && <style>{ customCss }</style> }
			<div className={ `simpletrad-switcher is-layout-${ layout }` }>
				{ codes.map( ( code, index ) => (
					<button
						type="button"
						key={ code }
						className={ `simpletrad-language${
							0 === index ? ' is-active' : ''
						}` }
					>
						{ renderLabel( code ) }
					</button>
				) ) }
			</div>
		</div>
	);
}
