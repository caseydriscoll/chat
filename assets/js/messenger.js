PWDEBUG = 1;

var ajaxURL = '/wp-admin/admin-ajax.php';

jQuery( document ).ready( function() {

	signedIn = true;

	if ( signedIn ) {
		pingPatchChat();
	}
} );


function pingPatchChat() {

	data = {
		'action' : 'ping_patchchat'
	};

	jQuery.post(
		ajaxURL,
		data,
		function( response ) {

			if ( response.success )
				setTimeout( pingPatchChat, 3000 );

			if ( PWDEBUG ) console.log( response );
		}
	)
}