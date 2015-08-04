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

	loadCommentsFromServer: function() {

		var ajaxdata = {
			'action'  : 'patchchat_get',
			'method'  : 'get_user_chats'
		};

		if ( PWDEBUG ) console.log( 'before ' + ajaxdata.method, ajaxdata );

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
			success : function ( response ) {

				if ( PWDEBUG ) console.log( 'response get_user_chats: ', response );

				if ( response.success ) {
					this.setState( { data : { chats : response.data } } );

					clearTimeout( this.timeOutID );
					this.timeOutID = setTimeout( this.loadCommentsFromServer, 3000 );
				} else {
					if ( PWDEBUG ) console.log( 'error response get_user_chats: ', response );
				}

			}.bind(this),
			error   : function ( response ) {
				if ( PWDEBUG ) console.error( 'error response get_user_chats: ', response );
			}.bind(this)
		});
	},

	submit: function(chat) {

		patchchat.spinner.show();

		chat.action = 'patchchat_post';

		if ( PWDEBUG ) console.log( 'before ' + chat.method, chat );

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : chat,
			success : function ( response ) {

				if ( PWDEBUG ) console.log( 'response create/update: ', response );

				patchchat.spinner.hide();

				patchchat.users = response.data.users;
				this.setState({ data : response.data });

				clearTimeout( this.timeOutID );
				this.timeOutID = setTimeout( this.loadCommentsFromServer, 3000 );

			}.bind( this ),
			error   : function ( response ) {
				if ( PWDEBUG ) console.error( 'error response create/update: ', response );
			}.bind( this )
		});
	},
	getInitialState: function() {
		return { data: { chats: [] }  }
	},
	componentDidMount: function() {
		patchchat.spinner = jQuery( '.spinner' );
		this.loadCommentsFromServer();
	},
	render: function() {
		return (
			<div id="patchchatmessenger">
				<PatchChatList  data={this.state.data} />
				<PatchChatBoxes data={this.state.data} submit={this.submit} />
			</div>
		);
	}
} );