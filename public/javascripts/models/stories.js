define(['models/story', 'Knockout', 'Common', 'Reqwest'], function (Story, ko, Common, Reqwest) {

    var Stories = function(opts) {
        var endpoint = '/story',
            self = this;

        this.stories = ko.observableArray();

        // Temporary
        this.selected = ko.observable();

        this.length = ko.computed(function(){
            return this.stories().length;
        }, this)

        this.loadStory = function(o) {
            var story;
            o = o || {_tentative: true};
            o.articleCache = opts.articleCache;
            story = new Story(o);
            self.stories.push(story);
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
                self.selected(false);
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

        // Grab stories
        Reqwest({
            url: '/story',
            type: 'json',
            success: function(resp) {
                resp.map(function(s){
                    self.loadStory(s);
                });
            },
            error: function() {}
        });
    };

    return Stories;
});
