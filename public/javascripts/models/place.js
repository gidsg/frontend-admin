define(['Knockout'], function (ko) {

    var Place = function(opts) {

        var opts = opts || {};

        this.id         = ko.observable(opts.id || '');
        this.sameAs     = ko.observableArray(opts.sameAs);

    };

    return Place;
})
