var PatchChatBoxes = React.createClass( {
	render: function() {

		var patchchat_boxes = this.props.data.chats.map( function( chat, i ) {

			var chat_id = 'chat_' + chat.chat_id;
			var classes = 'patchchatbox';
			if ( i == 0 ) classes += ' active';

			return (
				<PatchChatBox
					id={chat_id}
					key={chat_id}
					data={chat}
					role="tabpanel"
					submit={this.props.submit}
					classes={classes}
					/>
			);
		}, this );

		return(
			<ul id="patchchatboxes">
				{patchchat_boxes}
			</ul>
		)
	}
} );


var PatchChatBox = React.createClass( {

	render: function() {
		var patchchat_comments = typeof this.props.data.chat_id === 'undefined' ? null : <PatchChatComments data={this.props.data} />;
		return(
			<li className={this.props.classes} id={this.props.id}>
				{patchchat_comments}
				<PatchChatForm submit={this.props.submit} chatid={this.props.data.chat_id} />
			</li>
		);
	}
} );

var PatchChatComments = React.createClass( {
	render: function() {
		var comments = this.props.data.comments.map( function( comment ) {
			var classes = 'comment ' ;//+ patchchat.users[comment.user].role;
			return (
				<li className={classes} key={'comment' + comment.id}>
					<img src={'https://gravatar.com/avatar/' + comment.img + '.jpg?s=30'} />
					{comment.text}
				</li>
			);
		} );
		return (
			<ul className="patchchatcomments">
				{comments}
			</ul>
		);
	}
} );


var PatchChatForm = React.createClass( {

	validate: function(e) {

		if ( e.which == 13 || e.keyCode == 13 ) {
			e.preventDefault();

			if ( typeof this.props.chatid !== 'undefined' ) {
				this.props.submit();
				return;
			}

			var name  = jQuery( 'input[name=patchchat-name]' ).val();
			var email = jQuery( 'input[name=patchchat-email]' ).val();
			var text  = jQuery( 'textarea[name=patchchat-text]' ).val();

			var honey = jQuery( 'input[name=patchchat-honeypot]' ).val();

			var re    = /\S+@\S+/;
			var valid = false;
			var error = false;

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

			if ( valid ) this.props.submit();

		}

	},
	adjust: function(e) {
		jQuery( e.target ).height( 0 );
		jQuery( e.target ).height( e.target.scrollHeight );
	},
	render: function() {
		var fieldset = typeof this.props.chatid === 'undefined' ? <PatchChatFieldset /> : null;
		return(
			<form>
				{fieldset}
				<textarea name="patchchat-text" onKeyUp={this.adjust} onKeyDown={this.validate} required></textarea>
			</form>
		);
	}
});

var PatchChatFieldset = React.createClass( {
	render: function() {
		return(
			<fieldset>
				<label>Name</label><input name="patchchat-name" type="name" required />
				<label>Email</label><input name="patchchat-email" type="email" required />
				<input id="patchchat-honeypot" name="patchchat-honeypot" type="text" />
			</fieldset>
		);
	}

} );