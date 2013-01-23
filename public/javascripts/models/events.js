define(['models/event', 'Knockout', 'Common'], function (Event, ko, Common) {

    return function(articles) {
        var self = this;

        this.events = ko.observableArray();

        this.createEvent = function() {
            var event = new Event({
                articles: articles
            });
            self.events.unshift(event);
        };

        this.createEventFollowOn = function(parent) {
            var event = new Event({
                articles: articles,
                parent: {id: parent.id()}
            });
            self.events.unshift(event);
        };

        this.eventSaveSuccess = function() {
        };

        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);
    };
});