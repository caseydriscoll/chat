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


		add_action( 'wp_ajax_submit_patchchat', array( $this, 'submit_patchchat' ) );
		add_action( 'wp_ajax_nopriv_submit_patchchat', array( $this, 'submit_patchchat' ) );
	}


	static function load_assets() {

		wp_enqueue_style( 'patchchat-front', plugins_url( '/assets/css/front.css', __FILE__ ) );


		wp_register_script( 'react', plugins_url( '/assets/js/react-with-addons.js', __FILE__ ) );

		wp_enqueue_script( 'patchchat-front', plugins_url( '/assets/js/front.js', __FILE__ ), array( 'jquery', 'react' ), '', true );

	}



	public function submit_patchchat() {

		// TODO: Catch the honeypot?
		// TODO: Can bots submit a POST if no 'submit' button?
		// TODO: Create test for each error case


		/* Simple Validation for all fields */
		extract( $_POST );

		$error = false;

		    if ( empty( $name ) )                 $error = "Name is empty";
		elseif ( empty( $email ) )                $error = "Email is empty";
		elseif ( ! is_email( $email ) )           $error = "Email is not valid";
		elseif ( get_user_by( 'email', $email ) ) $error = "Email already attached to user";
		elseif ( empty( $text ) )                 $error = "Text is empty";


		if ( $error ) wp_send_json_error( $error );




		wp_send_json_success( 'hello there' );
	}

}

new PatchChat();