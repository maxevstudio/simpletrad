<?php
/**
 * Lightweight GitHub-releases based update checker for SimpleTrad.
 *
 * @package SimpleTrad
 */

namespace SimpleTrad;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Checks a public GitHub repository's releases for newer versions and wires
 * the result into WordPress's native plugin-update UI.
 *
 * This class is entirely self-contained: it can be disabled (by not calling
 * Updater::init() from Plugin) or swapped for another mechanism without
 * touching the translation engine or any other part of the plugin.
 *
 * No personal access token or secret is ever embedded: only the public
 * GitHub REST API for releases is used.
 */
class Updater {

	const CACHE_KEY = 'simpletrad_github_release';
	const CACHE_TTL = 6 * HOUR_IN_SECONDS;

	/**
	 * Registers the WordPress update hooks.
	 */
	public function init() {
		add_filter( 'site_transient_update_plugins', array( $this, 'inject_update' ) );
		add_filter( 'plugins_api', array( $this, 'plugin_information' ), 20, 3 );
		add_action( 'upgrader_process_complete', array( $this, 'purge_cache' ), 10, 0 );
	}

	/**
	 * The public `owner/repo` slug used to query GitHub releases. Filterable
	 * so a fork or a private catalogue can point elsewhere.
	 *
	 * @return string
	 */
	private function get_repo_slug() {
		return apply_filters( 'simpletrad_github_repo', 'maxev/simpletrad' );
	}

	/**
	 * Fetches (and caches) the latest published GitHub release.
	 *
	 * @return array|null
	 */
	private function get_latest_release() {
		$cached = get_transient( self::CACHE_KEY );

		if ( false !== $cached ) {
			return $cached;
		}

		$response = wp_remote_get(
			sprintf( 'https://api.github.com/repos/%s/releases/latest', $this->get_repo_slug() ),
			array(
				'headers' => array(
					'Accept'     => 'application/vnd.github+json',
					'User-Agent' => 'SimpleTrad-Updater',
				),
				'timeout' => 10,
			)
		);

		if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
			set_transient( self::CACHE_KEY, array(), self::CACHE_TTL );
			return null;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( empty( $body['tag_name'] ) ) {
			set_transient( self::CACHE_KEY, array(), self::CACHE_TTL );
			return null;
		}

		$release = array(
			'version'      => ltrim( $body['tag_name'], 'v' ),
			'download_url' => ! empty( $body['zipball_url'] ) ? $body['zipball_url'] : '',
			'changelog_url' => ! empty( $body['html_url'] ) ? $body['html_url'] : '',
			'body'         => ! empty( $body['body'] ) ? $body['body'] : '',
		);

		// Prefer an actual uploaded ZIP asset over GitHub's auto-generated
		// zipball, since the latter isn't a ready-to-install plugin ZIP.
		if ( ! empty( $body['assets'] ) && is_array( $body['assets'] ) ) {
			foreach ( $body['assets'] as $asset ) {
				if ( isset( $asset['browser_download_url'] ) && str_ends_with( $asset['browser_download_url'], '.zip' ) ) {
					$release['download_url'] = $asset['browser_download_url'];
					break;
				}
			}
		}

		set_transient( self::CACHE_KEY, $release, self::CACHE_TTL );

		return $release;
	}

	/**
	 * Injects a fake update entry into WordPress's update transient when a
	 * newer GitHub release is found.
	 *
	 * @param object $transient Update transient.
	 * @return object
	 */
	public function inject_update( $transient ) {
		if ( empty( $transient->checked ) ) {
			return $transient;
		}

		$release = $this->get_latest_release();

		if ( empty( $release ) || empty( $release['download_url'] ) ) {
			return $transient;
		}

		if ( ! version_compare( $release['version'], SIMPLETRAD_VERSION, '>' ) ) {
			return $transient;
		}

		$item = new \stdClass();

		$item->slug        = 'simpletrad';
		$item->plugin      = SIMPLETRAD_BASENAME;
		$item->new_version = $release['version'];
		$item->url         = $release['changelog_url'];
		$item->package     = $release['download_url'];

		$transient->response[ SIMPLETRAD_BASENAME ] = $item;

		return $transient;
	}

	/**
	 * Provides the "View details" popup content in the Plugins screen.
	 *
	 * @param false|object|array $result Existing result.
	 * @param string             $action Requested action.
	 * @param object             $args   Request args.
	 * @return false|object
	 */
	public function plugin_information( $result, $action, $args ) {
		if ( 'plugin_information' !== $action || empty( $args->slug ) || 'simpletrad' !== $args->slug ) {
			return $result;
		}

		$release = $this->get_latest_release();

		if ( empty( $release ) ) {
			return $result;
		}

		$info                = new \stdClass();
		$info->name          = 'SimpleTrad';
		$info->slug          = 'simpletrad';
		$info->version       = $release['version'];
		$info->author        = 'Maxev';
		$info->homepage      = $release['changelog_url'];
		$info->download_link = $release['download_url'];
		$info->sections      = array(
			'changelog' => wp_kses_post( $release['body'] ),
		);

		return $info;
	}

	/**
	 * Clears the cached release info once WordPress finishes an update, so
	 * the next check reflects reality immediately.
	 */
	public function purge_cache() {
		delete_transient( self::CACHE_KEY );
	}
}
