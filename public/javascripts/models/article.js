define(['models/editable', 'models/quote', 'Knockout', 'Common'], function (Editable, Quote, ko, Common) {

    var mDotHost = 'http://m.guardian.co.uk/';

    var Article = function(opts) {

        var opts = opts || {},
            self = this;

        this.id         = ko.observable(opts.id || '');
        this.webTitle   = ko.observable(opts.webTitle || '');
        this.webPublicationDate = ko.observable(opts.webPublicationDate);
        this.importance = ko.observable(opts.importance || 50);
        this.colour     = ko.observable(opts.colour);

        this.sharedCount     = opts.sharedCount || 0;
        this.sharedCountTime = opts.sharedCountTime || 0;

        if (opts.fields) {
            this.trailText  = ko.observable(opts.fields.trailText || '');
        }

        this.quote  = ko.observable(opts.quote ? new Quote(opts.quote) : '');

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
