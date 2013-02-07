curl(['Common']).then(


    function (common) {
        
        var parser = function () {

            var q = { before: null, after: null, string: null } 

            this.parse = function (str) {
                str.match(/\b[a-z]{3,}:[a-z0-9]{4}\b/gi).forEach(function (m) {
                    var tokens = m.split(":")
                    q[tokens[0]] = tokens[1];
                });
                return q;
            }

        } 
        
        describe("ContentApiSearch", function() {
            
            it("should before", function() {

                expect(new parser().parse('before:2010')).toBe(true);
                expect(new parser().parse('before:2010 before:2012')).toBe(true);
                expect(new parser().parse('foo before:2010')).toBe(true);
                expect(new parser().parse('bar before:2010 foo')).toBe(true);
                expect(new parser().parse('bar after:2010 foo')).toBe(true);
                expect(new parser().parse('bar tone:news foo')).toBe(true);
                expect(new parser().parse('"sdafasdf" before:2010')).toBe(true);
                expect(new parser().parse('before:2010d')).toBe(null);

            });

        })
    },
    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
