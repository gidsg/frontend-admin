curl(['models/frontend', 'Knockout']).then(function(Frontend, Knockout) {

 	var frontend = new Frontend;
 	Knockout.applyBindings(frontend, document.getElementById('network-front'));

    $('#network-front').submit(function(e) {
    	e.preventDefault();

        $.ajax({
            contentType: 'application/json',
            type: "POST",
            url: '/json/save',
            dataType: 'json',
            data: frontend.toJSON()
        })
    });

    // can't use standard reset type, doesn't fire change event on form
    $('#network-front #clear-form').click(function(e) {

    	$.each(['us', 'uk'], function(index, edition) {
    		trailblocks[edition].clear();
    	});
    });

});