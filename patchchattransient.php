<?php


/**
 * The whole purpose of this class is to affect the 'new' and 'user' transients\
 *
 * Form:
 * 'id'       => $chat->ID,
 * 'img'      => md5( strtolower( trim ( $email ) ) ),
 * 'name'     => $name,
 * 'title'    => $chat->post_title,
 * 'email'    => $email,
 * 'status'   => $type,
 * 'comments' => An array of all the comments with the given form:
 *     'text'
 *     'time'
 *     'author'
 *
 *
 *
 * Functions:
 * - build   (create new transient from fresh WP_Query)
 * - trim    (remove a specific node from current transient)
 * - prepend (Add new chat to front of array)
 * - move    (to move between two transients)
 */

class PatchChatTransient {


	public static function build( $type = 'new' ) {

		$transient = array();

		$args = array(
			'post_type'   => 'patchchat',
			'post_status' => $type,
			'nopaging'    => true
		);

		$chats = new WP_Query( $args );

		foreach ( $chats->posts as $chat ) {

			// TODO: Get the actual user's name, not display name

			// Get the user and the comments
			$user  = get_userdata( $chat->post_author );
			$email = $user->user_email;
			$name  = $user->display_name;

			$patchchat = array(
				'id'     => $chat->ID,
				'img'    => md5( strtolower( trim ( $email ) ) ),
				'name'   => $name,
				'title'  => $chat->post_title,
				'email'  => $email,
				'status' => $type
			);


			$comments = get_comments( array( 'post_id' => $chat->ID ) );

			foreach ( $comments as $comment ) {
				$patchchat['text'] = $comment->comment_content;
			}

			array_unshift( $transient, $patchchat );
		}


		set_transient( 'patchchat_new', $transient );


		return $transient;
	}



	/**
	 * Trims a patchchat from a transient's array
	 *
	 * For example, when a chat is moved from 'new' to 'open', it needs to be trimmed and reassigned
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-19 20:16:57
	 *
	 */
	public static function trim( $transient_name, $id ) {

		$transient = get_transient( $transient_name );

		if ( $transient === false ) return false;

		foreach ( $transient as $index => $chat ) {

			if ( $chat['id'] == $id )
				unset( $transient[ $index ] );

		}

		set_transient( $transient_name, $transient );

		return true;
	}

}