define(['Knockout', 'Common', 'Reqwest'], function (ko, Common, Reqwest) {

    var Event = function(opts) {

        var self = this, 
            endpoint = '/stories/event'

        this.content    = ko.observableArray();
        this.title      = ko.observable();
        this.section    = ko.observable();
        this.date       = ko.observable();
        this.importance = ko.observable();
        this.id         = ko.observable();
        this.parent     = ko.observable();

        // Administrative vars
        this._tentative = ko.observable(!opts || !opts.id); // No id means it's a new unpersisted event,
        this._viewing   = ko.observable(this._tentative()); // in which case view it 
        this._editing   = ko.observable(this._tentative()); // as editable
        this._slug      = ko.observable();

        this.init = function (o) {
            o = o || {};

            this.content(o.content || []);
            this.title(o.title || '');
            this.section(o.section || '');
            this.importance(o.importance || '');

            if(o.id) {
                this.id(o.id);
                this._slug(_.last(o.id.split('/')));
            }

            this.parent({
                id: ko.observable(o.parent ? o.parent.id : '')
            });

            if (o.date) {
                this.date(new Date(o.date));
            } else {
                this.date(new Date());
            }

            this._isValid = ko.computed(function () {
                return (
                    this.title().length > 0 &&
                    this.section().length > 0
                );
            }, this);
        }

        this.addArticle = function() {
            var 
                id = document.querySelector('#article').value.replace(' ',''),
                hasId = function(o) {return o.id === id};

            if (id) {
                if (_.some(this.content(), hasId)) { // remove it
                    this.content.remove(hasId)
                } else { // add it
                    this.content.unshift({id: id});
                }
                this.saveEvent();
            }
        };

        this.removeArticle = function(article) {
            this.content.remove(article);
            this.saveEvent();
        };

        this.saveEvent =  function() {
            var body,

                // We post to the 'old' id
                url = endpoint + (this._tentative() ? '' : this.id());
                // but we regenerate a new id in the posted event, as the user may have edited the slug, date, etc.  
                this.id(this.generateId()); 

            Reqwest({
                url: url,
                method: 'post',
                type: 'json',
                contentType: 'application/json',
                data: JSON.stringify({event: this}),
                success: function(resp) {
                    console.log('FROM: ' + url)                    
                    console.log(JSON.stringify(resp) + "\n")
                    if (resp.event) {
                        // Update event using the server response
                        self.init(resp.event);
                        // Mark it as real 
                        self._tentative(false);
                        this._editing(false);
                        this._viewing(true);
                    }
                    Common.mediator.emitEvent('models:events:save:success', [resp]);
                },
                error: function() {
                    Common.mediator.emitEvent('models:events:save:error');
                }
            });
        };
        
        this.generateId = function () {
            var id,
                months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

            id = '/' + [
                this.section(),
                'event',
                this.date().getFullYear(),
                months[this.date().getMonth()],
                this.date().getDate(),
                slugify(this._slug() || this.title())
            ].join('/');
            return id;
        };

        this.toggleShowing = function() {
           this._viewing(!this._viewing());
           this._editing(false);
        };

        this.toggleEditing = function() {
            this._editing(!this._editing());
        };

        this.init(opts);
    };

    Event.prototype.toJSON = function() {
        var copy = ko.toJS(this),
            prop;
        // Strip administrative properties starting '_'
        for (prop in copy) {
            if (0 === prop.indexOf('_')) {
                delete copy[prop];
            }
        }
        if (copy.parent && !copy.parent.id) {
            delete copy.parent;
        }
        return copy;
    };

    function slugify (str) {
        str = str
            .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'')
            .replace(/\s+/g,' ')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-');
        return str;
    }

    return Event;
})
