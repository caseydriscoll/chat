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
		<PatchChat />,
		document.getElementById( 'wpbody-content' )
	);

} );


var PatchChat = React.createClass( {
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
			<div className="patchchat">
				<Header count={this.state.data.chats.length} />
				<Chats data={this.state.data} />
			</div>
		);
	}
} );


var Header = React.createClass( {
	render: function() {
		return (
			<header>
				<h1>PatchChat ({this.props.count})</h1>
			</header>
		);
	}
} );



// TODO: Make gravatar img size variable
var Chats = React.createClass( {
	render: function() {
		var chats = this.props.data.chats.reverse().map( function( chat ) {
			return (
				<Chat comments={chat.comments} >
					<img src={'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40'} />
					<h3>{chat.name}</h3>
					{chat.title}
				</Chat>
			);
		} );
		return (
			<ul className="chats">
				{chats}
			</ul>
		);
	}
} );

var Chat = React.createClass( {
	render: function() {
		return (
			<li className='chat'>
				{this.props.children}
				<ChatPanel comments={this.props.comments} />
			</li>
		);
	}
} );


var ChatPanel = React.createClass( {
	render: function() {
		var comments = this.props.comments.map( function( comment ) {
			return (
				<li>{comment.text}</li>
			);
		} );
		return (
			<ul className="chatpanel">
				{comments}
			</ul>
		);
	}
} );