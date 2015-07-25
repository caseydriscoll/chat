<?php
/**
 * PatchChat Settings
 *
 * Registers and renders the 'Settings' menu and page
 *
 * @class PatchChat_Settings
 * @author caseypatrickdriscoll
 * @created 2015-07-24 22:47:49
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Class PatchChat_Settings
 */
class PatchChat_Settings {


	/**
	 * Initialize the menu registration
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );
	}


	/**
	 * Register the submenu
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-24 22:49:09
	 */
	public static function register_menu() {
		add_submenu_page(
			'patchchat',
			'PatchChat Settings',
			'Settings',
			'manage_options',
			'patchchat_settings',
			'PatchChat_Settings::render'
		);
	}


	// TODO: Make it render

	static function render() {

	}
}