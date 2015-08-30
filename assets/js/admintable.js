var prevStatus = '';

function add_status_menu( status ) {
	var statusProper = status.charAt(0).toUpperCase() + status.slice(1);
	var menuItem = '<li class="' + status + '"><a href="edit.php?post_status=' + status + '&amp;post_type=patchchat">' + statusProper + ' <span class="count">(1)</span></a></li>'
	
	jQuery( '.subsubsub li' ).last().append( '| ' );
	jQuery( '.subsubsub' ).append( menuItem );
}

jQuery( document ).ready( function() {

	jQuery( 'select' )
		.on( 'focus', function(e) { prevStatus = this.value; } )
		.on( 'change', function(e) {

			jQuery( this ).next().show();

			var chatID = jQuery( this ).parent().parent().attr( 'id' ).split( '-' )[1];

			data = {
				'action'      : 'change_chat_status',
				'chat_id'     : chatID,
				'prev_status' : prevStatus,
				'status'      : this.value
			};

			console.log( data );

			jQuery.post(
				'/wp-admin/admin-ajax.php',
				data,
				function( response ) {

					console.log( response );

					for ( var i = 0; i < response.data.length; i++ ) {

						var chatID     = response.data[i].chat_id;
						var postStatus = response.data[i].status;

						if ( prevStatus == postStatus ) return;

						// Hide the spinner
						jQuery( '#post-' + chatID ).find( 'img' ).hide();

						// Increment the new post_status
						var menu = jQuery( '.subsubsub .' + postStatus );

						if ( menu.length == 0 ) {
							add_status_menu( postStatus );
						} else {
							postCount = jQuery( '.subsubsub .' + postStatus ).find( '.count' ).html().replace( /[()]/g, '' );
							jQuery( '.' + postStatus ).find( '.count' ).html( '(' + ++postCount + ')' );
						}

						// Decrement the old prevStatus or remove it
						count = jQuery( '.' + prevStatus ).find( '.count' ).html().replace( /[()]/g, '' );

						if ( count == 1 ) {
							jQuery( '.subsubsub .' + prevStatus ).remove();
						} else {
							jQuery( '.' + prevStatus ).find( '.count' ).html( '(' + --count + ')' );
						}

						jQuery( '#post-' + chatID )
							.removeClass( 'status-' + prevStatus )
							.addClass( 'status-' + postStatus );

						if ( jQuery( '.post_status_page' ).val() != 'all' ) {
							jQuery( '#post-' + chatID ).fadeOut( 'normal', function () {
								jQuery( this ).remove();
							} );

							if ( count == 0 ) {
								jQuery( '#the-list' ).append( '<tr class="no-items"><td class="colspanchange" colspan="6">No Chats found</td></tr>' );
							}
						}
					}

				}
			);

		} );
} );