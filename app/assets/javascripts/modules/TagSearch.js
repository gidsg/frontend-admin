define(["Config", "Common", "Reqwest"], function (Config, Common, Reqwest) {

    return {
        // dependencies
        _config: Config,
        _common: Common,
        _reqwest: Reqwest,

        _apiEndPoint: 'http://content.guardianapis.com/tags',

        init: function(opts) {

            // dependency injection
            var opts = opts || {}
            var config  = opts.config  || this._config;
            var common  = opts.common  || this._common;
            var reqwest = opts.reqwest || this._reqwest;

            var apiEndPoint = opts.apiEndPoint || this._apiEndPoint;

            common.mediator.addListener('modules:oncomplete', function () {

                // ....
                reqwest(
                    {
                        url: apiEndPoint + "?q=" + encodeURIComponent('tag') + "&format=json&page-size=50&api-key=" + config.apiKey,
                        type: 'jsonp',
                        success: function (json) {
                           common.mediator.emitEvent('modules:tagsearch:success', [json.response])
                        }
                    }
                )

            });

        }
    }

});

