jQuery( document ).ready( function() {

	jQuery( 'body' ).append( '<div id="patchchat">' );

	React.render(
		React.createElement("h1", null, "Hi, there!"),
		document.getElementById( 'patchchat' )
	);

} );