/**
 * Floating language button (`.simpletrad-fab`, printed by
 * includes/class-floating.php when enabled in the settings): opens/closes
 * the language panel, mirrors the active language code on the button, and
 * drives the optional "back to top" button.
 */

const SCROLL_THRESHOLD = 400;

function bootFloating() {
	const fab = document.querySelector( '[data-simpletrad-fab]' );

	if ( ! fab ) {
		return;
	}

	const langButton = fab.querySelector( '.simpletrad-fab-lang-btn' );
	const panel = fab.querySelector( '.simpletrad-fab-panel' );
	const code = fab.querySelector( '.simpletrad-fab-code' );
	const topButton = fab.querySelector( '.simpletrad-fab-top' );

	// Back to top: the language button slides up to make room for it.
	if ( topButton ) {
		let ticking = false;
		const onScroll = () => {
			fab.classList.toggle(
				'is-scrolled',
				window.scrollY > SCROLL_THRESHOLD
			);
			ticking = false;
		};

		window.addEventListener(
			'scroll',
			() => {
				if ( ! ticking ) {
					ticking = true;
					window.requestAnimationFrame( onScroll );
				}
			},
			{ passive: true }
		);
		onScroll();

		topButton.addEventListener( 'click', () => {
			const reduce = window.matchMedia(
				'(prefers-reduced-motion: reduce)'
			).matches;

			window.scrollTo( { top: 0, behavior: reduce ? 'auto' : 'smooth' } );
		} );
	}

	const setOpen = ( open ) => {
		fab.classList.toggle( 'is-open', open );
		langButton.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
	};
	const isOpen = () => fab.classList.contains( 'is-open' );

	langButton.addEventListener( 'click', ( event ) => {
		event.stopPropagation();
		setOpen( ! isOpen() );
	} );

	document.addEventListener( 'click', ( event ) => {
		if ( isOpen() && ! fab.contains( event.target ) ) {
			setOpen( false );
		}
	} );

	document.addEventListener( 'keydown', ( event ) => {
		if ( event.key === 'Escape' && isOpen() ) {
			setOpen( false );
			langButton.focus();
		}
	} );

	// The switcher toggles `.is-active` on the chosen language: mirror it.
	const syncCode = () => {
		const active = panel.querySelector( '.simpletrad-language.is-active' );

		if ( active ) {
			code.textContent = (
				active.getAttribute( 'data-simpletrad-lang' ) || ''
			).toUpperCase();
		}
	};

	syncCode();
	new window.MutationObserver( syncCode ).observe( panel, {
		subtree: true,
		attributes: true,
		attributeFilter: [ 'class' ],
	} );

	// Close the panel shortly after a language is picked.
	panel.addEventListener( 'click', ( event ) => {
		if ( event.target.closest( '.simpletrad-language' ) ) {
			setTimeout( () => setOpen( false ), 250 );
		}
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', bootFloating );
} else {
	bootFloating();
}
