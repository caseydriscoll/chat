PWDEBUG = 1;

// TODO: Explain/document these variables
// TODO: Document all the things
// TODO: Localize script
// TODO: Move validation to React
// TODO: Drop jquery, completely if possible (except ajax)
// TODO: Generally clean up
var patchchat = {};
var ajaxURL = '/wp-admin/admin-ajax.php';



jQuery( document ).ready( function() {

	renderPatchChat();

	patchchat.spinner = jQuery( '.patchchat .spinner' );

} );

/*
 * - PatchChat
 *   - section
 *     - header
 *     - .patchchat-body
 *       - PatchComments
 *         - li.comment
 *       - PatchForm
 */

function renderPatchChat() {

	jQuery( 'body' ).append( '<div class="patchchat"></div>' );

	React.render(
		React.createElement(PatchChat, null),
		document.getElementsByClassName( 'patchchat' )[0]
	);
}


var PatchChat = React.createClass( {displayName: "PatchChat",
	loadCommentsFromServer: function() {

		if ( this.state.data.id === undefined ) return;

		ajaxdata = {
			'action'  : 'patchchat_get',
			'method'  : 'get_single',
			'chat_id' : this.state.data.id
		};

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
			success : function ( response ) {
				this.setState({ data : response.data });

				patchchat.users = response.data.users;

				patchchat.spinner.hide();
				jQuery( '.patchchat textarea' ).focus();

				setTimeout( this.loadCommentsFromServer, 3000 );

				if ( PWDEBUG ) console.log( 'response 2: ', response );
			}.bind(this),
			error   : function ( response ) {
				if ( PWDEBUG ) console.log( 'error response: ', response );
			}.bind(this)
		});
	},
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

		if ( this.state.data.id === undefined ) {
			ajaxdata.method       = 'create';
		} else {
			ajaxdata.method       = 'update';
			ajaxdata.patchchat.id = this.state.data.id;
		}

		jQuery( '.patchchat textarea' ).val( '' ).focus();

		console.log( 'Pre-' + ajaxdata.method, ajaxdata );

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
			success : function ( response ) {

				jQuery( '.patchchat' ).addClass( 'active' );

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
	toggle: function() {
		jQuery( '.patchchat-body' ).toggle();
		jQuery( '.patchchat input' )[0].focus();
	},
	getInitialState: function() {
		return { data: { comments: [] }  }
	},
	componentDidMount: function() {
		this.loadCommentsFromServer();
	},
	render: function() {
		return (
			React.createElement("section", null, 
				React.createElement("header", {onClick: this.toggle}, 
					"PatchChat", 
					React.createElement("img", {className: "spinner", src: "/wp-admin/images/wpspin_light.gif"})
				), 
				React.createElement("div", {className: "patchchat-body"}, 
					React.createElement(PatchComments, {data: this.state.data}), 
					React.createElement(PatchChatForm, {submit: this.submit})
				)
			)
		);
	}
} );


var PatchComments = React.createClass( {displayName: "PatchComments",
	render: function() {
		var comments = this.props.data.comments.map( function( comment ) {
			classes = 'comment ' + patchchat.users[comment.user].role;
			return (
				React.createElement("li", {className: classes, key: 'comment' + comment.id}, 
					React.createElement("img", {src: 'https://gravatar.com/avatar/' + comment.img + '.jpg?s=30'}), 
					comment.text
				)
			);
		} );
		return (
			React.createElement("ul", {className: "comments"}, 
				comments
			)
		);
	}
} );



var PatchChatForm = React.createClass( {displayName: "PatchChatForm",
	validate: function(e) {

		if ( e.which == 13 || e.keyCode == 13 ) {
			e.preventDefault();
			this.props.submit();
		}

	},
	adjust: function(e) {
		jQuery( e.target ).height( 0 );
		jQuery( e.target ).height( e.target.scrollHeight );
	},
	render: function() {
		return(
			React.createElement("form", {onSubmit: this.handleSubmit}, 
				React.createElement("fieldset", null, 
					React.createElement("label", null, "Name"), React.createElement("input", {name: "patchchat-name", type: "name", required: true}), 
					React.createElement("label", null, "Email"), React.createElement("input", {name: "patchchat-email", type: "email", required: true}), 
					React.createElement("input", {id: "patchchat-honeypot", name: "patchchat-honeypot", type: "text"})
				), 
				React.createElement("textarea", {name: "patchchat-text", onKeyUp: this.adjust, onKeyDown: this.validate, required: true})
			)
		);
	}
});



function validPatchChat() {

	if ( patchchat.id !== undefined ) {
		return true;
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

	return valid;
}