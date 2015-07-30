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

		$instant_reply = 'Welcome ' . $user_id . '! We received your chat and will be with you in a moment.';

		$comment = array(
			'comment_post_ID'   => $post_id,
			'user_id'           => 1,
			'comment_content'   => $instant_reply,
			'comment_type'      => 'auto',
			'comment_date'      => current_time( 'mysql' ), // So it occurs after first comment time set above
		);

		$comment_id = wp_insert_comment( $comment );


		return PatchChat_Transient::build( $post_id );

	}


	/**
	 * Updates a patchchat by adding a comment
	 *
	 * @param string $chat_id
	 */
	public static function update( $patchchat ) {

		$chat_id = $patchchat['id'];
		$email   = $patchchat['email'];
		$text    = $patchchat['text'];

		$user    = get_user_by( 'email', $email );

		$time    = current_time( 'mysql' );
		$text    = wp_strip_all_tags( $text );


		$comment = array(
			'comment_post_ID'   => $chat_id,
			'user_id'           => $user->ID,
			'comment_content'   => $text,
			'comment_date'      => $time,
			'comment_type'      => '',
			'comment_author_IP' => $_SERVER['REMOTE_ADDR'],
			'comment_agent'     => $_SERVER['HTTP_USER_AGENT']
		);

		$comment_id = wp_insert_comment( $comment );

		$comment['comment_id'] = $comment_id;


		return PatchChat_Transient::update( $chat_id, $comment );
	}


	public static function get_single( $chat_id ) {

		$chat = PatchChat_Transient::get_by_id( $chat_id );

		return $chat;
	}

	/**
	 * Get all
	 */
	public static function get_all() {

	}




	/**
	 * Get all chats with 'new' status
	 */
	private static function get_new() {

	}
}