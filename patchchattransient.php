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

}