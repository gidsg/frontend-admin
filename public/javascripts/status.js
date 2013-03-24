curl(['graphite'])
    .then(function(graphite) {

        var lastRefresh = new Date();

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
                $.ajax( {
                    url: this.dataURL,
                    success: this.success.bind(this),
                    error: this.error.bind(this),
                    dataType: 'jsonp',
                    timeout: 5000,
                    jsonpCallback: 'callback'
                } );
            }
         });

        // ** request duration 
        var g = new graphite.client({ host: 'http://graphite.guprod.gnl/render', from: '-1hours' });
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
                             .alias(/frontend-([^_]+)/.exec(tag)[1])
                             .toQueryString()
            })

        // draw a graph 
        var jsonpGraph = new Rickshaw.Graph.JSONP.Static( {

            element: document.getElementById("request-duration"),
            width: window.getComputedStyle(document.getElementById('col1'),null).getPropertyValue("width") * 0.9,
            height: 75 * 4, 
            renderer: 'line',
            dataURL: g.toUrl(),
            onData: graphiteJsonToRickshaw,
            series: [
                {
                    name: 'article',
                    color: '#666',
                }, {
                    name: 'front',
                    color: '#888',
                }, {
                    name: 'section',
                    color: '#aaa'
                }, {
                    name: 'tag',
                    color: '#bbb'
                }, {
                    name: 'gallery',
                    color: '#ccc'
                }, {
                    name: 'football',
                    color: '#999'
                }, {
                    name: 'video',
                    color: '#555'
                }
            ]
        } );
        
        // ** server errors 
        var e = new graphite.client({ host: 'http://graphite.guprod.gnl/render' });
        e.targets = [
            'ganglia.GU-PROD-Frontend.frontend-*_*.*.gu_50x_error_request_status_rate-frontend-*.sum'
            ].map(function(tag){
                return new graphite.target(tag)
                             .exclude('__SummaryInfo__')
                             .averageSeries()
                             .alias(/gu_([^_]+)/.exec(tag)[1])
                             .toQueryString()
            })

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
                }
            ]
        } );
        
        // ** client errors 
        var e = new graphite.client({ host: 'http://graphite.guprod.gnl/render' });
        e.targets = [
            'ganglia.GU-PROD-Frontend.frontend-diagnostics_*.*.gu_px_gif_diagnostics_rate-frontend-diagnostics.sum',
            ].map(function(tag){
                return new graphite.target(tag)
                             .exclude('__SummaryInfo__')
                             .averageSeries()
                             .alias(/gu_px_gif_([^_]+)/.exec(tag)[1])
                             .toQueryString()
            })

         var jsonpClientErrorsGraph = new Rickshaw.Graph.JSONP.Static( {

            element: document.getElementById("client-errors"),
            width: window.getComputedStyle(document.getElementById('col2'),null).getPropertyValue("width") * 0.9,
            height: 50,
            renderer: 'line',
            dataURL: e.toUrl(),
            onData: graphiteJsonToRickshaw,
            series: [
                {
                    name: 'diagnostics',
                    color: '#cf171f'
                }
            ]
        } );

        /** views */
        var ophanViews = new Rickshaw.Graph.JSONP.Static( {

            element: document.getElementById("ophan-views"),
            width: window.getComputedStyle(document.getElementById('col2'),null).getPropertyValue("width") * 0.9,
            height: 50,
            renderer: 'line',
            dataURL: 'http://dashboard.ophan.co.uk/perf/pageviews/data?host=m.guardian.co.uk&host=m.guardiannews.com&hours=1&callback=?',
            onData: function(d) {
                        var today = d.filter(
                            function(i) { return i.name === "Today" })
                        document.getElementById('ophan-views-val').innerHTML = today[0].data[0].y + ' requests p/min'
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
            dataURL: 'http://dashboard.ophan.co.uk/perf/timings/data?hours=1&host=m.guardian.co.uk&host=m.guardiannews.com&callback=?', 
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

        window.setInterval(function() {

            // refresh graph data 
            jsonpGraph.request();
            jsonpServerErrorsGraph.request();
            jsonpClientErrorsGraph.request();
            ophanViews.request();
            ophanPerf.request();
            
        }, 30000);

    }, function() { 
        console.error('curl.js failed to load')
    });
