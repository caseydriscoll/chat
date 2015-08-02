// TODO: Localize
// TODO: Drop jquery if possible

'use strict';

var PWDEBUG = 1;

var ajaxURL = '/wp-admin/admin-ajax.php';
var patchchat = { users: [] };

jQuery(document).ready(function () {

	React.render(React.createElement(PatchChatMessenger, null), document.getElementById('wpbody'));

	patchchat.spinner = jQuery('.patchchatmessenger .spinner');
});
