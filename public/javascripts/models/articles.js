define(['models/article', 'Knockout', 'Common', 'Reqwest'], function (Article, ko, Common, Reqwest) {

    return function() {

        var self = this,
            deBounced;

        this.articles = ko.observableArray();

        this.articleTerm = ko.observable(Common.queryParams.q || '');
        this.sectionTerm = ko.observable();
        this.toneNews    = ko.observable();

        this.cache = {};

        // Grab articles from Content Api
        this.articleSearch = function() {
            clearTimeout(deBounced);
            deBounced = setTimeout(function(){
                
                var url, propName;

                // If term contains slashes, assume it's an article id
                if (self.articleTerm().match(/\//)) {
                    var url = '/api/proxy/' + self.articleTerm() + '?show-fields=all&format=json';
                    propName = 'content';
                } else {
                    url  = '/api/proxy/search?show-fields=all&page-size=50&format=json&q=';
                    url += encodeURIComponent(self.articleTerm());
                    url += self.sectionTerm() ? '&section=' + encodeURIComponent(self.sectionTerm()) : '';
                    url += self.toneNews() ? '&tag=tone%2Fnews' : '';
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
                            self.cache[a.id] = a;
                        })
                    },
                    error: function() {}
                });
            }, 250);
            
            return true; // ensure default click happens on all the bindings
        };

    };
});


