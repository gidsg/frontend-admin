define(function () {

	Trailblock = Spine.Model.sub();

	// properties
	Trailblock.configure('Trailblock', 'tag', 'edition');

	// add ajax functionality
	Trailblock.extend(Spine.Model.Ajax);
	// url to post to - NOTE, probably change
	Trailblock.extend({url: '/json/save'});

	Trailblock.extend(
		{
			fetch: function(){
				return new Trailblock(frontConfig);
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