curl(['models/place', 'Knockout']).then(

    function  (Place, Knockout) {

        describe('Place Model', function() {

            var place; 

            beforeEach(function() {
                place = new Place;
            });

            it('should have an id property', function() {
                expect(place.id).toBeDefined();
            });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
