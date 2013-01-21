curl([
	'models/events',
	'Knockout',
	'Config',
    'Common'
]).then(function(
	Events,
	Knockout,
	Config,
    Common
) {

    Knockout.applyBindings({
    	events: new Events()
    });

});
