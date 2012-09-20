define(['knockout'], function (Knockout) {

	return function() {
		this.type     = 'tag';
    	this.id       = Knockout.observable('foo');
    	this.title 	  = Knockout.observable('A title');
    	this.numItems = Knockout.observable('3');
    	this.lead 	  = Knockout.observable(true);
	};

});