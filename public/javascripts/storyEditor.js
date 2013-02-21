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
        $(event.target).css('opacity', '0.3'); 
    }

    function onDragEnd(event) {
        setTimeout(function(){
            $(event.target).css('opacity', '1');
        }, 1000);
    }

    function onDragOver(event) {
        event.preventDefault();
        $(event.currentTarget).addClass('onDragOver');
    }

    function onDragLeave(event) {
        event.preventDefault();
        $(event.currentTarget).removeClass('onDragOver');
    }

    function onDrop(event) {
        event.preventDefault();
        var id = event.dataTransfer.getData('Text');
        var el = event.currentTarget;
        var target = ko.dataFor(el);
        target.addArticle(id)
        $(el).removeClass('onDragOver');
        $(el).addClass('onDrop');
        setTimeout(function(){
            $(el).removeClass('onDrop');
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

    Common.mediator.addListener('models:story:haschanges', function(){
        if (viewModel.stories.selected()) {
            viewModel.stories.selected().backgroundSave();            
            viewModel.pendingSave(true)
        }
    });

    Common.mediator.addListener('models:story:save:success', function(){
        viewModel.pendingSave(false)
    });

    // Render
    ko.applyBindings(viewModel);

});
