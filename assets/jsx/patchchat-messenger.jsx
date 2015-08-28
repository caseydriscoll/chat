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

var PatchChatMessenger = React.createClass( {

	timeOutID : null,

	playReceiveMessageSound: function( newChats ) {

		// Don't play on the first run (init page loads)
		if ( patchchat.init ) {
			patchchat.init = false;
			return;
		}

		if ( this.state.chats.length < newChats.length ) {
			new Audio( patchchat.receiveMessageSound ).play();
			return;
		}

		if ( this.state.chats.length == newChats.length ) {

			for ( var i = 0; i < this.state.chats.length; i++ ) {

				// TODO: Fix this reverseIndex problem
				// For some reason the newChats array is reversed. I have to look into it.
				// Maybe it is what happens when js does a deep copy when passing into function?
				// So for now, use a 'reverseIndex' to properly compare the two arrays

				var reverseIndex = newChats.length - 1 - i;

				if ( this.state.chats[i].comments.length < newChats[reverseIndex].comments.length ) {
					new Audio( patchchat.receiveMessageSound ).play();
					return;
				}

			}

		}

	},

	loadCommentsFromServer: function() {

		var ajaxdata = {
			'action'  : 'patchchat_get',
			'method'  : 'get_user_state'
		};

		if ( patchchat.debug == 'true' ) console.log( 'before ' + ajaxdata.method, ajaxdata );

		jQuery.ajax({
			method  : 'POST',
			url     : patchchat.ajaxurl,
			data    : ajaxdata,
			success : function ( response ) {

				if ( patchchat.debug == 'true' ) console.log( 'response get_user_chats: ', response );

				if ( response.success ) {

					this.playReceiveMessageSound( response.data );

					this.setState( { chats : response.data } );

					clearTimeout( this.timeOutID );
					this.timeOutID = setTimeout( this.loadCommentsFromServer, this.props.pulse );

				} else {
					if ( patchchat.debug == 'true' ) console.log( 'error response get_user_chats: ', response );
				}

			}.bind(this),
			error   : function ( response ) {
				if ( patchchat.debug == 'true' ) console.error( 'error response get_user_chats: ', response );
			}.bind(this)
		});
	},

	submit: function(chat) {

		patchchat.spinner.show();

		chat.action = 'patchchat_post';

		if ( patchchat.debug == 'true' ) console.log( 'before ' + chat.method, chat );

		jQuery.ajax({
			method  : 'POST',
			url     : patchchat.ajaxurl,
			data    : chat,
			success : function ( response ) {

				if ( patchchat.debug == 'true' ) console.log( 'response create/update: ', response );

				patchchat.spinner.hide();

				clearTimeout( this.timeOutID );
				this.timeOutID = setTimeout( this.loadCommentsFromServer, this.props.pulse );

				if ( response.success ) {

					jQuery( '#patchchatinitbox' ).find( 'input' ).val( '' ).empty();

					this.setState( { chats : response.data } );

					var audio = new Audio( patchchat.sendMessageSound ).play();

				} else {
					jQuery( '.patchchat-message' ).html( response.data );
				}

			}.bind( this ),
			error   : function ( response ) {
				if ( patchchat.debug == 'true' ) console.error( 'error response create/update: ', response );
			}.bind( this )
		});
	},

	changeStatus : function( chat ) {

		var data = {
			'action'      : 'change_chat_status',
			'chat_id'     : chat.chat_id,
			'prev_status' : chat.prevstatus,
			'status'      : chat.status
		};

		if ( patchchat.debug == 'true' ) console.log( 'before change_chat_status: ', data );

		jQuery.ajax({
			method  : 'POST',
			url     : patchchat.ajaxurl,
			data    : data,
			success :function( response ) {

				if ( patchchat.debug == 'true' ) console.log( 'response change_chat_status: ', response );

				clearTimeout( this.timeOutID );
				this.timeOutID = setTimeout( this.loadCommentsFromServer, this.props.pulse );

				if ( response.success ) {
					var indicator = jQuery( '.patchchatlistitem[data-chat_id="' + response.chat_id + '"]' ).find( 'fa' );

					indicator.removeClass( 'fa-spinner fa-spin' ).addClass( 'fa-circle' );
				}

			}.bind( this ),
			error   : function ( response ) {
				if ( patchchat.debug == 'true' ) console.error( 'error response changeStatus: ', response );
			}.bind( this )
		});
	},

	getInitialState: function() {
		return { chats: new Array(0) }
	},

	componentDidMount: function() {
		patchchat.init = true;

		// Need to use inline-block, so overwritten
		patchchat.spinner = {
			show : function() { 
				jQuery( '#patchchatmessenger .patchchat-spinner' ).css( 'display', 'inline-block' ); 
			},

			hide : function() {
				jQuery( '#patchchatmessenger .patchchat-spinner' ).css( 'display', 'none' ); 
			} 
		}

		this.loadCommentsFromServer();
	},

	render: function() {
		return (
			<div id="patchchatmessenger">
				<PatchChatList  chats={this.state.chats} changeStatus={this.changeStatus} />
				<PatchChatBoxes chats={this.state.chats} submit={this.submit} />
			</div>
		);
	}
} );