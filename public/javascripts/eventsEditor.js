curl([
    'models/events',
    'Knockout',
    'Config',
    'Common'
]).then(function(
    Events,
    Knockout,
    Config,
    Common
) {

    Knockout.applyBindings({
        events: new Events()
    });

    if(Common.queryParams.article) {
        document.querySelector('#article').value = Common.queryParams.article;
    }

});
