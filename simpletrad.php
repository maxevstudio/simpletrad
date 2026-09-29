<?php
/**
 * Plugin Name:       SimpleTrad
 * Plugin URI:         https://github.com/maxev/simpletrad
 * Description:        Traduit visuellement le front-end de votre site directement dans le navigateur du visiteur, sans dupliquer aucun contenu WordPress.
 * Version:            1.0.0
 * Requires at least:  6.4
 * Requires PHP:       7.4
 * Author:             Maxev
 * Author URI:         https://github.com/maxev
 * License:             GPL v2 or later
 * License URI:         https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:         simpletrad
 * Domain Path:         /languages
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Do not access this file directly.
}

define( 'SIMPLETRAD_VERSION', '1.0.0' );
define( 'SIMPLETRAD_FILE', __FILE__ );
define( 'SIMPLETRAD_PATH', plugin_dir_path( __FILE__ ) );
define( 'SIMPLETRAD_URL', plugin_dir_url( __FILE__ ) );
define( 'SIMPLETRAD_BASENAME', plugin_basename( __FILE__ ) );

require_once SIMPLETRAD_PATH . 'includes/class-languages.php';
require_once SIMPLETRAD_PATH . 'includes/class-settings.php';
require_once SIMPLETRAD_PATH . 'includes/class-rest-controller.php';
require_once SIMPLETRAD_PATH . 'includes/class-assets.php';
require_once SIMPLETRAD_PATH . 'includes/class-shortcode.php';
require_once SIMPLETRAD_PATH . 'includes/class-admin-page.php';
require_once SIMPLETRAD_PATH . 'includes/class-updater.php';
require_once SIMPLETRAD_PATH . 'includes/class-plugin.php';

/**
 * Boots the plugin. Kept as a thin bootstrap so the real wiring lives in
 * Plugin::init(), which keeps simpletrad.php easy to read.
 */
function simpletrad_boot() {
	Plugin::instance()->init();
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\\simpletrad_boot' );

/**
 * Runs once on activation. No data migration is required since SimpleTrad
 * never stores translations; only default settings are provisioned.
 */
function simpletrad_activate() {
	Settings::maybe_set_defaults();
}
register_activation_hook( __FILE__, __NAMESPACE__ . '\\simpletrad_activate' );

/**
 * Runs on deactivation. Nothing is deleted here on purpose: deactivating the
 * plugin must never break the site or lose configuration.
 */
function simpletrad_deactivate() {
	// Intentionally left blank: deactivation must not delete any data.
}
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\\simpletrad_deactivate' );
