(function(){
var nsLib = IXW.ns("Lib");
var nsGlobal = IXW.ns("Global");
var ixwD3 = IXW.LibD3;
var nsD3 = IXW.ns('D3');
var nsD3Lib = IXW.ns('D3Lib');

var category = {
	traffic : {
		name: "traffic", 
		text: '',
		seriesFill: "rgba(255,67,299,0.15)",
		legendColor: "#e85298",
	}
};

var graphCfgs = {
	padding: [30,20,10,65],
	type: 'line-area',
	tips: {
		show: function (x,y,tipsData,svgH){
			nsLib.showToolTips(containerEl,{
				left: x+20,
				top: -(svgH-y+70),
				width: 90,
				height: 50
			},{
				clz: 'traffic-data-tooltip',
				list: IX.map(tipsData,function(item){
					return {text:"",num: nsLib.changeNumSegWithComma(item.num)};
				})
			});
		},
		hide: function(){
			nsLib.hideToolTips();
		}
	},
	category: category,
};
var graphView = null;
var svgEl = null;
var containerEl = null;
nsLib.trafficGraph = function(el){
	containerEl = el;
	var rect = $XH.getPosition(el);
	if(d3.select(el).select("svg").empty()){
		svgEl = d3.select(el).append('svg')
					.attr({width:'100%',height:'100%'});
	}else{
		svgEl.selectAll("g").remove();
	}
	return {
		resize: function(){

		},
		refresh: function(type,data){
			var xFormatter = null;
			switch(type){
				case 'hour':
					xFormatter = d3.time.format("%H");
					break;
				case 'month':
				case 'week':
					xFormatter = d3.time.format("%m/%d");
					break;
			}
			var options = IX.inherit(graphCfgs,{
				xAxis: {
					formatter: xFormatter,
					key: 'time',
					dataType: type,
					showGridLine: false
				},
				yAxis: {
				 	showAxisLine: true
				}
			});
			graphView = new nsD3.showAxisGraph(
				svgEl,
				[rect[2],rect[3]],
				options,
				nsD3Lib.getTrafficChartData
			);
			graphView.resize(rect[2],rect[3]);
			graphView.refresh(data);
		}
	};
};

})();