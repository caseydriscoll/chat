jQuery( document ).ready( function() {

	jQuery( 'body' )
		.append( '<div class="patchchat"><header>PatchChat</header><section><textarea></textarea></section></div>' )
		.find( '.patchchat header' )
		.on( 'click', function() {
			jQuery( '.patchchat > section' ).toggle();
			jQuery( '.patchchat textarea' ).focus();
		} );

	jQuery( '.patchchat' ).delegate( 'textarea', 'keyup', function (){
		jQuery( this ).height( 0 );
		jQuery( this ).height( this.scrollHeight );
	});
	jQuery( '.patchchat' ).find( 'textarea' ).keyup();

} );