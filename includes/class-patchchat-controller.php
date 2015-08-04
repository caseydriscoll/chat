<?php


class PatchChat_Controller {


	/**
	 * Creates a patchchat by
	 *   creating a user,
	 *   creating a new patchchat post,
	 *   creating first comment to post,
	 *   adding an 'instant reply' comment from admin,
	 *   building a new transient,
	 *   return new transient to new user
	 *
	 * @edited 2015-08-03 16:32:16 - Adds user signon after creation
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
			'comment_date'      => $time,
			'comment_author_IP' => $_SERVER['REMOTE_ADDR'],
			'comment_agent'     => $_SERVER['HTTP_USER_AGENT']
		);

		$comment_id = wp_insert_comment( $comment );


		/* Insert default action comment reply */
		// TODO: Should not be hardcoded! Should be setting for 'default agent'
		// TODO: $instant_reply should be a setting

		$instant_reply = 'Welcome user ' . $user_id . '! We received your chat and will be with you in a moment.';

		$comment = array(
			'comment_post_ID'   => $post_id,
			'user_id'           => 1,
			'comment_content'   => $instant_reply,
			'comment_type'      => 'auto',
			'comment_date'      => current_time( 'mysql' ), // So it occurs after first comment time set above
		);

		$comment_id = wp_insert_comment( $comment );


		$transient = PatchChat_Transient::build( $post_id );

		PatchChat_Transient_Array::add( 'new', $transient );

		return $transient;

	}


	/**
	 * Updates a patchchat by adding a comment
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @edited 2015-08-04 15:02:36 - Adds updating of transient array
	 *
	 * @param string $chat_id
	 */
	public static function update( $patchchat ) {

		// This is checked in PatchChat_AJAX too (never hurts to double check)
		if ( ! is_user_logged_in() ) return array( 'error' => 'User is not logged in' );

		$current_user = wp_get_current_user();

		if ( $current_user->ID == 0 ) {
			return array( 'error' => 'User is not logged in' );
		}

		$user_id = $current_user->ID;

		$chat_id = $patchchat['chat_id'];
		$text    = $patchchat['text'];

		$time    = current_time( 'mysql' );
		$text    = wp_strip_all_tags( $text );


		$comment = array(
			'comment_post_ID'   => $chat_id,
			'user_id'           => $user_id,
			'comment_content'   => $text,
			'comment_date'      => $time,
			'comment_type'      => '',
			'comment_author_IP' => $_SERVER['REMOTE_ADDR'],
			'comment_agent'     => $_SERVER['HTTP_USER_AGENT']
		);

		$comment_id = wp_insert_comment( $comment );

		$comment['comment_id'] = $comment_id;


		$transient = PatchChat_Transient::update( $chat_id, $comment );

		return PatchChat_Transient_Array::update( $user_id, $transient );

	}


	public static function get_single( $chat_id ) {

		$chat = PatchChat_Transient::get_by_id( $chat_id );

		return $chat;
	}



	/**
	 * Returns the given agent's transient set along with the new chats
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @edited 2015-08-04 15:36:31 - Adds role check for getting user chats
	 *
	 * TODO: Add 'agent' role/capability instead of 'administrator'
	 */
	public static function get_user_state( $user_id ) {

		$user_chats = PatchChat_Controller::get_array( $user_id );

		// if user is an agent, get new chats too
		$user = new WP_User( $user_id );

		if ( ! empty( $user->roles ) && is_array( $user->roles ) ) {
			foreach ( $user->roles as $role )
				if ( $role == 'administrator' ) {
					$user_chats = array_merge( $user_chats, PatchChat_Controller::get_array( 'new' ) );
				}
		}

		return $user_chats;
	}

	/**
	 * Get a PatchChat Transient Array
	 *
	 */
	private static function get_array( $array_name ) {

		$set = PatchChat_Transient_Array::get( $array_name );

		return $set;

	}


}