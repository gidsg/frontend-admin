define(['models/article', 'Knockout', 'Common', 'Reqwest'], function (Article, ko, Common, Reqwest) {

    return function() {

        var self = this,
            deBounced,
            apiHost = 'http://content.guardianapis.com/',
            apiParams = {
                'show-fields': 'all',
                'page-size': 50,
                'format': 'json'
            };

        this.articles = ko.observableArray();
        this.articleTerm = ko.observable(Common.queryParams.q || '');
        this.makeUrl = function () {
            var queryString = Object.keys(this.apiParams).map(function (key) {
                return [key, this.apiParams[key]].join('=')
            }).join('&')
            return this.apiHost + queryString
        }

        // Grab articles from Content Api
        this.articleSearch = function() {
            clearTimeout(deBounced);
            deBounced = setTimeout(function(){
                
                var url, propName;

                // If term contains slashes, assume it's an article id
                if (self.articleTerm().match(/\//)) {
                    var url = apiHost + self.articleTerm() + '?show-fields=all&format=json';
                    propName = 'content';
                } else {
                    url = 'http://content.guardianapis.com/search?show-fields=all&page-size=50&format=json&q=';
                    url+= encodeURIComponent(self.articleTerm());
                    propName = 'results';
                }

                Reqwest({
                    url: url,
                    type: 'jsonp',
                    success: function(resp) {
                        var rawArticles = resp.response && resp.response[propName] ? resp.response[propName] : [];

                        // Make sure it's an array 
                        rawArticles = [].concat(rawArticles);

                        self.articles.removeAll();
                        rawArticles.map(function(a){
                            self.articles.push(new Article(a));
                        })
                    },
                    error: function() {}
                });
            }, 250);
        };

    };
});
