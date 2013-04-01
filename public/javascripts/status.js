curl(['graphite'])
    .then(function(graphite) {

        var qs = {};

        window.location.search.substring(1).split('&').forEach(function(q){
                        var p = q.split('=')
                        qs[p[0]] = p[1]
                    })

        var lastRefresh = new Date(),
            build_p35 = $('#buildStatus.p35'),
            build_p41 = $('#buildStatus.p41'),
            teamCityBuilds = []
            from = qs.from || '-3hours';

        var getBuildStatus = function(id) {
            $.ajax( { url: '/teamcity/proxy/app/rest/buildTypes/'+id+'/builds',
                    success: function(d) {
                        var lastBuild = d.build[0];
                        (function(url){
                            $('#' + id)
                                .removeClass()
                                .addClass(lastBuild.status.toLowerCase())
                                .click(function() {
                                        window.open(url, "_blank");
                                })
                        })(lastBuild.webUrl)
                    },
                    timeout: 5000
            })
        }

        var getBuilds = function(id, dom) {
            $.ajax( { url: '/teamcity/proxy/app/rest/projects/id:' + id,
                      success: function(d) {
                        
                        var teamCityBuilds = d.buildTypes.buildType.map(function(bt){
                            return { id: bt.id, name: bt.name } 
                        });

                        // create status markers
                        teamCityBuilds.forEach(function(build){
                            getBuildStatus(build.id)
                            $('<div/>').attr('id', build.id).text(build.name).appendTo(dom)
                        })
        
                        window.setInterval(function() {
                            console.log('refreshing build statuses ' + id)
                            teamCityBuilds.forEach(function(build){
                                getBuildStatus(build.id)
                            })
                            refreshDate();
                        }, 30000);
                       
                    },
                    timeout: 5000
                })
        }

        var refreshDate = function() {
            document.querySelector('#last-refresh').innerHTML = Math.floor((new Date() - lastRefresh) / 1000) + ' seconds ago'
        };

        getBuilds('project35', build_p35)
        getBuilds('project41', build_p41)

        // convert Graphite datapoints to something Rickshaw understands  
        var graphiteJsonToRickshaw = function(d) {
            return d.map( function(i) {
                return { name: i.target, data: i.datapoints.map(function(dd, i) {
                    return { x: dd[1], y: dd[0] }
                    })
                }
            })
        };
        
        // factory for Richshaw ajax requests
        Rickshaw.Graph.JSONP.Static = Rickshaw.Class.create( Rickshaw.Graph.JSONP, {

            request: function() {
                $.ajax( { url: this.dataURL,
                    success: this.success.bind(this),
                    error: this.error.bind(this),
                    dataType: 'jsonp',
                    timeout: 5000,
                    jsonpCallback: 'callback'
                } );
            }
         });

        // ** request durations 
        ['article', 'front', 'section', 'tag', 'gallery', 'football', 'video'].forEach(function(server){
            
            var g = new graphite.client({ host: 'http://graphite.guprod.gnl/render', from: from })
              , tag = 'ganglia.GU-PROD-Frontend.frontend-'+server+'_*.*.gu_request_duration_performance_time-frontend-'+server+'.sum';
            
            g.targets.push(new graphite.target(tag)
                                 .exclude('__SummaryInfo__')
                                 .averageSeries()
                                 .alias('duration')
                                 .toQueryString()
                                 )

            g.targets.push(new graphite.target(tag)
                                 .exclude('__SummaryInfo__')
                                 .averageSeries()
                                 .movingAverage(50)
                                 .alias('moving')
                                 .toQueryString()
                                 )


            var jsonpGraph = new Rickshaw.Graph.JSONP.Static( {
                element: document.getElementById('request-duration-'+server),
                width: 320, 
                height: 50, 
                renderer: 'line',
                dataURL: g.toUrl(),
                onData: graphiteJsonToRickshaw,
                series: [ { 
                        name: 'duration',
                        color: '#1E90FF'
                    }, {
                        name: 'moving',
                        color: '#999'
                    }]  
                });
        
            (function(g) {
                window.setInterval(function() {
                    g.request()
                }, 15000)})(jsonpGraph);

        });

        // ** server errors 
        var e = new graphite.client({ host: 'http://graphite.guprod.gnl/render', from: from });
        e.targets = [
            'ganglia.GU-PROD-Frontend.frontend-*_*.*.gu_50x_error_request_status_rate-frontend-*.sum'
            ].map(function(tag){
                return new graphite.target(tag)
                             .exclude('__SummaryInfo__')
                             .averageSeries()
                             .alias(/gu_([^_]+)/.exec(tag)[1])
                             .toQueryString()
            })
          
        e.targets.push(
                  new graphite.target('ganglia.GU-PROD-Frontend.frontend-*_*.*.gu_50x_error_request_status_rate-frontend-*.sum')
                             .exclude('__SummaryInfo__')
                             .movingAverage(50)
                             .averageSeries()
                             .alias('moving')
                             .toQueryString()
            )

         var jsonpServerErrorsGraph = new Rickshaw.Graph.JSONP.Static( {

            element: document.getElementById("server-errors"),
            width: window.getComputedStyle(document.getElementById('col2'),null).getPropertyValue("width") * 0.9,
            height: 50,
            renderer: 'line',
            dataURL: e.toUrl(),
            onData: graphiteJsonToRickshaw,
            series: [
                {
                    name: '50x',
                    color: '#cf171f'
                }, {
                    name: 'moving',
                    color: '#999'
                }

            ]
        } );
        
        // ** client errors 
        var e = new graphite.client({ host: 'http://graphite.guprod.gnl/render', from: from });
        e.targets = [
            'ganglia.GU-PROD-Frontend.frontend-diagnostics_*.*.gu_js_diagnostics_rate-frontend-diagnostics.sum',
            ].map(function(tag){
                return new graphite.target(tag)
                             .exclude('__SummaryInfo__')
                             .averageSeries()
                             .alias(/gu_([^_]+)/.exec(tag)[1])
                             .toQueryString()
            })
        
          e.targets.push(
                  new graphite.target('ganglia.GU-PROD-Frontend.frontend-diagnostics_*.*.gu_js_diagnostics_rate-frontend-diagnostics.sum')
                             .exclude('__SummaryInfo__')
                             .movingAverage(50)
                             .averageSeries()
                             .alias('moving')
                             .toQueryString()
            )

         var jsonpClientErrorsGraph = new Rickshaw.Graph.JSONP.Static( {

            element: document.getElementById("client-errors"),
            width: window.getComputedStyle(document.getElementById('col2'),null).getPropertyValue("width") * 0.9,
            height: 50,
            renderer: 'line',
            dataURL: e.toUrl(),
            onData: graphiteJsonToRickshaw,
            series: [
                {
                    name: 'js',
                    color: '#cf171f'
                },
                {
                    name: 'moving',
                    color: '#999'
                }
            ]
        } );

        // polling

        refreshDate();

        window.setInterval(function() {

            // refresh graph data 
            jsonpServerErrorsGraph.request();
            jsonpClientErrorsGraph.request();
            
            // 
            lastRefresh = new Date();
            
        }, 15000);

        window.setInterval(function() {
            refreshDate();
        }, 1000);

    }, function() { 
        console.error('curl.js failed to load')
    });
