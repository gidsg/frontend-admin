curl(['models/trailblock', 'Knockout']).then(

    function  (Trailblock, Knockout) {
        describe('Trailblock Model', function() {

            var trailblock;

            beforeEach(function() {
                trailblock = new Trailblock;
            });

            it('should have a type property', function() {
                expect(trailblock.type).toBeDefined();
            });

            it('type property should be set to "tag"', function() {
                expect(trailblock.type).toEqual('tag');
            });

            var observableProps = {
                'id': '',
                'title': '',
                'numItems' : '3',
                'lead': true
            };

            for (var name in observableProps) {

                it('should have property "' + name + '"', function() {
                    expect(trailblock[name]).toBeDefined();
                });

                it('"' + name + '" property should be an observable', function() {
                    expect(Knockout.isObservable(trailblock[name])).toEqual(true);
                });

                var value = observableProps[name];

                it('"' + name + '" property should be set to "' + value + '" initially', function() {
                    expect(trailblock[name]()).toEqual(value);
                });

            }

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);