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
	loadCommentsFromServer: function() {

		var ajaxdata = {
			'action'  : 'patchchat_get',
			'method'  : 'get_agent'
		};

		if ( PWDEBUG ) console.log( 'Pre-' + ajaxdata.method, ajaxdata );

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
			success : function ( response ) {

				if ( PWDEBUG ) console.log( 'response get_agent: ', response );

				if ( response.success ) {
					this.setState( { data : { chats : response.data } } );

					setTimeout( this.loadCommentsFromServer, 3000 );
				} else {
					if ( PWDEBUG ) console.log( 'error response get_agent: ', response );
				}

			}.bind(this),
			error   : function ( response ) {
				if ( PWDEBUG ) console.error( 'error response get_agent: ', response );
			}.bind(this)
		});
	},
	submit: function(chat) {

		patchchat.spinner.show();

		chat.action = 'patchchat_post';

		if ( PWDEBUG ) console.log( 'Pre-' + chat.method, chat );

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : chat,
			success : function ( response ) {

				if ( PWDEBUG ) console.log( 'response create/update: ', response );

				patchchat.spinner.hide();

				patchchat.users = response.data.users;
				this.setState({ data : response.data });

				setTimeout( this.loadCommentsFromServer, 3000 );

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