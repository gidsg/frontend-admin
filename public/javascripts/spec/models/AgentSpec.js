curl(['models/agent', 'Knockout']).then(

    function  (Agent, Knockout) {

        describe('Agent Model', function() {

            var agent; 

            beforeEach(function() {
                agent = new Agent();
            });

            it('should have an id property', function() {
                expect(agent.id).toBeDefined();
            });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
