define(['models/edition', 'models/trailblock', 'Knockout'], function (Edition, Trailblock, Knockout) {

	return function() {

        var self = this;

        this.editions = Knockout.observableArray();

        this.toJSON = function() {
            var data = {};
            self.editions().forEach(function(edition){

                var blocks = [];
                edition.trailblocks().forEach(function(trailblock) {
                    blocks.push(Knockout.toJS(trailblock));
                });

                data[edition.id] = {
                    'blocks': blocks
                }
            });

            return JSON.stringify(data);
        }

        // create editions, and associated trailblocks
        $.each(['us', 'uk'], function(index, editionId) {
            var edition = new Edition;
            edition.id = editionId;

            var editionConfig = frontConfig[editionId];
            if (editionConfig && editionConfig.blocks) {
                editionConfig.blocks.forEach(function (block) {
                    var trailblock = new Trailblock;
                    trailblock.update(block);
                    edition.trailblocks.push(trailblock);

                });
            }

            // need at least one trailblock
            if (edition.trailblocks().length === 0) {
                edition.trailblocks.push(new Trailblock);
            }

            self.editions.push(edition);
        });

	};

});