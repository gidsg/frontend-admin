define(function () {

	Trailblock = Spine.Model.sub();

	// properties
	Trailblock.configure('Trailblock', 'tagId', 'tagName', 'edition');

	// add ajax functionality
	Trailblock.extend(Spine.Model.Ajax);
	Trailblock.extend({url: '/admin/foo'});

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