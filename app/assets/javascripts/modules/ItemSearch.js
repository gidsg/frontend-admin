define(["Config", "Common", "Reqwest"], function (Config, Common, Reqwest) {

    var apiEndPoint = 'http://content.guardianapis.com/',
        key = Config.apiKey;

    var search = function(response, tagInputElement) {
            Reqwest({
                url: apiEndPoint + $(tagInputElement).val() + "?format=json&page-size=1&api-key=" + key,
                type: 'jsonp',
                success: function (json) {
                    Common.mediator.emitEvent('modules:itemsearch:success', [json.response, tagInputElement])
                }
        })
    }

    // evaluate a response
    var validateTag = function(response, tagInputElement) {
        if (response.hasOwnProperty('tag')) {
            Common.mediator.emitEvent('modules:tagvalidation:success', [tagInputElement]);
        } else {
            Common.mediator.emitEvent('modules:tagvalidation:failure', [tagInputElement]);
        }
    }

    Common.mediator.addListener('modules:tagsearch:success', search);
    Common.mediator.addListener('ui:frontendtool:tagid:selected', search);
    Common.mediator.addListener('modules:autocomplete:selected', search);
    Common.mediator.addListener('modules:itemsearch:success', validateTag);

    return {}

});

