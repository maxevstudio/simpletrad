import { TranslationController } from '../controller';
import { TranslationEngineRegistry } from '../engine';

jest.mock( '../engine' );

/**
 * Integration test for the full per-string pipeline wired in
 * `translateRoot()`: protect terms → translate → restore terms → fix case →
 * DOM, using a fake engine so we can assert on exactly what text reaches
 * "the engine" and control what it returns.
 */
describe( 'TranslationController translation pipeline', () => {
	let fakeTranslateBatch;

	beforeEach( () => {
		document.body.innerHTML = '';
		fakeTranslateBatch = jest.fn();

		TranslationEngineRegistry.mockImplementation( () => ( {
			resolve: jest.fn().mockResolvedValue( {
				engine: { translateBatch: fakeTranslateBatch },
				status: 'available',
			} ),
		} ) );
	} );

	function makeController( overrides = {} ) {
		return new TranslationController( {
			sourceLanguage: 'fr',
			targetLanguages: [ { code: 'en' } ],
			noTranslateClass: 'simpletrad-no-translate',
			excludedSelectors: [],
			protectedTerms: [],
			...overrides,
		} );
	}

	it( 'protects a configured term through translation and restores its exact casing', async () => {
		document.body.innerHTML = '<p>Bienvenue chez Maxev</p>';

		fakeTranslateBatch.mockImplementation( ( texts ) =>
			Promise.resolve(
				texts.map( ( text ) =>
					text.replace( 'Bienvenue chez', 'Welcome to' )
				)
			)
		);

		const controller = makeController( { protectedTerms: [ 'Maxev' ] } );
		const success = await controller.translateRoot( document.body, 'en' );

		expect( success ).toBe( true );
		expect( document.body.textContent ).toBe( 'Welcome to Maxev' );

		// The engine itself must never have seen the literal brand name.
		const [ sentTexts ] = fakeTranslateBatch.mock.calls[ 0 ];
		expect( sentTexts[ 0 ] ).not.toContain( 'Maxev' );
	} );

	it( 'forces the translated output back to uppercase when the source was fully uppercase', async () => {
		document.body.innerHTML = '<button>RÉSERVER MAINTENANT</button>';
		fakeTranslateBatch.mockResolvedValue( [ 'book now' ] );

		const controller = makeController();
		await controller.translateRoot( document.body, 'en' );

		expect( document.body.textContent ).toBe( 'BOOK NOW' );
	} );

	it( 'only capitalizes the first letter when the source started with a capital', async () => {
		document.body.innerHTML = '<h1>Découvrir nos chambres</h1>';
		fakeTranslateBatch.mockResolvedValue( [ 'discover our rooms' ] );

		const controller = makeController();
		await controller.translateRoot( document.body, 'en' );

		expect( document.body.textContent ).toBe( 'Discover our rooms' );
	} );

	it( 'combines protected terms and case correction without cross-contamination', async () => {
		document.body.innerHTML = '<p>Découvrez SimpleTrad à Cannes</p>';

		fakeTranslateBatch.mockImplementation( ( texts ) =>
			Promise.resolve(
				texts.map( ( text ) =>
					text
						.replace( 'Découvrez', 'Discover' )
						.replace( 'à Cannes', 'in Cannes' )
				)
			)
		);

		const controller = makeController( {
			protectedTerms: [ 'SimpleTrad' ],
		} );
		await controller.translateRoot( document.body, 'en' );

		expect( document.body.textContent ).toBe(
			'Discover SimpleTrad in Cannes'
		);
	} );

	it( 'restores the original text when switching back to the source language, never re-translating it', async () => {
		document.body.innerHTML = '<p>Bonjour</p>';
		fakeTranslateBatch.mockResolvedValue( [ 'Hello' ] );

		const controller = makeController();
		await controller.translateRoot( document.body, 'en' );
		expect( document.body.textContent ).toBe( 'Hello' );

		const { restoreOriginals } = jest.requireActual( '../dom-walker' );
		restoreOriginals( controller.registry );
		expect( document.body.textContent ).toBe( 'Bonjour' );

		fakeTranslateBatch.mockClear();
		await controller.translateRoot( document.body, 'en' );
		// Must translate from the pristine "Bonjour" again, never from "Hello".
		const [ sentTexts ] = fakeTranslateBatch.mock.calls[ 0 ];
		expect( sentTexts ).toContain( 'Bonjour' );
	} );

	it( 'switches between two target languages from the original text', async () => {
		document.body.innerHTML = '<p>Bonjour</p>';
		fakeTranslateBatch.mockImplementation( ( texts, from, to ) =>
			Promise.resolve(
				texts.map( () => ( to === 'it' ? 'Ciao' : 'Hello' ) )
			)
		);

		const controller = makeController();
		await controller.setLanguage( 'en' );
		await controller.setLanguage( 'it' );

		expect( document.body.textContent ).toBe( 'Ciao' );
		expect( fakeTranslateBatch.mock.calls[ 1 ][ 0 ] ).toEqual( [
			'Bonjour',
		] );

		await controller.setLanguage( 'fr' );
		expect( document.body.textContent ).toBe( 'Bonjour' );
	} );

	it( 'drops a slow translation when the visitor switched again meanwhile', async () => {
		document.body.innerHTML = '<p>Bonjour</p>';
		let finishEnglish;
		fakeTranslateBatch.mockImplementation(
			( texts, from, to ) =>
				new Promise( ( resolve ) => {
					if ( to === 'en' ) {
						finishEnglish = () => resolve( [ 'Hello' ] );
					} else {
						resolve( [ 'Ciao' ] );
					}
				} )
		);

		const controller = makeController();
		const english = controller.setLanguage( 'en' );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		expect( controller.requestedLanguage ).toBe( 'en' );

		// Back to French while English is still loading.
		await controller.setLanguage( 'fr' );
		finishEnglish();

		expect( await english ).toBe( false );
		expect( document.body.textContent ).toBe( 'Bonjour' );
		expect( controller.currentLanguage ).toBe( 'fr' );
	} );
} );
