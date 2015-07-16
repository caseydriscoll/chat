PWDEBUG = 1;

jQuery( document ).ready( function() {

	jQuery( 'body' ).append( '<div class="patchchat"></div>' );

	React.render(
		<section>
			<header>PatchChat</header>
			<div className="patchchat-body">
				<form>
					<label>Name</label><input name="patchchat-name" type="name" required />
					<label>Email</label><input name="patchchat-email" type="email" required />
					<input id="patchchat-honeypot" name="patchchat-honeypot" type="text" />
					<textarea name="patchchat-text" required></textarea>
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

			jQuery( this ).height( 0 );
			jQuery( this ).height( this.scrollHeight );

		} ).delegate( 'textarea', 'keydown', function(e) {
			
			if ( e.which == 13 || e.keyCode == 13 ) {
				e.preventDefault();
				submitPatchChat( e.target );
			}

		} );

} );


var patchchat = {};


function submitPatchChat() {

	valid = validPatchChat();

	if ( PWDEBUG ) console.log( 'valid: ' + valid );

	if ( ! valid ) return false;

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
			if ( PWDEBUG ) console.log( response );
		}
	);

}


function validPatchChat() {

	patchchat = {};

	name  = jQuery( 'input[name=patchchat-name]' ).val();
	email = jQuery( 'input[name=patchchat-email]' ).val();
	text  = jQuery( 'textarea[name=patchchat-text]' ).val();

	honey = jQuery( 'input[name=patchchat-honeypot]' ).val();

	re    = /\S+@\S+/;
	valid = false;
	error = false;

	if ( name == '' )
		error = 'Name is blank';
	else if ( email == '' )
		error = 'Email is blank';
	else if ( ! re.test( email ) )
		error = 'Not a valid email';
	else if ( text == '' )
		error = 'Text is blank';

	if ( honey != '' )
		error = 'Caught the honeypot';


	if ( error == false ) {
		valid = true;

		patchchat.name = name;
		patchchat.email = email;
		patchchat.text = text;
	}

	if ( PWDEBUG ) console.log( 'name: ' + name, 'email: ' + email, 'text: ' + text, 'error: ' + error );

	return valid;
}