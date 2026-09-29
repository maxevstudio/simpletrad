import { normalizeLocale, detectPreferredLanguage } from '../locale-detect';

describe( 'normalizeLocale', () => {
	it( 'strips region subtags', () => {
		expect( normalizeLocale( 'en-GB' ) ).toBe( 'en' );
		expect( normalizeLocale( 'en-US' ) ).toBe( 'en' );
		expect( normalizeLocale( 'fr-FR' ) ).toBe( 'fr' );
		expect( normalizeLocale( 'es-ES' ) ).toBe( 'es' );
	} );

	it( 'handles underscores and mixed case', () => {
		expect( normalizeLocale( 'PT_br' ) ).toBe( 'pt' );
	} );

	it( 'returns an empty string for falsy input', () => {
		expect( normalizeLocale( '' ) ).toBe( '' );
		expect( normalizeLocale( undefined ) ).toBe( '' );
	} );
} );

describe( 'detectPreferredLanguage', () => {
	const originalLanguages = window.navigator.languages;
	const originalLanguage = window.navigator.language;

	afterEach( () => {
		Object.defineProperty( window.navigator, 'languages', {
			value: originalLanguages,
			configurable: true,
		} );
		Object.defineProperty( window.navigator, 'language', {
			value: originalLanguage,
			configurable: true,
		} );
	} );

	function mockNavigatorLanguages( languages ) {
		Object.defineProperty( window.navigator, 'languages', {
			value: languages,
			configurable: true,
		} );
		Object.defineProperty( window.navigator, 'language', {
			value: languages[ 0 ],
			configurable: true,
		} );
	}

	it( 'picks the first enabled language among navigator.languages', () => {
		mockNavigatorLanguages( [ 'de-DE', 'en-GB', 'fr-FR' ] );
		expect( detectPreferredLanguage( [ 'en', 'fr' ] ) ).toBe( 'en' );
	} );

	it( 'returns null when no enabled language matches', () => {
		mockNavigatorLanguages( [ 'de-DE' ] );
		expect( detectPreferredLanguage( [ 'en', 'fr' ] ) ).toBeNull();
	} );

	it( 'falls back to navigator.language when navigator.languages is empty', () => {
		Object.defineProperty( window.navigator, 'languages', {
			value: [],
			configurable: true,
		} );
		Object.defineProperty( window.navigator, 'language', {
			value: 'it-IT',
			configurable: true,
		} );
		expect( detectPreferredLanguage( [ 'it' ] ) ).toBe( 'it' );
	} );
} );
