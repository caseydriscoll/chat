/** Structure
 *
 * - PatchChatMessenger
 *   - PatchChatList
 *   - PatchChatBoxes
 *     - PatchChatBox
 *       - PatchChatHeader
 *       - PatchChatComments
 *       - PatchChatForm
 *
 */

var PatchChatMessenger = React.createClass( {
	loadCommentsFromServer: function() {

		var ajaxdata = {
			'action'  : 'patchchat_get',
			'method'  : 'get_agent',
			'user_id' : 1
		};

		if ( PWDEBUG ) console.log( 'Pre-' + ajaxdata.method, ajaxdata );

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
			success : function ( response ) {


				this.setState({ data : { chats: response.data } });

				if ( PWDEBUG ) console.log( 'response get_agent: ', response );

				setTimeout( this.loadCommentsFromServer, 3000 );

			}.bind(this),
			error   : function ( response ) {
				if ( PWDEBUG ) console.error( 'error response get_agent: ', response );
			}.bind(this)
		});
	},
	submit: function() {

		patchchat.spinner.show();

		var ajaxdata = {
			'action'    : 'patchchat_post',
			'patchchat' : {
				'text'  : jQuery( 'textarea[name=patchchat-text]' ).val(),
				'name'  : jQuery( 'input[name=patchchat-name]' ).val(),
				'email' : jQuery( 'input[name=patchchat-email]' ).val()
			}
		};

		if ( this.state.data.chat_id === undefined ) {
			ajaxdata.method  = 'create';
		} else {
			ajaxdata.method  = 'update';
			ajaxdata.patchchat.chat_id = this.state.data.chat_id;
			ajaxdata.patchchat.email = patchchat.email;
		}

		jQuery( '.patchchatbody textarea' ).val( '' ).focus();

		if ( PWDEBUG ) console.log( 'Pre-' + ajaxdata.method, ajaxdata );

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
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