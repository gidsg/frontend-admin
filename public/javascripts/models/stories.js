define(['models/story', 'Config', 'Knockout', 'Common', 'Reqwest'], function (Story, Config, ko, Common, Reqwest) {

    var Stories = function(opts) {
        var endpoint = '/story',
            self = this;

        this.stories = ko.observableArray();

        // Temporary
        this.selected = ko.observable();

        this.length = ko.computed(function(){
            return this.stories().length;
        }, this)

        // Update share counts etc when story is selected
        this.selected.subscribe(function(){
            var now = new Date(),
                i = 0;
            if(this.selected()) {
                this.selected().events().map(function(e){
                    e.content().map(function(article){
                        var t = i;
                        var then = article.sharedCountTime ? new Date(article.sharedCountTime) : false;
                        // TODO: filter out old articles by webPublicatiobDate
                        if(!then || (now.getTime() - then.getTime()) > 0) { // 300000 ms === 5 minutes
                            setTimeout(function(){ self.addShareCount(article); }, t*100);
                            i += 1;                        
                        }
                    });
                });
            }
        }, this);

        this.addShareCount = function(article) {
            var url = 'http://www.guardian.co.uk/' + article.id();
            Reqwest({
                url: 'http://api.sharedcount.com/?url=' + encodeURIComponent(url),
                type: 'jsonp',
                success: function(resp) {
                    console.log("Received sharedCount for: " + url);
                    article.sharedCountValue(self.sumNumericProps(resp));
                    article.sharedCountTakenAt(new Date());
                    Common.mediator.emitEvent('models:story:haschanges');
                }
            });            
        };

        this.sumNumericProps = function(obj) {
            return _.reduce(obj, function(sum, p){
                if (typeof p === 'object' && p) {
                    return sum + self.sumNumericProps(p);
                } else {
                    return sum + (typeof p === 'number' ? p : 0);
                }
            }, 0);
        }

        this.loadStory = function(o) {
            var story;
            o = o || {_tentative: true};
            o.articleCache = opts.articleCache;
            story = new Story(o);
            self.stories.unshift(story);
            return story; 
        };

        this.loadSelectedStory = function(o) {
            var story;
            this.stories.remove(this.selected());
            o = o || {};
            o.articleCache = opts.articleCache;
            story = new Story(o);
            self.stories.unshift(story);
            this.selected(story);
            return story; 
        };

        this.setSelected = function(story) {
            self.selected(story);
            story._selected(false) // Confusing names. change to _selectedEvent() etc.
            return story;
        };

        this.clearSelected = function(story) {
            var doIt = story._tentative() ? self.deleteSelected(story) : true;
            if (doIt) {
                window.location.href = '/events';
            }
        };

        this.createStory = function() {
            self.setSelected(self.loadStory());
        };

        this.deleteSelected = function(story){            
            var doIt = window.confirm("Permanently delete this story?");
            if (doIt) {
                self.selected().delete();
                self.selected(false);
                self.stories.remove(story);
            }
            return doIt;
        };

        this.cancelEditing = function(story) {
            story._editing(false);
            if (story._tentative()) {
                self.stories.remove(story);
                self.selected(false);
            }
        }

        this.loadStories = function() {
            Reqwest({
                url: '/story',
                type: 'json',
                success: function(resp) {
                    self.stories.removeAll();
                    resp.map(function(s){
                        self.loadStory(s);
                    });
                },
                error: function() {}
            });
        };
    };

    return Stories;
});
