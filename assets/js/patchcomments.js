var PatchComments = React.createClass( {displayName: "PatchComments",
	render: function() {
		var comments = this.props.data.comments.map( function( comment ) {
			classes = 'comment ' ;//+ patchchat.users[comment.user].role;
			return (
				React.createElement("li", {className: classes, key: 'comment' + comment.id}, 
					React.createElement("img", {src: 'https://gravatar.com/avatar/' + comment.img + '.jpg?s=30'}), 
					comment.text
				)
			);
		} );
		return (
			React.createElement("ul", {className: "patchcomments"}, 
				comments
			)
		);
	}
} );


var PatchChatForm = React.createClass( {displayName: "PatchChatForm",
	validate: function(e) {

		if ( e.which == 13 || e.keyCode == 13 ) {
			e.preventDefault();
			this.props.submit();
		}

	},
	adjust: function(e) {
		jQuery( e.target ).height( 0 );
		jQuery( e.target ).height( e.target.scrollHeight );
	},
	render: function() {
		return(
			React.createElement("form", {onSubmit: this.handleSubmit}, 
				React.createElement("fieldset", null, 
					React.createElement("label", null, "Name"), React.createElement("input", {name: "patchchat-name", type: "name", required: true}), 
					React.createElement("label", null, "Email"), React.createElement("input", {name: "patchchat-email", type: "email", required: true}), 
					React.createElement("input", {id: "patchchat-honeypot", name: "patchchat-honeypot", type: "text"})
				), 
				React.createElement("textarea", {name: "patchchat-text", onKeyUp: this.adjust, onKeyDown: this.validate, required: true})
			)
		);
	}
});