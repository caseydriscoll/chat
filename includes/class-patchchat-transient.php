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
 * - get:    get a transient from the db by id or build it
 * - build:  build a transient from scratch if not in DB
 * - push:   adds a comment to the comments list
 * - update: update any of the fields
 */

class PatchChat_Transient {


	/**
	 * Returns a transient by chat_id, building it if it doesn't exist
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @created 2015-08-27 18:54:19
	 * 
	 * @param  int    $chat_id   The given post_id of the requested patchchat
	 * @return string $transient The json representation of a chat
	 */
	public static function get( $chat_id ) {

		$transient = get_transient( 'patchchat_' . $chat_id );

		if ( $transient === false ) $transient = PatchChat_Transient::build( $chat_id );

		return $transient;

	}


	/**
	 * Sets the transient by chat_id
	 *
	 * Also responsible for pushing the updates to the respective Transient States
	 *
	 * In theory, this should be the only method that updates any PatchChat_Transient_State
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @created 2015-08-27 18:59:19
	 * @edited  2015-08-28 12:30:12 - Refactors to push transient updates to state without move function
	 * @edited  2015-08-29 13:57:00 - Adds bot for auto comments
	 */
	public static function set( $chat_id, $transient, $update_state = 1 ) {

		// 1. Set the individual chat transient
		set_transient( 'patchchat_' . $chat_id, $transient );

		if ( ! $update_state ) return;

		// 2. Update all the 'new' transient state, which is an outlier
		if ( $transient['status'] == 'new' ) 
			PatchChat_Transient_State::update( 'new', $transient );
		else
			PatchChat_Transient_State::trim( 'new', $chat_id );

		// 3. Update all the individual user transients
		foreach ( $transient['users'] as $user_id => $user ) {

			if ( $user_id == PatchChat_Settings::bot() ) continue;

			PatchChat_Transient_State::update( $user_id, $transient );

		}

	}


	/**
	 * Queries the DB and builds a Transient for a given PatchChat ID from scratch
	 *
	 * Should only be called from PatchChat_Transient::get()
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @edited 2015-08-29 16:43:15 - Refactors for more specialized performance and reusability
	 *
	 * @param $chat_id
	 *
	 * @return PatchChat_Transient
	 */
	private static function build( $chat_id ) {

		// 1. Build main transient
		$patchchat = get_post( $chat_id );

		$transient = array(
			'chat_id'    => $chat_id,
			'title'      => $patchchat->post_title,
			'status'     => $patchchat->post_status,
			'first_time' => $patchchat->post_date,
			'last_time'  => $patchchat->post_modified,
		);

		$transient['users'] = array();
		$transient['comments'] = array();

		PatchChat_Transient::set( $chat_id, $transient, 0 );


		// 2. Add comments (which will add users involved)
		$comments = get_comments( array( 'post_id' => $chat_id, 'order' => 'ASC' ) );

		foreach ( $comments as $comment )
			self::add_comment( (array) $comment );

		return self::get( $chat_id );

	}

	/**
	 * Updates a Transient with the given field
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @created 2015-08-28 09:55:52
	 */
	public static function update( $chat_id, $key, $value ) {

		$transient = PatchChat_Transient::get( $chat_id );

		$transient[$key] = $value;

		PatchChat_Transient::set( $chat_id, $transient );

	}


	/**
	 * Updates a PatchChat_Transient, building it if it doesn't exist
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @edited 2015-08-04 16:24:30 - Adds updating of 'new' Transient Array
	 * @edited 2015-08-04 17:48:09 - Adds updating of user Transient State
	 *
	 */
	public static function add_comment( $comment ) {

		$chat_id   = $comment['comment_post_ID'];
		$user_id   = $comment['user_id'];

		$transient = PatchChat_Transient::get( $chat_id );

		array_push(
			$transient['comments'],
			array(
				'id'   => $comment['comment_ID'],
				'text' => $comment['comment_content'],
				'time' => $comment['comment_date'],
				'type' => $comment['comment_type'],
				'user' => $comment['user_id'],
			)
		);

		if ( ! isset( $transient['users'][$user_id] ) )
			$transient['users'][$user_id] = self::generate_user_data( $user_id );

		PatchChat_Transient::set( $chat_id, $transient );

		return $transient;
	}

	/**
	 * Helper function to convert a user to data that is needed for the transient
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @created 2015-08-29 16:06:09
	 * 
	 * @param int $user_id Generate data for the user with this id
	 */
	private static function generate_user_data( $user_id ) {

		$user = get_user_by( 'id', $user_id );

		$img = md5( strtolower( trim ( $user->user_email ) ) );
		$status = '';

		return array(
			'img'    => $img,
			'name'   => $user->display_name,
			'role'   => $user->roles[0],
			'email'  => $user->user_email,
			'status' => $status,
		);

	}

}