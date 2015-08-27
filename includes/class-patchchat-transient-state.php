<?php
/**
 * PatchChat Transient State
 *
 * A Transient State is an array of patchchat transients
 *
 *
 * Methods:
 * - build (create new transient from fresh WP_Query)
 * - trim  (remove a specific node from current transient)
 * - add   (Add new chat to front of array)
 * - move  (to move between two transients)
 */


if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly


// TODO: If patchchat doesn't exist in a transient you have to build
//       Like adding a chat to 'open' that was previously 'closed'

class PatchChat_Transient_State {

	/**
	 * Returns the transient of the given name, building it if it doesn't exist
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @edited 2015-08-04 14:43:09 - Refactors to use array instead of set
	 * @edited 2015-08-27 18:23:09 - Refactors all other methods to use PatchChat_Transient_State::get
	 * 
	 * @param $state_name - The 'name' of the state (new or user_id)
	 *
	 * @return array|mixed
	 */
	public static function get( $state_name ) {

		$transient_state = get_transient( 'patchchat_state_' . $state_name );

		if ( $transient_state === false ) $transient_state = PatchChat_Transient_State::build( $state_name );

		return $transient_state;

	}


	/**
	 * This builds a Transient Array by getting all the transients of user or type.
	 *
	 * There are two types of Transient Arrays
	 *   - 'new'     is an array of all current chats with a 'new' status.
	 *   - 'user_id' is an array of all current chats belonging to a user.
	 *
	 * It needs to know which transients to grab, which it can't do on name only
	 *
	 * We need a record of which transients are 'new' chats, which chats an agent belongs to, etc
	 *
	 * But absolutely, this function does not build single transients from WP_Querys
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @edited 2015-08-04 13:35:48 - Refactors to query only user_id
	 * @edited 2015-08-04 14:44:06 - Adds building of transient if missing
	 *
	 * @param $state_name - The 'name' of the state (new or user_id)
	 *
	 * @return array
	 */
	public static function build( $state_name ) {

		// TODO: Should better design to differentiate between
		//       array_name == user_id and array_name == 'new'
		//       Need to generally design to build all sorts of array types
		$transient_state = array();

		$args = array(
			'post_type' => 'patchchat',
			'nopaging'  => true,
			'fields'    => 'ids',
		);

		// A 'new' array is indifferent to the author, just needs a new status
		if ( $state_name == 'new' ) {
			$args['post_status'] = 'new';
		} else {
			// If it's not 'new' it's a user array
			$args['author'] = $state_name;
			$args['post_status'] = array( 'new', 'open' );
		}

		$query = new WP_Query( $args );

		$list = $query->get_posts();

		foreach ( $list as $id ) {
			$transient = get_transient( 'patchchat_' . $id );

			if ( $transient === false ) $transient = PatchChat_Transient::build( $id );

			array_push( $transient_state, $transient );
		}


		set_transient( 'patchchat_state_' . $state_name, $transient_state );


		return $transient_state;
	}


	/**
	 * Updates a transient array with a given transient
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-08-04 14:54:51
	 *
	 * TODO: Handle bad transient setting
	 */
	public static function update( $state_name, $transient ) {

		$transient_state = PatchChat_Transient_State::get( $state_name );

		foreach ( $transient_state as $i => $old_transient ) {
			if ( $old_transient['chat_id'] == $transient['chat_id'] )
				$transient_state[$i] = $transient;
		}

		set_transient( 'patchchat_state_' . $state_name, $transient_state );

		return $transient_state;
	}


	/**
	 * Moves a chat from one transient to another
	 * Used in the PatchChat_Controller::change_status function
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
	public static function move( $chat ) {

		$chat_id = $chat['ID'];
		$from    = $chat['prev_status'];
		$to      = $chat['post_status'];

		if ( $from == 'new' && $to == 'open' ) {

			// This is checked in PatchChat_AJAX too (never hurts to double check)
			if ( ! is_user_logged_in() ) return array( 'error' => 'User is not logged in' );

			$current_user = wp_get_current_user();

			if ( $current_user->ID == 0 ) {
				return array( 'error' => 'User is not logged in' );
			}

			$user_id = $current_user->ID;

			$transient_state = PatchChat_Transient_State::get( $from );

			foreach ( $transient_state as $key => $newchat ) {

				if ( $newchat['chat_id'] == $chat_id ) {

					PatchChat_Transient_State::trim( $from, $chat_id );

					PatchChat_Transient_State::add( $user_id, $newchat );

					break;
				}
			}

		}

		// TODO: Handle error validation
		return true;

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
	public static function trim( $state_name, $chat_id ) {

		$transient_state = PatchChat_Transient_State::get( $state_name );

		foreach ( $transient_state as $index => $chat ) {

			if ( $chat['chat_id'] == $chat_id )
				unset( $transient_state[ $index ] );

		}

		set_transient( 'patchchat_state_' . $state_name, $transient_state );

		return true;
	}


	/**
	 * Adds a PatchChat_Transient to a transient's array
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-19 20:18:54
	 * @edited  2015-08-04 16:13:17 - Refactors to build all given arrays
	 *
	 * $transient_name string The name of the transient to add to ('patchchat_new', etc)
	 *
	 * $patchchat array The array of information to store in transient (see 'Form' in class comments)
	 *
	 */
	public static function add( $state_name, $transient ) {

		$transient_state = PatchChat_Transient_State::get( $state_name );

		array_unshift( $transient_state, $transient );

		set_transient( 'patchchat_state_' . $state_name, $transient_state );

		return true;
	}

}