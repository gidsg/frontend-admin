define([
    'models/editable',
    'models/quote',
    'Knockout',
    'Common',
    'Reqwest'
], 
function (
    Editable,
    Quote,
    ko,
    Common,
    Reqwest
){

    var mDotHost = 'http://m.guardian.co.uk/';

    var Article = function(opts) {

        var opts = opts || {},
            self = this;

        this.id         = ko.observable(opts.id || '');
        this.shortId    = ko.observable(opts.shortId || '');
        this.webTitle   = ko.observable(opts.webTitle || '');
        this.webPublicationDate = ko.observable(opts.webPublicationDate);
        this.importance = ko.observable(opts.importance || 50);
        this.colour     = ko.observable(opts.colour);

        if (opts.fields) {
            this.trailText  = ko.observable(opts.fields.trailText || '');
        }

        this.quote  = ko.observable(opts.quote ? new Quote(opts.quote) : '');

        // Performance stats
        this._commentCountValue   = ko.observable(0);
        this._commentCountTakenAt = ko.observable(0);
        this._sharedCountValue   = ko.observable(0);
        this._sharedCountTakenAt = ko.observable(0);
        if (opts.performance) {
            opts.performance.map(function(p){
                switch(p.name) {
                    case 'shared-count':
                        self._sharedCountValue(p.value);
                        self._sharedCountTakenAt(p.takenAt);
                        break;
                    case 'comment-count':
                        self._commentCountValue(p.value);
                        self._commentCountTakenAt(p.takenAt);
                        break;
                }
            });        
        }
        this.performance = ko.computed(function(){
            var perf = [];
            if (this._sharedCountTakenAt()) {
                perf.push({
                    name: 'shared-count',
                    value: this._sharedCountValue(),
                    takenAt: this._sharedCountTakenAt() 
                });                
            }
            if (this._commentCountTakenAt()) {
                perf.push({
                    name: 'comment-count',
                    value: this._commentCountValue(),
                    takenAt: this._commentCountTakenAt() 
                });                
            }
            return perf;
        }, this);

        // Temp vars
        this._mDot      = ko.observable(mDotHost + opts.id || '');    
        this._humanDate = ko.computed(function(){
            return this.webPublicationDate() ? humanized_time_span(this.webPublicationDate()) : '-';
        }, this);

        // colour is represented as a number at the moment
        this._colourAsText = ko.computed(function() {
            switch (this.colour()) {
                case 1: return 'Overview';
                case 2: return 'Background';
                case 3: return 'Analysis';
                case 4: return 'Reaction';
                case 5: return 'Light';
                case 0: return '';
            }
        }, this);

        // Track for editability / saving
        this._makeEditable(['importance', 'colour']);
    };

    Article.prototype = new Editable();

    Article.prototype.addSharedCount = function() {
        var url = encodeURIComponent('http://api.sharedcount.com/?url=http://www.guardian.co.uk/' + this.id()),
            self = this;
        Reqwest({
            url: '/jsonp/proxy/' + url,
            type: 'jsonp',
            success: function(resp) {
                self._sharedCountValue(self.sumNumericProps(resp));
                self._sharedCountTakenAt(new Date());
                Common.mediator.emitEvent('models:article:sharecount:received');
                Common.mediator.emitEvent('models:story:haschanges');
            }
        });            
    };

    Article.prototype.addCommentCount = function() {
        var url,
            self = this;
        if(this.shortId()){
            Reqwest({
                url: 'http://discussion.guardianapis.com/discussion-api/discussion/p/' + this.shortId() + '/comments/count',
                type: 'jsonp',
                success: function(resp) {
                    self._sharedCountValue(self.sumNumericProps(resp));
                    self._sharedCountTakenAt(new Date());
                    Common.mediator.emitEvent('models:article:sharecount:received');
                    Common.mediator.emitEvent('models:story:haschanges');
                }
            });            
        }    
    };

    Article.prototype.sumNumericProps = function sumNumericProps(obj) {
        var self = this;
        return _.reduce(obj, function(sum, p){
            if (typeof p === 'object' && p) {
                return sum + self.sumNumericProps(p);
            } else {
                return sum + (typeof p === 'number' ? p : 0);
            }
        }, 0);
    };

    Article.prototype.setColour = function(item, e) {
        var colour = parseInt($(e.target).data('tone') || 0, 10);
        this.colour(colour === item.colour() ? 0 : colour);
    };

    Article.prototype.addQuote = function() {
        this.quote(new Quote());
    };

    Article.prototype.deleteQuote = function() {
        if (!window.confirm("Are you sure you want to DELETE the quote?")) return;
        this.quote(undefined);
        Common.mediator.emitEvent('models:story:haschanges');
    };

    return Article;
});
