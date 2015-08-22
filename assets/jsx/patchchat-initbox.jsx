var PatchChatInitBox = React.createClass( {
	validate: function(e) {

		e.preventDefault();

		var chat = {};

		chat.method = 'create';

		chat.name   = jQuery( e.target ).find( 'input[name=patchchat-name]' ).val();
		chat.email  = jQuery( e.target ).find( 'input[name=patchchat-email]' ).val();
		chat.text   = jQuery( e.target ).find( 'input[name=patchchat-text]' ).val();

		chat.honey  = jQuery( e.target ).find( 'input[name=patchchat-honeypot]' ).val();

		var re    = /\S+@\S+/;
		var valid = false;
		var error = false;

		if ( chat.name == '' )
			error = 'Name is blank';
		else if ( chat.email == '' )
			error = 'Email is blank';
		else if ( ! re.test( chat.email ) )
			error = 'Not a valid email';
		else if ( chat.text == '' )
				error = 'Text is blank';

		if ( chat.honey != '' )
			error = 'Caught the honeypot';


		if ( error == false ) {
			valid = true;
		}

		if ( patchchat.debug == 'true' ) console.log( 'PatchChatInitBox', 'name: ' + chat.name, 'email: ' + chat.email, 'text: ' + chat.text, 'error: ' + error );

		if ( valid ) {
			jQuery( '#patchchatinitbox' )
				.find( 'input' ).val( '' ).empty();

			this.props.submit( chat );
		}

	},
	render: function() {

		var classes = 'patchchatbox open';
		classes += (this.props.needed ? ' needed' : '');

		// TODO: Make 'Comment' field label adjustable (Question, Comment, etc)
		// TODO: Make 'required' adjustable
		// TODO: Make 'login' link optional
		return(
			<li id="patchchatinitbox" className={classes}>
				<PatchChatBoxHeader />
				<form onSubmit={this.validate}>
					<p className="patchchat-instructions">{patchchat.instructions}</p>
					<p>Already have an account? <a href="/wp-login.php">Login</a></p>
					<p className="patchchat-message"></p>
					<label>Name</label><input name="patchchat-name" type="name" required />
					<label>Email</label><input name="patchchat-email" type="email" required />
					<label>Comment</label><input name="patchchat-text" type="text" required />
					<input id="patchchat-honeypot" name="patchchat-honeypot" type="text" />
					<input type="submit" />
				</form>
			</li>
		);
	}
} );