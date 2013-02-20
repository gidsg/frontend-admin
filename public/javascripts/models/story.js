define(['models/event', 'Knockout', 'Common', 'Reqwest'], function (Event, ko, Common, Reqwest) {

    var Story = function(opts) {
        var endpoint = '/story',
            saveInterval = 1000, // milliseconds
            deBounced,
            self = this;

        opts = opts || {};

        this.id = ko.observable(opts.id);
        this.title = ko.observable(opts.title || '');
        this.explainer = ko.observable(opts.explainer || '(No synopsis)');
        this.hero = ko.observable(opts.hero || '');
        this.events = ko.observableArray();

        // Temporary
        this._oldTitle = ko.observable();
        this._selected = ko.observable();

        this._tentative   = ko.observable(opts._tentative); // No id means it's a new un-persisted event,
        this._editing     = ko.observable(this._tentative()); // so mark as editable
        this._hidden      = ko.observable();

        this.length = ko.computed(function(){
            return this.events().length;
        }, this)

        // Lsisteners on editable observables
        this._title_editing = ko.observable(opts._tentative);
        this._title_edit    = function() { this._title_editing(true) };

        this._explainer_editing = ko.observable(false);
        this._explainer_edit    = function() { this._explainer_editing(true) };

        this._hero_editing = ko.observable(false);
        this._hero_edit    = function() { this._hero_editing(true) };

        this.title.subscribe(    function(){Common.mediator.emitEvent('models:story:haschanges')});
        this.explainer.subscribe(function(){Common.mediator.emitEvent('models:story:haschanges')});
        this.hero.subscribe(     function(){Common.mediator.emitEvent('models:story:haschanges')});

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
                    if (self._tentative()) {
                        Common.mediator.emitEvent('models:story:save:error:duplicate');
                    } else {
                        Common.mediator.emitEvent('models:story:save:error');
                    }
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
