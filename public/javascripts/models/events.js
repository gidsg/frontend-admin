define(['models/event', 'Knockout', 'Common', 'Reqwest'], function (Event, Knockout, Common, Reqwest) {

	return function(data) {

        var self = this;

        this.article = Knockout.observable(Common.queryParams.article);

        this.events = Knockout.observableArray([
            new Event({section: 'news', id:'/news/event/2013/britons-confirmed-dead-in-algeria', title:'Britons confirmed dead in Algeria', importance:1}),
            new Event({section: 'news', id:'/news/event/2013/algerian-military-storm-hostage-takers', title:'Algerian military storm hostage takers', importance:1}),
            new Event({section: 'news', id:'/news/event/2013/british-hostages-taken-in-algeria', title:'British Hostages held in Algeria', importance:1})
        ]);

        this.createEvent = function() {
            var event = new Event();
            self.events.unshift(event);
        };

        this.eventSaveSuccess = function() {};

        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);
	};
});
