define(['Knockout'], function (ko) {

    var Article = function(opts) {

        opts = opts || {};

        this.id         = ko.observable(opts.id         || '');
        this.webTitle   = ko.observable(opts.webTitle   || '');
        this.webPublicationDate = ko.observable(opts.webPublicationDate || '');
        this.importance = ko.observable(opts.importance || 50);
        this.checked    = ko.observable(opts.checked    || false);
        if (opts.fields)
            this.trailText  = ko.observable(opts.fields.trailText  || '');
    };

    return Article;
})
