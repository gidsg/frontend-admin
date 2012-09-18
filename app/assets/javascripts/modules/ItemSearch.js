define(["Config", "Common", "Reqwest"], function (Config, Common, Reqwest) {

    var apiEndPoint = 'http://content.guardianapis.com/',
        key = Config.apiKey;

   
    // view
    

    // model
    
    var foo = {

        search: function(tag) {
        
            var tag = search.results[0].id;
            
            Reqwest({
                url: apiEndPoint + tag + "?format=json&page-size=50&api-key=" + key,
                type: 'jsonp',
                success: function (json) {
                    Common.mediator.emitEvent('modules:itemsearch:success', [json.response])
                }
            })
        }

    }

    Common.mediator.addListener('modules:tagsearch:success', search);
    Common.mediator.addListener('modules:itemsearch:success', function (results) {
        console.log(results);
        });

    return {}

});

