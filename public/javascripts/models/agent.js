define(['Knockout'], function (ko) {

    var Agent = function(opts) {

        var opts = opts || {};

        this.id         = ko.observable(opts.id || '');
        this.name       = ko.observable(opts.name || '');
        this.role       = ko.observable(opts.role || '');
        this.sameAs     = ko.observableArray(); // TODO 

    };

    return Agent;
})
