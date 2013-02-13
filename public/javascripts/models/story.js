define(['models/event', 'Knockout', 'Common', 'Reqwest'], function (Event, ko, Common, Reqwest) {

    var Story = function(opts) {
        var endpoint = '/events',
            self = this;

        this.id = ko.observable();
        this.title = ko.observable();
        this.events = ko.observableArray();

        // Temporary
        this.oldTitle = ko.observable();
        this.selected = ko.observable();

        this._tentative   = ko.observable(!opts || !opts.id); // No id means it's a new un-persisted event,
        this._editing     = ko.observable(this._tentative()); // so mark as editable
        this._hidden      = ko.observable();

        this.length = ko.computed(function(){
            return this.events().length;
        }, this)

        this.loadEvent = function(o) {
            var event;
            o = o || {};
            o.articleCache = opts.articleCache;
            event = new Event(o);
            self.events.unshift(event);
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
                articleCache: opts.articleCache
            });
            self.events.unshift(event);
            self.selected(event);
        };

        this.deleteEvent = function(event){
            
            var result = window.confirm("Are you sure you want to DELETE this event? Once deleted it will be gone FOREVER!");
            if (!result) return;

            var url = endpoint + '/' + event.id();
            self.events.remove(event);
            self.selected(false);
            Reqwest({
                url: url,
                method: 'delete',
                type: 'json',
                contentType: 'application/json',
                data: JSON.stringify(self)
            });
        };

        this.cancelEditing = function(event) {
            event._editing(false);
            if (event._tentative()) {
                self.selected(false);
                self.events.remove(event);
            }
        }

        this.save =  function() {
            var url = endpoint;

            // Post to the persisted id - even if we're changing the id
            if (self.id()) {
                url += '/' + self.id();
            }

            // Generate an ID if the title has changed. This also covers new events.
            // IDs get a random part for "uniquness"
            if (self.title() !== self.oldTitle()) {
                self.id(this.slugify(this.title() + '-' + Math.floor(Math.random()*1000000)));
            }
            
            // Sort by importance then by date.  Both descending. This'll probably need changing.
            /*
            this.content.sort(function (left, right) {
                var li = left.importance(),
                    ri = right.importance(),
                    ld = left.webPublicationDate(),
                    rd = right.webPublicationDate();
                if (li === ri) {
                    return (ld > rd) ? -1 : 1;
                } else {
                    return (li > ri) ? -1 : 1;
                }
            });
            */

            console && console.log('SENT:');
            console && console.log(JSON.stringify(self) + "\n\n")

            new Reqwest({
                url: url,
                method: 'post',
                type: 'json',
                contentType: 'application/json',
                data: JSON.stringify(self),
                success: function(resp) {
                    console && console.log('RECEIVED:')
                    console && console.log(JSON.stringify(resp) + "\n\n")
                    
                    // Update event using the server response
                    self.init(resp);
                    // Get UI stuff from api/cache
                    self.decorateContent();
                    // Mark event as real
                    self._tentative(false);
                    // Stop editing
                    self._editing(false);
                    Common.mediator.emitEvent('models:event:save:success');
                },
                error: function() {
                    if (self._tentative()) {
                        Common.mediator.emitEvent('models:event:save:error:duplicate');
                    } else {
                        Common.mediator.emitEvent('models:event:save:error');
                    }
                }
            });
        };
        
        this.backgroundSave = function() {
            if(!self._editing()) {
                clearTimeout(deBounced);
                deBounced = setTimeout(function(){
                    self.save();
                }, saveInterval);
            }
        };

        this.eventSaveSuccess = function() {
            // Show success
        };
        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);

        // Grab events
        Reqwest({
            url: '/events/list',
            type: 'json',
            success: function(resp) {
                resp.map(function(e){
                    self.loadEvent(e);
                });
            },
            error: function() {}
        });
    };

    Story.prototype.toJSON = function() {
        var copy = ko.toJS(this),
            prop;

        // Strip administrative properties starting '_'
        for (prop in copy) {
            if (0 === prop.indexOf('_')) {
                delete copy[prop];
            }
        }

        return copy;
    };

    return Story;
});
