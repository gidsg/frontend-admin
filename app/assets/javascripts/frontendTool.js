curl([
	'models/frontend',
	'Knockout',
	'Config',
    'Common',
    'TagEntry',
    'AutoComplete',
    'TagSearch',
    'ItemSearch'
]).then(function(
	Frontend,
	Knockout,
	Config,
    Common,
    TagEntry,
    AutoComplete,
    TagSearch,
    ItemSearch
) {
 	var frontend = new Frontend;
 	Knockout.applyBindings(frontend, document.getElementById('frontend-tool'));

    $('#network-front').submit(function(e) {
    	e.preventDefault();

        $.ajax({
            contentType: 'application/json',
            type: 'POST',
            url: '/json/save',
            dataType: 'json',
            data: frontend.toJSON()
        })
    });

    // can't use standard reset type, doesn't fire change event on form
    $('#network-front #clear-form').click(function(e) {

    	frontend.editions().forEach(function(edition) {
    		edition.trailblocks().forEach(function(trailblock) {
    			trailblock.clear();
    		});
    	});

    });

    new TagSearch.init( { apiEndPoint: 'http://content.guardianapis.com/tags', config: Config } );
    new TagEntry.init( { nodeList: $('.typeahead') } );

});