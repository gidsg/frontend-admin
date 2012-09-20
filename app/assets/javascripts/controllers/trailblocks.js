define(['models/trailblock'], function (Trailblock) {

	var Trailblocks = Spine.Controller.sub({

  		events: {
    		"submit #special": "save"
  		},

  		init: function(){
   			// Instantiate other controllers..
    		//Trailblock.fetch()
  		},

  		save: function(e) {
  			e.preventDefault();
  			var trailblock = Trailblock.fromForm(e.target)
  			trailblock.save();
  		}

	});

	return Trailblocks;

});