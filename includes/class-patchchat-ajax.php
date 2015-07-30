<?php
/**
 * PatchChat AJAX
 *
 * Handles all ajax calls, sanitizes and directs to PatchChat_Controller, returns json
 *
 * There are only two class methods, get and post, reflecting HTTP methods
 *
 * Both function operate off giant switch statements which parse for the available actions.
 *
 * @author caseypatrickdriscoll
 * @created 2015-07-24 23:30:03
 */


if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly


/**
 * Class PatchChat_AJAX
 */
class PatchChat_AJAX {

	// TODO: Needs to be refactored
	//       - Should just handle ajax events
	//       - Conditions for transient manipulation should be handled elsewhere
	// TODO: Needs more security
	//       - Sanitize early
	//       - Escape late
	//       - Separate nopriv and admin functions?


	public static function init() {
		add_action( 'wp_ajax_change_chat_status',
			array( __CLASS__, 'change_chat_status' ) );

		add_action( 'wp_ajax_patchchat_post',
			array( __CLASS__, 'post' ) );
		add_action( 'wp_ajax_nopriv_patchchat_post',
			array( __CLASS__, 'post' ) );

		add_action( 'wp_ajax_nopriv_patchchat_get',
			array( __CLASS__, 'get' ) );
		add_action( 'wp_ajax_patchchat_get',
			array( __CLASS__, 'get' ) );
	}


	/**
	 * Get json from the server
	 *
	 * This is a large switch statement to direct activity based on the requested method
	 *
	 * 'get_single' => User requests single chat identified by patchchat->ID
	 * 'get_all'    => Agent requests all new chats and their involved chats
	 */
	public static function get() {

		$data = '';

		// Sanitize request

		// Switch based on request
		switch ( $_POST['method'] ) {
			case 'get_single' : // Return single chat
				$data = PatchChat_Controller::get_single( $_POST['chat_id'] );
				break;

			case 'get_all' : // Return 'new' chats and chats for given user
				$data = PatchChat_Controller::get_all( $_POST['user_id'] );
				break;

			default:
				$data = array( 'error' => 'No method with name ' . $_POST['method'] );
		}


		if ( isset( $data['error'] ) )
			wp_send_json_error( $data );
		else
			wp_send_json_success( $data );

	}


	/**
	 * Post json to the server
	 */
	public static function post() {

		$data = '';

		// Sanitize request


		$chat = $_POST['patchchat'];

		// Switch based on request
		switch ( $_POST['method'] ) {
			case 'create' : // Create a chat
				$data = PatchChat_Controller::create( $chat );
				break;

			case 'update' : // Update a chat
				$data = PatchChat_Controller::update( $chat );
				break;

			default:
				$data = array( 'error' => 'No method with name ' . $_POST['method'] );
		}



		if ( isset( $data['error'] ) )
			wp_send_json_error( $data );
		else
			wp_send_json_success( $data );
	}


	/**
	 * The POST handler for status changes from the admin table
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-18 17:49:02
	 * @edited  2015-07-24 19:56:52 - Refactors to use move function
	 *
	 */
	public static function change_chat_status() {

		// TODO: Assign agent when becomes 'open'
		// TODO: Create idea of assigned agents
		// TODO: Figure out security and sanitized stuff (although low priority as comes from select in admin POST)
		// TODO: Handle error situations, including missing data and error on update
		// TODO: Bulk status change in bulk editor
		// TODO: Style the selector based on status
		// TODO: Add thumbs up or signal if POST is success

		extract( $_POST );

		$post = array(
			'ID'          => $id,
			'post_status' => $status
		);

		wp_update_post( $post );

		PatchChat_Transient_Set::move( $id, $prevstatus, $status );

		$response = array(
			'id'         => $id,
			'status'     => $status,
			'prevstatus' => $prevstatus
		);

		wp_send_json_success( $response );
	}


	/**
	 * The POST handler for looking for chat updates
	 */
	public static function ping() {

		$transient = get_transient( 'patchchat_new' );

		if ( $transient === false ) $transient = PatchChat_Transient_Set::build( 'new' );

		wp_send_json_success( $transient );
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
	 * @edited  2015-07-18 15:18:47 - Refactors to strip username of email '@' and domain
	 * @edited  2015-07-19 20:28:31 - Refactors to use PatchChatTransient::add
	 *
	 * @return wp_send_json_error || wp_send_json_success
	 */
	public static function submit() {

		// TODO: Catch the honeypot?
		// TODO: Can bots submit a POST if no 'submit' button?
		// TODO: Create test for each error case
		// TODO: Send email reminder if email already exists
		// TODO: Error handling for every insert (make pretty)
		// TODO: Handle username duplicates (iterate or validate?)
		// TODO: Allow title length to be set as option (currently hard coded to 40 char)


		/* Simple Validation for all fields */
		extract( $_POST );

		$error = false;

		if ( empty( $name ) ) {
			$error = "Name is empty";
		} elseif ( empty( $email ) ) {
			$error = "Email is empty";
		} elseif ( ! is_email( $email ) ) {
			$error = "Email is not valid";
		} elseif ( email_exists( $email ) ) {
			$error = "Email exists";
		} elseif ( empty( $text ) ) {
			$error = "Text is empty";
		}


		if ( $error ) {
			wp_send_json_error( $error );
		}


		wp_send_json_success( $response );

	}
}