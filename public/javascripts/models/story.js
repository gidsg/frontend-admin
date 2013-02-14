define(['models/event', 'Knockout', 'Common', 'Reqwest'], function (Event, ko, Common, Reqwest) {

    var Story = function(opts) {
        var endpoint = '/story',
            saveInterval = 1000, // milliseconds
            deBounced,
            self = this;

        this.id = ko.observable();
        this.title = ko.observable();
        this.events = ko.observableArray();

        // Temporary
        this._oldTitle = ko.observable();
        this._selected = ko.observable();

        this._tentative   = ko.observable(!opts || !opts.id); // No id means it's a new un-persisted event,
        this._editing     = ko.observable(this._tentative()); // so mark as editable
        this._hidden      = ko.observable();

        this.length = ko.computed(function(){
            return this.events().length;
        }, this)

        this.init = function (o) {
            o = o || {};

            this.title(o.title || 'Title');

            if (o.id) {
                this.id(o.id);
            }

            self.events.removeAll();
            (o.events || []).map(function(a){
                self.loadEvent(a);
            });
        };

        this.loadEvent = function(o) {
            var event;
            o = o || {};
            o.articleCache = opts.articleCache;
            event = new Event(o);
            self.events.push(event);
        };

        this.setSelected = function(current) {
            if (current === self._selected()) {
                self._selected(undefined);
            } else {
                current.decorateContent();
                self._selected(current);
            } 
        };

        this.createEvent = function() {
            var event = new Event({
                articleCache: opts.articleCache
            });
            self.events.unshift(event);
            self._selected(event);
        };

        this.deleteEvent = function(event){            
            var result = window.confirm("Are you sure you want to DELETE this event? Once deleted it will be gone FOREVER!");
            if (!result) return;
            self.events.remove(event);
            self._selected(false);
            Common.mediator.emitEvent('models:story:updated');
        };

        this.cancelEditing = function(event) {
            event._editing(false);
            if (event._tentative()) {
                self._selected(false);
                self.events.remove(event);
            }
        }

        this.save =  function() {
            var url = endpoint;

            // Post to the persisted id - even if we're changing the id
            if (self.id()) {
                url += '/' + self.id();
            }

            // Clean up the title
            //self.title(self.sanitize(self.title))

            // Generate an ID if the title has changed. This also covers new events.
            // IDs get a random part for "uniquness"
            if (self.title() !== self._oldTitle()) {
                self.id(self.slugify(self.title() + '-' + Math.floor(Math.random()*1000000)));
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
                    //self.init(resp);

                    // Get UI stuff from api/cache
                    //self.decorateContent();

                    // Mark event as real
                    self._tentative(false);

                    // Stop editing
                    //self._editing(false);
                    Common.mediator.emitEvent('models:story:save:success');
                },
                error: function() {
                    if (self._tentative()) {
                        Common.mediator.emitEvent('models:story:save:error:duplicate');
                    } else {
                        Common.mediator.emitEvent('models:story:save:error');
                    }
                }
            });
        };

        this.delete =  function() {
            var url = endpoint;

            // Post to the persisted id - even if we're changing the id
            if (self.id()) {
                url += '/' + self.id();

                console && console.log('DELETE');

                new Reqwest({
                    url: url,
                    method: 'delete',
                    type: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(self),
                    success: function(resp) {
                        Common.mediator.emitEvent('models:story:delete:success');
                    },
                    error: function() {
                        Common.mediator.emitEvent('models:story:delete:error');
                    }
                });
            }
        };

        this.backgroundSave = function() {
            clearTimeout(deBounced);
            deBounced = setTimeout(function(){
                self.save();
            }, saveInterval);
        };

        this.sanitize = function (str) {
            str = str
                .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'')
                .replace(/[^\w]+/g, ' ') // unfair on utf-8 IMHO
                .replace(/(^\w|\w$)/g, '');
            return str;
        };

        this.slugify = function (str) {
            str = str
                .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'')
                .toLowerCase()
                .replace(/[^\w]+/g, '-') // unfair on utf-8 IMHO
                .replace(/(^-|-$)/g, '');
            return str;
        };

        this.eventSaveSuccess = function() {
            // Show success
        };
        Common.mediator.addListener('models:events:save:success', this.eventSaveSuccess);

        this.init(opts);
    };

    Story.prototype.toJSON = function() {
        var copy = ko.toJS(this),
            prop;
        // Strip temp vars starting '_'
        for (prop in copy) {
            if (0 === prop.indexOf('_')) {
                delete copy[prop];
            }
        }
        return copy;
    };

    return Story;
});
