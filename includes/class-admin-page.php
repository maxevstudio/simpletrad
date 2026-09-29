<?php
/**
 * The single SimpleTrad settings screen (menu page + React mount point).
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the one and only SimpleTrad admin page. No sub-menus: the whole
 * configuration UI lives in a single React screen.
 */
class Admin_Page {

	/**
	 * Registers the top-level menu page.
	 */
	public function register_menu() {
		add_menu_page(
			__( 'SimpleTrad', 'simpletrad' ),
			__( 'SimpleTrad', 'simpletrad' ),
			'manage_options',
			'simpletrad',
			array( $this, 'render' ),
			'dashicons-translation',
			80
		);
	}

	/**
	 * Renders the React mount point.
	 */
	public function render() {
		echo '<div id="simpletrad-admin-root" class="simpletrad-admin-root"></div>';
	}
}
