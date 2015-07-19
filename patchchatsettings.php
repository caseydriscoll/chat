<?php

	class PatchChatSettings {
		
		static function register_menu() {
			add_submenu_page(
				'patchchat',
				'PatchChat Settings',
				'Settings',
				'manage_options',
				'patchchat_settings',
				'PatchChatSettings::render'
			);
		}



		static function render() {
		
		}
	}