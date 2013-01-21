define(["EventEmitter"], function (Mediator) {

    return {
        mediator: new Mediator(),

        queryParams: (function(){
        	var
	        	vars = {},
    	    	hash = window.location.search,
        		items,
        		item,
        		i;	
        	if (hash) {
        		items = hash.slice(1).split('&');
        		for (i = 0; i < items.length; i += 1) {
        			item = items[i].split('=');
        			vars[item[0]] = item[1];
        		}
        	}
        	return vars;
        }())

    }

});

