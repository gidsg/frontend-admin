define(['models/event', 'Knockout', 'Common', 'Reqwest'], function (Event, ko, Common, Reqwest) {

    return function(articleCache) {
        var self = this;

        this.events = ko.observableArray();
        this.selectedEvent = ko.observable();

        this.length = ko.computed(function(){
            return this.events().length;
        }, this)

        this.loadEvent = function(opts) {
            opts = opts || {};
            opts.articleCache = articleCache;
            self.events.unshift(new Event(opts));
        };

        this.setSelected = function(current) {
            if (current === self.selectedEvent()) {
                self.selectedEvent(undefined);
            } else {
                current.decorateContent();
                self.selectedEvent(current);
            } 
        };

        this.createEvent = function() {
            var event = new Event({
                articleCache: articleCache
            });
            self.events.unshift(event);
            self.selectedEvent(event)
        };

        this.createEventFollowOn = function(parent) {
            var event = new Event({
                articleCache: articleCache,
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
