define(['Knockout'], function (Knockout) {

	return function() {
		this.type     = 'tag';
    	this.id       = Knockout.observable('');
    	this.title 	  = Knockout.observable('');
    	this.numItems = 3;
    	this.lead 	  = true;

        this.update = function(data)
        {
            for (prop in data) {
                if (this[prop] && Knockout.isObservable(this[prop])) {
                    this[prop](data[prop]);
                }
            }
        }

        this.clear = function()
        {
            for (prop in this) {
                if (Knockout.isObservable(this[prop])) {
                    this[prop]('');
                }
            }
        }
	};

});
