// TODO: Document all the things
// TODO: Generally clean up

'use strict';

var ajaxURL = '/wp-admin/admin-ajax.php';

jQuery('body').append('<div id="patchchatcontainer"></div>');

React.render(React.createElement(PatchChatMessenger, { pulse: '3000' }), document.getElementById('patchchatcontainer'));
