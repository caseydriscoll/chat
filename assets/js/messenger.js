PWDEBUG = 1;

var ajaxURL = '/wp-admin/admin-ajax.php';
var patchchat = { users: [] };

// TODO: Localize
// TODO: Convert to new ajax controller
// TODO: Make better React
// TODO: Drop jquery if possible
// TODO: Add bootstrap(?) tabs


/**
 * - PatchChatMessenger
 *   - Header
 *   - PatchChatList
 */

jQuery( document ).ready( function() {

	React.render(
		React.createElement(PatchChatMessenger, null),
		document.getElementById( 'wpbody' )
	);

	patchchat.spinner = jQuery( '.patchchatmessenger .spinner' );

} );


var PatchChatMessenger = React.createClass( {displayName: "PatchChatMessenger",
	loadCommentsFromServer: function() {

		ajaxdata = {
			'action'  : 'patchchat_get',
			'method'  : 'get_agent',
			'user_id' : 1
		};

		if ( PWDEBUG ) console.log( 'Pre-' + ajaxdata.method, ajaxdata );

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
			React.createElement("div", {id: "patchchatmessenger"}, 
				React.createElement(Header, {count: this.state.data.chats.length}), 
				React.createElement(PatchChatList, {data: this.state.data}), 
				React.createElement(PatchChatBodies, {data: this.state.data})
			)
		);
	}
} );


var Header = React.createClass( {displayName: "Header",
	render: function() {
		return (
			React.createElement("header", null, 
				React.createElement("h1", null, "PatchChat (", this.props.count, ")"), 
				React.createElement("img", {className: "spinner", src: "/wp-admin/images/wpspin_light.gif"})
			)
		);
	}
} );



// TODO: Make gravatar img size variable
var PatchChatList = React.createClass( {displayName: "PatchChatList",
	render: function() {
		var chats = this.props.data.chats.reverse().map( function( chat, i ) {
			return (
				React.createElement(Chat, {data: chat, idx: i, key: chat.chat_id}, 
					React.createElement("img", {src: 'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40'}), 
					React.createElement("h3", null, chat.name), 
					chat.title
				)
			);
		} );

		return (
			React.createElement("ul", {className: "patchchatlist", role: "tablist"}, 
				chats
			)
		);
	}
} );

var Chat = React.createClass( {displayName: "Chat",
	click: function (e) {
		e.preventDefault();
		jQuery( e.nativeEvent.target ).tab('show');
	},
	render: function() {
		var chat_id = 'chat_' + this.props.data.chat_id;
		var classes = 'chat';
		if ( this.props.idx == 0 ) classes += ' active';
		return (
			React.createElement("li", {className: classes, role: "presentation"}, 
				React.createElement("a", {href: '#' + chat_id, "aria-controls": chat_id, role: "tab", "data-toggle": "tab", onClick: this.click}, 
					this.props.children
				)
			)
		);
	}
} );

var PatchChatBodies = React.createClass( {displayName: "PatchChatBodies",
	render: function() {

		var comments = this.props.data.chats.map( function( chat, i ) {

			var chat_id = 'chat_' + chat.chat_id;
			var classes = 'tabpanel';
			if ( i == 0 ) classes += ' active';
			return (
				React.createElement("div", {className: classes, id: chat_id, role: "tabpanel", key: chat_id}, 
					React.createElement(PatchChatBody, {data: chat})
				)
			);
		}, this );

		return(
			React.createElement("div", {className: "tab-content"}, 
				comments
			)
		)
	}
} );