<?php

	class PatchChatAdmin {
		
		static function register_menu() {
			add_menu_page(
				'PatchChat',
				'PatchChat',
				'manage_options',
				'patchchat',
				'PatchChatAdmin::render',
				'dashicons-format-chat',
				'25.1'
			);

			add_submenu_page(
				'patchchat',
				'PatchChat Settings',
				'Messenger',
				'manage_options',
				'patchchat_messenger',
				'PatchChatAdmin::render'
			);

			add_submenu_page(
				'patchchat',
				'PatchChat Settings',
				'Settings',
				'manage_options',
				'patchchat_settings',
				'PatchChatAdmin::render'
			);
		}



		static function render() {
		
		}
	}