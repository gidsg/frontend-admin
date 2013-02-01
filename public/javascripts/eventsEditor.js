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
        events = new Events(articles.cache),
        dragged,
        deBounced,
        self = this;

    var viewModel = {
        events: events,
        articles: articles,
        sections: ko.observableArray()
    };

    // Grab the section definitions
    Reqwest({
        url: 'http://content.guardianapis.com/sections?format=json',
        type: 'jsonp',
        success: function(resp) {
            if (resp.response) {
                var sections = resp.response.results || [];
                sections.sort(function(l,r) {
                    return l.webTitle < r.webTitle ? -1 : 1;
                })
                viewModel.sections(sections);
            }
            //viewModel.articles.sectionTerm('news');
        },
        error: function() {}
    });

    // Do an initial article search
    articles.articleSearch();

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
        event.currentTarget.style.background = '#DFF0D8';
    }

    function onDragLeave(event) {
        event.preventDefault();
        event.currentTarget.style.background = 'inherit';  
    }

    function onDrop(event) {
        var el = event.currentTarget;
        event.preventDefault();
        var target = ko.dataFor(el);
        target.addArticle(dragged)
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


    // Render
    ko.applyBindings(viewModel);

});
