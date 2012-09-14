define(["Config", "Common", "Reqwest"], function (Config, Common, Reqwest) {

    var apiHost = 'http://content.guardianapis.com',
        key = Config.apiKey;

    Common.mediator.addListener('go!', function() {
        console.log(1);
    });
    
    Common.mediator.addListener('modules:oncomplete', function(tag) {
        Reqwest({
            url: apiHost + "/tags?q=" + encodeURIComponent(tag) + "&format=json&page-size=50&api-key=" + key,
            type: 'jsonp',
            success: function (json) {
                Common.mediator.emitEvent('modules:tagsearch:success', [json.response])
            }
        })
    });

    return {}

});

