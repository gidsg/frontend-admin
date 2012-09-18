function Edition(id, trailblock) {
    var self = this;
    self.id = id;
    self.trailblock = ko.observable(trailblock);
}

function ViewModel() {

    var self = this;

    self.trailblocks = [
            { type: 'tag', id: 'sport/triathlon', title: "Triathlon", items: 3, lead: true },
            { type: 'tag', id: 'sport/javlin', title: "Javelin", items: 5, lead: true }
        ]
    
    self.editions = ko.observableArray([
        new Edition("uk", self.trailblocks[0]),
        new Edition("us", self.trailblocks[1])
        ]);

    self.save = function () {
        var json = JSON.stringify(ko.toJS(self.editions), null, 2);
        console.log(json); // TODO - broadcast a event 'post-to-sever'
    }
}

ko.applyBindings(new ViewModel());

