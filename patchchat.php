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

include 'patchchatadmin.php';

class PatchChat {

	function __construct() {

		if ( is_admin() ) {
		
			add_action( 'admin_menu', 'PatchChatAdmin::register_menu' );
		
		} else {

			add_action( 'wp_enqueue_scripts', 'PatchChat::load_assets' );

		}


	}


	static function load_assets() {

		wp_enqueue_style( 'patchchat-front', plugins_url( '/css/front.css', __FILE__ ) );


		wp_register_script( 'react', plugins_url( '/js/react-with-addons.js', __FILE__ ) );

		wp_enqueue_script( 'patchchat-front', plugins_url( '/js/front.js', __FILE__ ), array( 'jquery', 'react' ), '', true );

	}

}

new PatchChat();