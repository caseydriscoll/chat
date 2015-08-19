jQuery( document ).ready( function() {

	jQuery( '#receive-message-sound, #send-message-sound' ).on( 'change', function(e) {

		if ( e.target.value == '' ) return;

		var sound = e.target.value;

		var audio = new Audio( patchchat.audiourl + sound);

		audio.play();

	} );

} );