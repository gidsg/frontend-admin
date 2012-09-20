define(["Common"], function (Common) {

    var view = {
        results: function() {
        }
    }

    $('#autocomplete').hide();
    
    Common.mediator.addListener('ui:autocomplete:keydown', function(tag) {
        $('.dropdown-menu').hide();
        $('.dropdown-menu').empty();
    });
    
    //
    Common.mediator.addListener('modules:autocomplete:selected', function(tag) {
        $('.dropdown-menu').hide();
        $('.dropdown-menu').empty();
    });
    
    var container = '<ul class="dropdown-menu">%s</ul>'
      , item = '<li><a href="#" data-id="%s">%s</a></li>';

    $('#autocomplete').click(function (e) {
        var id = e.target.getAttribute('data-id');
        Common.mediator.emitEvent('modules:autocomplete:selected', [id]);
        e.preventDefault();
    })

    Common.mediator.addListener('modules:tagsearch:success', function(search) {
         
         var results = search.results.splice(0,10).map(function (result) {
             return item.replace(/\%s/gi, result.id);
         })

         if (results.length > 0) {
            $('#autocomplete').show();
         } else {
            $('#autocomplete').hide();
         }

          // else ?

         var html = container.replace("%s", results.join(''), "gm");
         document.getElementById("autocomplete").innerHTML = html;


    })

    return {}

});

