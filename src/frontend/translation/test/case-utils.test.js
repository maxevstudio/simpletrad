import {
	detectCasePattern,
	applyCasePattern,
	normalizeEngineCasing,
} from '../case-utils';

describe( 'detectCasePattern', () => {
	it.each( [
		[ 'Bienvenue', 'capitalized' ],
		[ 'BIENVENUE', 'upper' ],
		[ 'bienvenue', 'lower' ],
		[ 'Découvrir nos chambres', 'capitalized' ],
		[ 'RÉSERVER MAINTENANT', 'upper' ],
		[ 'Réserver maintenant', 'capitalized' ],
		[ 'Nos Services', 'capitalized' ],
		[ 'FAQ', 'upper' ],
		[ '123', 'none' ],
		[ '19,99 €', 'none' ],
	] )( 'detects "%s" as %s', ( text, expected ) => {
		expect( detectCasePattern( text ) ).toBe( expected );
	} );

	it( 'treats mixed-case brand-like words as "mixed" (never forced)', () => {
		// The very warning in the spec: a naive word-by-word or
		// first-letter-only heuristic must not corrupt these.
		expect( detectCasePattern( 'iPhone' ) ).toBe( 'mixed' );
		expect( detectCasePattern( 'eCommerce' ) ).toBe( 'mixed' );
	} );
} );

describe( 'applyCasePattern', () => {
	it( 'forces uppercase translation when source is fully uppercase', () => {
		expect( applyCasePattern( 'CONTACT', 'contact us' ) ).toBe(
			'CONTACT US'
		);
		expect( applyCasePattern( 'RÉSERVER MAINTENANT', 'book now' ) ).toBe(
			'BOOK NOW'
		);
	} );

	it( 'capitalizes only the first letter when source starts with a capital', () => {
		expect( applyCasePattern( 'Bonjour', 'hello' ) ).toBe( 'Hello' );
		expect( applyCasePattern( 'Réserver', 'book' ) ).toBe( 'Book' );
		expect(
			applyCasePattern( 'Découvrir nos chambres', 'discover our rooms' )
		).toBe( 'Discover our rooms' );
	} );

	it( 'does not force capitalization on every word (sentence case, not title case)', () => {
		// "Nos Services" is detected as 'capitalized' (first letter upper),
		// but only the first letter of the translation should be forced —
		// the rest of the engine's own output must be left untouched.
		expect( applyCasePattern( 'Nos Services', 'our services' ) ).toBe(
			'Our services'
		);
	} );

	it( 'never forces an artificial capital when the source is fully lowercase', () => {
		expect( applyCasePattern( 'contact', 'contact' ) ).toBe( 'contact' );
		expect( applyCasePattern( 'contact', 'Contact' ) ).toBe( 'Contact' );
	} );

	it( 'leaves mixed-case brand-like translations untouched', () => {
		expect( applyCasePattern( 'iPhone', 'iPhone' ) ).toBe( 'iPhone' );
		expect( applyCasePattern( 'eCommerce', 'eCommerce' ) ).toBe(
			'eCommerce'
		);
	} );

	it( 'is a no-op when the source has no letters', () => {
		expect( applyCasePattern( '123', '123' ) ).toBe( '123' );
	} );
} );

describe( 'normalizeEngineCasing', () => {
	it( 'lowercases a fully uppercase translation of a non-uppercase source', () => {
		expect(
			normalizeEngineCasing( 'et du Département', 'AND DEPARTMENT' )
		).toBe( 'and department' );
	} );

	it( 'keeps an uppercase translation when the source was uppercase', () => {
		expect( normalizeEngineCasing( 'CONTACT', 'CONTACT US' ) ).toBe(
			'CONTACT US'
		);
	} );

	it( 'keeps acronyms present verbatim in the source', () => {
		expect(
			normalizeEngineCasing( 'Les aides de la UE', 'THE UE GRANTS' )
		).toBe( 'the UE grants' );
	} );

	it( 'undoes engine-invented Title Case, sentence by sentence', () => {
		expect(
			normalizeEngineCasing(
				'Deux fonctions complémentaires, deux échelles d’action. Retrouvez mes engagements selon le mandat qui vous intéresse.',
				'Two Complementary Functions, Two Action Scale. Find my commitments according to the mandate that interests you.'
			)
		).toBe(
			'Two complementary functions, two action scale. Find my commitments according to the mandate that interests you.'
		);
	} );

	it( 'keeps proper nouns found verbatim in the source', () => {
		expect(
			normalizeEngineCasing(
				'Rencontre avec les habitants de Cannes et Grasse',
				'Meeting With The Residents Of Cannes And Grasse'
			)
		).toBe( 'Meeting with the residents of Cannes and Grasse' );
	} );

	it( 'trusts the engine when the source itself is Title Cased', () => {
		expect(
			normalizeEngineCasing(
				'Nos Services Premium',
				'Our Premium Services'
			)
		).toBe( 'Our Premium Services' );
	} );

	it( 'leaves a normal translation untouched', () => {
		expect(
			normalizeEngineCasing(
				'Bienvenue à Nice, chez Maxev',
				'Welcome to Nice, at Maxev'
			)
		).toBe( 'Welcome to Nice, at Maxev' );
	} );
} );
