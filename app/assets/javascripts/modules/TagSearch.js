define(["Config", "Common", "Reqwest"], function (Config, Common, Reqwest) {

    var apiEndPoint = 'http://content.guardianapis.com/tags',
        key = Config.apiKey;

    var foo = function () {
    
        // ....
        Reqwest({
            url: apiEndPoint + "?q=" + encodeURIComponent(tag) + "&format=json&page-size=50&api-key=" + key,
            type: 'jsonp',
            success: function (json) {
                Common.mediator.emitEvent('modules:tagsearch:success', [json.response])
            }
        })

    } 

    Common.mediator.addListener('modules:oncomplete', foo);

    return {}

});

