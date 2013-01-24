define(['Knockout'], function (ko) {

    var Article = function(opts) {

        opts = opts || {};

        this.id         = ko.observable(opts.id         || '');
        this.webTitle   = ko.observable(opts.webTitle   || '');
        this.webPublicationDate = ko.observable(opts.webPublicationDate || '');
        this.importance = ko.observable(opts.importance || 30);
        this.checked    = ko.observable(opts.checked    || false);
        if (opts.fields)
            this.trailText  = ko.observable(opts.fields.trailText  || '');
        // TODO ask what is useful here, how to people find things in the content api?
    };

    return Article;
})
