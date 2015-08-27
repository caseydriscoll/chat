jQuery( document ).ready( function() {


	// Sounds
	jQuery( '#receive-message-sound, #send-message-sound' ).on( 'change', function(e) {

		if ( e.target.value == '' ) return;

		var sound = e.target.value;

		var audio = new Audio( patchchat.audiourl + sound);

		audio.play();

	} );


	// minimizeIcon
	var minimizeIcon = jQuery( '#minimize-icon' ).val();

	jQuery( '#minimize-icon' ).after( '<i class="minimize fa ' + minimizeIcon + '" style="margin: 0 10px;"></i>' );

	jQuery( '#minimize-icon' ).on( 'change', function(e) {

		minimizeIcon = e.target.value;

		jQuery( '.minimize' ).removeAttr( 'class' ).addClass( 'minimize fa' ).addClass( minimizeIcon );
	} );


	// spinnerIcon
	var spinnerIcon = jQuery( '#spinner-icon' ).val();

	jQuery( '#spinner-icon' ).after( '<i class="fa fa-spin ' + spinnerIcon + '" style="margin: 0 10px;"></i>' );

	jQuery( '#spinner-icon' ).on( 'change', function(e) {

		spinnerIcon = e.target.value;

		jQuery( '.fa-spin' ).removeAttr( 'class' ).addClass( 'fa fa-spin' ).addClass( spinnerIcon );
	} );

} );