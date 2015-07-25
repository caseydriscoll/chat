<?php
/**
 * PatchChat Transient Set
 *
 * A Transient set is an array of patchchat transients
 *
 *
 * Methods:
 * - build (create new transient from fresh WP_Query)
 * - trim  (remove a specific node from current transient)
 * - add   (Add new chat to front of array)
 * - move  (to move between two transients)
 */


if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly


// TODO: Create 'move' function to move patchchat between two transients
// TODO: If patchchat doesn't exist in a transient you have to build
//       Like adding a chat to 'open' that was previously 'closed'

class PatchChat_Transient_Set {


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
	 * Moves a chat from one transient to another
	 * Used in the PatchChatAJAX::change_chat_status function
	 *
	 * For example, moves a chat from the 'new' transient to a transient of its own
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-24 19:37:58
	 *
	 * @param $id
	 * @param $from
	 * @param $to The status to move it to
	 */
	public static function move( $id, $from, $to ) {

		if ( $from == 'new' && $to == 'open' ) {

			$transient = get_transient( 'patchchat_new' );

			foreach ( $transient as $key => $newchat ) {

				if ( $newchat['id'] == $id ) {

					PatchChat_Transient_Set::trim( 'patchchat_new', $id );
					PatchChat_Transient_Set::add( 'patchchat_' . $id, $newchat );

					break;
				}
			}

		}

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


	/**
	 * Adds a patchchat to a transient's array
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-19 20:18:54
	 *
	 * $transient_name string The name of the transient to add to ('patchchat_new', etc)
	 *
	 * $patchchat array The array of information to store in transient (see 'Form' in class comments)
	 *
	 */
	public static function add( $transient_name, $patchchat ) {

		$transient = get_transient( $transient_name );

		if ( $transient === false ) $transient = PatchChat_Transient_Set::build( 'new' );

		array_unshift( $transient, $patchchat );

		set_transient( $transient_name, $transient );

		return true;
	}

}