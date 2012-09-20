curl(['models/trailblockViewModel', 'Knockout']).then(function(TrailblockViewModel, Knockout) {

	var trailblocks = {
		'uk': new TrailblockViewModel,
		'us': new TrailblockViewModel
	}

	for (edition in trailblocks) {
		var trailblock = trailblocks[edition];
        // apply bindings
        Knockout.applyBindings(trailblock, document.getElementById(edition + '-trailblocks'));

        // update with values from server
		var editionConfig = frontConfig[edition];
        if (editionConfig) {
        	trailblock.update(editionConfig);
        }
    }

    $('#network-front').submit(function(e) {
    	e.preventDefault();

        // turn trailblock models into js obj
        var data = {
        	'uk': Knockout.toJS(trailblocks.uk),
            'us': Knockout.toJS(trailblocks.us)
        };

        $.ajax({
            contentType: 'application/json',
            type: "POST",
            url: '/json/save',
            dataType: 'json',
            data: JSON.stringify(data)
        })
    });

    // can't use standard reset type, doesn't fire change event on form
    $('#network-front #clear-form').click(function(e) {
    	$.each(['us', 'uk'], function(index, edition) {
    		trailblocks[edition].clear();
    	});
    });

});