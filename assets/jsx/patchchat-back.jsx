// TODO: Localize
// TODO: Drop jquery if possible

var PWDEBUG = 1;

var ajaxURL = '/wp-admin/admin-ajax.php';
var patchchat = { users: [] };


jQuery( document ).ready( function() {

	React.render(
		<PatchChatMessenger />,
		document.getElementById( 'wpbody' )
	);

} );