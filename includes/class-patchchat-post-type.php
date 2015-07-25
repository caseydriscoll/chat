<?php
/**
 * PatchChat Post Type
 *
 * Registers the 'PatchChat' post type and configures the admin table
 *
 * @class PatchChat_Post_Type
 * @author caseypatrickdriscoll
 * @created 2015-07-24 22:37:29
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Class PatchChat_Post_Type
 */
class PatchChat_Post_Type {


	/**
	 * Set the hooks for initialization
	 */
	public static function init() {

		add_action( 'init',
			array( __CLASS__, 'register_post_type' ) );

		add_filter( 'post_updated_messages',
			array( __CLASS__, 'updated_messages' ) );

		add_action( 'manage_patchchat_posts_custom_column',
			array( __CLASS__, 'custom_columns' ), 10, 2 );

		add_filter( 'manage_patchchat_posts_columns',
			array( __CLASS__, 'edit_columns' ) );

	}

	/**
	 * Registers the 'patchchat' post type along with the 'new', 'open', and 'closed' statuses
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-18 15:04:14
	 * @edited  2015-07-18 15:12:00 - Refactors to show in 'PatchChat' submenu
	 * @edited  2015-07-18 16:20:09 - Refactors to use static statuses array
	 *
	 */
	public static function register_post_type() {


		// TODO: Remove patchchat comments from normal comments admin
		//   http://wordpress.stackexchange.com/questions/72210/exclude-post-type-from-admin-comments-list/72220#72220
		// TODO: Adjust query so comments appear on 'patchchat' cpt
		// TODO: Make 'Chats' appear in the admin menu bar


		register_post_type( 'patchchat', array(
			'labels'            => array(
				'name'               => __( 'Chats', 'patchworks' ),
				'singular_name'      => __( 'Chat', 'patchworks' ),
				'all_items'          => __( 'Chats', 'patchworks' ),
				'new_item'           => __( 'New Chat', 'patchworks' ),
				'add_new'            => __( 'Add New', 'patchworks' ),
				'add_new_item'       => __( 'Add New Chat', 'patchworks' ),
				'edit_item'          => __( 'Edit Chat', 'patchworks' ),
				'view_item'          => __( 'View Chats', 'patchworks' ),
				'search_items'       => __( 'Search Chats', 'patchworks' ),
				'not_found'          => __( 'No Chats found', 'patchworks' ),
				'not_found_in_trash' => __( 'No Chats found in trash', 'patchworks' ),
				'parent_item_colon'  => __( 'Parent Chat', 'patchworks' ),
				'menu_name'          => __( 'Patchchats', 'patchworks' ),
			),
			'public'            => false,
			'hierarchical'      => false,
			'show_ui'           => true,
			'show_in_menu'      => false,
			'show_in_nav_menus' => true,
			'supports'          => array( 'title', 'author', 'comments' ),
			'has_archive'       => false,
			'rewrite'           => true,
			'query_var'         => true,
			'menu_icon'         => 'dashicons-format-chat',
		) );


		// TODO: Decide to show 'closed' in 'All' view
		foreach ( PatchChat::$statuses as $status ) {
			register_post_status( $status, array(
				'label'                     => _x( ucfirst( $status ), 'patchworks' ),
				'public'                    => true,
				'exclude_from_search'       => true,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true,
				'label_count'               => _n_noop( ucfirst( $status ) . ' <span class="count">(%s)</span>', ucfirst( $status ) . ' <span class="count">(%s)</span>' ),
			) );
		}

	}


	/**
	 * TODO: This is just generic from the wp-cli scaffold, make it work
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-18 15:07:07
	 *
	 * @param $messages
	 *
	 * @return mixed
	 */
	public static function updated_messages( $messages ) {
		global $post;

		$permalink = get_permalink( $post );

		$messages['patchchat'] = array(
			0  => '', // Unused. Messages start at index 1.
			1  => sprintf( __( 'Patchchat updated. <a target="_blank" href="%s">View patchchat</a>', 'patchworks' ), esc_url( $permalink ) ),
			2  => __( 'Custom field updated.', 'patchworks' ),
			3  => __( 'Custom field deleted.', 'patchworks' ),
			4  => __( 'Patchchat updated.', 'patchworks' ),
			/* translators: %s: date and time of the revision */
			5  => isset( $_GET['revision'] ) ? sprintf( __( 'Patchchat restored to revision from %s', 'patchworks' ), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
			6  => sprintf( __( 'Patchchat published. <a href="%s">View patchchat</a>', 'patchworks' ), esc_url( $permalink ) ),
			7  => __( 'Patchchat saved.', 'patchworks' ),
			8  => sprintf( __( 'Patchchat submitted. <a target="_blank" href="%s">Preview patchchat</a>', 'patchworks' ), esc_url( add_query_arg( 'preview', 'true', $permalink ) ) ),
			9  => sprintf( __( 'Patchchat scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview patchchat</a>', 'patchworks' ),
				// translators: Publish box date format, see http://php.net/date
				date_i18n( __( 'M j, Y @ G:i' ), strtotime( $post->post_date ) ), esc_url( $permalink ) ),
			10 => sprintf( __( 'Patchchat draft updated. <a target="_blank" href="%s">Preview patchchat</a>', 'patchworks' ), esc_url( add_query_arg( 'preview', 'true', $permalink ) ) ),
		);

		return $messages;
	}


	/**
	 * Renders the status dropdown on the 'PatchChat' admin table
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-18 16:10:32
	 *
	 * @param string $column The name of the column to display
	 * @param int $post_id The ID of the current post
	 */
	public static function custom_columns( $column, $post_id ) {

		global $post;

		switch ( $column ) {
			case 'status':

				$select = '<select>';
				foreach ( PatchChat::$statuses as $status ) {
					$selected = $post->post_status == $status ? 'selected' : '';
					$select .= '<option value="' . $status . '" ' . $selected . '>' . ucfirst( $status ) . '</option>';
				}
				$select .= '</select>';

				echo $select;

				echo '<img src="' . admin_url( '/wp-admin/images/wpspin_light.gif' ) . '"/>';
				break;
		}

	}


	/**
	 * Adds the 'Status' column to the front of the 'PatchChat' admin table
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @created 2015-07-18 16:08:47
	 *
	 * @param   array $columns The current array of column names
	 *
	 * @return  array   $new       The new array of column names
	 */
	public static function edit_columns( $columns ) {

		// TODO: Somehow sort by status

		$new = array();

		foreach ( $columns as $key => $value ) {
			if ( $key == "title" ) {
				$new['status'] = "Status";
			}

			$new[ $key ] = $value;
		}

		return $new;

	}
}