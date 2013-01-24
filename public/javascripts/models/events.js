define(['models/event', 'Knockout', 'Common'], function (Event, ko, Common) {

    return function(articles) {
        var self = this;

        this.events = ko.observableArray();

        this.length = ko.computed(function(){
            return this.events().length;
        }, this)

        this.loadEvent = function(opts) {
            opts = opts || {};
            opts.articles = articles;
            self.events.unshift(new Event(opts));
        };

        this.collapseAll = function(current) {
            this.events().map(function(event){
                event._viewing(false);
            });
        };

        this.createEvent = function() {
            var event = new Event({
                articles: articles
            });
            self.collapseAll();
            self.events.unshift(event);
        };

        this.createEventFollowOn = function(parent) {
            var event = new Event({
                articles: articles,
                parent: {id: parent.id()}
            });
            self.collapseAll();
            self.events.unshift(event);
        };

        this.eventSaveSuccess = function() {
        };

        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);
    };
});