jQuery( document ).ready( function() {

	jQuery( '#receive-message-sound, #send-message-sound' ).on( 'change', function(e) {

		if ( e.target.value == '' ) return;

		var sound = e.target.value;

		var audio = new Audio( patchchat.audiourl + sound);

		audio.play();

	} );

	var minimizeIcon = jQuery( '#minimize-icon' ).val();

	jQuery( '#minimize-icon' ).after( '<i class="fa ' + minimizeIcon + '" style="margin: 0 10px;"></i>' );

	jQuery( '#minimize-icon' ).on( 'change', function(e) {

		var minimizeIcon = e.target.value;

		jQuery( '.fa' ).removeAttr( 'class' ).addClass( 'fa' ).addClass( minimizeIcon );
	} );

} );