jQuery( document ).ready( function() {

	jQuery( 'body' ).append( '<div class="patchchat"></div>' );

	React.render(
		<section>
			<header>PatchChat</header>
			<div className="patchchat-body">
				<form>
					<label>Name</label><input name="patchchat-name" type="text"/>
					<label>Email</label><input name="patchchat-email" type="email"/>
					<textarea name="patchchat-text"></textarea>
				</form>
			</div>
		</section>,
		document.getElementsByClassName('patchchat')[0]
	);

	jQuery( '.patchchat header')
		.on( 'click', function() {
			jQuery( '.patchchat-body' ).toggle();
			jQuery( '.patchchat input' )[0].focus();
		} );

	jQuery( '.patchchat form' )
		.delegate( 'textarea', 'keyup', function (e) {

			if ( e.which == 13 || e.keyCode == 13 ) {
//				jQuery( e.target ).val( '' );
			}

			jQuery( this ).height( 0 );
			jQuery( this ).height( this.scrollHeight );

		} ).delegate( 'textarea', 'keydown', function(e) {
			
			if ( e.which == 13 || e.keyCode == 13 ) {
				submitPatchChat( e.target );
			}

		} );

} );



function submitPatchChat() {

	data = {
		'action' : 'submit_patchchat',
		'name'   : jQuery( 'input[name=patchchat-name]' ).val(),
		'email'  : jQuery( 'input[name=patchchat-email]' ).val(),
		'text'   : jQuery( 'textarea[name=patchchat-text]' ).val()
	};

	jQuery.post(
		'/wp-admin/admin-ajax.php',
		data,
		function( response ) {
			
		}
	);

}