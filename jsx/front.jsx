jQuery( document ).ready( function() {

	jQuery( 'body' ).append( '<div id="patchchat">' );

	React.render(
		<h1>Hi, there!</h1>,
		document.getElementById( 'patchchat' )
	);

} );