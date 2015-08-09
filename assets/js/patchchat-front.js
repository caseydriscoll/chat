// TODO: Document all the things

'use strict';

jQuery('body').append('<div id="patchchatcontainer"></div>');

React.render(React.createElement(PatchChatMessenger, { pulse: '3000' }), document.getElementById('patchchatcontainer'));
