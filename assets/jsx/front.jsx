jQuery( document ).ready( function() {

	jQuery( 'body' )
		.append( '<div class="patchchat"></div>' )
		.find( '.patchchat' )
		.append( '<header>PatchChat</header>' )
		.append( '<section></section>' )
		.find( 'section' )
		.append( '<label>Name</label><input id="patchchat-name" type="text"/>' )
		.append( '<label>Email</label><input id="patchchat-email" type="email"/>' )
		.append( '<textarea id="patchchat-text"></textarea>' )
		.parent().find( 'header' )
		.on( 'click', function() {
			jQuery( '.patchchat > section' ).toggle();
			jQuery( '.patchchat input' )[0].focus();
		} );

	jQuery( '.patchchat' )
		.delegate( 'textarea', 'keyup', function (e) {

			if ( e.which == 13 || e.keyCode == 13 ) {
				jQuery( e.target ).val( '' );
			}

			jQuery( this ).height( 0 );
			jQuery( this ).height( this.scrollHeight );

		} ).delegate( 'textarea', 'keydown', function(e) {
			
			if ( e.which == 13 || e.keyCode == 13 ) {
				submitPatchChat( e.target.value );
			}

		} );

} );

var patchchat = Array();

function submitPatchChat( text ) {

	patchchat['name']  = jQuery( '#patchchat-name' ).val();
	patchchat['email'] = jQuery( '#patchchat-email' ).val();
	patchchat['text']  = jQuery( '#patchchat-text' ).val();

	console.log( patchchat );

}