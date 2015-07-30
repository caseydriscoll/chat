var PatchComments = React.createClass( {
	render: function() {
		var comments = this.props.data.comments.map( function( comment ) {
			classes = 'comment ' ;//+ patchchat.users[comment.user].role;
			return (
				<li className={classes} key={'comment' + comment.id}>
					<img src={'https://gravatar.com/avatar/' + comment.img + '.jpg?s=30'} />
					{comment.text}
				</li>
			);
		} );
		return (
			<ul className="patchcomments">
				{comments}
			</ul>
		);
	}
} );


var PatchChatForm = React.createClass( {
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
			<form onSubmit={this.handleSubmit}>
				<fieldset>
					<label>Name</label><input name="patchchat-name" type="name" required />
					<label>Email</label><input name="patchchat-email" type="email" required />
					<input id="patchchat-honeypot" name="patchchat-honeypot" type="text" />
				</fieldset>
				<textarea name="patchchat-text" onKeyUp={this.adjust} onKeyDown={this.validate} required></textarea>
			</form>
		);
	}
});