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
		}



		static function render() {
		
		}
	}

?>