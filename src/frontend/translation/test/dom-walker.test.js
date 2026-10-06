import {
	collectTranslatables,
	applyTranslation,
	restoreOriginals,
} from '../dom-walker';

describe( 'collectTranslatables', () => {
	beforeEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'collects visible text nodes and groups identical strings together', () => {
		document.body.innerHTML = `
			<h1>Bienvenue</h1>
			<p>Bonjour</p>
			<p>Bonjour</p>
		`;

		const registry = new Map();
		const groups = collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[],
			registry
		);

		expect( groups.has( 'Bienvenue' ) ).toBe( true );
		expect( groups.get( 'Bonjour' ) ).toHaveLength( 2 );
	} );

	it( 'ignores script/style content', () => {
		document.body.innerHTML = `
			<script>var untranslatable = "Bonjour";</script>
			<style>.foo { content: "Bonjour"; }</style>
			<p>Bonjour</p>
		`;

		const registry = new Map();
		const groups = collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[],
			registry
		);

		expect( groups.get( 'Bonjour' ) ).toHaveLength( 1 );
	} );

	it( 'ignores elements carrying the no-translate class or translate="no"', () => {
		document.body.innerHTML = `
			<p class="simpletrad-no-translate">Ne pas traduire</p>
			<p translate="no">Ne pas traduire non plus</p>
			<p>Texte normal</p>
		`;

		const registry = new Map();
		const groups = collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[],
			registry
		);

		expect( groups.has( 'Ne pas traduire' ) ).toBe( false );
		expect( groups.has( 'Ne pas traduire non plus' ) ).toBe( false );
		expect( groups.has( 'Texte normal' ) ).toBe( true );
	} );

	it( 'honors admin-configured excluded selectors', () => {
		document.body.innerHTML = `<div class="logo"><span>Acme Corp</span></div><p>Texte normal</p>`;

		const registry = new Map();
		const groups = collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[ '.logo' ],
			registry
		);

		expect( groups.has( 'Acme Corp' ) ).toBe( false );
		expect( groups.has( 'Texte normal' ) ).toBe( true );
	} );

	it( 'ignores purely numeric or price-like text', () => {
		document.body.innerHTML = `<p>123</p><p>19,99 €</p><p>Vrai texte</p>`;

		const registry = new Map();
		const groups = collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[],
			registry
		);

		expect( groups.has( '123' ) ).toBe( false );
		expect( groups.has( '19,99 €' ) ).toBe( false );
		expect( groups.has( 'Vrai texte' ) ).toBe( true );
	} );

	it( 'collects placeholder/title/aria-label attributes', () => {
		document.body.innerHTML = `<input placeholder="Votre nom" title="Champ requis" aria-label="Nom complet" />`;

		const registry = new Map();
		const groups = collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[],
			registry
		);

		expect( groups.has( 'Votre nom' ) ).toBe( true );
		expect( groups.has( 'Champ requis' ) ).toBe( true );
		expect( groups.has( 'Nom complet' ) ).toBe( true );
	} );

	it( 'skips alt text that looks like a filename', () => {
		document.body.innerHTML = `
			<img src="a.jpg" alt="photo-final-v2.jpg" />
			<img src="b.jpg" alt="Notre équipe au travail" />
		`;

		const registry = new Map();
		const groups = collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[],
			registry
		);

		expect( groups.has( 'photo-final-v2.jpg' ) ).toBe( false );
		expect( groups.has( 'Notre équipe au travail' ) ).toBe( true );
	} );
} );

describe( 'applyTranslation / restoreOriginals', () => {
	it( 'applies translated text and restores the original from the source, never chaining languages', () => {
		document.body.innerHTML = '<p>Bonjour</p>';
		const registry = new Map();
		const groups = collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[],
			registry
		);

		applyTranslation( groups.get( 'Bonjour' ), 'Hello' );
		expect( document.body.textContent.trim() ).toBe( 'Hello' );

		restoreOriginals( registry );
		expect( document.body.textContent.trim() ).toBe( 'Bonjour' );

		// A second translation pass must read the pristine registry value
		// (still "Bonjour"), proving FR → ES never goes through FR → EN.
		const groupsAgain = collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[],
			registry
		);
		expect( groupsAgain.has( 'Bonjour' ) ).toBe( true );
	} );
} );

describe( 'whitespace and language switching', () => {
	const collect = ( registry ) =>
		collectTranslatables(
			document.body,
			'simpletrad-no-translate',
			[],
			registry
		);

	it( 'keeps the whitespace around inline text (e.g. before an <em>)', () => {
		document.body.innerHTML = '<h2>La lettre <em>mensuelle</em></h2>';
		const registry = new Map();
		const groups = collect( registry );

		applyTranslation( groups.get( 'La lettre' ), 'The letter' );
		applyTranslation( groups.get( 'mensuelle' ), ' monthly ' );

		expect( document.body.innerHTML ).toBe(
			'<h2>The letter <em>monthly</em></h2>'
		);
	} );

	it( 'translates from the original when switching between two target languages', () => {
		document.body.innerHTML = '<p>Bonjour</p>';
		const registry = new Map();

		applyTranslation( collect( registry ).get( 'Bonjour' ), 'Hello' );

		// Switching EN → ES directly: the source must still be "Bonjour".
		const groups = collect( registry );
		expect( groups.has( 'Bonjour' ) ).toBe( true );
		expect( groups.has( 'Hello' ) ).toBe( false );

		applyTranslation( groups.get( 'Bonjour' ), 'Hola' );
		restoreOriginals( registry );
		expect( document.body.textContent ).toBe( 'Bonjour' );
	} );

	it( 'picks up text the page itself changed after a translation', () => {
		document.body.innerHTML = '<p>Bonjour</p>';
		const registry = new Map();

		applyTranslation( collect( registry ).get( 'Bonjour' ), 'Hello' );
		document.querySelector( 'p' ).firstChild.nodeValue = 'Au revoir';

		expect( collect( registry ).has( 'Au revoir' ) ).toBe( true );
	} );
} );
