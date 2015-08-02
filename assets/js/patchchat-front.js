// TODO: Explain/document these variables
// TODO: Document all the things
// TODO: Localize script
// TODO: Move validation to React
// TODO: Drop jquery, completely if possible (except ajax)
// TODO: Generally clean up

'use strict';

var PWDEBUG = 1;

var patchchat = {};
var ajaxURL = '/wp-admin/admin-ajax.php';

jQuery(document).ready(function () {

	renderPatchChat();

	patchchat.spinner = jQuery('.patchchat .spinner');
});

function renderPatchChat() {

	jQuery('body').append('<div id="patchchatcontainer"></div>');

	React.render(React.createElement(PatchChatMessenger, null), document.getElementById('patchchatcontainer'));
}
