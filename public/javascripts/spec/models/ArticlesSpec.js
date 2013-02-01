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

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
