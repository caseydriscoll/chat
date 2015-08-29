<?php
/**
 * PatchChat Settings
 *
 * Registers and renders the 'Settings' menu and page
 *
 * @class PatchChat_Settings
 * @author caseypatrickdriscoll
 * @created 2015-07-24 22:47:49
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Class PatchChat_Settings
 */
class PatchChat_Settings {

	/**
	 * Option key, and option page slug
	 * @var string
	 */
	static $key = 'patchchat_settings';


	/**
	 * Options page metabox id
	 * @var string
	 */
	private $metabox_id = 'myprefix_option_metabox';


	/**
	 * Options Page title
	 * @var string
	 */
	static $title = 'PatchChat Settings';


	/**
	 * Options Page hook
	 * @var string
	 */
	protected $options_page = 'patchchat_settings';

	/**
	 * Default option for js debugging in localize() function
	 *
	 * Must be string, not boolean, as false value is passed to js as empty string
	 * http://wordpress.stackexchange.com/questions/105426/passing-boolean-values-with-wp-localize-script
	 * 
	 * @var string
	 */
	static $debug = 'false';


	/**
	 * Default option for js messenger GET pulse on user side
	 *
	 * Defaults to 3 seconds, can be set in patchchat_settings admin
	 * @var string
	 */
	static $user_pulse_time = '3000';


	/**
	 * Default option for js messenger GET pulse on admin side
	 *
	 * Defaults to 1 second, can be set in patchchat_settings admin
	 * @var string
	 */
	static $admin_pulse_time = '1000';

	/**
	 * Default option for the chatbox header text
	 *
	 * @var  string
	 */
	static $header_text = 'Welcome!';

	/**
	 * Default option for js messenger instructions to new user
	 * 
	 * @var string
	 */
	static $instructions = 'Welcome! Send us a comment.';


	/**
	 * Default text for the initbox 'comment' label
	 *
	 * @var  string
	 */
	static $label_comment = 'Comment';


	/**
	 * Default option for spinner-icon
	 *
	 * @var  string
	 */
	static $spinner_icon = 'fa-spinner';


	/**
	 * Default option for the read receipt
	 *
	 * @var  string
	 */
	static $instant_reply = 'Welcome! We received your chat and will be with you in a moment.';


	/**
	 * Default bot username
	 *
	 * @var  string
	 */
	static $bot_username = 'patchchatbot';


	/**
	 * Default bot displayname
	 *
	 * @var  string
	 */
	static $bot_displayname = 'bot';


	/**
	 * Initialize the menu registration
	 *
	 * @edited 2015-08-09 16:43:55 - Adds cmb2
	 */
	public static function init() {
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );

		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );

		add_action( 'cmb2_init', array( __CLASS__, 'register_fields' ) );
	}


	/**
	 * 
	 */
	public static function register_settings() {
		register_setting( self::$key, self::$key );
	}


	/**
	 * Register the submenu
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-07-24 22:49:09
	 */
	public static function register_menu() {
		add_submenu_page(
			'patchchat',
			self::$title,
			'Settings',
			'manage_options',
			self::$key,
			'PatchChat_Settings::render'
		);
	}


	/**
	 * Registers all the setting fields with cmb2
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-08-09 16:44:44
	 * @edited  2015-08-11 22:09:06 - Adds audio setting and playback
	 * @edited  2015-08-19 13:55:02 - Refactors send and receive sound fields
	 * @edited  2015-08-19 16:37:29 - Adds setting for chat-instructions
	 * @edited  2015-08-19 16:45:35 - Adds setting for header-text
	 * @edited  2015-08-27 13:16:34 - Adds minimize-icon option
	 * @edited  2015-08-28 20:11:39 - Adds PatchChat_Settings::instant_reply
	 */
	public static function register_fields() {

		$cmb = new_cmb2_box( array(
			'id'         => self::$key,
			'hookup'     => false,
			'show_on'    => array(
				'key'   => 'options-page',
				'value' => array( self::$key, )
			),
		) );

		$cmb->add_field( array(
			'name' => __( 'Javascript Debugger', 'patchchat' ),
			'desc' => __( 'Will output values to js console', 'patchchat' ),
			'id'   => 'js-debug',
			'type' => 'checkbox',
		) );


		/* MESSAGES */
		$cmb->add_field( array(
			'name' => __( 'Messages', 'patchchat' ),
			'id'   => 'messages',
			'type' => 'title',
		) );

		$cmb->add_field( array(
			'name' => __( 'Header Text', 'patchchat' ),
			'desc' => __( 'The text that appears on the chat box header.', 'patchchat' ),
			'id'   => 'header-text',
			'type' => 'text',
			'attributes' => array(
				'placeholder' => __( self::$header_text, 'patchchat' ),
			),
		) );

		$cmb->add_field( array(
			'name' => __( 'Chat Instructions', 'patchchat' ),
			'desc' => __( 'Instructions for starting a new chat.', 'patchchat' ),
			'id'   => 'chat-instructions',
			'type' => 'text',
			'attributes' => array(
				'placeholder' => __( self::$instructions, 'patchchat' ),
			),
		) );

		$cmb->add_field( array(
			'name' => __( 'Instant Reply', 'patchchat' ),
			'desc' => __( 'The text that appears on as the first reply confirming receipt.', 'patchchat' ),
			'id'   => 'instant-reply',
			'type' => 'text',
			'attributes' => array(
				'placeholder' => __( self::$instant_reply, 'patchchat' ),
			),
		) );


		/* PULSE TIMES */
		$cmb->add_field( array(
			'name' => __( 'Pulse Times', 'patchchat' ),
			'id'   => 'pulse-times',
			'type' => 'title',
		) );

		$cmb->add_field( array(
			'name' => __( 'Admin Pulse Time', 'patchchat' ),
			'desc' => __( 'How fast the admin chat updates, in milliseconds.', 'patchchat' ),
			'id'   => 'admin-pulse-time',
			'type' => 'text_small',
			'attributes' => array(
				'placeholder' => self::$admin_pulse_time,
			),
		) );

		$cmb->add_field( array(
			'name' => __( 'User Pulse Time', 'patchchat' ),
			'desc' => __( 'How fast the user chat updates, in milliseconds.', 'patchchat' ),
			'id'   => 'user-pulse-time',
			'type' => 'text_small',
			'attributes' => array(
				'placeholder' => self::$user_pulse_time,
			),
		) );


		/* Chat UI */
		$cmb->add_field( array(
			'name' => __( 'Chat UI', 'patchchat' ),
			'id'   => 'chat-ui',
			'type' => 'title',
		) );

		$cmb->add_field( array(
			'name' => __( 'Spinner Icon', 'patchchat' ),
			'desc' => __( 'The Font Awesome icon used to show ajax action in chat box', 'patchchat' ),
			'id'   => 'spinner-icon',
			'type' => 'select',
			'options'          => array(
					'fa-spinner'        => 'Spinner',
					'fa-circle-o-notch' => 'Circle Open Notch',
					'fa-refresh'        => 'Refresh',
			),
		) );

		$cmb->add_field( array(
			'name' => __( 'Minimize Icon', 'patchchat' ),
			'desc' => __( 'The Font Awesome icon used to minimize chat box', 'patchchat' ),
			'id'   => 'minimize-icon',
			'type' => 'select',
			'show_option_none' => true,
			'options'          => array(
					'fa-minus'               => 'Minus',
					'fa-minus-circle'        => 'Minus Circle',
					'fa-minus-square'        => 'Minus Square',
					'fa-minus-square-o'      => 'Minus Square Open',
					'fa-sort-down'           => 'Triangle Down',
					'fa-toggle-down'         => 'Toggle Down',
					'fa-angle-down'          => 'Angle Down',
					'fa-angle-double-down'   => 'Angle Double Down',
					'fa-arrow-down'          => 'Arrow Down',
					'fa-arrow-circle-down'   => 'Arrow Circle Down',
					'fa-arrow-circle-o-down' => 'Arrow Circle Open Down',
					'fa-chevron-down'        => 'Chevron Down',
					'fa-chevron-circle-down' => 'Chevron Circle Down',
			),
		) );


		/* SOUNDS */
		$cmb->add_field( array(
			'name' => __( 'Sounds', 'patchchat' ),
			'id'   => 'sound-title',
			'type' => 'title',
		) );

		$cmb->add_field( array(
			'name' => __( 'Receive Sound', 'patchchat' ),
			'desc' => __( 'The receive sound.', 'patchchat' ),
			'id'   => 'receive-message-sound',
			'type' => 'select',
			'show_option_none' => true,
			'options'          => self::audio_options(),
		) );

		$cmb->add_field( array(
			'name' => __( 'Send Sound', 'patchchat' ),
			'desc' => __( 'The send sound.', 'patchchat' ),
			'id'   => 'send-message-sound',
			'type' => 'select',
			'show_option_none' => true,
			'options'          => self::audio_options(),
		) );

	}


	/**
	 * Renders the settings page
	 *
	 * @author caseypatrickdriscoll
	 */
	static function render() {

		?>
		<h2><?php _e( self::$title ); ?></h2>
		<div class="wrap cmb2-options-page">
			<?php cmb2_metabox_form( self::$key, self::$key ); ?>
		</div>
		<?php

	}


	/**
	 * Prepares the 'patchchat' js object variable for wp_localize_script
	 *
	 * Sets defaults if patchchat_settings option array doesn't exist
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-08-09 18:33:09
	 * @edited  2015-08-19 16:36:58 - Adds setting for chat-instructions
	 * @edited  2015-08-19 16:45:35 - Adds setting for header-text
	 * @edited  2015-08-22 09:40:02 - Adds 'labels' default settings
	 * @edited  2015-08-27 13:16:34 - Adds minimize-icon option
	 * @edited  2015-08-27 13:28:10 - Adds default spinner-icon
	 * @edited  2015-08-27 13:55:54 - Adds spinner-icon option
	 * 
	 * @return array $settings The array of settings
	 */
	static function localize() {

		$data = array(
			'admin'   => 'false',
			'ajaxurl' => '/wp-admin/admin-ajax.php',
		);

		if ( is_admin() ) {
			$data['admin'] = 'true';
		}

		$settings = get_option( self::$key );

		// If the 'patchchat_settings' option hasn't been initialized or is missing
		//   set the array with default settings
		if ( $settings === false ) {

			$data['debug']          = self::$debug;
			$data['userpulsetime']  = self::$user_pulse_time;
			$data['adminpulsetime'] = self::$admin_pulse_time;
			$data['headerText']     = self::$header_text;
			$data['instructions']   = self::$instructions;
			$data['spinnerIcon']    = self::$spinner_icon;

		} else {

			// Convert js-debug checkbox value to true/false
			// true/false must be string, as wp_localize_script() will convert to string anyways
			// http://wordpress.stackexchange.com/questions/105426/passing-boolean-values-with-wp-localize-script
			if ( array_key_exists( 'js-debug', $settings ) && $settings['js-debug'] == 'on' ) {
				$data['debug'] = 'true';
			} else {
				$data['debug'] = 'false';
			}

			// If not set by admin, set admin pulse time from class default
			if ( array_key_exists( 'admin-pulse-time', $settings ) ) {
				$data['adminpulsetime'] = $settings['admin-pulse-time'];
			} else {
				$data['adminpulsetime'] = self::$admin_pulse_time;
			}

			// If not set by admin, set user pulse time from class default
			if ( array_key_exists( 'user-pulse-time', $settings ) ) {
				$data['userpulsetime'] = $settings['user-pulse-time'];
			} else {
				$data['userpulsetime']  = self::$user_pulse_time;
			}

			$audio_url = plugins_url( '/assets/audio/', dirname( dirname( __FILE__ ) ) );

			if ( array_key_exists( 'send-message-sound', $settings ) ) {
				$data['sendMessageSound'] = $audio_url . $settings['send-message-sound'];
			}

			if ( array_key_exists( 'receive-message-sound', $settings ) ) {
				$data['receiveMessageSound'] = $audio_url . $settings['receive-message-sound'];
			}

			if ( array_key_exists( 'header-text', $settings ) ) {
				$data['headerText'] = $settings['header-text'];
			} else {
				$data['headerText'] = self::$header_text;
			}

			if ( array_key_exists( 'minimize-icon', $settings ) ) {
				$data['minimizeIcon'] = $settings['minimize-icon'];
			}

			if ( array_key_exists( 'spinner-icon', $settings ) ) {
				$data['spinnerIcon'] = $settings['spinner-icon'];
			} else {
				$data['spinnerIcon']  = self::$spinner_icon;
			}

			if ( array_key_exists( 'chat-instructions', $settings ) ) {
				$data['instructions'] = $settings['chat-instructions'];
			} else {
				$data['instructions'] = self::$instructions;
			}

		}

		$data['labels'] = array(
			'comment' => self::$label_comment,
		);


		return $data;

	}


	/**
	 * Returns the approriate string to for the instant read receipt
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @created 2015-08-28 20:13:06
	 *
	 * @param WP_USER $user The given user
	 *
	 * @return  string The instant reply to leave as a comment
	 */
	public static function instant_reply( $user ) {

		$settings = get_option( self::$key );

		if ( $settings === false || empty( $settings['instant-reply'] ) )
			return __( self::$instant_reply, 'patchchat' );
		else
			return $settings['instant-reply'];
	}


	/**
	 * Returns the user id saved as the bot
	 *
	 * TODO: Add bot setting, remove hardcoding
	 *
	 * @author  caseypatrickdriscoll
	 *
	 * @created 2015-08-28 20:17:30
	 * 
	 * @return int The user id of the auto bot user
	 */
	public static function bot() {

		$settings = get_option( self::$key );

		$bot_id = '';

		if ( $settings === false || empty( $settings['bot_id'] ) ) {

			$bot = get_user_by( 'username', self::$bot_username );

			if ( $bot === false ) {

				$bot = array(
					'user_login'   => self::$bot_username,
					'user_pass'    => NULL,
					'display_name' => self::$bot_displayname,
				);

				$bot_id = wp_insert_user( $bot );

			} else {

				$bot_id = $bot->ID;
			
			}

			if ( $settings === false )
				$settings = array( 'bot_id' => $bot_id );
			else
				$settings['bot_id'] = $bot_id;

			update_option( self::$key, $settings );

		} else {

			$bot_id = $settings['bot_id'];

		}

		return $bot_id;
	}


	/**
	 * Helper method to prep and return all audio filenames
	 *
	 * @author caseypatrickdriscoll
	 *
	 * @created 2015-08-19 14:20:31
	 *
	 * @return  array $audio_options An array of audio_filename => filename_as_title
	 */
	private static function audio_options() {
		$audio_dir = plugin_dir_path( dirname( dirname( __FILE__ ) ) ) . '/assets/audio/';

		$audio_files = scandir( $audio_dir );

		$audio_options = array();

		foreach ( $audio_files as $key => $audio_file ) {

			if ( substr( $audio_file, -3 ) != 'mp3' ) continue;

			$filename = ucwords( str_replace( '-', ' ', preg_replace('/\\.[^.\\s]{3}$/', '', $audio_file ) ) );

			$audio_options[$audio_file] = __( $filename , 'patchchat' );

		}

		return $audio_options;
	}

}