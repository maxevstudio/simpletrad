<?php
/**
 * Uninstall handler for SimpleTrad.
 *
 * SimpleTrad never stores translations anywhere (no database rows, no post
 * meta, no custom tables). The only persisted data is the single
 * `simpletrad_settings` option, which is removed here so uninstallation
 * leaves no trace in the database.
 *
 * @package SimpleTrad
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'simpletrad_settings' );

// Multisite: clean up the option on every site of the network.
if ( is_multisite() ) {
	$site_ids = get_sites( array( 'fields' => 'ids' ) );

	foreach ( $site_ids as $site_id ) {
		switch_to_blog( $site_id );
		delete_option( 'simpletrad_settings' );
		restore_current_blog();
	}
}
