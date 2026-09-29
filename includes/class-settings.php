<?php
/**
 * Settings storage & sanitization for SimpleTrad.
 *
 * All plugin settings live in a single structured `wp_options` row
 * (`simpletrad_settings`) as required by the project's specification:
 * translations themselves are never persisted anywhere.
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads, validates and writes the single `simpletrad_settings` option.
 */
class Settings {

	const OPTION_KEY = 'simpletrad_settings';

	/**
	 * Returns the hard-coded default settings.
	 *
	 * @return array
	 */
	public static function get_defaults() {
		return array(
			'source_language'   => 'fr',
			'target_languages'  => array(),
			'auto_detect'       => true,
			'switcher_display'  => 'name', // name | code | flag_name | flag.
			'switcher_layout'   => 'horizontal', // horizontal | dropdown.
			'excluded_selectors' => array(),
			'fallback_models_url' => '',
		);
	}

	/**
	 * Ensures the option exists (with defaults) right after activation.
	 * Never overwrites existing settings.
	 */
	public static function maybe_set_defaults() {
		if ( false === get_option( self::OPTION_KEY, false ) ) {
			add_option( self::OPTION_KEY, self::get_defaults() );
		}
	}

	/**
	 * Returns the current settings merged with defaults so newly introduced
	 * keys always have a sane value even after an update.
	 *
	 * @return array
	 */
	public static function get_all() {
		$stored = get_option( self::OPTION_KEY, array() );

		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		return wp_parse_args( $stored, self::get_defaults() );
	}

	/**
	 * Validates and persists a full settings payload coming from the REST
	 * API. Unknown keys are dropped; every known key is sanitized
	 * individually so malformed client input can never corrupt the option.
	 *
	 * @param array $input Raw settings payload.
	 * @return array Sanitized settings that were actually saved.
	 */
	public static function update( array $input ) {
		$defaults  = self::get_defaults();
		$current   = self::get_all();
		$sanitized = $current;

		if ( isset( $input['source_language'] ) ) {
			$code = self::sanitize_language_code( $input['source_language'] );

			if ( isset( Languages::get_catalog()[ $code ] ) ) {
				$sanitized['source_language'] = $code;
			}
		}

		if ( isset( $input['target_languages'] ) && is_array( $input['target_languages'] ) ) {
			$catalog = Languages::get_catalog();

			$sanitized['target_languages'] = array_values(
				array_unique(
					array_filter(
						array_map( array( __CLASS__, 'sanitize_language_code' ), $input['target_languages'] ),
						function ( $code ) use ( $catalog ) {
							return isset( $catalog[ $code ] );
						}
					)
				)
			);
		}

		if ( isset( $input['auto_detect'] ) ) {
			$sanitized['auto_detect'] = (bool) $input['auto_detect'];
		}

		if ( isset( $input['switcher_display'] ) ) {
			$allowed = array( 'name', 'code', 'flag_name', 'flag' );
			$value   = sanitize_key( $input['switcher_display'] );
			$sanitized['switcher_display'] = in_array( $value, $allowed, true ) ? $value : $defaults['switcher_display'];
		}

		if ( isset( $input['switcher_layout'] ) ) {
			$allowed = array( 'horizontal', 'dropdown' );
			$value   = sanitize_key( $input['switcher_layout'] );
			$sanitized['switcher_layout'] = in_array( $value, $allowed, true ) ? $value : $defaults['switcher_layout'];
		}

		if ( isset( $input['excluded_selectors'] ) && is_array( $input['excluded_selectors'] ) ) {
			$sanitized['excluded_selectors'] = array_values(
				array_filter(
					array_map( 'sanitize_text_field', $input['excluded_selectors'] )
				)
			);
		}

		if ( isset( $input['fallback_models_url'] ) ) {
			$sanitized['fallback_models_url'] = esc_url_raw( trim( (string) $input['fallback_models_url'] ) );
		}

		// A language can never be both the source and a target at once.
		$sanitized['target_languages'] = array_values(
			array_diff( $sanitized['target_languages'], array( $sanitized['source_language'] ) )
		);

		update_option( self::OPTION_KEY, $sanitized );

		return $sanitized;
	}

	/**
	 * Sanitizes a single BCP 47 / ISO language code (letters, digits and
	 * hyphens only, e.g. `en`, `zh-Hant`).
	 *
	 * @param string $code Raw language code.
	 * @return string
	 */
	public static function sanitize_language_code( $code ) {
		$code = trim( (string) $code );

		return preg_replace( '/[^A-Za-z0-9\-]/', '', $code );
	}
}
