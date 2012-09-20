define(function () {

	Trailblock = Spine.Model.sub();

	// properties
	Trailblock.configure('Trailblock', 'tag', 'edition');

	Trailblock.extend(
		{
			all: function() {
				// get trailblocks from data
				return [new Trailblock(frontConfig).save()];
			},
			save: function() {
				// validate each trailblock
				console.log('foo');
				// convert to correct json
			}
		}
	);

	// extend
	Trailblock.include({
		validate: function () {
			if (!this.tag) {
				return 'Tag required';
			}
		}
	});

	// bind events
	Trailblock.bind("error", function(rec, msg) {
  		return alert("Contact failed to save - " + msg);
	});

	return Trailblock;

});