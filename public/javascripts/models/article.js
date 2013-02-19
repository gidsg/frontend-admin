define(['Knockout', 'Common'], function (ko, Common) {

    var Article = function(opts) {

        var opts = opts || {},
            mDotHost = 'http://m.guardian.co.uk/',
            self = this;

        this.id         = ko.observable(opts.id         || '');
        this.webTitle   = ko.observable(opts.webTitle   || '');
        this.webPublicationDate = ko.observable(opts.webPublicationDate);
        this.importance = ko.observable(opts.importance || 50);
        this.colour     = ko.observable(opts.colour);
        
        // colour is represented as a number at the moment
        this._colourAsText = ko.computed(function() {
            switch (self.colour()) {
                case 1: return 'Overview';
                case 2: return 'Background';
                case 3: return 'Analysis';
                case 4: return 'Reaction';
                case 0: return 'None';
            }
        })


        if (opts.fields)
            this.trailText  = ko.observable(opts.fields.trailText  || '');

        // Temp vars
        this._mDot      = ko.observable(mDotHost + opts.id || '');    
        this._humanDate = ko.computed(function(){
            return this.webPublicationDate() ? humanized_time_span(this.webPublicationDate()) : '-';
        }, this);

    };

    Article.prototype.toJSON = function() {
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

    return Article;
})
