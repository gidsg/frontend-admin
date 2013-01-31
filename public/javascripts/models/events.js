define(['models/event', 'Knockout', 'Common', 'Reqwest'], function (Event, ko, Common, Reqwest) {

    var Events = function(articleCache) {
        var endpoint = '/events',
            self = this;

        this.list  = ko.observableArray();
        this.trees = ko.observableArray();

        this.pruneTerm = ko.observable();

        this.selected = ko.observable();
        this.previous = ko.computed(function(e){
            if (this.selected()) {
                return _.filter(this.list(), function(e){
                    return e.startDate() < self.selected().startDate()
                });
            } else {
                return [];
            }
        }, this);

        this.growTrees = function() {
            var eventsById = {},
                list = self.list(),
                len = list.length,
                parentId,
                addTo,
                i;
            self.trees.removeAll();
            for (i = 0; i < len; ++i) {
                list[i]._children.removeAll();
                eventsById[list[i].id()] = list[i];
            }
            for (i = 0; i < len; ++i) {
                parentId = list[i]._parentId();
                addTo = (parentId && eventsById[parentId]) ? eventsById[parentId]._children : self.trees;
                addTo.push(list[i]);
            }
        };

        this.pruneTrees = function () {
            self.trees().map(function(e){
                self.prune(new RegExp(self.pruneTerm(),"i"), e)
            })
        };

        this.prune = function(regex, node, keep) {
            var keep = !!node.title().match(regex) || keep;
            node._children().map(function(e){
                if (self.prune(regex, e, keep)) keep = true
            })
            node._hidden(!keep);
            return keep 
        };

        Common.mediator.addListener('models:event:save:success',      self.growTrees);
        Common.mediator.addListener('models:event:delete:success',    self.growTrees);
        Common.mediator.addListener('models:events:hierarchy:change', self.growTrees);

        this.length = ko.computed(function(){
            return this.list().length;
        }, this)

        this.loadEvent = function(o) {
            o = o || {};
            o.articleCache = articleCache;
            self.list.unshift(new Event(o));
        };

        this.setSelected = function(current) {
            if (current === self.selected()) {
                self.selected(undefined);
            } else {
                current.decorateContent();
                self.selected(current);
            } 
        };

        this.createEvent = function() {
            var event = new Event({
                articleCache: articleCache
            });
            self.list.unshift(event);
            self.selected(event)
            Common.mediator.emitEvent('models:events:hierarchy:change');
        };

        this.deleteEvent = function(event){
            var url = endpoint + '/' + event.id();
            self.list.remove(event);
            self.selected(false);
            Reqwest({
                url: url,
                method: 'delete',
                type: 'json',
                contentType: 'application/json',
                data: JSON.stringify(self),
                success: function(resp) {
                    Common.mediator.emitEvent('models:events:hierarchy:change');
                }
            });
        };

        this.createEventFollowOn = function(parent) {
            var event = new Event({
                articleCache: articleCache,
                parent: {id: parent.id()}
            });
            self.list.unshift(event);
            self.selected(event)
            Common.mediator.emitEvent('models:events:hierarchy:change');
        };

        this.cancelEditing = function(event) {
            event._editing(false);
            if (event._tentative()) {
                self.list.remove(event);
                self.selected(false);
            }
        }

        this.eventSaveSuccess = function() {
            // Show success
        };
        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);

        // Grab events
        Reqwest({
            url: '/events/list',
            type: 'json',
            success: function(resp) {
                resp.sort(function(l,r){
                    return l.startDate < r.startDate ? -1 : 1;
                });
                resp.map(function(e){
                    self.loadEvent(e);
                });
                Common.mediator.emitEvent('models:events:hierarchy:change');
            },
            error: function() {}
        });
    };

    return Events;
});