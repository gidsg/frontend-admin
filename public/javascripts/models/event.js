define(['models/article', 'Knockout', 'Config', 'Common', 'Reqwest'], function (Article, ko, Config, Common, Reqwest) {

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

        this.importance  = ko.observable();
        this.id          = ko.observable();

        // listen out for changes to content array and generate a content api
        this.content.subscribe(function(content){
            var apiHost = "http://content.guardianapis.com/search",
                query = "?page-size=50&format=json&show-fields=all&show-tags=all&show-factboxes=all&show-media=all&show-references=all&api-key=" + Config.apiKey + "&ids="
                apiUrl = apiHost + query + content.map( function (article) {
                    return encodeURIComponent(article.id())
            }).join(',')
            self._contentApi(apiUrl);
        });
        
        // Administrative vars
        this._parentId    = ko.observable();
        this._parentTitle = ko.observable();
        this._contentApi  = ko.observable();
        this._tentative   = ko.observable(!opts || !opts.id); // No id means it's a new un-persisted event,
        this._editing     = ko.observable(this._tentative()); // so mark as editable
        this._hasNewArticle = ko.observable();

        this.init = function (o) {
            o = o || {};

            self.content.removeAll();
            (o.content || []).map(function(a){
                var cached = opts.articleCache[a.id];
                if (cached) {
                    cached.importance = a.importance;
                    a = cached;
                }
                self.content.push(new Article(a));
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
            
            if (o.parent) {
                this._parentId(o.parent.id) 
                this._parentTitle(o.parent.title) 
            } else {
                this._parentId(undefined)
                this._parentTitle(undefined)
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
                return (
                    this.title().length > 0
                );
            }, this);

        }

        this.addArticle = function(article) {
            var included = _.some(self.content(), function(item){
                return item.id() === article.id()
            });
            if (!included) {
                self.content.unshift(article);
                this.backgroundSave();
            }
        };

        this.removeArticle = function(article) {
            self.content.remove(article);
            self.backgroundSave();
        };

        this.decorateContent = function() {
            var apiUrl = "http://content.guardianapis.com/search";
            // Find articles that aren't yet decorated with API data..
            var areRaw = _.filter(self.content(), function(a){return ! a.webTitle()});
            // and grab them from the API
            if(areRaw.length) {                    
                apiUrl += "?page-size=50&format=json&show-fields=all&show-tags=all&show-factboxes=all&show-media=all&show-references=all&api-key=" + Config.apiKey;
                apiUrl += "&ids=" + areRaw.map(function(article){
                    return encodeURIComponent(article.id())
                }).join(',');

                Reqwest({
                    url: apiUrl,
                    type: 'jsonp',
                    success: function(resp) {
                        if (resp.response && resp.response.results) {
                            resp = resp.response.results;
                            resp.map(function(ra){
                                var c = _.find(areRaw,function(a){return a.id() === ra.id});
                                c.webTitle(ra.webTitle);
                                c.webPublicationDate(ra.webPublicationDate);
                                opts.articleCache[ra.id] = ra;
                            })
                        }
                    },
                    error: function() {}
                });
            }
        };

        this.save =  function(a) {
            // We post to the 'old' id
            var url = endpoint + (self._tentative() ? '' : '/' + self.id());

            // ..but we generate the posted id, as the user may have edited the slug, date, etc.
            self.id(self.generateId());

            /*
            this.content.sort(function (left, right) {
                return (left.id() < right.id()) ? -1 : 1
            })
            */

            console.log('SENT:')
            console.log(JSON.stringify(self) + "\n\n")

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
                    // Get UI stuff from api/cache
                    self.decorateContent();
                    // Mark event as real
                    self._tentative(false);
                    // Stop editing
                    self._editing(false);
                    Common.mediator.emitEvent('models:event:save:success', [resp]);
                },
                error: function() {
                    Common.mediator.emitEvent('models:event:save:error');
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

    function slugify (str) {
        str = str
            .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'')
            .replace(/\s+/g,' ')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-'); // unfair on utf-8 IMHO
        return str;
    }

    return Event;
})
