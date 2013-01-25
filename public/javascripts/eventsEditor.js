curl([
    'models/events',
    'models/articles',
    'Knockout',
    'Reqwest',
    'Config',
    'Common'
]).then(function(
    Events,
    Articles,
    ko,
    Reqwest,
    Config,
    Common
) {
    var 
        articles = new Articles(),
        events = new Events(articles.articles()),
        dragged,
        deBounced;

    var viewModel = {
        events: events,
        articles: articles,
        sections: ko.observableArray()
    };

    // Do an initial article search
    articles.articleSearch();

    // Grab events
    Reqwest({
        url: '/events/list',
        type: 'json',
        success: function(resp) {
            resp.map(function(event){
                viewModel.events.loadEvent(event);
            });
        },
        error: function() {}
    });

    function onDragStart(event) {
        event.dataTransfer.setData('article', '1');
        event.target.style.opacity = '0.3';  // this / e.target is the source node.
        dragged = ko.dataFor(event.target);
    }

    function onDragEnd(event) {
        setTimeout(function(){
            event.target.style.opacity = '1';
        }, 1000);
        dragged = false;
    }

    function onDragOver(event) {
        event.preventDefault();
        event.currentTarget.style.background = '#EEE';
    }

    function onDragLeave(event) {
        event.preventDefault();
        event.currentTarget.style.background = '#fff';  
    }

    function onDrop(event) {
        var el = event.currentTarget;
        event.preventDefault();
        var target = ko.dataFor(el);
        target.addContent(dragged)
        el.style.background = '#FCF8E3';
        setTimeout(function(){
            el.style.background = '#fff';  
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


    // Render
    ko.applyBindings(viewModel);

});
