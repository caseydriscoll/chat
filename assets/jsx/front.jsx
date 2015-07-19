PWDEBUG = 1;

// TODO: Explain/document these variables
// TODO: Document all the things
// TODO: Localize script
var patchchat = {};
var pingID;
var ajaxURL = '/wp-admin/admin-ajax.php';



jQuery( document ).ready( function() {

	jQuery( 'body' ).append( '<div class="patchchat"></div>' );

	React.render(
		<section>
			<header>
				PatchChat
				<img className="spinner" src="/wp-admin/images/wpspin_light.gif" />
			</header>
			<div className="patchchat-body">
				<form>
					<label>Name</label><input name="patchchat-name" type="name" required />
					<label>Email</label><input name="patchchat-email" type="email" required />
					<input id="patchchat-honeypot" name="patchchat-honeypot" type="text" />
					<textarea name="patchchat-text" required></textarea>
				</form>
			</div>
		</section>,
		document.getElementsByClassName( 'patchchat' )[0]
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


function submitPatchChat() {

	valid = validPatchChat();

	if ( PWDEBUG ) console.log( 'valid: ' + valid );

	if ( ! valid ) return false;

	jQuery( '.patchchat .spinner' ).show();

	data = {
		'action' : 'submit_patchchat',
		'name'   : jQuery( 'input[name=patchchat-name]' ).val(),
		'email'  : jQuery( 'input[name=patchchat-email]' ).val(),
		'text'   : jQuery( 'textarea[name=patchchat-text]' ).val()
	};

	jQuery.post(
		ajaxURL,
		data,
		function( response ) {
			if ( PWDEBUG ) console.log( response );

			jQuery( '.patchchat .spinner' ).hide();

			if ( response.success ) {
				jQuery( '.patchchat textarea').val( '' ).focus();

				React.render(
					<section>
						<header>
							PatchChat
							<img className="spinner" src="/wp-admin/images/wpspin_light.gif" />
						</header>
						<div className="patchchat-body">
							<ul>
								<li className="user">{response.data.text}</li>
								<li className="admin">Hi there what can we help you with?</li>
							</ul>
							<form>
								<textarea name="patchchat-text" required></textarea>
							</form>
						</div>
					</section>,
					document.getElementsByClassName( 'patchchat' )[0]
				);

				// Start up the clock
				// TODO: Not sure if should set up interval or timeout.
				//       For now, new timeout set on every successful trip from server, reset by pingPatchChat callback success
				pingPatchChat();

			} else {

			}
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