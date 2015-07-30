var prevstatus = '';

// TODO: Convert to new ajax controller

jQuery( document ).ready( function() {

	jQuery( 'select' )
		.on( 'focus', function(e) { prevstatus = this.value; } )
		.on( 'change', function(e) {

			jQuery( this ).next().show();

			id = jQuery( this ).parent().parent().attr( 'id' ).split( '-' )[1];

			data = {
				'action'     : 'change_chat_status',
				'id'         : id,
				'prevstatus' : prevstatus,
				'status'     : this.value
			};

			console.log( data );

			jQuery.post(
				'/wp-admin/admin-ajax.php',
				data,
				function( response ) {

					prevstatus = response.data.status;

					jQuery( '#post-' + response.data.id ).find( 'img' ).hide();

					count = jQuery( '.' + response.data.status ).find( '.count' ).html().replace(/[()]/g, '');
					jQuery( '.' + response.data.status ).find( '.count' ).html( '(' + ++count + ')' );

					count = jQuery( '.' + response.data.prevstatus ).find( '.count' ).html().replace(/[()]/g, '');
					jQuery( '.' + response.data.prevstatus ).find( '.count' ).html( '(' + --count + ')' );

					jQuery( '#post-' + response.data.id )
						.removeClass( 'status-' + response.data.prevstatus )
						.addClass( 'status-' + response.data.status );

					if ( jQuery( '.post_status_page' ).val() != 'all' ) {
						jQuery( '#post-' + response.data.id ).fadeOut( 'normal', function () {
							jQuery( this ).remove();
						} );
					}


					if ( count == 0 ) {
						jQuery( '#the-list' ).append( '<tr class="no-items"><td class="colspanchange" colspan="6">No Chats found</td></tr>' );
					}

				}
			);

		} );
} );