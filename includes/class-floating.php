<?php
/**
 * Optional floating language button ("pastille flottante").
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Prints a floating button in a bottom corner of every front-end page which
 * opens a small panel containing the regular `[simpletrad]` switcher, plus
 * an optional "back to top" button that slides in once the page is scrolled.
 * The behaviour lives in `src/frontend/floating.js`, the look in
 * `src/frontend/style.css` (`.simpletrad-fab*`, `--simpletrad-fab-*`).
 */
class Floating {

	/**
	 * Hooks the markup into the footer when the option is enabled.
	 */
	public function register() {
		// Priority 5: before footer scripts are printed (20), so the switcher
		// rendered here can still enqueue SimpleTrad's front-end assets.
		add_action( 'wp_footer', array( $this, 'render' ), 5 );
	}

	/**
	 * Prints the floating button(s).
	 */
	public function render() {
		$settings = Settings::get_all();

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only check of Elementor's preview flag.
		if ( empty( $settings['floating_enabled'] ) || is_admin() || isset( $_GET['elementor-preview'] ) ) {
			return;
		}

		$switcher = ( new Shortcode() )->render(
			array(
				'display' => 'name',
				'layout'  => 'dropdown',
			)
		);

		if ( '' === $switcher ) {
			return;
		}

		$position    = 'bottom-left' === $settings['floating_position'] ? 'bottom-left' : 'bottom-right';
		$back_to_top = ! empty( $settings['floating_back_to_top'] );
		?>
		<div class="simpletrad-fab is-<?php echo esc_attr( $position ); ?>" data-simpletrad-fab translate="no">
			<div class="simpletrad-fab-lang">
				<div class="simpletrad-fab-panel" id="simpletrad-fab-panel" role="dialog" aria-label="<?php esc_attr_e( 'Choix de la langue', 'simpletrad' ); ?>">
					<p class="simpletrad-fab-title"><?php esc_html_e( 'Langue du site', 'simpletrad' ); ?></p>
					<?php echo $switcher; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by Shortcode::render(). ?>
					<p class="simpletrad-fab-note"><?php esc_html_e( 'Traduction automatique par votre navigateur.', 'simpletrad' ); ?></p>
				</div>
				<button type="button" class="simpletrad-fab-btn simpletrad-fab-lang-btn" aria-expanded="false" aria-controls="simpletrad-fab-panel" aria-label="<?php esc_attr_e( 'Choisir la langue du site', 'simpletrad' ); ?>">
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/></svg>
					<span class="simpletrad-fab-code"><?php echo esc_html( strtoupper( $settings['source_language'] ) ); ?></span>
				</button>
			</div>
			<?php if ( $back_to_top ) : ?>
				<button type="button" class="simpletrad-fab-btn simpletrad-fab-top" aria-label="<?php esc_attr_e( 'Revenir en haut de la page', 'simpletrad' ); ?>">
					<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
				</button>
			<?php endif; ?>
		</div>
		<?php
	}
}
