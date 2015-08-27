var prevstatus = '';

function add_status_menu( status ) {
	var statusProper = status.charAt(0).toUpperCase() + status.slice(1);
	var menuItem = '<li class="' + status + '"><a href="edit.php?post_status=' + status + '&amp;post_type=patchchat">' + statusProper + ' <span class="count">(1)</span></a></li>'
	
	jQuery( '.subsubsub li' ).last().append( '| ' );
	jQuery( '.subsubsub' ).append( menuItem );
}

jQuery( document ).ready( function() {

	jQuery( 'select' )
		.on( 'focus', function(e) { prevstatus = this.value; } )
		.on( 'change', function(e) {

			jQuery( this ).next().show();

			var chat_id = jQuery( this ).parent().parent().attr( 'id' ).split( '-' )[1];

			data = {
				'action'      : 'change_chat_status',
				'chat_id'     : chat_id,
				'prev_status' : prevstatus,
				'status'      : this.value
			};

			console.log( data );

			jQuery.post(
				'/wp-admin/admin-ajax.php',
				data,
				function( response ) {

					console.log( response );

					var chat_id     = response.data.ID;
					var post_status = response.data.post_status;
					var prev_status = response.data.prev_status;

					jQuery( '#post-' + chat_id ).find( 'img' ).hide();

					// Increment the new post_status
					var menu = jQuery( '.subsubsub .' + post_status );

					if ( menu.length == 0 ) {
						add_status_menu( post_status );
					} else {
						count = jQuery( '.subsubsub .' + post_status ).find( '.count' ).html().replace( /[()]/g, '' );
						jQuery( '.' + post_status ).find( '.count' ).html( '(' + ++count + ')' );
					}

					// Decrement the old prev_status
					count = jQuery( '.' + prev_status ).find( '.count' ).html().replace( /[()]/g, '' );
					jQuery( '.' + prev_status ).find( '.count' ).html( '(' + --count + ')' );

					if ( count == 0 ) {
						jQuery( '.subsubsub .' + prev_status ).remove();
					}

					jQuery( '#post-' + chat_id )
						.removeClass( 'status-' + prev_status )
						.addClass( 'status-' + post_status );

					if ( jQuery( '.post_status_page' ).val() != 'all' ) {
						jQuery( '#post-' + chat_id ).fadeOut( 'normal', function () {
							jQuery( this ).remove();
						} );

						if ( count == 0 ) {
							jQuery( '#the-list' ).append( '<tr class="no-items"><td class="colspanchange" colspan="6">No Chats found</td></tr>' );
						}
					}

				}
			);

		} );
} );