import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import App from './App';
import './style.css';

const config = window.SimpleTradAdmin || {};

if ( config.nonce ) {
	apiFetch.use( apiFetch.createNonceMiddleware( config.nonce ) );
}

if ( config.restUrl ) {
	apiFetch.use( apiFetch.createRootURLMiddleware( config.restUrl ) );
}

const container = document.getElementById( 'simpletrad-admin-root' );

if ( container ) {
	createRoot( container ).render( <App /> );
}
