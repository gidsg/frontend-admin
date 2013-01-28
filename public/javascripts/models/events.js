define(['models/event', 'Knockout', 'Common', 'Reqwest'], function (Event, ko, Common, Reqwest) {

    return function(articleCache) {
        var endpoint = '/events',
            self = this;

        this.events = ko.observableArray();
        this.selectedEvent = ko.observable();

        this.unSelectedEvents = ko.computed(function(){
            return _.without(this.events(), this.selectedEvent());
        }, this);

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

        this.deleteEvent = function(event){
            var url = endpoint + '/' + event.id();
            self.events.remove(event);
            self.selectedEvent(false);
            Reqwest({
                url: url,
                method: 'delete',
                type: 'json',
                contentType: 'application/json',
                data: JSON.stringify(self),
                success: function(resp) {
                    Common.mediator.emitEvent('models:event:delete:success', [resp]);
                },
                error: function() {
                    Common.mediator.emitEvent('models:event:delete:error');
                }
            });
        };

        this.createEventFollowOn = function(parent) {
            var event = new Event({
                articleCache: articleCache,
                parent: {id: parent.id()}
            });
            self.events.unshift(event);
            self.selectedEvent(event)
        };

        this.cancelEditing = function(event) {
            event._editing(false);
            if (event._tentative()) {
                self.events.remove(event);
                self.selectedEvent(false);
            }
        }

        this.eventSaveSuccess = function() {
        };

        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);
    };
});
