<?php

/**
 * PatchChat Controller
 *
 * Mirrors the PatchChat_AJAX calls, by updating the DB and necessary Transients
 *
 * All public methods return the current user state
 *
 * @author caseypatrickdriscoll
 * 
 * Methods:
 * - create             : Called from AJAX, creates a new patchchat
 * - update             : Called from AJAX, updates patchchat with a comment
 * - change_chat_status : Updates the status of the patchchat
 * - get_user_state     : Returns the applicable Transient_State (including 'new')
 * - add_comment        : Inserts a comment to the DB and updates transient
 */


if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly


/**
 * Class PatchChat_AJAX
 */
class PatchChat_Controller {


	/**
	 * Creates a patchchat post by
	 *   creating a user,
	 *   creating a new patchchat post,
	 *   creating first comment to post,
	 *   adding an 'instant reply' comment from admin,
	 *   building a new transient,
	 *   return new transient to new user
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @edited 2015-08-03 16:32:16 - Adds user signon after creation
	 * @edited 2015-08-28 20:11:39 - Adds PatchChat_Settings::instant_reply
	 * @edited 2015-08-28 20:19:22 - Adds PatchChat_Settings::bot
	 */
	public static function create( $patchchat ) {

		$email    = $patchchat['email'];
		$text     = $patchchat['text'];

		$username = substr( $email, 0, strpos( $email, "@" ) );
		$password = wp_generate_password( 10, false );
		$title    = substr( $text, 0, 40 );
		$time     = current_time( 'mysql' );
		$text     = wp_strip_all_tags( $text );


		/* Create User */
		$user_id = wp_create_user( $username, $password, $email );
		// TODO: Add the user's name to the user
		// TODO: Check to see if user logged in, no need to create again

		wp_new_user_notification( $user_id, $password );

		$user = get_user_by( 'id', $user_id );

		$creds = array(
			'user_login'    => $user->user_login,
			'user_password' => $password,
			'remember'      => true,
		);

		$user_signon = wp_signon( $creds, false );


		/* Create PatchChat Post */
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
			'comment_date'      => $time, // Set to the same time as the post above
			'comment_author_IP' => $_SERVER['REMOTE_ADDR'],
			'comment_agent'     => $_SERVER['HTTP_USER_AGENT']
		);

		$comment_id = wp_insert_comment( $comment );


		/* Insert default action comment reply */
		$comment = array(
			'comment_post_ID'   => $post_id,
			'user_id'           => PatchChat_Settings::bot(),
			'comment_content'   => PatchChat_Settings::instant_reply( $user ),
			'comment_type'      => 'auto',
			'comment_date'      => current_time( 'mysql' ), // So it occurs after first comment time set above
		);

		$comment_id = wp_insert_comment( $comment );


		// Will build the Transient
		PatchChat_Transient::get( $post_id );

		return PatchChat_Controller::get_user_state( $user_id );

	}


	/**
	 * A reflection of the PatchChat_AJAX 'update' method
	 *
	 * Prepares an update for insertion
	 *
	 * Presumes data sanitized and validated from PatchChat_AJAX
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @created 2015-08-29 16:41:42
	 *
	 * TODO: Error handling (add comment shouldn't return state, this method should)
	 */
	public static function update( $chat ) {

		$comment = array(
			'comment_type' => '',
			'comment_post_ID' => $chat['chat_id'],
			'comment_content' => $chat['text'],
		);

		if ( self::add_comment( $comment ) )
			return PatchChat_Controller::get_user_state();

	}


	/**
	 * Changes the post_status of the given chat
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @created 2015-08-27 15:13:52
	 * @edited  2015-08-28 17:58:30 - Refactors to prevent open and closed transient states
	 * @edited  2015-08-28 18:14:09 - Adds fast update by returning user state on change_status
	 * @edited  2015-08-28 20:38:24 - Adds auto comment for every status change
	 * 
	 */
	public static function change_chat_status( $chat ) {

		// TODO: Assign agent when becomes 'open'
		// TODO: Create idea of assigned agents
		// TODO: Figure out security and sanitized stuff (although low priority as comes from select in admin POST)
		// TODO: Handle error situations, including missing data and error on update
		// TODO: Bulk status change in bulk editor
		// TODO: Style the selector based on status
		// TODO: Add thumbs up or signal if POST is success

		// 1. Update the post status and appropriate transients
		wp_update_post( $chat );
		PatchChat_Transient::update( $chat['ID'], 'status', $chat['post_status'] );

		// 2. Add the comment
		$comment = array(
			'comment_type'    => 'auto',
			'comment_post_ID' => $chat['ID'],
			'comment_content' => __( 'Agent changed status to ' . $chat['post_status'] . '.', 'patchchat' ),
		);

		if ( self::add_comment( $comment ) )
			return PatchChat_Controller::get_user_state();

	}


	/**
	 * Returns the given agent's transient set along with the new chats
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @edited 2015-08-04 15:36:31 - Adds role check for getting user chats
	 * @edited 2015-08-27 18:38:05 - Refactors to remove get_array()
	 * @edited 2015-08-29 18:16:26 - Refactors for situations with no user_id because the user was just created
	 *
	 * TODO: Add 'agent' role/capability instead of 'administrator'
	 */
	public static function get_user_state( $user_id = NULL ) {

		if ( $user_id == NULL ) {
			$user    = wp_get_current_user();
			$user_id = $user->ID;
		} else {
			$user    = get_user_by( 'id', $user_id );
		}

		$user_chats = PatchChat_Transient_State::get( $user_id );

		if ( ! empty( $user->roles ) && is_array( $user->roles ) ) {
			foreach ( $user->roles as $role )
				if ( $role == 'administrator' ) {
					$user_chats = array_merge( $user_chats, PatchChat_Transient_State::get( 'new' ) );
				}
		}

		return $user_chats;
	}


	/**
	 * Updates a patchchat by adding a comment
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @edited 2015-08-04 15:02:36 - Adds updating of transient array
	 * @edited 2015-08-29 16:43:15 - Refactors for more specialized performance and reusability
	 *
	 * @param Array $comment
	 */
	private static function add_comment( $comment ) {

		$current_user = wp_get_current_user();

		if ( $current_user->ID == 0 ) {
			return array( 'error' => 'User is not logged in' );
		}


		$comment['user_id']           = $current_user->ID;
		$comment['comment_date']      = current_time( 'mysql' );

		$comment['comment_author_IP'] = $_SERVER['REMOTE_ADDR'];
		$comment['comment_agent']     = $_SERVER['HTTP_USER_AGENT'];


		$comment_id = wp_insert_comment( $comment );

		$comment['comment_ID'] = $comment_id;


		$transient = PatchChat_Transient::add_comment( $comment );

		return true;

	}


}