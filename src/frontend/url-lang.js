/**
 * Handles the `?lang=xx` URL parameter: reading the current language,
 * updating the browser URL without a reload, and propagating (or removing)
 * the parameter on internal links so navigating to another WordPress page
 * keeps the chosen language.
 */

const FILE_EXTENSION_PATTERN =
	/\.(pdf|zip|rar|7z|docx?|xlsx?|pptx?|csv|jpe?g|png|gif|svg|webp|mp3|mp4|mov|avi|ics)$/i;

/**
 * Reads the `lang` query parameter from the current URL.
 *
 * @param {string} paramName Query parameter name (default `lang`).
 * @return {string|null}
 */
export function getLangFromUrl( paramName = 'lang' ) {
	const params = new URLSearchParams( window.location.search );
	return params.get( paramName );
}

/**
 * Updates the current URL's `lang` parameter without reloading the page,
 * preserving every other existing query parameter.
 *
 * @param {string|null} lang      New language code, or null to remove it.
 * @param {string}      paramName Query parameter name.
 */
export function setLangInUrl( lang, paramName = 'lang' ) {
	const url = new URL( window.location.href );

	if ( lang ) {
		url.searchParams.set( paramName, lang );
	} else {
		url.searchParams.delete( paramName );
	}

	window.history.replaceState( window.history.state, '', url.toString() );
}

/**
 * Determines whether a given anchor element is eligible to receive the
 * `lang` query parameter, per the plugin's exclusion rules: external links,
 * `mailto:`/`tel:`, `javascript:` pseudo-links, pure `#anchor` links,
 * wp-admin, login/logout, downloadable files and REST/API endpoints are all
 * left untouched.
 *
 * @param {HTMLAnchorElement} anchor Anchor element.
 * @return {boolean}
 */
export function isEligibleLink( anchor ) {
	const href = anchor.getAttribute( 'href' );

	if ( ! href || href.trim() === '' ) {
		return false;
	}

	if ( href.startsWith( '#' ) ) {
		return false;
	}

	if ( /^(mailto|tel|javascript):/i.test( href ) ) {
		return false;
	}

	if ( anchor.hasAttribute( 'download' ) ) {
		return false;
	}

	let url;

	try {
		url = new URL( href, window.location.href );
	} catch ( error ) {
		return false;
	}

	if ( url.origin !== window.location.origin ) {
		return false;
	}

	if ( FILE_EXTENSION_PATTERN.test( url.pathname ) ) {
		return false;
	}

	if ( /\/wp-admin\/|\/wp-login\.php|\/wp-json\//i.test( url.pathname ) ) {
		return false;
	}

	if ( /action=logout/i.test( url.search ) ) {
		return false;
	}

	return true;
}

/**
 * Applies (or removes) the `lang` parameter on every eligible internal link
 * currently in the document. Safe to call repeatedly (e.g. after
 * MutationObserver detects new links).
 *
 * @param {string|null} lang      Language to propagate, or null to strip it.
 * @param {string}      paramName Query parameter name.
 * @param {ParentNode}  root      Root node to scan (defaults to the whole document).
 */
export function propagateLangToLinks(
	lang,
	paramName = 'lang',
	root = document
) {
	const anchors = root.querySelectorAll( 'a[href]' );

	anchors.forEach( ( anchor ) => {
		if ( ! isEligibleLink( anchor ) ) {
			return;
		}

		const url = new URL(
			anchor.getAttribute( 'href' ),
			window.location.href
		);

		if ( lang ) {
			url.searchParams.set( paramName, lang );
		} else {
			url.searchParams.delete( paramName );
		}

		anchor.setAttribute(
			'href',
			`${ url.pathname }${ url.search }${ url.hash }`
		);
	} );
}
