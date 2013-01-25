define(['models/event', 'Knockout', 'Common'], function (Event, ko, Common) {

    return function(articles) {
        var self = this;

        this.events = ko.observableArray();
        this.selectedEvent = ko.observable();

        this.length = ko.computed(function(){
            return this.events().length;
        }, this)

        this.loadEvent = function(opts) {
            opts = opts || {};
            opts.articles = articles;
            self.events.unshift(new Event(opts));
        };

        this.setSelected = function(current) {
            self.selectedEvent(current === self.selectedEvent() ? undefined : current);
            console.log(self.selectedEvent());
        };

        this.createEvent = function() {
            var event = new Event({
                articles: articles
            });
            self.events.unshift(event);
            self.selectedEvent(event)
        };

        this.createEventFollowOn = function(parent) {
            var event = new Event({
                articles: articles,
                parent: {id: parent.id()}
            });
            self.events.unshift(event);
            self.selectedEvent(event)
        };

        this.eventSaveSuccess = function() {
        };

        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);
    };
});