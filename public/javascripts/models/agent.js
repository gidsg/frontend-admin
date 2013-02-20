define(['Knockout'], function (ko) {

    var Agent = function(opts) {

        var opts = opts || {};

        this.id         = ko.observable(opts.id || '');
        this.name       = ko.observable(opts.name || '');
        this.explainer  = ko.observable(opts.explainer || '');
        this.importance = ko.observable(opts.importance || '');
        this.picture    = ko.observable(opts.picture || '');
        this.role       = ko.observable(opts.role || ''); // Eg, 'Barrister, and inquiry Chairman'
        this.sameAs     = ko.observableArray(opts.sameAs);

    };

    return Agent;
})
