define(["Config", "Common", "Reqwest"], function (Config, Common, Reqwest) {

    var apiEndPoint = 'http://content.guardianapis.com/',
        key = Config.apiKey;

    var search = function(response, inputElement) {
            Reqwest({
                url: apiEndPoint + inputElement.value + "?format=json&page-size=1&api-key=" + key,
                type: 'jsonp',
                success: function (json) {
                    Common.mediator.emitEvent('modules:itemsearch:success', [json.response])
                }
        })
    }

    // evaluate a response
    var validateTag = function(response) {
        if (response.hasOwnProperty('tag')) {
            Common.mediator.emitEvent('modules:tagvalidation:success');
        }
    }

    Common.mediator.addListener('modules:tagsearch:success', search);
    Common.mediator.addListener('modules:itemsearch:success', validateTag);

    return {}

});

