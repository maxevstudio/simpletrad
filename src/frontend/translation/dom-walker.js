/**
 * DOM scanning: collects translatable text nodes and attributes using a
 * `TreeWalker` (never a blind `innerHTML` pass), keeps the original values
 * in memory for the lifetime of the page, and restores them instantly when
 * switching back to the source language.
 */

const SKIPPED_TAGS = new Set( [
	'SCRIPT',
	'STYLE',
	'NOSCRIPT',
	'TEMPLATE',
	'CODE',
	'PRE',
	'SVG',
	'TEXTAREA',
	'IFRAME',
	'CANVAS',
] );

const TRANSLATABLE_ATTRIBUTES = [ 'placeholder', 'title', 'aria-label' ];

// `alt` text is only translated when it reads like a real sentence/label,
// never when it looks like a filename or is empty — this avoids mistranslating
// technical alt text while still improving accessibility for real captions.
const ALT_LOOKS_LIKE_FILENAME = /\.[a-z0-9]{2,5}$/i;

/**
 * Returns true if a number-only or price-like string should be left alone.
 *
 * @param {string} text Candidate text.
 * @return {boolean}
 */
function isPurelyNumericOrPrice( text ) {
	return /^[\s\d.,€$£¥%+-]+$/.test( text );
}

/**
 * Determines whether an element (or one of its ancestors) must be excluded
 * from translation: `.simpletrad-no-translate`, `translate="no"`, or any of
 * the admin-configured CSS selectors.
 *
 * @param {Element}  element           Element to test.
 * @param {string}   noTranslateClass  The plugin's standard exclusion class.
 * @param {string[]} excludedSelectors Extra CSS selectors from settings.
 * @return {boolean}
 */
export function isExcluded( element, noTranslateClass, excludedSelectors ) {
	const combinedSelector = [
		`.${ noTranslateClass }`,
		'[translate="no"]',
		...excludedSelectors.filter( Boolean ),
	].join( ',' );

	try {
		return element.closest( combinedSelector ) !== null;
	} catch ( error ) {
		// An invalid selector supplied by the admin must never break the page.
		return (
			element.closest( `.${ noTranslateClass }, [translate="no"]` ) !==
			null
		);
	}
}

/**
 * Walks a root node and collects every translatable text node and
 * attribute, grouped by their current text so identical strings are only
 * ever translated (and requested from the engine) once.
 *
 * @param {Node}     root              Root node to scan.
 * @param {string}   noTranslateClass  Standard exclusion class.
 * @param {string[]} excludedSelectors Admin-configured excluded CSS selectors.
 * @param {Map}      registry          Node → original-value cache to populate/reuse.
 * @return {Map<string, Array<{node: Node, kind: string}>>} text → targets.
 */
export function collectTranslatables(
	root,
	noTranslateClass,
	excludedSelectors,
	registry
) {
	const groups = new Map();

	const addTarget = ( node, kind, text ) => {
		const trimmed = text.trim();

		if ( ! trimmed || isPurelyNumericOrPrice( trimmed ) ) {
			return;
		}

		if ( ! registry.has( node ) ) {
			registry.set( node, new Map() );
		}
		registry.get( node ).set( kind, text );

		if ( ! groups.has( trimmed ) ) {
			groups.set( trimmed, [] );
		}
		groups.get( trimmed ).push( { node, kind } );
	};

	const rootElement =
		root.nodeType === Node.ELEMENT_NODE ? root : root.body || document.body;

	const walker = document.createTreeWalker(
		rootElement,
		// eslint-disable-next-line no-bitwise -- combining TreeWalker node-type flags is the documented DOM API usage.
		NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
		{
			acceptNode( node ) {
				const element =
					node.nodeType === Node.ELEMENT_NODE
						? node
						: node.parentElement;

				if ( ! element ) {
					return NodeFilter.FILTER_SKIP;
				}

				if ( SKIPPED_TAGS.has( element.tagName ) ) {
					return NodeFilter.FILTER_REJECT;
				}

				if (
					isExcluded( element, noTranslateClass, excludedSelectors )
				) {
					return NodeFilter.FILTER_REJECT;
				}

				return NodeFilter.FILTER_ACCEPT;
			},
		}
	);

	let current = walker.nextNode();

	while ( current ) {
		if ( current.nodeType === Node.TEXT_NODE ) {
			addTarget( current, 'text', current.nodeValue );
		} else if ( current.nodeType === Node.ELEMENT_NODE ) {
			TRANSLATABLE_ATTRIBUTES.forEach( ( attr ) => {
				if ( current.hasAttribute( attr ) ) {
					addTarget(
						current,
						`attr:${ attr }`,
						current.getAttribute( attr )
					);
				}
			} );

			if (
				current.tagName === 'IMG' &&
				current.hasAttribute( 'alt' ) &&
				! ALT_LOOKS_LIKE_FILENAME.test(
					current.getAttribute( 'alt' ).trim()
				)
			) {
				addTarget( current, 'attr:alt', current.getAttribute( 'alt' ) );
			}
		}

		current = walker.nextNode();
	}

	return groups;
}

/**
 * Applies translated strings back onto their DOM targets.
 *
 * @param {Array<{node: Node, kind: string}>} targets    Targets sharing the same source text.
 * @param {string}                            translated Translated text to apply.
 */
export function applyTranslation( targets, translated ) {
	targets.forEach( ( { node, kind } ) => {
		if ( kind === 'text' ) {
			node.nodeValue = translated;
		} else if ( kind.startsWith( 'attr:' ) ) {
			node.setAttribute( kind.slice( 5 ), translated );
		}
	} );
}

/**
 * Restores every previously modified node/attribute back to its original
 * (source-language) value.
 *
 * @param {Map} registry Node → Map(kind → original value).
 */
export function restoreOriginals( registry ) {
	registry.forEach( ( kinds, node ) => {
		kinds.forEach( ( original, kind ) => {
			if ( kind === 'text' ) {
				node.nodeValue = original;
			} else if ( kind.startsWith( 'attr:' ) ) {
				node.setAttribute( kind.slice( 5 ), original );
			}
		} );
	} );
}
