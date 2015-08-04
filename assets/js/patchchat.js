/** Structure
 *
 * - #PatchChatMessenger
 *   - #PatchChatList
 *     - #PatchChatInit
 *     - .PatchChatListItem
 *   - #PatchChatBoxes
 *     - #PatchChatInitBox
 *     - .PatchChatBox
 *       - .PatchChatHeader
 *       - .PatchChatComments
 *       - .PatchChatForm
 *
 */

'use strict';

var PatchChatMessenger = React.createClass({
	displayName: 'PatchChatMessenger',

	loadCommentsFromServer: function loadCommentsFromServer() {

		var ajaxdata = {
			'action': 'patchchat_get',
			'method': 'get_user_chats'
		};

		if (PWDEBUG) console.log('before ' + ajaxdata.method, ajaxdata);

		jQuery.ajax({
			method: 'POST',
			url: ajaxURL,
			data: ajaxdata,
			success: (function (response) {

				if (PWDEBUG) console.log('response get_user_chats: ', response);

				if (response.success) {
					this.setState({ data: { chats: response.data } });

					setTimeout(this.loadCommentsFromServer, 3000);
				} else {
					if (PWDEBUG) console.log('error response get_user_chats: ', response);
				}
			}).bind(this),
			error: (function (response) {
				if (PWDEBUG) console.error('error response get_user_chats: ', response);
			}).bind(this)
		});
	},
	submit: function submit(chat) {

		patchchat.spinner.show();

		chat.action = 'patchchat_post';

		if (PWDEBUG) console.log('Pre-' + chat.method, chat);

		jQuery.ajax({
			method: 'POST',
			url: ajaxURL,
			data: chat,
			success: (function (response) {

				if (PWDEBUG) console.log('response create/update: ', response);

				patchchat.spinner.hide();

				patchchat.users = response.data.users;
				this.setState({ data: response.data });

				setTimeout(this.loadCommentsFromServer, 3000);
			}).bind(this),
			error: (function (response) {
				if (PWDEBUG) console.error('error response create/update: ', response);
			}).bind(this)
		});
	},
	getInitialState: function getInitialState() {
		return { data: { chats: [] } };
	},
	componentDidMount: function componentDidMount() {
		patchchat.spinner = jQuery('.spinner');
		this.loadCommentsFromServer();
	},
	render: function render() {
		return React.createElement(
			'div',
			{ id: 'patchchatmessenger' },
			React.createElement(PatchChatList, { data: this.state.data }),
			React.createElement(PatchChatBoxes, { data: this.state.data, submit: this.submit })
		);
	}
});

'use strict';

var PatchChatBoxes = React.createClass({
	displayName: 'PatchChatBoxes',

	render: function render() {

		var patchchat_boxes = this.props.data.chats.map(function (chat, i) {

			var chat_id = 'chat_' + chat.chat_id;
			var classes = 'patchchatbox';
			if (i == 0) classes += ' active';

			return React.createElement(PatchChatBox, {
				id: chat_id,
				key: chat_id,
				data: chat,
				role: 'tabpanel',
				submit: this.props.submit,
				classes: classes
			});
		}, this);

		return React.createElement(
			'ul',
			{ id: 'patchchatboxes' },
			React.createElement(PatchChatInitBox, { submit: this.props.submit }),
			patchchat_boxes
		);
	}
});

var PatchChatInitBox = React.createClass({
	displayName: 'PatchChatInitBox',

	validate: function validate(chat) {

		chat.method = 'create';

		chat.name = jQuery('input[name=patchchat-name]').val();
		chat.email = jQuery('input[name=patchchat-email]').val();

		chat.honey = jQuery('input[name=patchchat-honeypot]').val();

		var re = /\S+@\S+/;
		var valid = false;
		var error = false;

		if (chat.name == '') error = 'Name is blank';else if (chat.email == '') error = 'Email is blank';else if (!re.test(chat.email)) error = 'Not a valid email';

		if (chat.honey != '') error = 'Caught the honeypot';

		if (error == false) {
			valid = true;
		}

		if (PWDEBUG) console.log('PatchChatInitBox', 'name: ' + chat.name, 'email: ' + chat.email, 'text: ' + chat.text, 'error: ' + error);

		if (valid) {
			jQuery('#patchchatinitbox').find('input, textarea').val('').empty();

			this.props.submit(chat);
		}
	},
	render: function render() {
		return React.createElement(
			'li',
			{ id: 'patchchatinitbox', className: 'patchchatbox open' },
			React.createElement(PatchChatBoxHeader, null),
			React.createElement(
				PatchChatForm,
				{ submit: this.validate },
				React.createElement(
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
				)
			)
		);
	}
});

var PatchChatBox = React.createClass({
	displayName: 'PatchChatBox',

	render: function render() {
		var patchchat_comments = typeof this.props.data.chat_id === 'undefined' ? null : React.createElement(PatchChatComments, { data: this.props.data });
		return React.createElement(
			'li',
			{ className: this.props.classes, id: this.props.id },
			React.createElement(PatchChatBoxHeader, null),
			patchchat_comments,
			React.createElement(PatchChatForm, { submit: this.props.submit, chatid: this.props.data.chat_id })
		);
	}
});

var PatchChatBoxHeader = React.createClass({
	displayName: 'PatchChatBoxHeader',

	handleClick: function handleClick(e) {
		jQuery(e.nativeEvent.target).closest('.patchchatbox').toggleClass('open');
	},
	render: function render() {
		return React.createElement(
			'header',
			{ onClick: this.handleClick },
			'PatchChat',
			React.createElement('img', { className: 'spinner', src: '/wp-admin/images/wpspin_light.gif' })
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

/**
 * This is a normal form, with just the text box for creating commments.
 *
 * Previously, it also had the name and email fields.
 *
 * Name and email are moved to PatchChatInitBox - caseypatrickdriscoll 2015-08-02 18:53:59
 */
var PatchChatForm = React.createClass({
	displayName: 'PatchChatForm',

	validate: function validate(e) {

		if (e.which == 13 || e.keyCode == 13) {
			e.preventDefault();

			var chat = {};

			chat.text = e.target.value;

			var valid = false;
			var error = false;

			if (chat.text == '') error = 'Text is blank';

			if (error == false) {
				valid = true;
			}

			if (PWDEBUG) console.log('PatchChatForm', 'text: ' + chat.text, 'error: ' + error);

			if (valid) this.props.submit(chat);
		}
	},
	adjust: function adjust(e) {
		jQuery(e.target).height(0);
		jQuery(e.target).height(e.target.scrollHeight);
	},
	render: function render() {
		return React.createElement(
			'form',
			null,
			this.props.children,
			React.createElement('textarea', { name: 'patchchat-text', onKeyUp: this.adjust, onKeyDown: this.validate, required: true })
		);
	}
});

// TODO: Make gravatar img size variable
'use strict';

var PatchChatList = React.createClass({
	displayName: 'PatchChatList',

	render: function render() {
		var chats = this.props.data.chats.reverse().map(function (chat, i) {
			return React.createElement(
				PatchChatListItem,
				{ data: chat, idx: i + 1, key: chat.chat_id },
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
			{ id: 'patchchatlist', role: 'tablist' },
			React.createElement(PatchChatInit, null),
			chats
		);
	}
});

/**
 * There is one PatchChatInit, coupled to a PatchChatInitBox in the PatchChatBoxes group
 *
 * PatchChatInit is used to initialize a chat from front to back or from back to front.
 *
 * PatchChatInit is not represented in the state.
 *   It only initializes a new chat, which is then represented in the normal state components.
 */
var PatchChatInit = React.createClass({
	displayName: 'PatchChatInit',

	render: function render() {
		return React.createElement('li', { id: 'patchchatinit' });
	}
});

var PatchChatListItem = React.createClass({
	displayName: 'PatchChatListItem',

	click: function click(e) {
		e.preventDefault();
		jQuery(e.nativeEvent.target).tab('show');
	},
	render: function render() {
		var chat_id = 'chat_' + this.props.data.chat_id;
		var classes = 'patchchatlistitem';
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
