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


	/**
	 * The POST handler for all chat submissions
	 *
	 * Validates POST request
	 *
	 * Inserts user, post, comment, if valid
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-16 20:14:26
	 *
	 * @return wp_send_json_error || wp_send_json_success
	 */
	public function submit_patchchat() {

		// TODO: Catch the honeypot?
		// TODO: Can bots submit a POST if no 'submit' button?
		// TODO: Create test for each error case
		// TODO: Send email reminder if email already exists
		// TODO: Error handling for every insert


		/* Simple Validation for all fields */
		extract( $_POST );

		$error = false;

		    if         ( empty( $name ) ) $error = "Name is empty";
		elseif        ( empty( $email ) ) $error = "Email is empty";
		elseif   ( ! is_email( $email ) ) $error = "Email is not valid";
		elseif ( email_exists( $email ) ) $error = "Email exists";
		elseif         ( empty( $text ) ) $error = "Text is empty";


		if ( $error ) wp_send_json_error( $error );


		

		$password = wp_generate_password( 10, false );
		$time = current_time('mysql');


		/* Create User */
		$user_id = wp_create_user( $email, $password, $email );

		wp_new_user_notification( $user_id, $password );




		/* Create Post */
		$post = array(
			'post_title'  => substr( wp_strip_all_tags( $text ), 0, 40 ),
			'post_type'   => 'patchchat',
			'post_author' => $user_id,
			'post_status' => 'new',
			'post_date'   => $time
		);

		$post_id = wp_insert_post( $post );




		/* Create First Comment */
		$comment = array(
			'comment_post_ID'   => $post_id,
			'user_id'           => $user_id,
			'comment_content'   => $text,
			'comment_date'      => $time,
			'comment_author_IP' => $_SERVER['REMOTE_ADDR'],
			'comment_agent'     => $_SERVER['HTTP_USER_AGENT']
		);

		$comment_id = wp_insert_comment( $comment );




		wp_send_json_success( array( $user_id, $post_id, $comment_id ) );

	}

}

new PatchChat();