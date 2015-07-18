<?php
/*
Plugin Name: PatchChat
Version: 0.1-alpha
Description: A high quality chat plugin made just for WordPress
Author: PatchWorks
Author URI: https://patch.works/
Plugin URI: https://patch.works/plugin/patchchat
Text Domain: patchworks
Domain Path: /languages
*/

include 'patchchatadmin.php';

class PatchChat {

	function __construct() {

		if ( is_admin() ) {
		
			add_action( 'admin_menu', 'PatchChatAdmin::register_menu' );

			add_action( 'init', 'PatchChat::register_post_type' );
			add_filter( 'post_updated_messages', 'PatchChat::updated_messages' );
		
		} else {

			add_action( 'wp_enqueue_scripts', 'PatchChat::load_assets' );


		}


		add_action( 'wp_ajax_submit_patchchat', array( $this, 'submit_patchchat' ) );
		add_action( 'wp_ajax_nopriv_submit_patchchat', array( $this, 'submit_patchchat' ) );
	}


	static function load_assets() {

		wp_enqueue_style( 'patchchat-front', plugins_url( '/assets/css/front.css', __FILE__ ) );


		wp_register_script( 'react', plugins_url( '/assets/js/react-with-addons.js', __FILE__ ) );

		wp_enqueue_script( 'patchchat-front', plugins_url( '/assets/js/front.js', __FILE__ ), array( 'jquery', 'react' ), '', true );

	}


	/**
	 * The POST handler for all chat submissions
	 *
	 * Validates POST request
	 *
	 * Inserts user, post, comment, if valid
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-16 20:14:26
	 * @edited  2015-07-18 15:18:47 - Refactors to strip username of email '@' and domain
	 *
	 * @return wp_send_json_error || wp_send_json_success
	 */
	public function submit_patchchat() {

		// TODO: Catch the honeypot?
		// TODO: Can bots submit a POST if no 'submit' button?
		// TODO: Create test for each error case
		// TODO: Send email reminder if email already exists
		// TODO: Error handling for every insert (make pretty)
		// TODO: Handle username duplicates (iterate or validate?)
		// TODO: Allow title length to be set as option (currently hard coded to 40 char)


		/* Simple Validation for all fields */
		extract( $_POST );

		$error = false;

		    if         ( empty( $name ) ) $error = "Name is empty";
		elseif        ( empty( $email ) ) $error = "Email is empty";
		elseif   ( ! is_email( $email ) ) $error = "Email is not valid";
		elseif ( email_exists( $email ) ) $error = "Email exists";
		elseif         ( empty( $text ) ) $error = "Text is empty";


		if ( $error ) wp_send_json_error( $error );


		
		$username = substr( $email, 0, strpos( $email, "@" ) );
		$password = wp_generate_password( 10, false );
		$time = current_time('mysql');
		$text = wp_strip_all_tags( $text );


		/* Create User */
		$user_id = wp_create_user( $username, $password, $email );

		wp_new_user_notification( $user_id, $password );




		/* Create Post */
		$post = array(
			'post_title'  => substr( $text , 0, 40 ),
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


		$response = array(
			'text' => $text
		);


		wp_send_json_success( $response );

	}




	/**
	 * Registers the 'patchchat' post type along with the 'new', 'open', and 'closed' statuses
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-18 15:04:14
	 * @edited  2015-07-18 15:12:00 - Refactored to show in 'PatchChat' submenu
	 *
	 */
	public static function register_post_type() {


		// TODO: Remove patchchat comments from normal comments admin
		//   http://wordpress.stackexchange.com/questions/72210/exclude-post-type-from-admin-comments-list/72220#72220
		// TODO: Adjust query so comments appear on 'patchchat' cpt
		// TODO: Make 'Chats' appear in the admin menu bar

		
		register_post_type( 'patchchat', array(
			'labels'            => array(
				'name'                => __( 'Chats', 'patchworks' ),
				'singular_name'       => __( 'Chat', 'patchworks' ),
				'all_items'           => __( 'Chats', 'patchworks' ),
				'new_item'            => __( 'New Chat', 'patchworks' ),
				'add_new'             => __( 'Add New', 'patchworks' ),
				'add_new_item'        => __( 'Add New Chat', 'patchworks' ),
				'edit_item'           => __( 'Edit Chat', 'patchworks' ),
				'view_item'           => __( 'View Chats', 'patchworks' ),
				'search_items'        => __( 'Search Chats', 'patchworks' ),
				'not_found'           => __( 'No Chats found', 'patchworks' ),
				'not_found_in_trash'  => __( 'No Chats found in trash', 'patchworks' ),
				'parent_item_colon'   => __( 'Parent Chat', 'patchworks' ),
				'menu_name'           => __( 'Patchchats', 'patchworks' ),
			),
			'public'            => false,
			'hierarchical'      => false,
			'show_ui'           => true,
			'show_in_menu'      => 'patchchat',
			'show_in_nav_menus' => true,
			'supports'          => array( 'title', 'author', 'comments' ),
			'has_archive'       => false,
			'rewrite'           => true,
			'query_var'         => true,
			'menu_icon'         => 'dashicons-format-chat',
		) );


		register_post_status( 'new', array(
			'label'                     => _x( 'New', 'patchworks' ),
			'public'                    => true,
			'exclude_from_search'       => true,
			'show_in_admin_all_list'    => true,
			'show_in_admin_status_list' => true,
			'label_count'               => _n_noop( 'New <span class="count">(%s)</span>', 'New <span class="count">(%s)</span>' ),
		) );


		register_post_status( 'open', array(
			'label'                     => _x( 'Open', 'patchworks' ),
			'public'                    => true,
			'exclude_from_search'       => true,
			'show_in_admin_all_list'    => true,
			'show_in_admin_status_list' => true,
			'label_count'               => _n_noop( 'Open <span class="count">(%s)</span>', 'Open <span class="count">(%s)</span>' ),
		) );


		register_post_status( 'closed', array(
			'label'                     => _x( 'Closed', 'patchworks' ),
			'public'                    => true,
			'exclude_from_search'       => true,
			'show_in_admin_all_list'    => true,
			'show_in_admin_status_list' => true,
			'label_count'               => _n_noop( 'Closed <span class="count">(%s)</span>', 'Closed <span class="count">(%s)</span>' ),
		) );

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
			0 => '', // Unused. Messages start at index 1.
			1 => sprintf( __('Patchchat updated. <a target="_blank" href="%s">View patchchat</a>', 'patchworks'), esc_url( $permalink ) ),
			2 => __('Custom field updated.', 'patchworks'),
			3 => __('Custom field deleted.', 'patchworks'),
			4 => __('Patchchat updated.', 'patchworks'),
			/* translators: %s: date and time of the revision */
			5 => isset($_GET['revision']) ? sprintf( __('Patchchat restored to revision from %s', 'patchworks'), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
			6 => sprintf( __('Patchchat published. <a href="%s">View patchchat</a>', 'patchworks'), esc_url( $permalink ) ),
			7 => __('Patchchat saved.', 'patchworks'),
			8 => sprintf( __('Patchchat submitted. <a target="_blank" href="%s">Preview patchchat</a>', 'patchworks'), esc_url( add_query_arg( 'preview', 'true', $permalink ) ) ),
			9 => sprintf( __('Patchchat scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview patchchat</a>', 'patchworks'),
				// translators: Publish box date format, see http://php.net/date
				date_i18n( __( 'M j, Y @ G:i' ), strtotime( $post->post_date ) ), esc_url( $permalink ) ),
			10 => sprintf( __('Patchchat draft updated. <a target="_blank" href="%s">Preview patchchat</a>', 'patchworks'), esc_url( add_query_arg( 'preview', 'true', $permalink ) ) ),
		);

		return $messages;
	}

}




new PatchChat();