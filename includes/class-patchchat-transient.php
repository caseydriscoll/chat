<?php
/**
 * PatchChat Transient
 *
 * A patchchat is a custom post with any number of comments between any number of people
 *
 * The transient stores only what is needed of a chat log
 *
 * Stored as name 'patchchat_$id' where $id is the post id
 *
 * We don't need all the post type or comment information. This is all we need for the interface
 *
 * A patchchat is typically between two people: an end user and an agent
 *
 * Agents can change assignment. The current agent is the 'agent'
 *
 * Historic comments are stored in the 'comments' array
 *
 * This is really just a stored json piece for updating the React board
 *
 * Form:
 *
 * 'id'        => $chat->ID,
 * 'title'     => $chat->post_title,
 * 'status'    => $type, [new, open, closed]
 * 'firstTime' => The MySQL post init time
 * 'lastTime'  => The MySQL last edit time
 * 'users'     => An array of the users in the chat in key value pairs
 *     'id'        => The key of the user and also the user id
 *         'img'       => The md5 url for the gravatar
 *         'name'      => The display name
 *         'role'      => The role in the conversation, typically 'author' or 'agent' (admin?)
 *         'email'     => The email of the user
 *         'status'    => The current action, whether they are typing, here, away, gone, etc
 * 'comments'  => An array of all the comments with the given form:
 *     'text'      => The body text of the comment
 *     'time'      => The time the comment was made
 *     'type'      => The type of comment 'auto', 'action', 'normal'
 *     'user'      => The comment author user id
 *
 *
 * Methods:
 *
 * - get_by_id:  get a transient from the db or build it
 * - build:  build a transient from scratch if not in DB
 * - push:   adds a comment to the comments list
 * - update: update any of the fields
 */

class PatchChat_Transient {


	public static function get_by_id( $chat_id ) {

		$transient = get_transient( 'patchchat_' . $chat_id );

		if ( $transient === false ) $transient = PatchChat_Transient::build( $chat_id );

		return $transient;

	}


	public static function build( $chat_id ) {

		$patchchat = get_post( $chat_id );

		$comments = get_comments( array( 'post_id' => $chat_id ) );


		// 1. Build main array
		$transient = array(
			'id'         => $chat_id,
			'title'      => $patchchat->post_title,
			'status'     => $patchchat->post_status,
			'first_time' => $patchchat->post_date,
			'last_time'  => $patchchat->post_modified,
		);


		// 3. Build users key in commments foreach
		$transient['users'] = array();


		// 3. Build comments key
		$transient['comments'] = array();

		foreach ( $comments as $comment ) {

			$user_id = $comment->user_id;

			array_push(
				$transient['comments'],
				array(
					'id'   => $comment->comment_ID,
					'text' => $comment->comment_content,
					'time' => $comment->comment_date,
					'type' => $comment->comment_type,
					'user' => $user_id,
				)
			);

			if ( ! isset( $transient['users'][$user_id] ) ) {

				$user = get_user_by( 'id', $user_id );

				$img = md5( strtolower( trim ( $user->user_email ) ) );
				$status = '';

				$transient['users'][$user_id] = array(
					'img'    => $img,
					'name'   => $user->display_name,
					'role'   => $user->roles[0],
					'email'  => $user->user_email,
					'status' => $status,
				);
			}

		}


		set_transient( 'patchchat_' . $chat_id, $transient );

		return $transient;
	}


	/**
	 *
	 */
	public static function update( $chat_id, $comment ) {

		$transient = get_transient( 'patchchat_' . $chat_id );

		array_push(
			$transient['comments'],
			array(
				'id'   => $comment['comment_id'],
				'text' => $comment['comment_content'],
				'time' => $comment['comment_date'],
				'type' => $comment['comment_type'],
				'user' => $comment['user_id'],
			)
		);


		set_transient( 'patchchat_' . $chat_id, $transient );

		return $transient;
	}
}