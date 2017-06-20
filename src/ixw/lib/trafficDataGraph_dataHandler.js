(function(){
var nsD3Lib = IXW.ns('D3Lib');
function DataModel(category,options){
	var xValues = [],yMax = 0,yMin = 0;
	var xKey = $XP(options,'xKey','time');
	var xFormatter = $XP(options,'xFormatter') || d3.time.format("%m/%d");
	var iTicks = $XP(options,'iTicks') || 5;
	function _getYValues(){
		var perTick = IX.Math.formatMaxValue(yMax,iTicks)/iTicks;
		return  IX.map(d3.range(iTicks+1),function(item,idx){
			return perTick*idx;
		}).reverse();
	}
	function _getLineSeries(data){
		return IX.map(category,function(name,idx){
			return {
				category : name,
				values : IX.map(data,function(d){
					var time = xFormatter(new Date(d[xKey]));
					if(idx === 0)
						xValues.push(time);
					if(d.num > yMax)
						yMax = d.num;
					if(d.num < yMin)
						yMin = d.num;
					return {'category':name,'time':time,'num': d.num};
				})
			};
		});
	}
	return {
		getYValues : _getYValues,
		getXValues : function(){return xValues;},
		getLineSeries : _getLineSeries
	};
}
nsD3Lib.getTrafficChartData  = function(category,options){
	var model = new DataModel(category,options);
	return {
		getData : function(data){
			return {
				series : model.getLineSeries(data),
				yValues : model.getYValues(),
				xValues : model.getXValues()
			};
		}
	};
};
})();