<?php
/*
Plugin Name: PatchChat
Version: 0.1-alpha
Description: A high quality chat plugin made just for WordPress
Author: PatchWorks
Author URI: https://patch.works/
Plugin URI: https://patch.works/plugin/patchchat
Text Domain: patchworks
Domain Path: /languages
*/


// TODO: Update Text Domain to be unique
//       - http://wordpress.stackexchange.com/questions/98963/text-domains-across-multiple-plugins-themes


if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly


if ( ! class_exists( 'PatchChat' ) ) :

/**
 * The main PatchChat initializer class
 *
 * @class PatchChat
 *
 */
class PatchChat {


	// TODO: Add a filter for adjusting this list?
	public static $statuses = array( 'new', 'open', 'closed' );


	/**
	 * Start initialization sequence, on condition of the view
	 *
	 * @author caseypatrickdriscoll
	 */
	public static function init() {

		PatchChat::includes();

		PatchChat_AJAX::init();

		if ( is_admin() ) {

			PatchChat::admin_includes();

			PatchChat_Post_Type::init();

			add_action( 'admin_menu', 'PatchChat::register_menu' );

			PatchChat_Settings::init();


			add_action( 'admin_enqueue_scripts', 'PatchChat::load_back_assets' );

		} else {

			add_action( 'wp_enqueue_scripts', 'PatchChat::load_front_assets' );

		}
	}


	/**
	 * Load all the necessary files for front and back
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-24 22:33:24
	 */
	public static function includes() {
		include_once( 'includes/class-patchchat-ajax.php' );
		include_once( 'includes/class-patchchat-controller.php' );

		include_once( 'includes/class-patchchat-transient.php' );
		include_once( 'includes/class-patchchat-transient-state.php' );

		include_once( 'includes/admin/class-patchchat-settings.php' );
	}

	/**
	 * Load all the necessary files for the admin
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-24 22:17:44
	 * @edited  2015-07-24 22:41:16 - Refactored for moved settings
	 */
	public static function admin_includes() {
		include_once( 'includes/class-patchchat-post-type.php' );
		include_once( 'includes/class-patchchat-post-type.php' );

		include_once( 'includes/cmb2/init.php' );
	}


	/**
	 * Registers the main admin menu
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-19 18:44:06
	 */
	static function register_menu() {

		// TODO: Change 'manage_options' to new 'agent' capabilities
		add_menu_page(
			'PatchChat',             // Page Title
			'PatchChat',             // Menu Title
			'manage_options',        // Required admin capabilities to see menu
			'patchchat',             // The page slug
			'PatchChat::render',     // Callback function to display
			'dashicons-format-chat', // The double chat icon
			'25.1'                   // Right below the 'Comments' menu
		);

		// TODO: Make 'post_status' configurable
		// TODO: Add 'post_status=new' as param
		//       For some reason, when there is a second param it doesn't keep the top menu open
		add_submenu_page(
			'patchchat',                   // Display under patchchat main menu
			'Archive',                     // Page Title
			'Archive',                     // Menu Title
			'manage_options',              // Required admin capabilities to see menu
			'edit.php?post_type=patchchat' // Slug to display patchchat post type
		);

		// TODO: Make displaying this an optional setting
		// TODO: Make ability to 'sign-on' in dropdown
		add_action( 'admin_bar_menu', array( __CLASS__, 'add_toolbar_menu' ), 999 );
	}


	/**
	 * Register the needed scripts and styles to be localized later
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @edited 2015-08-09 16:38:21 - Adds cmb2
	 * @edited 2015-08-11 20:12:17 - Adds patchchat-settings
	 * @edited 2015-08-27 12:17:17 - Adds font-awesome and minimize icon
	 */
	public static function register_assets() {
		wp_register_script( 'react-with-addons', plugins_url( '/assets/js/react-with-addons.js', __FILE__ ) );
		wp_register_script( 'patchchat-settings', plugins_url( '/assets/js/patchchat-settings.js', __FILE__ ) );
		wp_register_script( 'patchchat', plugins_url( '/assets/js/patchchat.js', __FILE__ ) );

		wp_register_style( 'patchchat', plugins_url( '/assets/css/patchchat.css', __FILE__ ) );
		wp_register_style( 'cmb2', plugins_url( '/includes/cmb2/css/cmb2.css', __FILE__ ) );

		wp_register_style( 'font-awesome', 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' );
	}


	/**
	 * Adds the 'PatchChat' link to the admin tool bar
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-24 23:08:52
	 */
	public static function add_toolbar_menu( $wp_admin_bar ) {
		$args = array(
			'id'    => 'patchchat',
			'title' => 'PatchChat',
			'href'  => admin_url( 'admin.php?page=patchchat' ),
			'meta'  => array(
				'class' => 'patchchat-menu',
				'title' => 'See all chats'
			)
		);

		$wp_admin_bar->add_node( $args );
	}


	/**
	 * Render the main messenger page
	 *
	 * Even though everything is loaded by js, add_menu_page() needs a callback function
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-24 22:45:57
	 */
	public static function render() {}




	/**
	 * Loads the scripts and styles for the user facing chatbox
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @edited 2015-08-27 12:16:50 - Adds font-awesome and minimize icon
	 */
	static function load_front_assets() {

		PatchChat::register_assets();

		wp_enqueue_style( 'patchchat-front', plugins_url( '/assets/css/patchchat-front.css', __FILE__ ),
			array( 'font-awesome' ) );


		wp_enqueue_script( 'patchchat-front', plugins_url( '/assets/js/patchchat-front.js', __FILE__ ),
			array( 'jquery', 'react-with-addons', 'patchchat' ), '', true );

		wp_localize_script( 'patchchat-front', 'patchchat', PatchChat_Settings::localize() );

	}


	/**
	 * Loads the scripts and styles for admin table
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-18 17:51:00
	 */
	static function load_back_assets() {

		PatchChat::register_assets();

		// TODO: Not sure I like 'patchchat_messenger' but the patchchat cpt took over the menu.
		//       The original 'patchchat' admin menu is not linked

		if ( isset( $_GET['post_type'] ) && $_GET['post_type'] == 'patchchat' ) {

			wp_enqueue_style( 'patchchat-admintable', plugins_url( '/assets/css/admintable.css', __FILE__ ) );

			wp_enqueue_script( 'patchchat-admintable', plugins_url( '/assets/js/admintable.js', __FILE__ ), array( 'jquery' ), '', true );

		} else if ( isset( $_GET['page'] ) && $_GET['page'] == 'patchchat' ) {

			wp_enqueue_style( 'patchchat-back', plugins_url( '/assets/css/patchchat-back.css', __FILE__ ),
				array( 'font-awesome' ) );

			wp_enqueue_script( 'patchchat-back', plugins_url( '/assets/js/patchchat-back.js', __FILE__ ),
				array( 'jquery', 'react-with-addons', 'patchchat' ), '', true );

			wp_localize_script( 'patchchat-back', 'patchchat', PatchChat_Settings::localize() );


			wp_enqueue_script( 'bootstrap-tabs', plugins_url( '/assets/js/bootstrap.tabs.min.js', __FILE__ ) );

		} else if ( isset( $_GET['page'] ) && $_GET['page'] == 'patchchat_settings' ) {

			wp_enqueue_script( 'patchchat-settings' );
			wp_localize_script( 'patchchat-settings', 'patchchat', array( 'audiourl' => plugins_url( '/assets/audio/', __FILE__ ) ) );

			wp_enqueue_style( 'font-awesome' );

		}

		wp_enqueue_style( 'cmb2' );

	}


}

endif;




PatchChat::init();