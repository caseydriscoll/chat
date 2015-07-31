PWDEBUG = 1;

// TODO: Explain/document these variables
// TODO: Document all the things
// TODO: Localize script
// TODO: Move validation to React
// TODO: Drop jquery, completely if possible (except ajax)
// TODO: Generally clean up
var patchchat = {};
var ajaxURL = '/wp-admin/admin-ajax.php';



jQuery( document ).ready( function() {

	renderPatchChat();

	patchchat.spinner = jQuery( '.patchchat .spinner' );

} );

/*
 * - PatchChatBox
 *   - header
 *   - PatchChatBody
 *     - PatchComments
 *       - li.comment
 *     - PatchForm
 */

function renderPatchChat() {

	jQuery( 'body' ).append( '<div id="patchchatbox"></div>' );

	React.render(
		<PatchChatBox />,
		document.getElementById( 'patchchatbox' )
	);
}


var PatchChatBox = React.createClass( {
	loadCommentsFromServer: function() {

		if ( this.state.data.id === undefined ) return;

		ajaxdata = {
			'action'  : 'patchchat_get',
			'method'  : 'get_single',
			'chat_id' : this.state.data.id
		};

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
			success : function ( response ) {
				this.setState({ data : response.data });

				patchchat.users = response.data.users;

				patchchat.spinner.hide();
				jQuery( '.patchchat textarea' ).focus();

				setTimeout( this.loadCommentsFromServer, 3000 );

				if ( PWDEBUG ) console.log( 'response 2: ', response );
			}.bind(this),
			error   : function ( response ) {
				if ( PWDEBUG ) console.log( 'error response: ', response );
			}.bind(this)
		});
	},
	submit: function() {

		patchchat.spinner.show();

		ajaxdata = {
			'action'    : 'patchchat_post',
			'patchchat' : {
				'text'  : jQuery( 'textarea[name=patchchat-text]' ).val(),
				'name'  : jQuery( 'input[name=patchchat-name]' ).val(),
				'email' : jQuery( 'input[name=patchchat-email]' ).val()
			}
		};

		if ( this.state.data.id === undefined ) {
			ajaxdata.method       = 'create';
		} else {
			ajaxdata.method       = 'update';
			ajaxdata.patchchat.id = this.state.data.id;
		}

		jQuery( '.patchchat textarea' ).val( '' ).focus();

		console.log( 'Pre-' + ajaxdata.method, ajaxdata );

		jQuery.ajax({
			method  : 'POST',
			url     : ajaxURL,
			data    : ajaxdata,
			success : function ( response ) {

				jQuery( '.patchchat' ).addClass( 'active' );

				if ( PWDEBUG ) console.log( 'response 1: ', response );

				patchchat.spinner.hide();

				patchchat.users = response.data.users;
				this.setState({ data : response.data });

				setTimeout( this.loadCommentsFromServer, 3000 );

			}.bind( this ),
			error   : function ( response ) {
				if ( PWDEBUG ) console.log( 'error response: ', response );
			}.bind( this )
		});
	},
	toggle: function() {
		jQuery( '.patchchatbody' ).toggle();
		jQuery( '.patchchatbody input' )[0].focus();
	},
	getInitialState: function() {
		return { data: { comments: [] }  }
	},
	componentDidMount: function() {
		this.loadCommentsFromServer();
	},
	render: function() {
		return (
			<div>
				<header onClick={this.toggle}>
					PatchChat
					<img className="spinner" src="/wp-admin/images/wpspin_light.gif" />
				</header>
				<PatchChatBody data={this.state.data} />
			</div>
		);
	}
} );