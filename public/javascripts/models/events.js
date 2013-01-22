define(['models/event', 'Knockout', 'Common', 'Reqwest'], function (Event, Knockout, Common, Reqwest) {

    return function(data) {
        var self = this;

        this.events = Knockout.observableArray();

        this.createEvent = function() {
            var event = new Event();
            self.events.unshift(event);
        };

        this.eventSaveSuccess = function() {
            // let the user know
        };

        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);
    };
});