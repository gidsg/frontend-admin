define(['models/trailblock'], function (Trailblock) {

	var Trailblocks = Spine.Controller.sub({

		elements: {
			".trailblocks": "trailblocks"
		},

  		events: {
    		"submit #network-front": "save"
  		},

  		init: function() {
  			Trailblock.bind("create", this.proxy(this.foo));
    		var trailblocks = Trailblock.all();
  		},

  		foo: function() {
  			console.log('bar');
  		},

  		save: function(e) {
  			e.preventDefault();
  			var trailblock = Trailblock.fromForm(e.target);
  			if (!trailblock.save()) {
  				return;
  			}
  			// now save trailblocks to s3
  			Trailblock.save();
  		}

	});

	return Trailblocks;

});