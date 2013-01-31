curl(['models/article', 'Knockout']).then(

    function  (Article, Knockout) {

        describe('Article Model', function() {

            var article; 

            beforeEach(function() {
                article = new Article;
            });

            it('should have an id property', function() {
                expect(article.id).toBeDefined();
            });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
