<?php
/**
 * Script & style registration/enqueuing for SimpleTrad.
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers front-end and admin assets. Front-end assets are only
 * *registered* on `wp_enqueue_scripts` and actually *enqueued* on demand by
 * Shortcode (i.e. only when `[simpletrad]` is actually rendered on the
 * page), so SimpleTrad never loads its front-end JS on pages that don't use
 * the switcher.
 */
class Assets {

	const FRONTEND_HANDLE = 'simpletrad-frontend';
	const ADMIN_HANDLE    = 'simpletrad-admin';

	/**
	 * Registers (without enqueuing) the front-end script and style.
	 */
	public function register_frontend() {
		$asset_file = SIMPLETRAD_PATH . 'build/frontend.asset.php';
		$asset      = file_exists( $asset_file ) ? require $asset_file : array(
			'dependencies' => array(),
			'version'      => SIMPLETRAD_VERSION,
		);

		wp_register_script(
			self::FRONTEND_HANDLE,
			SIMPLETRAD_URL . 'build/frontend.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_register_style(
			self::FRONTEND_HANDLE,
			SIMPLETRAD_URL . 'build/style-frontend.css',
			array(),
			$asset['version']
		);

		$settings = Settings::get_all();

		wp_localize_script(
			self::FRONTEND_HANDLE,
			'SimpleTradConfig',
			array(
				'sourceLanguage'    => $settings['source_language'],
				'targetLanguages'   => array_map(
					array( $this, 'map_language_for_js' ),
					$settings['target_languages']
				),
				'autoDetect'        => (bool) $settings['auto_detect'],
				'switcherDisplay'   => $settings['switcher_display'],
				'switcherLayout'    => $settings['switcher_layout'],
				'excludedSelectors' => $settings['excluded_selectors'],
				'fallbackModelsUrl' => $settings['fallback_models_url'],
				'queryParam'        => 'lang',
				'noTranslateClass'  => 'simpletrad-no-translate',
				'i18n'              => array(
					/* translators: shown in the switcher while a translation model is loading. */
					'loading' => __( 'Traduction…', 'simpletrad' ),
				),
			)
		);
	}

	/**
	 * Formats a language code with its catalogue metadata for JS consumption.
	 *
	 * @param string $code Language code.
	 * @return array
	 */
	private function map_language_for_js( $code ) {
		$entry = Languages::get_language( $code );

		return array(
			'code'        => $code,
			'name_fr'     => $entry ? $entry['name_fr'] : $code,
			'name_native' => $entry ? $entry['name_native'] : $code,
		);
	}

	/**
	 * Enqueues the front-end assets. Called on demand from Shortcode.
	 */
	public function enqueue_frontend() {
		wp_enqueue_script( self::FRONTEND_HANDLE );
		wp_enqueue_style( self::FRONTEND_HANDLE );
	}

	/**
	 * Enqueues the React admin settings screen assets.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public function enqueue_admin( $hook_suffix ) {
		if ( 'toplevel_page_simpletrad' !== $hook_suffix ) {
			return;
		}

		$asset_file = SIMPLETRAD_PATH . 'build/admin.asset.php';
		$asset      = file_exists( $asset_file ) ? require $asset_file : array(
			'dependencies' => array(),
			'version'      => SIMPLETRAD_VERSION,
		);

		wp_enqueue_script(
			self::ADMIN_HANDLE,
			SIMPLETRAD_URL . 'build/admin.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			self::ADMIN_HANDLE,
			SIMPLETRAD_URL . 'build/style-admin.css',
			array( 'wp-components' ),
			$asset['version']
		);

		wp_localize_script(
			self::ADMIN_HANDLE,
			'SimpleTradAdmin',
			array(
				'restUrl'   => esc_url_raw( rest_url() ),
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'shortcode' => '[simpletrad]',
			)
		);

		wp_set_script_translations( self::ADMIN_HANDLE, 'simpletrad' );
	}
}
