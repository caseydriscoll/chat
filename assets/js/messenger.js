PWDEBUG = 1;

var ajaxURL = '/wp-admin/admin-ajax.php';
var patchchat = { users: [] };

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

	React.render(
		React.createElement(PatchChat, null),
		document.getElementById( 'wpbody-content' )
	);

} );


var PatchChat = React.createClass( {displayName: "PatchChat",
	loadCommentsFromServer: function() {

		ajaxdata = {
			'action'  : 'patchchat_get',
			'method'  : 'get_agent',
			'user_id' : 1
		};

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
			success : function ( response ) {

				this.setState({ data : { chats: response.data } });

				if ( PWDEBUG ) console.log( 'response 2: ', response );

				setTimeout( this.loadCommentsFromServer, 3000 );

			}.bind(this),
			error   : function ( response ) {
				if ( PWDEBUG ) console.log( 'error response: ', response );
			}.bind(this)
		});
	},
	getInitialState: function() {
		return { data: { chats: [] }  }
	},
	componentDidMount: function() {
		this.loadCommentsFromServer();
	},
	render: function() {
		return (
			React.createElement("div", {className: "patchchat"}, 
				React.createElement(Header, {count: this.state.data.chats.length}), 
				React.createElement(Chats, {data: this.state.data})
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
		var chats = this.props.data.chats.reverse().map( function( chat ) {
			return (
				React.createElement(Chat, {data: chat}, 
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
				this.props.children, 

				React.createElement(PatchComments, {data: this.props.data})
			)
		);
	}
} );