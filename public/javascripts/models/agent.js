define(['models/editable', 'Knockout', 'Common'], function (Editable,  ko, Common) {

    var Agent = function(opts) {

        var opts = opts || {},
            self = this;

        this.id         = ko.observable(opts.id);
        this.name       = ko.observable(opts.name);
        this.explainer  = ko.observable(opts.explainer);
        this.importance = ko.observable(opts.importance);
        this.role       = ko.observable(opts.role); // Eg, 'Barrister, and inquiry Chairman'
        this.picture    = ko.observable(opts.picture);
        this.rdfType    = opts.rdfType || 'http://schema.org/Person';

        // Make these editable inline 
        this._makeEditable(['name', 'explainer', 'role', 'picture']);

        this.bump = function() {
            self.importance(self.importance() ? 0 : 1);
        };
    };

    Agent.prototype = new Editable();

    return Agent;
})
