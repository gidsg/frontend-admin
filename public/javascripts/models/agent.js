define(['Knockout'], function (ko) {

    var Agent = function(opts) {

        var opts = opts || {};

        this.id         = ko.observable(opts.id || '');
        this.name       = ko.observable(opts.name || '');
        this.explainer  = ko.observable(opts.explainer || '');
        this.sameAs     = ko.observableArray(opts.sameAs); // TODO - We want to associate this person with a set of external identifiers (Eg, guardian tag or wikipedia url)

    };

    return Agent;
})
