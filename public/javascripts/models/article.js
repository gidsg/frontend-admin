define(['Knockout'], function (ko) {

    var Article = function(opts) {

        opts = opts || {};

        this.id         = ko.observable(opts.id         || '');
        this.webTitle   = ko.observable(opts.webTitle   || '');
        this.importance = ko.observable(opts.importance || 30);
        this.checked    = ko.observable(opts.checked    || false);
    };

    return Article;
})
