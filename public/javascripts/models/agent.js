define(['Knockout', 'Common'], function (ko, Common) {

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

        // Generate boolean observables to denote editable states
        for(var prop in this) {
            if(this.hasOwnProperty(prop) && this[prop].subscribe) {
                this['_editing_' + prop] = ko.observable(opts._tentative);
                this[prop].subscribe(function(value) {
                    Common.mediator.emitEvent('models:story:haschanges')
                });
            }
        }

        // Generic edit function. A data-edit attribute states which property should become editable  
        this._edit = function(item, e) {
            var prop = e.srcElement.getAttribute('data-edit');
            this['_editing_' + prop](true);
        };

        this.bump = function() {
            self.importance(self.importance() ? 0 : 1);
        };
    };

    return Agent;
})
