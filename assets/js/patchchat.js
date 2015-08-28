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

	timeOutID: null,

	playReceiveMessageSound: function playReceiveMessageSound(newChats) {

		// Don't play on the first run (init page loads)
		if (patchchat.init) {
			patchchat.init = false;
			return;
		}

		if (this.state.chats.length < newChats.length) {
			new Audio(patchchat.receiveMessageSound).play();
			return;
		}

		if (this.state.chats.length == newChats.length) {

			for (var i = 0; i < this.state.chats.length; i++) {

				// TODO: Fix this reverseIndex problem
				// For some reason the newChats array is reversed. I have to look into it.
				// Maybe it is what happens when js does a deep copy when passing into function?
				// So for now, use a 'reverseIndex' to properly compare the two arrays

				var reverseIndex = newChats.length - 1 - i;

				if (this.state.chats[i].comments.length < newChats[reverseIndex].comments.length) {
					new Audio(patchchat.receiveMessageSound).play();
					return;
				}
			}
		}
	},

	loadCommentsFromServer: function loadCommentsFromServer() {

		var ajaxdata = {
			'action': 'patchchat_get',
			'method': 'get_user_state'
		};

		if (patchchat.debug == 'true') console.log('before ' + ajaxdata.method, ajaxdata);

		jQuery.ajax({
			method: 'POST',
			url: patchchat.ajaxurl,
			data: ajaxdata,
			success: (function (response) {

				if (patchchat.debug == 'true') console.log('response get_user_chats: ', response);

				if (response.success) {

					this.playReceiveMessageSound(response.data);

					this.setState({ chats: response.data });

					clearTimeout(this.timeOutID);
					this.timeOutID = setTimeout(this.loadCommentsFromServer, this.props.pulse);
				} else {
					if (patchchat.debug == 'true') console.log('error response get_user_chats: ', response);
				}
			}).bind(this),
			error: (function (response) {
				if (patchchat.debug == 'true') console.error('error response get_user_chats: ', response);
			}).bind(this)
		});
	},

	submit: function submit(chat) {

		patchchat.spinner.show();

		chat.action = 'patchchat_post';

		if (patchchat.debug == 'true') console.log('before ' + chat.method, chat);

		jQuery.ajax({
			method: 'POST',
			url: patchchat.ajaxurl,
			data: chat,
			success: (function (response) {

				if (patchchat.debug == 'true') console.log('response create/update: ', response);

				patchchat.spinner.hide();

				clearTimeout(this.timeOutID);
				this.timeOutID = setTimeout(this.loadCommentsFromServer, this.props.pulse);

				if (response.success) {

					jQuery('#patchchatinitbox').find('input').val('').empty();

					this.setState({ chats: response.data });

					var audio = new Audio(patchchat.sendMessageSound).play();
				} else {
					jQuery('.patchchat-message').html(response.data);
				}
			}).bind(this),
			error: (function (response) {
				if (patchchat.debug == 'true') console.error('error response create/update: ', response);
			}).bind(this)
		});
	},

	changeStatus: function changeStatus(chat) {

		var data = {
			'action': 'change_chat_status',
			'chat_id': chat.chat_id,
			'prev_status': chat.prevstatus,
			'status': chat.status
		};

		if (patchchat.debug == 'true') console.log('before change_chat_status: ', data);

		jQuery.ajax({
			method: 'POST',
			url: patchchat.ajaxurl,
			data: data,
			success: (function (response) {

				if (patchchat.debug == 'true') console.log('response change_chat_status: ', response);

				clearTimeout(this.timeOutID);
				this.timeOutID = setTimeout(this.loadCommentsFromServer, this.props.pulse);

				if (response.success) {

					this.setState({ chats: response.data });
				}
			}).bind(this),
			error: (function (response) {
				if (patchchat.debug == 'true') console.error('error response changeStatus: ', response);
			}).bind(this)
		});
	},

	getInitialState: function getInitialState() {
		return { chats: new Array(0) };
	},

	componentDidMount: function componentDidMount() {
		patchchat.init = true;

		// Need to use inline-block, so overwritten
		patchchat.spinner = {
			show: function show() {
				jQuery('#patchchatmessenger .patchchat-spinner').css('display', 'inline-block');
			},

			hide: function hide() {
				jQuery('#patchchatmessenger .patchchat-spinner').css('display', 'none');
			}
		};

		this.loadCommentsFromServer();
	},

	render: function render() {
		return React.createElement(
			'div',
			{ id: 'patchchatmessenger' },
			React.createElement(PatchChatList, { chats: this.state.chats, changeStatus: this.changeStatus }),
			React.createElement(PatchChatBoxes, { chats: this.state.chats, submit: this.submit })
		);
	}
});

'use strict';

var PatchChatBoxes = React.createClass({
	displayName: 'PatchChatBoxes',

	render: function render() {

		var patchchat_boxes = this.props.chats.map(function (chat, i) {

			var chat_id = 'chat_' + chat.chat_id;
			var classes = 'patchchatbox ' + chat.status;
			if (i == 0) classes += ' active';

			return React.createElement(PatchChatBox, {
				id: chat_id,
				key: chat_id,
				chat: chat,
				role: 'tabpanel',
				submit: this.props.submit,
				classes: classes
			});
		}, this);

		var initNeeded = this.props.chats.length == 0 ? true : false;

		return React.createElement(
			'ul',
			{ id: 'patchchatboxes' },
			React.createElement(PatchChatInitBox, { submit: this.props.submit, needed: initNeeded }),
			patchchat_boxes
		);
	}
});

var PatchChatBox = React.createClass({
	displayName: 'PatchChatBox',

	render: function render() {

		var patchchat_comments = typeof this.props.chat.chat_id === 'undefined' ? null : React.createElement(PatchChatComments, { chat: this.props.chat });

		return React.createElement(
			'li',
			{ className: this.props.classes, id: this.props.id },
			React.createElement(PatchChatBoxHeader, null),
			patchchat_comments,
			React.createElement(PatchChatForm, { submit: this.props.submit, chat_id: this.props.chat.chat_id })
		);
	}
});

var PatchChatBoxHeader = React.createClass({
	displayName: 'PatchChatBoxHeader',

	handleClick: function handleClick(e) {
		if (patchchat.admin == 'true') return;
		jQuery(e.nativeEvent.target).closest('.patchchatbox').toggleClass('active');
	},

	minimizeIcon: function minimizeIcon() {
		if ('minimizeIcon' in patchchat) {
			return React.createElement('i', { className: 'minimize fa ' + patchchat.minimizeIcon });
		}
	},

	spinnerIcon: function spinnerIcon() {
		if ('spinnerIcon' in patchchat) {
			return React.createElement('i', { className: 'patchchat-spinner fa ' + patchchat.spinnerIcon + ' fa-spin' });
		}
	},

	render: function render() {
		return React.createElement(
			'header',
			{ onClick: this.handleClick },
			patchchat.headerText,
			this.minimizeIcon(),
			this.spinnerIcon()
		);
	}
});

var PatchChatComments = React.createClass({
	displayName: 'PatchChatComments',

	shouldScrollBottom: true,

	componentWillUpdate: function componentWillUpdate() {
		var node = this.getDOMNode();
		this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
	},

	componentDidUpdate: function componentDidUpdate() {
		if (this.shouldScrollBottom) {
			var node = this.getDOMNode();
			node.scrollTop = node.scrollHeight;
		}
	},

	componentDidMount: function componentDidMount() {
		this.componentDidUpdate();
	},

	render: function render() {
		var comments = this.props.chat.comments.map(function (comment) {
			var classes = 'patchchatcomment ' + this.props.chat.users[comment.user].role;
			var user = this.props.chat.users[comment.user].name;
			return React.createElement(
				'li',
				{ className: classes, key: 'comment' + comment.id, title: user },
				React.createElement('img', { src: 'https://gravatar.com/avatar/' + comment.img + '.jpg?s=30' }),
				comment.text
			);
		}, this);
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

			// Initialize the method to update.
			// If the initBox is tripped, this will be changed to 'create'
			chat.method = 'update';

			chat.chat_id = this.props.chat_id;
			chat.text = e.target.value;

			var valid = false;
			var error = false;

			if (chat.text == '') error = 'Text is blank';

			if (error == false) {
				valid = true;
			}

			if (patchchat.debug == 'true') console.log('PatchChatForm', 'text: ' + chat.text, 'error: ' + error);

			if (valid) {
				e.target.value = '';
				this.props.submit(chat);
			}
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

'use strict';

var PatchChatInitBox = React.createClass({
	displayName: 'PatchChatInitBox',

	validate: function validate(e) {

		e.preventDefault();

		var chat = {};

		chat.method = 'create';

		chat.name = jQuery(e.target).find('input[name=patchchat-name]').val();
		chat.email = jQuery(e.target).find('input[name=patchchat-email]').val();
		chat.text = jQuery(e.target).find('input[name=patchchat-text]').val();

		chat.honey = jQuery(e.target).find('input[name=patchchat-honeypot]').val();

		var re = /\S+@\S+/;
		var valid = false;
		var error = false;

		if (chat.name == '') error = 'Name is blank';else if (chat.email == '') error = 'Email is blank';else if (!re.test(chat.email)) error = 'Not a valid email';else if (chat.text == '') error = patchchat.labels.comment + ' is blank';

		if (chat.honey != '') error = 'Caught the honeypot';

		if (error == false) {
			valid = true;
		}

		if (patchchat.debug == 'true') console.log('PatchChatInitBox', 'name: ' + chat.name, 'email: ' + chat.email, 'text: ' + chat.text, 'error: ' + error);

		if (valid) {
			this.props.submit(chat);
		} else {
			jQuery('.patchchat-message').html(error);
		}
	},

	render: function render() {

		var classes = 'patchchatbox open';
		classes += this.props.needed ? ' needed' : '';

		// TODO: Make 'Comment' field label adjustable (Question, Comment, etc)
		// TODO: Make 'required' adjustable
		// TODO: Make 'login' link optional
		return React.createElement(
			'li',
			{ id: 'patchchatinitbox', className: classes },
			React.createElement(PatchChatBoxHeader, null),
			React.createElement(
				'form',
				{ onSubmit: this.validate },
				React.createElement(
					'p',
					{ className: 'patchchat-instructions' },
					patchchat.instructions
				),
				React.createElement(
					'p',
					{ className: 'patchchat-loginlink' },
					'Already have an account? ',
					React.createElement(
						'a',
						{ href: '/wp-login.php' },
						'Login'
					)
				),
				React.createElement('p', { className: 'patchchat-message' }),
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
				React.createElement(
					'label',
					null,
					patchchat.labels.comment
				),
				React.createElement('input', { name: 'patchchat-text', type: 'text', required: true }),
				React.createElement('input', { id: 'patchchat-honeypot', name: 'patchchat-honeypot', type: 'text' }),
				React.createElement('input', { type: 'submit' })
			)
		);
	}

});

// TODO: Make gravatar img size variable
'use strict';

var PatchChatList = React.createClass({
	displayName: 'PatchChatList',

	render: function render() {

		var chats = this.props.chats.reverse().map(function (chat, i) {

			var users = [];

			for (var user in chat.users) {
				if (chat.users[user].role != 'administrator') users.push(chat.users[user].name);
			}

			users = users.join(', ');

			return React.createElement(
				PatchChatListItem,
				{ chat: chat, idx: i + 1, key: chat.chat_id, changeStatus: this.props.changeStatus },
				React.createElement('img', { src: 'https://gravatar.com/avatar/' + chat.img + '.jpg?s=40' }),
				React.createElement(
					'h3',
					null,
					users
				),
				chat.title
			);
		}, this);

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

	handleClick: function handleClick(e) {

		var button = jQuery(e.nativeEvent.target);

		if (button.hasClass('fa-plus-square')) {
			button.removeClass('fa-plus-square').addClass('fa-minus-square');
		} else {
			button.removeClass('fa-minus-square').addClass('fa-plus-square');
		}

		jQuery('#patchchatinitbox').toggle();
	},

	startChat: function startChat() {
		if (patchchat.admin == 'true') {
			return React.createElement('i', { className: 'start-chat fa fa-plus-square', onClick: this.handleClick });
		}
	},

	render: function render() {
		return React.createElement(
			'li',
			{ id: 'patchchatinit', className: 'patchchatlistitem' },
			this.startChat()
		);
	}
});

var PatchChatListItem = React.createClass({
	displayName: 'PatchChatListItem',

	changeStatus: function changeStatus(e) {

		jQuery(e.nativeEvent.target).removeClass('fa-circle new open closed').addClass('fa-spinner fa-spin');

		var item = this.getDOMNode();

		var chat = {
			'chat_id': item.getAttribute('data-chat_id'),
			'prevstatus': item.getAttribute('data-status')
		};

		if (chat.prevstatus == 'new') chat.status = 'open';else if (chat.prevstatus == 'open') chat.status = 'closed';else if (chat.prevstatus == 'closed') chat.status = 'new';

		this.props.changeStatus(chat);
	},

	click: function click(e) {
		e.preventDefault();
		jQuery(e.nativeEvent.target).tab('show');

		var chatbox = jQuery(e.nativeEvent.target).attr('href');

		jQuery(chatbox).find('textarea').focus();
	},

	render: function render() {

		var chat_id = 'chat_' + this.props.chat.chat_id;
		var classes = 'patchchatlistitem';
		if (this.props.idx == 0) classes += ' active';

		var statusClasses = 'status fa fa-circle ' + this.props.chat.status;

		return React.createElement(
			'li',
			{ className: classes, role: 'presentation', 'data-chat_id': this.props.chat.chat_id, 'data-status': this.props.chat.status },
			React.createElement('i', { className: statusClasses, onClick: this.changeStatus }),
			React.createElement(
				'a',
				{ href: '#' + chat_id, 'aria-controls': chat_id, role: 'tab', 'data-toggle': 'tab', onClick: this.click },
				this.props.children
			)
		);
	}

});
