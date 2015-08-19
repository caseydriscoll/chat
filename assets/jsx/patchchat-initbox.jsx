var PatchChatInitBox = React.createClass( {
	validate: function(e) {

		e.preventDefault();

		var chat = {};

		chat.method = 'create';

		chat.name   = jQuery( 'input[name=patchchat-name]' ).val();
		chat.email  = jQuery( 'input[name=patchchat-email]' ).val();
		chat.text   = jQuery( 'input[name=patchchat-text]' ).val();

		chat.honey  = jQuery( 'input[name=patchchat-honeypot]' ).val();

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
		return(
			<li id="patchchatinitbox" className={classes}>
				<PatchChatBoxHeader />
				<form onSubmit={this.validate}>
					<fieldset>
						<label>Name</label><input name="patchchat-name" type="name" required />
						<label>Email</label><input name="patchchat-email" type="email" required />
						<label>Comment</label><input name="patchchat-text" type="text" required />
						<input id="patchchat-honeypot" name="patchchat-honeypot" type="text" />
						<input type="submit" />
					</fieldset>
				</form>
			</li>
		);
	}
} );