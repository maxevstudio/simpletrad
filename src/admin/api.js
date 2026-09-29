import apiFetch from '@wordpress/api-fetch';

/**
 * Thin wrapper around `@wordpress/api-fetch` for the two SimpleTrad REST
 * routes. Authentication (nonce) and error handling are already provided by
 * `api-fetch`'s default middlewares once `apiFetch.use( apiFetch.createNonceMiddleware( ... ) )`
 * is configured in `index.js`.
 */

const SETTINGS_PATH = '/simpletrad/v1/settings';
const LANGUAGES_PATH = '/simpletrad/v1/languages';

export function fetchSettings() {
	return apiFetch( { path: SETTINGS_PATH, method: 'GET' } );
}

export function saveSettings( settings ) {
	return apiFetch( { path: SETTINGS_PATH, method: 'POST', data: settings } );
}

export function fetchLanguageCatalog() {
	return apiFetch( { path: LANGUAGES_PATH, method: 'GET' } );
}
