define(['Knockout', 'Common', 'Reqwest'], function (ko, Common, Reqwest) {

    return function() {

        var self = this,
            deBounced;

        this.articles = ko.observableArray();
        
        this.articleTerm = ko.observable(Common.queryParams.q || '');

        // Grab articles from Content Api
        this.articleSearch = function() {
            clearTimeout(deBounced);
            deBounced = setTimeout(function(){
                var url, propName;

                if (self.articleTerm().match(/\//)) {
                    // If term contains slashes, assume it's an article id
                    url = 'http://content.guardianapis.com/';
                    url+= self.articleTerm();
                    url+= '?format=json';
                    propName = 'content';
                } else {
                    url = 'http://content.guardianapis.com/search?page-size=50&format=json&q=';
                    url+=  + encodeURIComponent(self.articleTerm());
                    propName = 'results';
                }
                console.log(propName + " " + url)

                Reqwest({
                    url: url,
                    type: 'jsonp',
                    success: function(resp) {
                        var rawArticles = resp.response && resp.response[propName] ? resp.response[propName] : [],
                            length;

                        // Make sure it's an array 
                        rawArticles = [].concat(rawArticles);
                        length = rawArticles.length;

                        self.articles.removeAll();
                        rawArticles.map(function(a){
                            var article = {
                                id: a.id,
                                webTitle: a.webTitle,
                                // If single result, default it to checked
                                checked: ko.observable(1 === length) 
                            }
                            self.articles.push(article);
                        })
                    },
                    error: function() {}
                });
            }, 250);
        };

    };
});
