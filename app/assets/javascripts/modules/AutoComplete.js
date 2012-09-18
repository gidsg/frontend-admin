define(["Common"], function (Common) {

    var view = {
           
        results: function() {
        }

    }

    var container = '<ul class="dropdown-menu">%s</ul>'
      , item = '<li>%s</li>';

    Common.mediator.addListener('modules:tagsearch:success', function(search) {
         
         var results = search.results.splice(0,10).map(function(result){
             return item.replace('%s', result.id);
         })

         console.log(results);

          

         //var html = container.replace('%s', foo);
         // console.log(html);

         //document.getElementById("auto").innerHTML = html;
    })

    return {}

});

