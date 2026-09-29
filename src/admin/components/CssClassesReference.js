import { useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { copy as copyIcon, check } from '@wordpress/icons';

const EXAMPLE_CSS = `.simpletrad-switcher {
	display: flex;
	gap: 0.5em;
}

.simpletrad-language.is-active {
	font-weight: bold;
}

.simpletrad-language.is-loading {
	opacity: 0.6;
}`;

const CLASS_NAMES = [
	'.simpletrad-switcher',
	'.simpletrad-language',
	'.simpletrad-language-label',
	'.simpletrad-language-code',
	'.simpletrad-language-flag',
	'.simpletrad-language.is-active',
	'.simpletrad-language.is-loading',
];

/**
 * Documents the stable class names available for custom CSS (from
 * Elementor, a child theme, or the Customizer) — not a CSS editor, just a
 * lightweight reference plus a copy-to-clipboard convenience.
 */
export default function CssClassesReference() {
	const [ copied, setCopied ] = useState( false );

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText( EXAMPLE_CSS );
			setCopied( true );
			setTimeout( () => setCopied( false ), 2000 );
		} catch ( error ) {
			// Clipboard access can be denied by the browser; failing silently
			// here is safe since the example remains visible to copy by hand.
		}
	};

	return (
		<div className="simpletrad-css-reference">
			<p className="simpletrad-css-reference__title">
				{ __( 'Personnalisation CSS', 'simpletrad' ) }
			</p>
			<p>
				{ __(
					'Le switcher utilise des noms de classes stables que vous pouvez cibler depuis Elementor, un thème enfant ou les CSS additionnels de WordPress :',
					'simpletrad'
				) }
			</p>
			<ul className="simpletrad-css-reference__list">
				{ CLASS_NAMES.map( ( className ) => (
					<li key={ className }>
						<code>{ className }</code>
					</li>
				) ) }
			</ul>
			<pre className="simpletrad-css-reference__example">
				<code>{ EXAMPLE_CSS }</code>
			</pre>
			<Button
				variant="secondary"
				icon={ copied ? check : copyIcon }
				onClick={ handleCopy }
			>
				{ copied
					? __( 'Copié !', 'simpletrad' )
					: __( 'Copier l’exemple CSS', 'simpletrad' ) }
			</Button>
		</div>
	);
}
