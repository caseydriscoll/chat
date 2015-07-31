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
		var chats = this.props.data.chats.reverse().map( function( chat, i ) {
			return (
				React.createElement(Chat, {data: chat, idx: i}, 
					React.createElement("img", {src: 'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40'}), 
					React.createElement("h3", null, chat.name), 
					chat.title
				)
			);
		} );

		var comments = this.props.data.chats.map( function( chat, i ) {
			var chat_id = 'chat_' + chat.id;
			var classes = 'patchchat-body';
			if ( i == 0 ) classes += ' active';
			return (
				React.createElement("div", {className: classes, id: chat_id, role: "tabpanel"}, 
					React.createElement(PatchComments, {data: chat}), 
					React.createElement(PatchChatForm, {submit: this.submit})
				)
			);
		} );

		return (
			React.createElement("section", null, 
				React.createElement("ul", {className: "chats", role: "tablist"}, 
					chats
				), 
				React.createElement("div", {className: "tab-content"}, 
					comments
				)
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
		var chat_id = 'chat_' + this.props.data.id;
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