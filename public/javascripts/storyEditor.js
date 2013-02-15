curl([
    'models/stories',
    'models/articles',
    'Knockout',
    'Reqwest',
    'Config',
    'Common'
]).then(function(
    Stories,
    Articles,
    ko,
    Reqwest,
    Config,
    Common
) {
    var viewModel = {},
        self = this;

    if(!Common.hasVh()) {
        //this fixes the article and event lists to the height of the viewport
        //If CSS3 vh units are not supported
        var h = (window.innerHeight - 200) + 'px';
        document.querySelector('.articles').style.maxHeight = h;
        document.querySelector('.story').style.maxHeight = h;
    }

    viewModel.articles = new Articles();
    viewModel.stories  = new Stories({articleCache: viewModel.articles.cache});
    viewModel.pendingSave = ko.observable(false);

    // Do an initial article search
    viewModel.articles.search();

    function onDragStart(event) {
        event.target.style.opacity = '0.3';  // this / e.target is the source node.
    }

    function onDragEnd(event) {
        setTimeout(function(){
            event.target.style.opacity = '1';
        }, 1000);
    }

    function onDragOver(event) {
        event.preventDefault();
        event.currentTarget.style.background = '#DFF0D8';
    }

    function onDragLeave(event) {
        event.preventDefault();
        event.currentTarget.style.background = 'inherit';  
    }

    function onDrop(event) {
        event.preventDefault();
        var id = event.dataTransfer.getData('Text');
        var el = event.currentTarget;
        var target = ko.dataFor(el);
        target.addArticle(id)

        el.style.background = '#CEE8C3';
        setTimeout(function(){
            el.style.background = 'inherit';  
        }, 1000);
    }

    ko.bindingHandlers.makeDraggable = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            element.addEventListener('dragstart', onDragStart, false);
            element.addEventListener('dragend',   onDragEnd,   false);
        }
    };

    ko.bindingHandlers.makeDropabble = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            element.addEventListener('dragover',  onDragOver,  false);
            element.addEventListener('dragleave', onDragLeave, false);
            element.addEventListener('drop',      onDrop,      false);
        }
    };

    // Binding for contentEditable - accepts html tags
    ko.bindingHandlers.htmlEditable = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            ko.utils.registerEventHandler(element, "keyup", function() {
                var modelValue = valueAccessor();
                var elementValue = element.innerHTML;
                if (ko.isWriteableObservable(modelValue)) {
                    modelValue(elementValue);
                }
                else { //handle non-observable one-way binding
                    var allBindings = allBindingsAccessor();
                    if (allBindings['_ko_property_writers'] && allBindings['_ko_property_writers'].htmlEditable) allBindings['_ko_property_writers'].htmlEditable(elementValue);
                }
            })
        },
        update: function(element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()) || "";
            if (element.innerHTML !== value) {
                element.innerHTML = value;
            } else {
                Common.mediator.emitEvent('models:story:haschanges');
            }
        }
    };

    // Binding for contentEditable - does NOT accept html tags
    ko.bindingHandlers.textEditable = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            ko.utils.registerEventHandler(element, "keyup", function() {
                element.innerHTML = Common.stripTags(element.innerHTML);
                var modelValue = valueAccessor();
                var elementValue = Common.stripTags(element.innerHTML);
                if (ko.isWriteableObservable(modelValue)) {
                    modelValue(elementValue);
                }
            })
        },
        update: function(element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()) || "";
            value = Common.stripTags(value);
            if (element.innerHTML !== value) {
                element.innerHTML = value;
            } else {
                Common.mediator.emitEvent('models:story:haschanges');
            }
        }
    };

    Common.mediator.addListener('models:story:haschanges', function(){
        viewModel.pendingSave(true)
        viewModel.stories.selected().backgroundSave();
    });

    Common.mediator.addListener('models:story:save:success', function(){
        viewModel.pendingSave(false)
    });

    // Render
    ko.applyBindings(viewModel);

});
