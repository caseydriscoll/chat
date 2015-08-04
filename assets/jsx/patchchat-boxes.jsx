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
				<PatchChatInitBox submit={this.props.submit} />
				{patchchat_boxes}
			</ul>
		)
	}
} );


var PatchChatInitBox = React.createClass( {
	validate: function(chat) {

		chat.method = 'create';

		chat.name   = jQuery( 'input[name=patchchat-name]' ).val();
		chat.email  = jQuery( 'input[name=patchchat-email]' ).val();

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

		if ( chat.honey != '' )
			error = 'Caught the honeypot';


		if ( error == false ) {
			valid = true;
		}

		if ( PWDEBUG ) console.log( 'PatchChatInitBox', 'name: ' + chat.name, 'email: ' + chat.email, 'text: ' + chat.text, 'error: ' + error );

		if ( valid ) {
			jQuery( '#patchchatinitbox' )
				.find( 'input, textarea' ).val( '' ).empty();

			this.props.submit( chat );
		}

	},
	render: function() {
		return(
			<li id="patchchatinitbox" className="patchchatbox open">
				<PatchChatBoxHeader />
				<PatchChatForm submit={this.validate}>
					<fieldset>
						<label>Name</label><input name="patchchat-name" type="name" required />
						<label>Email</label><input name="patchchat-email" type="email" required />
						<input id="patchchat-honeypot" name="patchchat-honeypot" type="text" />
					</fieldset>
				</PatchChatForm>
			</li>
		);
	}
} );


var PatchChatBox = React.createClass( {

	render: function() {
		var patchchat_comments = typeof this.props.data.chat_id === 'undefined' ? null : <PatchChatComments data={this.props.data} />;
		return(
			<li className={this.props.classes} id={this.props.id}>
				<PatchChatBoxHeader />
				{patchchat_comments}
				<PatchChatForm submit={this.props.submit} chatid={this.props.data.chat_id} />
			</li>
		);
	}
} );


var PatchChatBoxHeader = React.createClass( {
	handleClick : function(e) {
		jQuery( e.nativeEvent.target ).closest( '.patchchatbox' ).toggleClass( 'open' );
	},
	render : function () {
		return (
			<header onClick={this.handleClick}>
				PatchChat
				<img className="spinner" src="/wp-admin/images/wpspin_light.gif" />
			</header>
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


/**
 * This is a normal form, with just the text box for creating commments.
 *
 * Previously, it also had the name and email fields.
 *
 * Name and email are moved to PatchChatInitBox - caseypatrickdriscoll 2015-08-02 18:53:59
 */
var PatchChatForm = React.createClass( {

	validate: function(e) {

		if ( e.which == 13 || e.keyCode == 13 ) {
			e.preventDefault();

			var chat = {};

			chat.text  = e.target.value;

			var valid = false;
			var error = false;

			if ( chat.text == '' )
				error = 'Text is blank';

			if ( error == false ) {
				valid = true;
			}

			if ( PWDEBUG ) console.log( 'PatchChatForm', 'text: ' + chat.text, 'error: ' + error );

			if ( valid ) this.props.submit(chat);

		}

	},
	adjust: function(e) {
		jQuery( e.target ).height( 0 );
		jQuery( e.target ).height( e.target.scrollHeight );
	},
	render: function() {
		return(
			<form>
				{this.props.children}
				<textarea name="patchchat-text" onKeyUp={this.adjust} onKeyDown={this.validate} required></textarea>
			</form>
		);
	}
});
