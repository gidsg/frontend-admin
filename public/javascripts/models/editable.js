define(['Knockout', 'Common'], function (ko, Common) {

    var Editable = function() {

        var self = this;

        // Generate boolean observables to denote editable states
        this._makeEditable = function (props) {        
            for(var i = 0; i < props.length; i++) {
                var prop = props[i];
                if(this.hasOwnProperty(prop) && this[prop].subscribe) {
                    this['_editing_' + prop] = ko.observable();
                    this[prop].subscribe(function(value) {
                        Common.mediator.emitEvent('models:story:haschanges')
                    });
                }
            }
        };

        // Generic edit function. Looks for data-edit attribute inorder to which own property should become editable  
        this._edit = function(item, e) {
            var prop = $(e.target).data('edit');
            this['_editing_' + prop](true);
        };
    };

    return Editable;
});
