// TODO: Make gravatar img size variable
var PatchChatList = React.createClass( {
	render: function() {
		var chats = this.props.data.chats.reverse().map( function( chat, i ) {
			return (
				<PatchChatListItem data={chat} idx={i} key={chat.chat_id}  >
					<img src={'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40'} />
					<h3>{chat.name}</h3>
					{chat.title}
				</PatchChatListItem>
			);
		} );

		return (
			<ul id="patchchatlist" role="tablist">
				{chats}
			</ul>
		);
	}
} );

var PatchChatListItem = React.createClass( {
	click: function (e) {
		e.preventDefault();
		jQuery( e.nativeEvent.target ).tab('show');
	},
	render: function() {
		var chat_id = 'chat_' + this.props.data.chat_id;
		var classes = 'patchchatlistitem';
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