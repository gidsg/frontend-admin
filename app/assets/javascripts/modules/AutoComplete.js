define(["Common"], function (Common) {

    Common.mediator.addListener('modules:tagsearch:success', function(search) {
         search.results.forEach(function(result){
            console.log(result.id);
         })
    })

    return {}

});

