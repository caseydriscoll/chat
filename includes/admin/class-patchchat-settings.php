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
	 * Option key, and option page slug
	 * @var string
	 */
	static $key = 'patchchat_settings';


	/**
	 * Options page metabox id
	 * @var string
	 */
	private $metabox_id = 'myprefix_option_metabox';


	/**
	 * Options Page title
	 * @var string
	 */
	static $title = 'PatchChat Settings';


	/**
	 * Options Page hook
	 * @var string
	 */
	protected $options_page = 'patchchat_settings';


	/**
	 * Initialize the menu registration
	 *
	 * @edited 2015-08-09 16:43:55 - Adds cmb2
	 */
	public static function init() {
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );

		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );

		add_action( 'cmb2_init', array( __CLASS__, 'register_fields' ) );
	}

	/**
	 * 
	 */
	public static function register_settings() {
		register_setting( self::$key, self::$key );
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
			self::$title,
			'Settings',
			'manage_options',
			self::$key,
			'PatchChat_Settings::render'
		);
	}


	/**
	 * Registers all the cmb2 fields
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-08-09 16:44:44
	 */
	public static function register_fields() {

		$cmb = new_cmb2_box( array(
			'id'         => self::$key,
			'hookup'     => false,
			'show_on'    => array(
				'key'   => 'options-page',
				'value' => array( self::$key, )
			),
		) );

		$cmb->add_field( array(
			'name' => __( 'Test Text', 'patchchat' ),
			'desc' => __( 'field description (optional)', 'patchchat' ),
			'id'   => 'text',
			'type' => 'text',
			'attributes' => array(
				'placeholder' => 'Default Text',
			),
		) );
	}


	/**
	 * Renders the settings page
	 *
	 * @author caseypatrickdriscoll
	 */
	static function render() {

		?>
		<h2><?php _e( self::$title ); ?></h2>
		<div class="wrap cmb2-options-page">
			<?php cmb2_metabox_form( self::$key, self::$key ); ?>
		</div>
		<?php

	}

}