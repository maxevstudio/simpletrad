<?php
/**
 * REST API endpoints for the SimpleTrad admin settings screen.
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Exposes `simpletrad/v1/settings` and `simpletrad/v1/languages`, both
 * restricted to users who can `manage_options`. Reads and writes go through
 * Settings::get_all() / Settings::update() so validation stays centralized.
 */
class Rest_Controller {

	const NAMESPACE_ = 'simpletrad/v1';

	/**
	 * Registers REST routes.
	 */
	public function register_routes() {
		register_rest_route(
			self::NAMESPACE_,
			'/settings',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
					'args'                => $this->get_settings_schema(),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE_,
			'/languages',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_languages' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);
	}

	/**
	 * Only administrators (or anyone granted `manage_options`) may read or
	 * write SimpleTrad settings. WordPress core already verifies the REST
	 * nonce (`X-WP-Nonce`) sent by `@wordpress/api-fetch` before this runs.
	 *
	 * @return bool
	 */
	public function check_permission() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * GET /settings
	 *
	 * @return \WP_REST_Response
	 */
	public function get_settings() {
		return new \WP_REST_Response( Settings::get_all(), 200 );
	}

	/**
	 * POST /settings
	 *
	 * @param \WP_REST_Request $request Request instance.
	 * @return \WP_REST_Response
	 */
	public function update_settings( \WP_REST_Request $request ) {
		$saved = Settings::update( $request->get_json_params() );

		return new \WP_REST_Response( $saved, 200 );
	}

	/**
	 * GET /languages — returns the full catalogue for the React token field.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_languages() {
		$catalog = Languages::get_catalog();
		$out     = array();

		foreach ( $catalog as $code => $entry ) {
			$out[] = array(
				'code'        => $code,
				'name_fr'     => $entry['name_fr'],
				'name_native' => $entry['name_native'],
			);
		}

		return new \WP_REST_Response( $out, 200 );
	}

	/**
	 * Minimal args schema used to sanitize/validate at the REST layer in
	 * addition to Settings::update()'s own defensive sanitization.
	 *
	 * @return array
	 */
	private function get_settings_schema() {
		return array(
			'source_language'     => array(
				'type'              => 'string',
				'sanitize_callback' => array( 'SimpleTrad\\Settings', 'sanitize_language_code' ),
			),
			'target_languages'    => array(
				'type' => 'array',
			),
			'auto_detect'         => array(
				'type' => 'boolean',
			),
			'switcher_display'    => array(
				'type' => 'string',
			),
			'switcher_layout'     => array(
				'type' => 'string',
			),
			'excluded_selectors'  => array(
				'type' => 'array',
			),
			'fallback_models_url' => array(
				'type'              => 'string',
				'sanitize_callback' => 'esc_url_raw',
			),
			'custom_css'          => array(
				'type'              => 'string',
				'sanitize_callback' => array( 'SimpleTrad\\Settings', 'sanitize_custom_css' ),
			),
			'protected_terms'     => array(
				'type' => 'array',
			),
			'floating_enabled'     => array(
				'type' => 'boolean',
			),
			'floating_position'    => array(
				'type' => 'string',
			),
			'floating_back_to_top' => array(
				'type' => 'boolean',
			),
		);
	}
}
