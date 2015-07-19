PWDEBUG = 1;

var ajaxURL = '/wp-admin/admin-ajax.php';

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
		<PatchChat data={chats} />,
		document.getElementById( 'wpbody-content' )
	);

}


var PatchChat = React.createClass( {
	render: function() {
		return (
			<div className="patchchat">
				<Header />
				<Chats data={this.props.data} />
			</div>
		);
	}
} );


var Header = React.createClass( {
	render: function() {
		return (
			<header>
				<h1>PatchChat Messenger</h1>
			</header>
		);
	}
} );



// TODO: Make gravatar img size variable
var Chats = React.createClass( {
	render: function() {
		var chats = this.props.data.map( function( chat ) {
			return (
				<Chat>
					<img src={'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40'} />
					<h3>{chat.name}</h3>
					{chat.text}
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
			</li>
		);
	}
} );