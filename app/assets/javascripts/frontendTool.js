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

 	var alert = $(
 		'<div class="alert alert-error">'
        	+ '<button type="button" class="close" data-dismiss="alert">×</button>'
        	+ '<h2>Error!</h2>'
        	+ '<p>There are errors in the form</p>'
    	+ '</div>'
	);

    $('#frontend-tool').submit(function(e) {
    	e.preventDefault();
    	var form = $(e.currentTarget);
    	if (form.find('.invalid').length) {
    		form.insertBefore(alert);
    	} else {
    		Common.mediator.emitEvent('ui:frontendtool:save');
    	}
    });

    $('#frontend-tool .typeahead').blur(function(e) {
    	if ($(e.currentTarget).val()) {
    		Common.mediator.emitEvent('ui:frontendtool:tagid:selected', [{}, e.currentTarget]);
    	}
    });

    // can't use standard reset type, doesn't fire change event on form
    $('#frontend-tool #clear-frontend').click(function(e) {
    	Common.mediator.emitEvent('ui:frontendtool:clear');
    });

    new TagSearch.init( { apiEndPoint: 'http://content.guardianapis.com/tags', config: Config } );
    new TagEntry.init( { nodeList: $('.typeahead') } );

});