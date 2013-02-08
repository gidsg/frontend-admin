define(['models/article', 'Knockout', 'Config', 'Common', 'Reqwest'], function (Article, ko, Config, Common, Reqwest) {

    // zero pad the date getters
    Date.prototype.getHoursPadded = function() {
        return ("0" + this.getHours()).slice(-2);
    };
    
    Date.prototype.getMinutesPadded = function() {
        return ("0" + this.getMinutes()).slice(-2);
    };

    var Event = function(opts) {

        var maxBumpedArticles = 2,
            importanceBumped  = 100,
            importanceDefault = 50,
            saveInterval = 100, // milliseconds
            bumped = [],
            endpoint = '/events',
            deBounced,
            self = this;

        // Input values that get post processed
        this._humanDate  = ko.observable();
        this._prettyDate = ko.observable();
        this._prettyTime = ko.observable();

        // Event 'schema' poperties
        this.content    = ko.observableArray();
        this.title      = ko.observable();
        this.importance = ko.observable();
        this.id         = ko.observable();
        this.explainer  = ko.observable();
        this.createdBy  = ko.observable();
        this.lastModifiedBy = ko.observable();

        this.startDate  = ko.computed({
            read: function() {
                return this._prettyDate() + 'T' + this._prettyTime() + ':00.000Z';
            },
            write: function(value) {
                var d = new Date(value);
                this._prettyDate(d.toISOString().match(/^\d{4}-\d{2}-\d{2}/)[0]);
                this._prettyTime(d.getHoursPadded() +':'+ d.getMinutesPadded());
                this._humanDate(humanized_time_span(d));
            },
            owner: this
        });

        // Administrative vars
        this._children    = ko.observableArray();
        this._parentId    = ko.observable();
        this._parentTitle = ko.observable();
        this._contentApi  = ko.observable();
        this._tentative   = ko.observable(!opts || !opts.id); // No id means it's a new un-persisted event,
        this._editing     = ko.observable(this._tentative()); // so mark as editable
        this._editParent  = ko.observable();
        this._hidden      = ko.observable();
        this._oldTitle    = ko.observable();

        this.init = function (o) {
            o = o || {};

            self.content.removeAll();
            (o.content || []).map(function(a){
                var cached = opts.articleCache[a.id];
                if (cached) {
                    cached.importance = a.importance; // updating the cached article with incoming update
                    cached.colour = a.colour;
                    a = cached;
                }
                self.content.push(new Article(a));
            });

            if (0 === bumped.length) {
                self.content().map(function(a){
                    if (a.importance() > importanceDefault) {
                        bumped.push(a.id());
                    }
                });
            }

            this.title(o.title || '');
            this._oldTitle(o.title || '');
 
            this.explainer(o.explainer || '');
            this.importance(o.importance || importanceDefault);
            
            if (o.parent) {
                this._parentId(o.parent.id);
                this._parentTitle(o.parent.title);
            } else {
                this._parentId(undefined);
                this._parentTitle(undefined);
            }

            if(o.id) {
                this.id(o.id);
            }

            if (o.startDate) {
                this.startDate(new Date(o.startDate)); // today
            } else {
                var d = new Date();
                d.setHours(0, 0, 0, 0);
                this.startDate(d);
            }

            this._isValid = ko.computed(function () {
                return !!this.slugify(this.title());
            }, this);

            this.createdBy(o.createdBy);
        };

        this.addArticle = function(article) {
            var included = _.some(self.content(), function(item){
                return item.id() === article.id();
            });
            if (!included) {
                self.content.unshift(article);
                self.backgroundSave();
            }
        };

        this.addArticleById = function(id) {
            id = self.urlPath(id);
            var included = _.some(self.content(), function(item){
                return item.id() === id;
            });
            if (!included) {
                self.content.unshift(new Article({id: id}));
                self.backgroundSave();
            }
        };

        this.removeArticle = function(article) {
            self.content.remove(article);
            self.backgroundSave();
        };

        this.decorateContent = function() {
            var apiUrl = "/api/proxy/search";
            // Find articles that aren't yet decorated with API data..
            var areRaw = _.filter(self.content(), function(a){
                return ! a.webTitle();
            });
            // and grab them from the API
            if(areRaw.length) {
                apiUrl += "?page-size=50&format=json&show-fields=all&show-tags=all&api-key=" + Config.apiKey;
                apiUrl += "&ids=" + areRaw.map(function(article){
                    return encodeURIComponent(article.id());
                }).join(',');

                new Reqwest({
                    url: apiUrl,
                    type: 'jsonp',
                    success: function(resp) {
                        if (resp.response && resp.response.results) {
                            resp = resp.response.results;
                            resp.map(function(ra){
                                var c = _.find(areRaw,function(a){
                                    return a.id() === ra.id;
                                });
                                c.webTitle(ra.webTitle);
                                c.webPublicationDate(ra.webPublicationDate);
                                opts.articleCache[ra.id] = ra;
                            });
                        }
                    },
                    error: function() {}
                });
            }
        };

        this.save =  function() {
            var url = endpoint;

            // Post to the persisted id - even if we're changing the id
            if (self.id()) {
                url += '/' + self.id();
            }

            // Generate an ID if the title has changed. This also covers new events.
            // IDs get a random part for "uniquness"
            if (self.title() !== self._oldTitle()) {
                self.id(this.slugify(this.title() + '-' + Math.floor(Math.random()*1000000)));
            }

            // Sort by importance then by date.  Both descending. This'll probably need changing.
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

            //console && console.log('SENT:');
            //console && console.log(JSON.stringify(self) + "\n\n")

            new Reqwest({
                url: url,
                method: 'post',
                type: 'json',
                contentType: 'application/json',
                data: JSON.stringify(self),
                success: function(resp) {
                    //console && console.log('RECEIVED:')
                    //console && console.log(JSON.stringify(resp) + "\n\n")
                    
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

        this.toggleEditing = function() {
            this._editing(!this._editing());
        };

        this.toggleEditParent = function() {
            this._editParent(!this._editParent());
        };

        this.bump = function() {
            if (self.importance() > importanceDefault) {
                self.importance(importanceDefault);
            } else {
                self.importance(importanceBumped);
            }
            self.backgroundSave();
        };

        this.bumpContent = function(item) {
            var id = item.id();
            if (_.contains(bumped, id)) {
                bumped = _.without(bumped, id);
            } else {
                bumped.unshift(id);
                bumped = bumped.slice(0,maxBumpedArticles);
            }
            // Now adjust the importance of all content items accordingly
            self.content().map(function(a){
                if (_.some(bumped, function(b){
                    return a.id() === b;
                })) {
                    a.importance(importanceBumped);
                } else {
                    a.importance(importanceDefault);
                }
            });
            self.backgroundSave();
        };
    
        this.setColour = function(item) {
            var id = item.id();
            self.content().forEach(function(i){
                if (i.id() === id) {
                    if (item.colour() > 2) {
                        i.colour(1)
                    }
                    else { 
                        i.colour(5)
                    }
                }
            }); 
            self.backgroundSave();
        }

        this.urlPath = function(url) {
            var a = document.createElement('a');
            a.href = url;
            a = a.pathname + a.search;
            a = a.indexOf('/') === 0 ? a.substr(1) : a;
            return a;
        };

        this.slugify = function (str) {
            str = str
                .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'')
                .toLowerCase()
                .replace(/[^\w]+/g, '-') // unfair on utf-8 IMHO
                .replace(/(^-|-$)/g, '');
            return str;
        };

        this.init(opts);
    };

    Event.prototype.toJSON = function() {
        var copy = ko.toJS(this),
            prop;

        // Turn parentId into parent obj
        if (copy._parentId) {
            copy.parent = {id: copy._parentId};
        }

        // Strip administrative properties starting '_'
        for (prop in copy) {
            if (0 === prop.indexOf('_')) {
                delete copy[prop];
            }
        }

        return copy;
    };

    return Event;
});
