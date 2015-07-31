var PatchChatBody = React.createClass( {
	submit: function() {

		patchchat.spinner.show();

		ajaxdata = {
			'action'    : 'patchchat_post',
			'patchchat' : {
				'text'  : jQuery( 'textarea[name=patchchat-text]' ).val(),
				'name'  : jQuery( 'input[name=patchchat-name]' ).val(),
				'email' : jQuery( 'input[name=patchchat-email]' ).val()
			}
		};

		
		if ( this.state.data.chat_id === undefined ) {
			ajaxdata.method  = 'create';
		} else {
			ajaxdata.method  = 'update';
			ajaxdata.patchchat.chat_id = this.state.data.chat_id;
			ajaxdata.patchchat.email = patchchat.email;
		}

		jQuery( '.patchchatbody textarea' ).val( '' ).focus();

		if ( PWDEBUG ) console.log( 'Pre-' + ajaxdata.method, ajaxdata );

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
			success : function ( response ) {

				if ( PWDEBUG ) console.log( 'response 1: ', response );

				patchchat.spinner.hide();

				patchchat.users = response.data.users;
				this.setState({ data : response.data });

				setTimeout( this.loadCommentsFromServer, 3000 );

			}.bind( this ),
			error   : function ( response ) {
				if ( PWDEBUG ) console.log( 'error response: ', response );
			}.bind( this )
		});
	},
	getInitialState: function() {
		return( { data: this.props.data } );
	},
	render: function() {
		comments = typeof this.state.data.chat_id === 'undefined' ? null : <PatchChatComments data={this.state.data} />;
		return(
			<div className="patchchatbody">
				{comments}
				<PatchChatForm submit={this.submit} chatid={this.state.data.chat_id} />
			</div>
		);
	}
} );

var PatchChatComments = React.createClass( {
	render: function() {
		var comments = this.props.data.comments.map( function( comment ) {
			classes = 'comment ' ;//+ patchchat.users[comment.user].role;
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

			if ( valid ) this.props.submit();

		}

	},
	adjust: function(e) {
		jQuery( e.target ).height( 0 );
		jQuery( e.target ).height( e.target.scrollHeight );
	},
	render: function() {
		fieldset = typeof this.props.chatid === 'undefined' ? <PatchChatFieldset /> : null;
		return(
			<form onSubmit={this.handleSubmit}>
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