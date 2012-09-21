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

    $('#frontend-tool').submit(function(e) {
    	e.preventDefault();
    	Common.mediator.emitEvent('ui:frontendtool:save');
    });

    $('#frontend-tool .typeahead').blur(function(e) {
    	if ($(e.currentTarget).val()) {
    		Common.mediator.emitEvent('ui:frontendtool:tagid:selected', [{}, e.currentTarget]);
    	}
    });

    // can't use standard reset type, doesn't fire change event on form
    $('#frontend-tool #clear-form').click(function(e) {
    	Common.mediator.emitEvent('ui:frontendtool:clear')
    });

    new TagSearch.init( { apiEndPoint: 'http://content.guardianapis.com/tags', config: Config } );
    new TagEntry.init( { nodeList: $('.typeahead') } );

});