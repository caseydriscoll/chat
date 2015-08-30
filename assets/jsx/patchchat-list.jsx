// TODO: Make gravatar img size variable
var PatchChatList = React.createClass( {

	render: function() {

		var chats = this.props.chats.reverse().map( function( chat, i ) {

			var users = [];

			for ( var user in chat.users ) {
				if ( chat.users[user].role != 'administrator' && chat.users[user].name != 'bot' )
					users.push( chat.users[user].name );
			}

			users = users.join( ', ' );

			return (
				<PatchChatListItem chat={chat} idx={i+1} key={chat.chat_id} changeStatus={this.props.changeStatus} >
					<img src={'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40'} />
					<h3>{users}</h3>
					{chat.title}
				</PatchChatListItem>
			);
		}, this );

		return (
			<ul id="patchchatlist" role="tablist">
				<PatchChatInit />
				{chats}
			</ul>
		);
	}
} );

/**
 * There is one PatchChatInit, coupled to a PatchChatInitBox in the PatchChatBoxes group
 *
 * PatchChatInit is used to initialize a chat from front to back or from back to front.
 *
 * PatchChatInit is not represented in the state.
 *   It only initializes a new chat, which is then represented in the normal state components.
 */
var PatchChatInit = React.createClass( {

	handleClick : function(e) {

		var button = jQuery( e.nativeEvent.target );

		if ( button.hasClass( 'fa-plus-square' ) ) {
			button.removeClass( 'fa-plus-square' ).addClass( 'fa-minus-square' );
		} else {
			button.removeClass( 'fa-minus-square' ).addClass( 'fa-plus-square' );
		}

		jQuery( '#patchchatinitbox' ).toggle();
	},

	startChat : function() {
		if ( patchchat.admin == 'true' ) {
			return <i className={'start-chat fa fa-plus-square'} onClick={this.handleClick}></i>;
		}
	},

	render: function() {
		return(
			<li id="patchchatinit" className="patchchatlistitem">
				{this.startChat()}
			</li>
		);
	}
} );


var PatchChatListItem = React.createClass( {

	changeStatus: function(e) {

		jQuery( e.nativeEvent.target ).removeClass( 'fa-circle new open closed').addClass( 'fa-spinner fa-spin' );

		var item = this.getDOMNode();

		var chat = {
			'chat_id'    : item.getAttribute( 'data-chat_id' ),
			'prevstatus' : item.getAttribute( 'data-status' )
		}

		if ( chat.prevstatus == 'new' )
			chat.status = 'open';
		else if ( chat.prevstatus == 'open' )
			chat.status = 'closed';
		else if ( chat.prevstatus == 'closed' )
			chat.status = 'new';

		this.props.changeStatus( chat );
	},

	click: function(e) {
		e.preventDefault();
		jQuery( e.nativeEvent.target ).tab('show');

		var chatbox = jQuery( e.nativeEvent.target ).attr( 'href' );

		jQuery( chatbox ).find( 'textarea' ).focus();
	},

	render: function() {

		var chat_id = 'chat_' + this.props.chat.chat_id;
		var classes = 'patchchatlistitem';
		if ( this.props.idx == 0 ) classes += ' active';

		var statusClasses = 'status fa fa-circle ' + this.props.chat.status;

		return (
			<li className={classes} role="presentation" data-chat_id={this.props.chat.chat_id} data-status={this.props.chat.status}>
				<i className={statusClasses} onClick={this.changeStatus}></i>
				<a href={'#' + chat_id} aria-controls={chat_id} role="tab" data-toggle="tab" onClick={this.click}>
					{this.props.children}
				</a>
			</li>
		);

	}

} );