curl([
    'models/events',
    'Knockout',
    'Reqwest',
    'Config',
    'Common'
]).then(function(
    Events,
    ko,
    Reqwest,
    Config,
    Common
) {

    var viewModel = {
        events: new Events(),
        sections: ko.observableArray()
    };

    ko.applyBindings(viewModel);

    // Grab section names from the Content Api
    Reqwest({
        url: 'http://content.guardianapis.com/sections',
        type: 'jsonp',
        success: function(resp) {
            viewModel.sections(resp.response && resp.response.results ? resp.response.results : []);
        },
        error: function() {
        }
    });

    // Populate article id field from query str
    if(Common.queryParams.article) {
        document.querySelector('#article').value = Common.queryParams.article;
    }

});
