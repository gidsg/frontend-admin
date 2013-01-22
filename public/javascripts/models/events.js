define(['models/event', 'Knockout', 'Common'], function (Event, ko, Common) {

    return function(data) {
        var self = this;

        this.events = ko.observableArray();

        this.createEvent = function() {
            var event = new Event();
            self.events.unshift(event);
        };

        this.eventSaveSuccess = function() {
        };

        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);
    };
});