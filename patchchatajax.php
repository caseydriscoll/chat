<?php

class PatchChatAJAX {


	public static function init() {
		add_action( 'wp_ajax_change_chat_status', array( 'PatchChatAJAX', 'change_chat_status' ) );

		add_action( 'wp_ajax_submit_patchchat', array( 'PatchChatAJAX', 'submit' ) );
		add_action( 'wp_ajax_nopriv_submit_patchchat', array( 'PatchChatAJAX', 'submit' ) );

		add_action( 'wp_ajax_nopriv_ping_patchchat', array( 'PatchChatAJAX', 'ping' ) );
		add_action( 'wp_ajax_ping_patchchat', array( 'PatchChatAJAX', 'ping' ) );
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

		PatchChatTransient::move( $id, $prevstatus, $status );

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

		if ( $transient === false ) $transient = PatchChatTransient::build( 'new' );

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


		$username = substr( $email, 0, strpos( $email, "@" ) );
		$password = wp_generate_password( 10, false );
		$title    = substr( $text, 0, 40 );
		$time     = current_time( 'mysql' );
		$text     = wp_strip_all_tags( $text );


		/* Create User */
		$user_id = wp_create_user( $username, $password, $email );
		// TODO: Add the user's name

		wp_new_user_notification( $user_id, $password );


		/* Create Post */
		$post = array(
			'post_title'  => $title,
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


		$response = array(
			'text' => $text
		);


		/* Set 'New Transient' */
		$patchchat = array(
			'id'     => $post_id,
			'img'    => md5( strtolower( trim ( $email ) ) ),
			'name'   => $name,
			'title'  => $title,
			'email'  => $email,
			'text'   => $text,
			'status' => 'new'
		);

		PatchChatTransient::add( 'patchchat_new', $patchchat );



		wp_send_json_success( $response );

	}
}