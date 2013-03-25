
// http://requirejs.org/docs/node.html#nodeModules
if (typeof define !== 'function') {
        var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    var Target = function(id) {
      
        var self = this;

        this.id = id; 
        this.callChain = [];

        if (!this.id) {
            throw new Error("No target specified, Eg. graphite.target('foo')")
        }

        // dynamically create a method per Graphite render function
        [ 'absolute','alias','aliasByMetric','aliasByNode','aliasSub','alpha','areaBetween','asPercent','averageAbove',
          'averageBelow','averageSeries','averageSeriesWithWildcards','cactiStyle','color','constantLine','cumulative',
          'currentAbove','currentBelow','dashed','derivative','diffSeries','divideSeries','drawAsInfinite','events','exclude',
          'group','groupByNode','highestAverage','highestCurrent','highestMax','hitcount','holtWintersAberration',
          'holtWintersConfidenceArea','holtWintersConfidenceBands','holtWintersForecast','integral','keepLastValue',
          'legendValue','limit','lineWidth','logarithm','lowestAverage','lowestCurrent','maxSeries','maximumAbove','maximumBelow',
          'minSeries','minimumAbove','mostDeviant','movingAverage','movingMedian','multiplySeries','nPercentile',
          'nonNegativeDerivative','offset','percentileOfSeries','randomWalkFunction','rangeOfSeries','removeAbovePercentile',
          'removeAboveValue','removeBelowPercentile','removeBelowValue','scale','scaleToSeconds','secondYAxis','sinFunction',
          'smartSummarize','sortByMaxima','sortByMinima','stacked','stdev','substr','sumSeries','sumSeriesWithWildcards',
          'summarize','threshold','timeFunction','timeShift','transformNull','useSeriesAbove'].forEach(function(f) {
                self[f] = function() {
                self.callChain.push({ name: f, args: [].slice.call(arguments) }) // coverts arguments to an array
                return self;
            }
        })
        
        // produces a nested function call string, Eg. ['foo', 'bar', 'la', 'car'] -> foo(bar(la(car(target))))
        this.toQueryString = function(n) {
            var n = (isNaN(n)) ? this.callChain.length - 1 : n
            if (n >= 0) {
                return this.callChain[n].name
                        + '(' 
                        +   this.toQueryString(n-1) 
                        +   this.callChain[n].args.map( function(a){
                                return ',"' + a + '"'
                            }).join('')
                        + ')'
            }
            return this.id // the graphite target
        }
    }

    var Client = function(opts) {

       var opts = opts || {}
         , host = opts.host || 'http://graphite.example.com/render'
         , self = this;
       
       this.params = { 
              from: opts.from || '-1hours',
              format: opts.format || 'json',
          };

       if (this.params.format === 'json') {
           this.params.jsonp = '?'
       }
       
       if (opts.until) {
           this.params.until = opts.until
       }

       this.targets = [];
      
       this.paramsToQueryString = function(){
            return  Object.keys(this.params).map(function(key){
                return key + '=' + self.params[key]
            }).join('&')
       }  

       this.targetsToQueryString = function(){
            return this.targets.map(function(target){
                return 'target=' + encodeURIComponent(target)
            }).join('&')
       }

       this.toUrl = function(){
            return host + '?' + this.targetsToQueryString() + '&' + this.paramsToQueryString() 
       }

    }
    
    exports.client = Client; 
    exports.target = Target; 

});
