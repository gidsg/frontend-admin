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
        deBounced;

    var viewModel = {
        events: events,
        articles: articles,
        sections: ko.observableArray()
    };

    // Do an initial article search
    articles.articleSearch();

    // Grab section names from the Content Api
    Reqwest({
        url: 'http://content.guardianapis.com/sections',
        type: 'jsonp',
        success: function(resp) {
            viewModel.sections(resp.response && resp.response.results ? resp.response.results : []);
        },
        error: function() {}
    });

    // Grab events
    Reqwest({
        url: '/stories/event/list',
        type: 'json',
        success: function(resp) {
            resp.events = resp.events || [];
            resp.events.map(function(event){
                viewModel.events.loadEvent(event);
            });
        },
        error: function() {}
    });

    // Render
    ko.applyBindings(viewModel);
});
