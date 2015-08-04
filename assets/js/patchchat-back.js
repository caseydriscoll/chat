// TODO: Localize
// TODO: Drop jquery if possible

'use strict';

var PWDEBUG = 1;

var ajaxURL = '/wp-admin/admin-ajax.php';
var patchchat = {};

jQuery(document).ready(function () {

	React.render(React.createElement(PatchChatMessenger, { pulse: '1000' }), document.getElementById('wpbody'));
});
