// TODO: Localize
// TODO: Drop jquery if possible

var PWDEBUG = 1;

var ajaxURL = '/wp-admin/admin-ajax.php';
var patchchat = {};


jQuery( document ).ready( function() {

	React.render(
		<PatchChatMessenger pulse="1000"  />,
		document.getElementById( 'wpbody' )
	);

} );