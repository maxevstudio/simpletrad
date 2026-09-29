<?php
/**
 * The `[simpletrad]` language switcher shortcode.
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the language switcher markup. The actual language-switching
 * behaviour is attached client-side by the front-end script, which looks
 * for `.simpletrad-switcher` elements already present in the DOM.
 */
class Shortcode {

	/**
	 * Registers the shortcode.
	 */
	public function register() {
		add_shortcode( 'simpletrad', array( $this, 'render' ) );
	}

	/**
	 * Renders `[simpletrad]`.
	 *
	 * Supported attributes:
	 * - display: name | code | flag_name | flag (defaults to the global admin setting)
	 * - layout:  horizontal | dropdown (defaults to the global admin setting)
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string
	 */
	public function render( $atts ) {
		$settings = Settings::get_all();

		$atts = shortcode_atts(
			array(
				'display' => $settings['switcher_display'],
				'layout'  => $settings['switcher_layout'],
			),
			$atts,
			'simpletrad'
		);

		$allowed_display = array( 'name', 'code', 'flag_name', 'flag' );
		$display         = in_array( $atts['display'], $allowed_display, true ) ? $atts['display'] : $settings['switcher_display'];

		$allowed_layout = array( 'horizontal', 'dropdown' );
		$layout         = in_array( $atts['layout'], $allowed_layout, true ) ? $atts['layout'] : $settings['switcher_layout'];

		$languages = $settings['target_languages'];

		if ( empty( $languages ) ) {
			return '';
		}

		// The front-end script is only ever enqueued here, i.e. only on
		// pages that actually render the switcher.
		( new Assets() )->enqueue_frontend();

		$source = Languages::get_language( $settings['source_language'] );

		ob_start();
		?>
		<div
			class="simpletrad-switcher is-layout-<?php echo esc_attr( $layout ); ?>"
			data-simpletrad-switcher
			role="group"
			aria-label="<?php esc_attr_e( 'Choix de la langue', 'simpletrad' ); ?>"
		>
			<button
				type="button"
				class="simpletrad-language is-active"
				data-simpletrad-lang="<?php echo esc_attr( $settings['source_language'] ); ?>"
				aria-pressed="true"
			>
				<?php echo $this->render_label( $settings['source_language'], $source, $display ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside render_label(). ?>
			</button>
			<?php foreach ( $languages as $code ) : ?>
				<?php $entry = Languages::get_language( $code ); ?>
				<button
					type="button"
					class="simpletrad-language"
					data-simpletrad-lang="<?php echo esc_attr( $code ); ?>"
					aria-pressed="false"
				>
					<?php echo $this->render_label( $code, $entry, $display ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside render_label(). ?>
				</button>
			<?php endforeach; ?>
		</div>
		<?php
		return trim( (string) ob_get_clean() );
	}

	/**
	 * Renders one language's inner label markup (already escaped).
	 *
	 * @param string     $code    Language code.
	 * @param array|null $entry   Catalogue entry, or null.
	 * @param string     $display Display mode.
	 * @return string
	 */
	private function render_label( $code, $entry, $display ) {
		$name = $entry ? $entry['name_native'] : $code;
		$html = '';

		if ( in_array( $display, array( 'flag', 'flag_name' ), true ) ) {
			$html .= '<span class="simpletrad-language-flag" aria-hidden="true" data-simpletrad-flag="' . esc_attr( $code ) . '"></span>';
		}

		if ( 'code' === $display ) {
			$html .= '<span class="simpletrad-language-code">' . esc_html( strtoupper( $code ) ) . '</span>';
		} elseif ( 'flag' !== $display ) {
			$html .= '<span class="simpletrad-language-label">' . esc_html( $name ) . '</span>';
		}

		return $html;
	}
}
