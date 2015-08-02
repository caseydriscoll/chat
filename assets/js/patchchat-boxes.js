'use strict';

var PatchChatBoxes = React.createClass({
	displayName: 'PatchChatBoxes',

	render: function render() {

		var comments = this.props.data.chats.map(function (chat, i) {

			var chat_id = 'chat_' + chat.chat_id;
			var classes = 'tabpanel';
			if (i == 0) classes += ' active';
			return React.createElement(
				'div',
				{ className: classes, id: chat_id, role: 'tabpanel', key: chat_id },
				React.createElement(PatchChatBox, { submit: this.props.submit, data: chat })
			);
		}, this);

		return React.createElement(
			'div',
			{ className: 'tab-content' },
			comments
		);
	}
});

var PatchChatBox = React.createClass({
	displayName: 'PatchChatBox',

	render: function render() {
		var patchchat_comments = typeof this.props.data.chat_id === 'undefined' ? null : React.createElement(PatchChatComments, { data: this.props.data });
		return React.createElement(
			'div',
			{ className: 'patchchatbox' },
			patchchat_comments,
			React.createElement(PatchChatForm, { submit: this.props.submit, chatid: this.props.data.chat_id })
		);
	}
});

var PatchChatComments = React.createClass({
	displayName: 'PatchChatComments',

	render: function render() {
		var comments = this.props.data.comments.map(function (comment) {
			var classes = 'comment '; //+ patchchat.users[comment.user].role;
			return React.createElement(
				'li',
				{ className: classes, key: 'comment' + comment.id },
				React.createElement('img', { src: 'https://gravatar.com/avatar/' + comment.img + '.jpg?s=30' }),
				comment.text
			);
		});
		return React.createElement(
			'ul',
			{ className: 'patchchatcomments' },
			comments
		);
	}
});

var PatchChatForm = React.createClass({
	displayName: 'PatchChatForm',

	validate: function validate(e) {

		if (e.which == 13 || e.keyCode == 13) {
			e.preventDefault();

			if (typeof this.props.chatid !== 'undefined') {
				this.props.submit();
				return;
			}

			var name = jQuery('input[name=patchchat-name]').val();
			var email = jQuery('input[name=patchchat-email]').val();
			var text = jQuery('textarea[name=patchchat-text]').val();

			var honey = jQuery('input[name=patchchat-honeypot]').val();

			var re = /\S+@\S+/;
			var valid = false;
			var error = false;

			if (name == '') error = 'Name is blank';else if (email == '') error = 'Email is blank';else if (!re.test(email)) error = 'Not a valid email';else if (text == '') error = 'Text is blank';

			if (honey != '') error = 'Caught the honeypot';

			if (error == false) {
				valid = true;

				patchchat.name = name;
				patchchat.email = email;
				patchchat.text = text;
			}

			if (PWDEBUG) console.log('name: ' + name, 'email: ' + email, 'text: ' + text, 'error: ' + error);

			if (valid) this.props.submit();
		}
	},
	adjust: function adjust(e) {
		jQuery(e.target).height(0);
		jQuery(e.target).height(e.target.scrollHeight);
	},
	render: function render() {
		var fieldset = typeof this.props.chatid === 'undefined' ? React.createElement(PatchChatFieldset, null) : null;
		return React.createElement(
			'form',
			null,
			fieldset,
			React.createElement('textarea', { name: 'patchchat-text', onKeyUp: this.adjust, onKeyDown: this.validate, required: true })
		);
	}
});

var PatchChatFieldset = React.createClass({
	displayName: 'PatchChatFieldset',

	render: function render() {
		return React.createElement(
			'fieldset',
			null,
			React.createElement(
				'label',
				null,
				'Name'
			),
			React.createElement('input', { name: 'patchchat-name', type: 'name', required: true }),
			React.createElement(
				'label',
				null,
				'Email'
			),
			React.createElement('input', { name: 'patchchat-email', type: 'email', required: true }),
			React.createElement('input', { id: 'patchchat-honeypot', name: 'patchchat-honeypot', type: 'text' })
		);
	}

});
