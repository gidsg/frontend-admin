define(['Knockout', 'Common'], function (ko, Common) {

    var Article = function(opts) {

        var opts = opts || {},
            mDotHost = 'http://m.guardian.co.uk/';

        this.id         = ko.observable(opts.id         || '');
        this.webTitle   = ko.observable(opts.webTitle   || '');
        this.webPublicationDate = ko.observable(opts.webPublicationDate);
        this.importance = ko.observable(opts.importance || 50);
        this.colour     = ko.observable(opts.colour);

        this.tone       = ko.observable(opts.tone);
        this.tone.subscribe(function(val){
            Common.mediator.emitEvent('models:story:haschanges');
        });


        if (opts.fields)
            this.trailText  = ko.observable(opts.fields.trailText  || '');

        // Temp vars
        this._mDot      = ko.observable(mDotHost + opts.id || '');    
        this._humanDate = ko.computed(function(){
            return humanized_time_span(this.webPublicationDate());
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
