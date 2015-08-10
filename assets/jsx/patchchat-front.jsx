// TODO: Document all the things

jQuery( 'body' ).append( '<div id="patchchatcontainer"></div>' );

React.render(
	<PatchChatMessenger pulse={patchchat.userpulsetime} />,
	document.getElementById( 'patchchatcontainer' )
);