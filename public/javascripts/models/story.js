define(['models/editable', 'models/event', 'Knockout', 'Common', 'Reqwest'], function (Editable, Event, ko, Common, Reqwest) {

    var Story = function(opts) {
        var endpoint = '/story',
            saveInterval = 1000, // milliseconds
            deBounced,
            self = this;

        opts = opts || {};

        this.title = ko.observable(opts.title || '');
        this.explainer = ko.observable(opts.explainer || '(No synopsis)');
        this.hero = ko.observable(opts.hero || '');
        this.id = ko.observable(opts.id);
        this.events = ko.observableArray();

        // Track for editability / saving
        this._makeEditable(['title', 'explainer', 'hero']);

        // Temporary
        this._selected = ko.observable(); // The selected event
        this._tentative = ko.observable(opts._tentative); // No id means it's a new un-persisted event,

        // Explainer - for textarea, replace <br/> with \n 
        this._explainerBreaks = ko.computed({
            read: function(value) {return this.explainer().replace(/\s*<br\s*\/>\s*/g, '\n')},
            write: function(value) {this.explainer(value.replace(/(\r\n|\n|\r)/gm, '<br />'))},
            owner: this
        });

        this.loadEvent = function(o) {
            var event;
            o = o || {};
            o.articleCache = opts.articleCache;
            event = new Event(o);
            self.events.push(event);
        };

        (opts.events || []).map(function(a){
            self.loadEvent(a);
        });

        this.setSelected = function(current) {
            current.decorateContent();
            self._selected(current);
        };

        this.clearSelected = function(current) {
            self._selected(undefined);
        };

        this.createEvent = function() {
            var event = new Event({
                articleCache: opts.articleCache,
                _tentative: true
            });
            self.events.unshift(event);
            self._selected(event);
        };

        this.deleteEvent = function(event){            
            var result = window.confirm("Permanently delete this chapter?");
            if (!result) return;
            self.events.remove(event);
            self._selected(false);
            Common.mediator.emitEvent('models:story:haschanges');
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
            } else {
                self.id("" + Math.floor(Math.random()*1000000));
            }
            
            // Sort by date, descending.
            this.events.sort(function (left, right) {
                var ld = left.startDate(),
                    rd = right.startDate();
                return (ld > rd) ? -1 : 1;
            });

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
                    // Mark event as real
                    self._tentative(false);
                    Common.mediator.emitEvent('models:story:save:success');
                },
                error: function() {
                    Common.mediator.emitEvent('models:story:save:error');
                }
            });
        };

        this.delete =  function() {
            if (self.id()) {
                new Reqwest({
                    url: endpoint + '/' + self.id(),
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
    };

    Story.prototype = new Editable();

    return Story;
});
