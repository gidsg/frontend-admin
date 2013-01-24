define(['models/article', 'Knockout', 'Common', 'Reqwest'], function (Article, ko, Common, Reqwest) {

    var Event = function(opts) {

        var self = this, 
            endpoint = '/events',
            deBounced;

        // A refence to articles that we might want to add to this event
        opts.articles =  opts.articles || []; 

        // Event 'schema' poperties
        this.content    = ko.observableArray();
        this.title      = ko.observable();
        this.section    = ko.observable();
        this.startDate  = ko.observable();
        this.importance = ko.observable();
        this.id         = ko.observable();
        this.parent     = ko.observable();

        // Input values that get post processed
        this._prettyDate = ko.observable(); 
        this._slug       = ko.observable();

        // Administrative vars
        this._tentative = ko.observable(!opts || !opts.id); // No id means it's a new unpersisted event,
        this._viewing   = ko.observable(this._tentative()); // in which case view it 
        this._editing   = ko.observable(this._tentative()); // as editable

        this.init = function (o) {
            o = o || {};

            self.content.removeAll();
            (o.content || []).map(function(article){
                self.content.push(new Article(article));
            })

            this.title(o.title || '');
            this.section(o.section || 'news');
            this.importance(o.importance || 30);

            if(o.id) {
                this.id(o.id);
                this._slug(_.last(o.id.split('/')));
            }

            this.parent({
                id: ko.observable(o.parent ? o.parent.id : '')
            });

            if (o.startDate) {
                this.startDate(new Date(o.startDate));
            } else {
                this.startDate(new Date());
            }
            this._prettyDate(this.startDate().toISOString().match(/^\d{4}-\d{2}-\d{2}/)[0]); 

            this._isValid = ko.computed(function () {
                return (
                    this.title().length > 0 &&
                    this.section().length > 0
                );
            }, this);
        }

        this.addArticle = function() {
            var hasChanged;

            opts.articles.map(function(article){
                var notIncluded;
                if (article.checked()) {
                    notIncluded = !_.some(self.content(), function(item){
                        return item.id === article.id
                    });
                    if (notIncluded) {
                        self.content.unshift(article);
                        hasChanged = true;
                    }
                }
            });

            if (hasChanged) {
                this.backgroundSave();
            }
        };

        this.removeArticle = function(article) {
            self.content.remove(article);
            self.backgroundSave();
        };

        this.save =  function() {
                var url;

                // Produce a proper date from the pretty (displayed, edited) date
                self.startDate(new Date(self._prettyDate()));

                // We post to the 'old' id
                //url = endpoint + (self._tentative() ? '' : self.id());
                url = endpoint;
                // ..but we generate the posted id, as the user may have edited the slug, date, etc.  
                self.id(self.generateId());

                console.log('SENT:')
                console.log(JSON.stringify({event: self}))

                Reqwest({
                    url: url,
                    method: 'post',
                    type: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({event: self}),
                    success: function(resp) {
                        console.log('RECEIVED:')
                        console.log(JSON.stringify(resp) + "\n\n")
                        if (resp.event) {
                            // Update event using the server response
                            self.init(resp.event);
                            // Mark it as real 
                            self._tentative(false);
                            self._editing(false);
                        }
                        Common.mediator.emitEvent('models:events:save:success', [resp]);
                    },
                    error: function() {
                        Common.mediator.emitEvent('models:events:save:error');
                    }
                });
        };
        
        this.backgroundSave = function() {
            if(!self._editing()) {
                clearTimeout(deBounced);
                deBounced = setTimeout(function(){
                    self.save();
                }, 750);
            }
        };

        this.generateId = function () {
            var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
                id = [
                    this.section(),
                    'event',
                    this.startDate().getFullYear(),
                    months[this.startDate().getMonth()],
                    this.startDate().getDate(),
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
        // Clean up an empty parent obj
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
