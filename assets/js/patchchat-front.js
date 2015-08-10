// TODO: Document all the things

'use strict';

jQuery('body').append('<div id="patchchatcontainer"></div>');

React.render(React.createElement(PatchChatMessenger, { pulse: patchchat.userpulsetime }), document.getElementById('patchchatcontainer'));
