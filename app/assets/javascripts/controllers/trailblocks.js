define(['models/trailblock'], function (Trailblock) {

	var Trailblocks = Spine.Controller.sub({

		elements: {
			".trailblock": "trailblocks"
		},

  		events: {
    		"submit #network-front": "save"
  		},

  		init: function() {
    		Trailblock.fetch()
    		Trailblock.bind("refresh change", this.proxy(this.render));
  		},

  		save: function(e) {
  			e.preventDefault();
  			var trailblock = Trailblock.fromForm(e.target)
  			trailblock.save();
  		}

	});

	return Trailblocks;

});