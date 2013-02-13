curl(['models/articles', 'Knockout']).then(

    function  (Articles, Knockout) {

        describe('Articles Model', function() {

            var articles; 

            beforeEach(function() {
                articles = new Articles;
            });

            it('should have an id property', function() {
                expect(articles).toBeDefined();
            });

            // TODO each of these should populate self.articles & self.cache
            xit('should search the Content API for a search term', function() {});
            xit('should search for an individual api item', function() {});
            xit('should filter the search by section', function() {});
            xit('should filter the search by tone ', function() {});

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
