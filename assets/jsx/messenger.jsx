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
		<PatchChatMessenger />,
		document.getElementById( 'wpbody' )
	);

	patchchat.spinner = jQuery( '.patchchatmessenger .spinner' );

} );


var PatchChatMessenger = React.createClass( {
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
			<div id="patchchatmessenger">
				<Header count={this.state.data.chats.length} />
				<PatchChatList data={this.state.data} />
				<PatchChatBodies data={this.state.data} />
			</div>
		);
	}
} );


var Header = React.createClass( {
	render: function() {
		return (
			<header>
				<h1>PatchChat ({this.props.count})</h1>
				<img className="spinner" src="/wp-admin/images/wpspin_light.gif" />
			</header>
		);
	}
} );



// TODO: Make gravatar img size variable
var PatchChatList = React.createClass( {
	render: function() {
		var chats = this.props.data.chats.reverse().map( function( chat, i ) {
			return (
				<Chat data={chat} idx={i} key={chat.chat_id}  >
					<img src={'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40'} />
					<h3>{chat.name}</h3>
					{chat.title}
				</Chat>
			);
		} );

		return (
			<ul className="patchchatlist" role="tablist">
				{chats}
			</ul>
		);
	}
} );

var Chat = React.createClass( {
	click: function (e) {
		e.preventDefault();
		jQuery( e.nativeEvent.target ).tab('show');
	},
	render: function() {
		var chat_id = 'chat_' + this.props.data.chat_id;
		var classes = 'chat';
		if ( this.props.idx == 0 ) classes += ' active';
		return (
			<li className={classes} role="presentation">
				<a href={'#' + chat_id} aria-controls={chat_id} role="tab" data-toggle="tab" onClick={this.click}>
					{this.props.children}
				</a>
			</li>
		);
	}
} );

var PatchChatBodies = React.createClass( {
	render: function() {

		var comments = this.props.data.chats.map( function( chat, i ) {

			var chat_id = 'chat_' + chat.chat_id;
			var classes = 'tabpanel';
			if ( i == 0 ) classes += ' active';
			return (
				<div className={classes} id={chat_id} role="tabpanel" key={chat_id} >
					<PatchChatBody data={chat} />
				</div>
			);
		}, this );

		return(
			<div className="tab-content">
				{comments}
			</div>
		)
	}
} );