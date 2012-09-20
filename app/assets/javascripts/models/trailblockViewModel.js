define(function () {

	return function() {
		this.type = 'tag';
    	this.id    = ko.observable('foo');
    	this.title = ko.observable('A title');
    	this.numItems = ko.observable('3');
    	this.lead = ko.observable(true);
	};

});