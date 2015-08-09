// TODO: Document all the things
// TODO: Generally clean up

var ajaxURL = '/wp-admin/admin-ajax.php';

jQuery( 'body' ).append( '<div id="patchchatcontainer"></div>' );

React.render(
	<PatchChatMessenger pulse="3000" />,
	document.getElementById( 'patchchatcontainer' )
);