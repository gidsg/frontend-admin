curl(['models/event', 'Knockout']).then(

    function  (Event, Knockout) {

        describe('Event Model', function() {

            var e; 

            beforeEach(function() {
                e = new Event;
            });

            it('should have an id property', function() {
                expect(e.id).toBeDefined();
            });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
