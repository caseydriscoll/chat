// TODO: Make gravatar img size variable
'use strict';

var PatchChatList = React.createClass({
	displayName: 'PatchChatList',

	render: function render() {
		var chats = this.props.data.chats.reverse().map(function (chat, i) {
			return React.createElement(
				Chat,
				{ data: chat, idx: i, key: chat.chat_id },
				React.createElement('img', { src: 'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40' }),
				React.createElement(
					'h3',
					null,
					chat.name
				),
				chat.title
			);
		});

		return React.createElement(
			'ul',
			{ className: 'patchchatlist', role: 'tablist' },
			chats
		);
	}
});

var Chat = React.createClass({
	displayName: 'Chat',

	click: function click(e) {
		e.preventDefault();
		jQuery(e.nativeEvent.target).tab('show');
	},
	render: function render() {
		var chat_id = 'chat_' + this.props.data.chat_id;
		var classes = 'chat';
		if (this.props.idx == 0) classes += ' active';
		return React.createElement(
			'li',
			{ className: classes, role: 'presentation' },
			React.createElement(
				'a',
				{ href: '#' + chat_id, 'aria-controls': chat_id, role: 'tab', 'data-toggle': 'tab', onClick: this.click },
				this.props.children
			)
		);
	}
});
