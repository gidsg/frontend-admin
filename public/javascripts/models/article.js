define(['Knockout'], function (ko) {

    var Article = function(opts) {

        var opts = opts || {},
            mDotHost = 'http://m.guardian.co.uk/';

        this.id         = ko.observable(opts.id         || '');
        this.mDot       = ko.observable(mDotHost + opts.id || '');
        this.webTitle   = ko.observable(opts.webTitle   || '');
        this.webPublicationDate = ko.observable(opts.webPublicationDate);
        this.importance = ko.observable(opts.importance || 50);
        this.colour     = ko.observable(opts.colour);

        if (opts.fields)
            this.trailText  = ko.observable(opts.fields.trailText  || '');
    
        this._humanDate = ko.computed(function(){
            return humanized_time_span(this.webPublicationDate());
        }, this);

    };

    return Article;
})
