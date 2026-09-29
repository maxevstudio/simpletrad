import {
	isEligibleLink,
	propagateLangToLinks,
	getLangFromUrl,
	setLangInUrl,
} from '../url-lang';

function setLocation( href ) {
	window.history.replaceState( null, '', href );
}

describe( 'isEligibleLink', () => {
	beforeEach( () =>
		setLocation( 'https://example.com/chambres/?utm_source=test' )
	);

	function anchor( href, extraAttrs = {} ) {
		const el = document.createElement( 'a' );
		el.setAttribute( 'href', href );
		Object.entries( extraAttrs ).forEach( ( [ key, value ] ) =>
			el.setAttribute( key, value )
		);
		return el;
	}

	it( 'accepts a normal internal link', () => {
		expect( isEligibleLink( anchor( '/contact/' ) ) ).toBe( true );
	} );

	it( 'rejects external links', () => {
		expect(
			isEligibleLink( anchor( 'https://other-site.example/' ) )
		).toBe( false );
	} );

	it( 'rejects mailto/tel/javascript links', () => {
		expect( isEligibleLink( anchor( 'mailto:hello@example.com' ) ) ).toBe(
			false
		);
		expect( isEligibleLink( anchor( 'tel:+33123456789' ) ) ).toBe( false );
		expect( isEligibleLink( anchor( 'javascript:void(0)' ) ) ).toBe(
			false
		);
	} );

	it( 'rejects pure #anchor links', () => {
		expect( isEligibleLink( anchor( '#section-2' ) ) ).toBe( false );
	} );

	it( 'rejects wp-admin, wp-login and wp-json links', () => {
		expect( isEligibleLink( anchor( '/wp-admin/edit.php' ) ) ).toBe(
			false
		);
		expect(
			isEligibleLink(
				anchor( '/wp-login.php?action=logout&_wpnonce=abc' )
			)
		).toBe( false );
		expect( isEligibleLink( anchor( '/wp-json/wp/v2/posts' ) ) ).toBe(
			false
		);
	} );

	it( 'rejects downloadable file links', () => {
		expect( isEligibleLink( anchor( '/brochure.pdf' ) ) ).toBe( false );
		expect(
			isEligibleLink( anchor( '/image.jpg', { download: '' } ) )
		).toBe( false );
	} );

	it( 'rejects empty href', () => {
		expect( isEligibleLink( anchor( '' ) ) ).toBe( false );
	} );
} );

describe( 'propagateLangToLinks', () => {
	beforeEach( () =>
		setLocation( 'https://example.com/chambres/?utm_source=test' )
	);

	it( 'adds ?lang= while preserving existing query params on eligible links', () => {
		document.body.innerHTML = `
			<a href="/contact/?ref=footer">Contact</a>
			<a href="https://external.example/">External</a>
			<a href="mailto:a@b.com">Mail</a>
		`;

		propagateLangToLinks( 'en' );

		const links = document.querySelectorAll( 'a' );
		expect( links[ 0 ].getAttribute( 'href' ) ).toBe(
			'/contact/?ref=footer&lang=en'
		);
		expect( links[ 1 ].getAttribute( 'href' ) ).toBe(
			'https://external.example/'
		);
		expect( links[ 2 ].getAttribute( 'href' ) ).toBe( 'mailto:a@b.com' );
	} );

	it( 'removes lang param when switching back to null', () => {
		document.body.innerHTML = `<a href="/contact/?lang=en">Contact</a>`;
		propagateLangToLinks( null );
		expect( document.querySelector( 'a' ).getAttribute( 'href' ) ).toBe(
			'/contact/'
		);
	} );
} );

describe( 'getLangFromUrl / setLangInUrl', () => {
	it( 'reads the lang param', () => {
		setLocation( 'https://example.com/?lang=es&utm_source=x' );
		expect( getLangFromUrl() ).toBe( 'es' );
	} );

	it( 'sets and removes the lang param while preserving others', () => {
		setLocation( 'https://example.com/page/?utm_source=x' );
		setLangInUrl( 'de' );
		expect( window.location.search ).toContain( 'lang=de' );
		expect( window.location.search ).toContain( 'utm_source=x' );

		setLangInUrl( null );
		expect( window.location.search ).not.toContain( 'lang=' );
		expect( window.location.search ).toContain( 'utm_source=x' );
	} );
} );
