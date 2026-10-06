<?php
/**
 * Central wiring for SimpleTrad.
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Singleton that instantiates the plugin's collaborators and hooks them
 * into WordPress. Kept intentionally thin: each class owns its own logic.
 */
class Plugin {

	/**
	 * Singleton instance.
	 *
	 * @var Plugin|null
	 */
	private static $instance = null;

	/**
	 * Returns the singleton instance.
	 *
	 * @return Plugin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Wires every collaborator into WordPress hooks.
	 */
	public function init() {
		load_plugin_textdomain( 'simpletrad', false, dirname( SIMPLETRAD_BASENAME ) . '/languages' );

		$assets    = new Assets();
		$shortcode = new Shortcode();
		$floating  = new Floating();
		$admin     = new Admin_Page();
		$rest      = new Rest_Controller();
		$updater   = new Updater();

		add_action( 'wp_enqueue_scripts', array( $assets, 'register_frontend' ) );
		add_action( 'admin_enqueue_scripts', array( $assets, 'enqueue_admin' ) );

		add_action( 'init', array( $shortcode, 'register' ) );
		add_action( 'init', array( $floating, 'register' ) );

		// REST routes must be registered on every request (REST calls do not
		// run inside is_admin()), while the menu page and updater are only
		// relevant inside wp-admin.
		add_action( 'rest_api_init', array( $rest, 'register_routes' ) );

		if ( is_admin() ) {
			add_action( 'admin_menu', array( $admin, 'register_menu' ) );
			$updater->init();
		}
	}
}
