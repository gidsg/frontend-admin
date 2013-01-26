define(['models/article', 'Knockout', 'Common', 'Reqwest'], function (Article, ko, Common, Reqwest) {

    // zero pad the date getters
    Date.prototype.getHoursPadded = function() {
        return ("0" + this.getHours()).slice(-2);
    }
    
    Date.prototype.getMinutesPadded = function() {
        return ("0" + this.getMinutes()).slice(-2);
    }

    var Event = function(opts) {

        var maxBumpedArticles = 2,
            importanceBumped  = 100,
            importanceDefault = 50,
            saveInterval = 100, // milliseconds
            bumped = [],
            endpoint = '/events',
            deBounced,
            self = this;

        // A reference to articles that we might want to add to this event
        opts.articles =  opts.articles || []; 

        // Input values that get post processed
        this._prettyDate = ko.observable(); 
        this._prettyTime = ko.observable(); 
        
        // Event 'schema' poperties
        this.content    = ko.observableArray();
        this.title      = ko.observable();
        this.startDate  = ko.computed({
            read: function() {
                      return this._prettyDate() + 'T' + this._prettyTime() + ':00.000Z'; 
                  },
            write: function(value) {
                      var d = new Date(value)
                      this._prettyDate(d.toISOString().match(/^\d{4}-\d{2}-\d{2}/)[0]);
                      this._prettyTime(d.getHoursPadded() +':'+ d.getMinutesPadded());
                  },
            owner: this
        });

        this.importance = ko.observable();
        this.id         = ko.observable();
        this.parent     = ko.observable();

        // Administrative vars
        this._tentative = ko.observable(!opts || !opts.id); // No id means it's a new un-persisted event,
        this._editing   = ko.observable(this._tentative()); // so mark as editable
        this._hasNewArticle = ko.observable();

        this.init = function (o) {
            o = o || {};

            self.content.removeAll();
            (o.content || []).map(function(a){
                var article = new Article(a);
                self.content.push(article);
            })

            if (0 === bumped.length) {
                self.content().map(function(a){
                    if (a.importance() > importanceDefault) {
                        bumped.push(a.id());
                    }
                })
            }

            this.title(o.title || '');
            this.importance(o.importance || importanceDefault);
            
            if(o.id) {
                this.id(o.id);
            }

            this.parent({
                id: ko.observable(o.parent ? o.parent.id : '')
            });

            if (o.startDate) {
                this.startDate(new Date(o.startDate)); // today
            } else {
                var d = new Date();
                d.setHours(0, 0, 0, 0);
                this.startDate(d);
            }

            this._isValid = ko.computed(function () {
                return (
                    this.title().length > 0
                );
            }, this);

        }

        this.addContent = function(article) {
            var included = _.some(self.content(), function(item){
                return item.id() === article.id()
            });
            if (!included) {
                self.content.unshift(article);
                this.backgroundSave();
            }
        };

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

                // We post to the 'old' id
                url = endpoint + (self._tentative() ? '' : '/' + self.id());

                // ..but we generate the posted id, as the user may have edited the slug, date, etc.
                self.id(self.generateId());

                Reqwest({
                    url: url,
                    method: 'post',
                    type: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(self),
                    success: function(resp) {
                        console.log('RECEIVED:')
                        console.log(JSON.stringify(resp) + "\n\n")

                        // Update event using the server response
                        self.init(resp);
                        // Mark it as real
                        self._tentative(false);
                        self._editing(false);

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
                }, saveInterval);
            }
        };

        this.generateId = function () {
            return slugify(this.title()); // TODO - decide id scheme
        };

        this.toggleEditing = function() {
            this._editing(!this._editing());
        };

        this.bump = function() {
            if (self.importance() > importanceDefault) {
                self.importance(importanceDefault)
            } else {
                self.importance(importanceBumped)                
            }
            self.backgroundSave();
        };

        this.bumpContent = function(item) {
            var id = item.id();
            if (_.contains(bumped, id)) {
                bumped = _.without(bumped, id)
            } else {
                bumped.unshift(id)
                bumped = bumped.slice(0,maxBumpedArticles);
            }
            // Now adjust the importance of all content items accordingly 
            self.content().map(function(a){
                if (_.some(bumped, function(b){return a.id() === b})) {
                    a.importance(importanceBumped);
                } else {
                    a.importance(importanceDefault);
                }
            });
            self.backgroundSave();
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
