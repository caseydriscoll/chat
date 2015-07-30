PWDEBUG = 1;

var ajaxURL = '/wp-admin/admin-ajax.php';

// TODO: Localize
// TODO: Convert to new ajax controller
// TODO: Make better React
// TODO: Drop jquery if possible
// TODO: Add bootstrap(?) tabs


/**
 * - PatchChat
 *   - Header
 *   - Chats
 */

jQuery( document ).ready( function() {

	signedIn = true;

	if ( signedIn ) {
		pingPatchChat();
	}
} );


function pingPatchChat() {

	data = {
		'action' : 'ping_patchchat'
	};

	jQuery.post(
		ajaxURL,
		data,
		function( response ) {

			if ( response.success ) {
				setTimeout( pingPatchChat, 3000 );

				renderPatchChat( response.data );
			}

			if ( PWDEBUG ) console.log( response );
		}
	)
}

function renderPatchChat( chats ) {

	console.log( chats );

	React.render(
		React.createElement(PatchChat, {data: chats}),
		document.getElementById( 'wpbody-content' )
	);

}


var PatchChat = React.createClass( {displayName: "PatchChat",
	render: function() {
		return (
			React.createElement("div", {className: "patchchat"}, 
				React.createElement(Header, {count: this.props.data.length}), 
				React.createElement(Chats, {data: this.props.data})
			)
		);
	}
} );


var Header = React.createClass( {displayName: "Header",
	render: function() {
		return (
			React.createElement("header", null, 
				React.createElement("h1", null, "PatchChat (", this.props.count, ")")
			)
		);
	}
} );



// TODO: Make gravatar img size variable
var Chats = React.createClass( {displayName: "Chats",
	render: function() {
		var chats = this.props.data.map( function( chat ) {
			return (
				React.createElement(Chat, null, 
					React.createElement("img", {src: 'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40'}), 
					React.createElement("h3", null, chat.name), 
					chat.title
				)
			);
		} );
		return (
			React.createElement("ul", {className: "chats"}, 
				chats
			)
		);
	}
} );

var Chat = React.createClass( {displayName: "Chat",
	render: function() {
		return (
			React.createElement("li", {className: "chat"}, 
				this.props.children
			)
		);
	}
} );