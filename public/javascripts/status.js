curl(['graphite'])
    .then(function(graphite) {

        var qs = {};

        window.location.search.substring(1).split('&').forEach(function(q){
                        var p = q.split('=')
                        qs[p[0]] = p[1]
                    })
       
        console.log(qs);

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

        // ** request duration 
        var g = new graphite.client({ host: 'http://graphite.guprod.gnl/render', from: from });
        g.targets = [
                'ganglia.GU-PROD-Frontend.frontend-article_*.*.gu_request_duration_performance_time-frontend-article.sum',
                'ganglia.GU-PROD-Frontend.frontend-front_*.*.gu_request_duration_performance_time-frontend-front.sum',
                'ganglia.GU-PROD-Frontend.frontend-section_*.*.gu_request_duration_performance_time-frontend-section.sum',
                'ganglia.GU-PROD-Frontend.frontend-tag_*.*.gu_request_duration_performance_time-frontend-tag.sum',
                'ganglia.GU-PROD-Frontend.frontend-gallery_*.*.gu_request_duration_performance_time-frontend-gallery.sum',
                'ganglia.GU-PROD-Frontend.frontend-football_*.*.gu_request_duration_performance_time-frontend-football.sum',
                'ganglia.GU-PROD-Frontend.frontend-video_*.*.gu_request_duration_performance_time-frontend-video.sum'
            ].map(function(tag){
                return new graphite.target(tag)
                             .exclude('__SummaryInfo__')
                             .averageSeries()
                             .movingAverage(30)
                             .alias(/frontend-([^_]+)/.exec(tag)[1])
                             .toQueryString()
            })

        // draw a graph 
        var jsonpGraph = new Rickshaw.Graph.JSONP.Static( {

            element: document.getElementById("request-duration"),
            width: window.getComputedStyle(document.getElementById('col1'),null).getPropertyValue("width") * 0.9,
            height: 85 * 4, 
            renderer: 'line',
            dataURL: g.toUrl(),
            onData: graphiteJsonToRickshaw,
            series: [
                {
                    name: 'article',
                    color: '#FFCC00',
                }, {
                    name: 'front',
                    color: '#FF9933',
                }, {
                    name: 'section',
                    color: '#FF9999'
                }, {
                    name: 'tag',
                    color: '#FF99FF'
                }, {
                    name: 'gallery',
                    color: '#FF3399'
                }, {
                    name: 'football',
                    color: '#FF33FF'
                }, {
                    name: 'video',
                    color: '#FFCCFF'
                }
            ]
        } );
        
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
                },
                {
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

        /** views */
        var ophanViews = new Rickshaw.Graph.JSONP.Static( {

            element: document.getElementById("ophan-views"),
            width: window.getComputedStyle(document.getElementById('col2'),null).getPropertyValue("width") * 0.9,
            height: 50,
            renderer: 'line',
            dataURL: 'http://dashboard.ophan.co.uk/perf/pageviews/data?host=m.guardian.co.uk&host=m.guardiannews.com&hours='+ -(parseInt(from)) +'&callback=?',
            onData: function(d) {
                        var today = d.filter(
                            function(i) { return i.name === "Today" })
                        document.getElementById('ophan-views-val').innerHTML = ((today[0].data[0].y) / 60).toFixed()
                        return today;
                    },
            series: [
                {
                    name: 'Today',
                    color: 'green'
                }
            ]
        } );
        
        /** perf */
        var ophanPerf = new Rickshaw.Graph.JSONP.Static( {

            element: document.getElementById("ophan-perf"),
            width: window.getComputedStyle(document.getElementById('col2'),null).getPropertyValue("width") * 0.9,
            height: 50,
            renderer: 'line',
            dataURL: 'http://dashboard.ophan.co.uk/perf/timings/data?hours='+ -(parseInt(from)) +'&host=m.guardian.co.uk&host=m.guardiannews.com&callback=?', 
            onData: function(d) {
                        return d.filter(
                            function(i) { return i.name !== "Load Event" })
                    },
            series: [
                {
                    name: 'DNS',
                    color: '#a2d00b'
                },
                {
                    name: 'First Byte',
                    color: '#b5e80c'
                },
                {
                    name: 'DomContentReady Event',
                    color: '#7c9f08'
                }
            ]
        } );

        // TODO https://dev.riffraff.gudev.gnl/api/history?project=frontend&stage=PROD&key=oFsACDUt5L2HfLgfdSW2Xf1nbOKHLN5A
        /*
           stage: "PROD",
               projectName: "frontend::router",
               build: "331",
               deployer: "Patrick Hamann",
               status: "Completed",
            taskType: "Deploy",
            time: 1363971152706
        */

        // polling

        refreshDate();

        window.setInterval(function() {

            // refresh graph data 
            jsonpGraph.request();
            jsonpServerErrorsGraph.request();
            jsonpClientErrorsGraph.request();
            ophanViews.request();
            ophanPerf.request();
            
            // 
            lastRefresh = new Date();
            
        }, 15000);

        window.setInterval(function() {
            refreshDate();
        }, 1000);

    }, function() { 
        console.error('curl.js failed to load')
    });
