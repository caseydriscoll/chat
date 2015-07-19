<?php

class PatchChatMessenger {


	static function register_menu() {

		add_submenu_page(
			'patchchat',
			'PatchChat Messenger',
			'Messenger',
			'manage_options',
			'patchchat_messenger',
			'PatchChatMessenger::render'
		);
	}


	public static function render() { ?>
		<div class="patchchat" id="patchchat">
			<header>
				<h1>PatchChat Messenger</h1>
			</header>
			<div class="messenger">
				<ul class="messages">

				</ul>
			</div>
		</div>
	<?php
	}
}