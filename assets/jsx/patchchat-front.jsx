// TODO: Document all the things

jQuery( 'body' ).append( '<div id="patchchatcontainer"></div>' );

React.render(
	<PatchChatMessenger pulse="3000" />,
	document.getElementById( 'patchchatcontainer' )
);