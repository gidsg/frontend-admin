define(['models/article', 'models/agent', 'models/place', 'Knockout', 'Config', 'Common', 'Reqwest'], function (Article, Agent, Place, ko, Config, Common, Reqwest) {

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
            bumped = [],
            self = this;

        opts = opts || {};

        // General 'schema' poperties
        this.title      = ko.observable(opts.title || '');
        this.explainer  = ko.observable(opts.explainer || 'none');
        this.importance = ko.observable(opts.importance || importanceDefault);
        
        // Content
        this.content = ko.observableArray();
        (opts.content || []).map(function(a){
            var cached = opts.articleCache ? opts.articleCache[a.id] : undefined;
            if (cached) {
                cached.importance = a.importance; // updating the cached article with incoming update
                cached.colour = a.colour;
                a = cached;
            }
            self.content.push(new Article(a));
        });

        // Agents
        this.agents     = ko.observableArray(); // people, organisations etc.
        self.agents.removeAll(); 
        (opts.agents || []).map(function(a){
            self.agents.push(new Agent(a));
        });

        // Places
        this.places     = ko.observableArray(); // locations 
        this.sameAs     = ko.observableArray(); // Eg. cross-reference with wikipedia, PA, BBC etc. 
        
        self.places.removeAll(); 
        (opts.places || []).map(function(p){
            self.places.push(new Place(p));
        });

        // Dates
        this._humanDate  = ko.observable();
        this._prettyDate = ko.observable();
        this._prettyTime = ko.observable();        

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

        if (opts.startDate) {
            this.startDate(new Date(opts.startDate)); // today
        } else {
            var d = new Date();
            this.startDate(d);
        }

        // Administrative vars
        this._tentative   = ko.observable(opts._tentative);
        this._hidden      = ko.observable();

        // Lsisteners on editable observables
        this._title_editing = ko.observable(opts._tentative);
        this._title_edit    = function() { this._title_editing(true) };

        this._explainer_editing = ko.observable(false);
        this._explainer_edit    = function() { this._explainer_editing(true) };

        this.title.subscribe(    function(){Common.mediator.emitEvent('models:story:haschanges')});
        this.explainer.subscribe(function(){Common.mediator.emitEvent('models:story:haschanges')});
        this.startDate.subscribe(function(){Common.mediator.emitEvent('models:story:haschanges')});

        if (bumped.length === 0) {
            self.content().map(function(a){
                if (a.importance() > importanceDefault) {
                    bumped.push(a.id());
                }
            });
        }

        this._isValid = ko.computed(function () {
            return true; // TODO validate
        }, this);
        
        this.addArticle = function(article) {
            var id, 
                included;
            if (typeof article === 'string') {
                id = self.urlPath(article);
                article = new Article({id: id})
            } else { // We assume it's an Article. Check using its constructor? 
                id = article.id(); 
            }
            included = _.some(self.content(), function(item){
                return item.id() === id;
            });
            if (!included) {
                self.content.unshift(article);
                self.decorateContent();
                Common.mediator.emitEvent('models:story:haschanges');
            }
        };

        this.removeArticle = function(article) {
            var result = window.confirm("Are you sure you want to DELETE this article?");
            if (!result) return;
            self.content.remove(article);
            Common.mediator.emitEvent('models:story:haschanges');
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
                                if (ra.id && ra.webTitle) {
                                    var c = _.find(areRaw,function(a){
                                        return a.id() === ra.id;
                                    });
                                    c.webTitle(ra.webTitle);
                                    c.webPublicationDate(ra.webPublicationDate);
                                    opts.articleCache[ra.id] = ra;
                                }
                            });
                        }
                    },
                    error: function() {}
                });
            }
        };

        this.bump = function() {
            if (self.importance() > importanceDefault) {
                self.importance(importanceDefault);
            } else {
                self.importance(importanceBumped);
            }
            Common.mediator.emitEvent('models:story:haschanges');
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
            Common.mediator.emitEvent('models:story:haschanges');
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
            Common.mediator.emitEvent('models:story:haschanges');
        }

        this.urlPath = function(url) {
            var a = document.createElement('a');
            a.href = url;
            a = a.pathname + a.search;
            a = a.indexOf('/') === 0 ? a.substr(1) : a;
            return a;
        };
    };

    Event.prototype.toJSON = function() {
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

    return Event;
});
