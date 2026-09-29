import { protectTerms, restoreTerms } from '../protect-terms';

describe( 'protectTerms / restoreTerms', () => {
	it( 'is a no-op when no terms are configured', () => {
		const { text, restoreMap } = protectTerms( 'Bienvenue chez Maxev', [] );
		expect( text ).toBe( 'Bienvenue chez Maxev' );
		expect( restoreMap.size ).toBe( 0 );
	} );

	it( 'protects a single term and restores it exactly', () => {
		const { text, restoreMap } = protectTerms( 'Bienvenue chez Maxev', [
			'Maxev',
		] );
		expect( text ).not.toContain( 'Maxev' );
		expect( text ).toMatch( /__SIMPLETRAD_TERM_0__/ );

		// Simulate a translation engine translating around the placeholder.
		const translated = text.replace( 'Bienvenue chez', 'Welcome to' );
		const restored = restoreTerms( translated, restoreMap );
		expect( restored ).toBe( 'Welcome to Maxev' );
	} );

	it( 'protects multiple distinct terms in the same sentence', () => {
		const terms = [ 'Maxev', 'SimpleTrad' ];
		const { text, restoreMap } = protectTerms(
			'Maxev présente SimpleTrad',
			terms
		);
		const translated = text.replace( 'présente', 'presents' );
		expect( restoreTerms( translated, restoreMap ) ).toBe(
			'Maxev presents SimpleTrad'
		);
	} );

	it( 'protects a term that appears multiple times', () => {
		const { text, restoreMap } = protectTerms( 'Maxev aime Maxev', [
			'Maxev',
		] );
		expect( text.match( /__SIMPLETRAD_TERM_\d+__/g ) || [] ).toHaveLength(
			2
		);
		const translated = text.replace( 'aime', 'loves' );
		expect( restoreTerms( translated, restoreMap ) ).toBe(
			'Maxev loves Maxev'
		);
	} );

	it( 'matches case-insensitively but restores the exact original casing found in the DOM', () => {
		const { text, restoreMap } = protectTerms( 'BIENVENUE CHEZ MAXEV', [
			'Maxev',
		] );
		// The literal DOM substring "MAXEV" must be what gets restored, not
		// the settings value "Maxev".
		expect( Array.from( restoreMap.values() ) ).toEqual( [ 'MAXEV' ] );
		const translated = text.replace( 'BIENVENUE CHEZ', 'WELCOME TO' );
		expect( restoreTerms( translated, restoreMap ) ).toBe(
			'WELCOME TO MAXEV'
		);
	} );

	it( 'handles a longer term containing a shorter configured term without partial corruption', () => {
		const terms = [ 'Hôtel', 'Hôtel Martinez' ];
		const { text, restoreMap } = protectTerms(
			'Bienvenue à l’Hôtel Martinez',
			terms
		);
		// Only one placeholder should exist: the longer term wins, so the
		// shorter "Hôtel" is never separately matched inside it.
		expect( text.match( /__SIMPLETRAD_TERM_\d+__/g ) || [] ).toHaveLength(
			1
		);
		expect( restoreTerms( text, restoreMap ) ).toBe(
			'Bienvenue à l’Hôtel Martinez'
		);
	} );

	it( 'leaves text untouched when the term is not present', () => {
		const { text, restoreMap } = protectTerms( 'Bienvenue chez nous', [
			'Maxev',
		] );
		expect( text ).toBe( 'Bienvenue chez nous' );
		expect( restoreMap.size ).toBe( 0 );
	} );

	it( 'restores even if the engine altered the placeholder casing', () => {
		const { text, restoreMap } = protectTerms( 'Bienvenue chez Maxev', [
			'Maxev',
		] );
		const shoutedPlaceholder = text.toUpperCase(); // simulate an engine uppercasing everything
		expect( restoreTerms( shoutedPlaceholder, restoreMap ) ).toBe(
			'BIENVENUE CHEZ Maxev'
		);
	} );
} );
