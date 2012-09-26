curl(['models/trailblock', 'Knockout']).then(

    function  (Trailblock, Knockout) {

        /**
         * adding data provider pattern to jasmine - https://github.com/jphpsf/jasmine-data-provider
         */
        function using(name, values, func){
            for (var i = 0, count = values.length; i < count; i++) {
                if (Object.prototype.toString.call(values[i]) !== '[object Array]') {
                    values[i] = [values[i]];
                }
                func.apply(this, values[i]);
                jasmine.currentEnv_.currentSpec.description += ' (with "' + name + '" using ' + values[i].join(', ') + ')';
            }
        }

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
                'numItems' : 3,
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

            using('trailblock data', [{'title': 'foo'}], function(data) {
                it('update method should update trailblock with supplied data', function() {
                    trailblock.update(data);
                    for (var prop in data) {
                        expect(trailblock[prop]()).toEqual(data[prop]);
                    }
                });
            });

            it('clear method should empty all observables', function() {
                // add some data
                trailblock.update({
                    'id': 'bar',
                    'title': 'foo',
                    'numItems': 5,
                });
                // clear trialblock
                trailblock.clear();
                // make sure observables are all empty
                for (var name in observableProps) {
                    expect(trailblock[name]()).toEqual('');
                }
            });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);