(function(){
var nsD3 = IXW.ns('D3');
var nsD3Lib = IXW.ns('D3Lib');
/** BaseAxis,按照给定刻度和画图区域渲染轴以及刻度,网格线等 
	axisEl : x或y轴 g标签
	rect : [w, h]
	options : {
		type : 'x' || 'y'， 			//轴类型,dafult : 'x',x代表水平方向，y代表垂直方向
		valueType :'int' || 'enum',		//刻度值类型,int整型，enum枚举型 default:int
		tickMarkPlacement : 'between', 	//刻度类型：bettween：表示段刻度，on表示点刻度 
										//即刻度文字与刻度线的对齐方式，on(与刻度线对齐)/between(两个刻度中间);default:on
		showGridLine: true,  			//是否显示轴刻度网格线，default:true
		showAxisLine : false, 			//是否显示轴基准线，default:true
		tickPadding : 10,       		//刻度文字与轴之间的距离，default:10
	}
	return ｛
		resize : function(rect),
		refresh : function(marks) 		//刻度值渲染
		getPos: function(val)			//返回值对应的坐标;
	｝
 */
function BaseAxis(gEl,rect,options){
	var type = $XP(options,'type','x');
	var iTicks  = $XP(options,'iTicks',5);
	var tickPadding = $XP(options,'tickPadding',10)+8;
	var showGridLine = $XP(options,'showGridLine',true);
	var showAxisLine = $XP(options,'showAxisLine',true);
	var valueType = $XP(options,'valueType','enum');
	var tickMarkPlacement = $XP(options,'tickMarkPlacement','on');
	var scale = null;
	var marks = [];
	var ticksEl = null,iPerTrans = 0,aTicksData = [];
	var placement = {};
	var baseRegion = 0;
	
	//确定轴位置
	var axisEl = gEl.append('g')
		.attr('class',type + '-axis')
		.attr('transform',function(){	return type == 'y' ?　'translate(0,0)' : 'translate(0,'+rect[1]+')';});
	
	//根据刻度值类型，确定比例尺
	switch(valueType){
		case 'int':
			scale = d3.scale.linear().range(type=='x'?[0,rect[0]] : [rect[1],0]);
			break;
		case 'enum':
			scale = d3.scale.ordinal().rangeBands(type == 'x' ? [0,rect[0]] : [rect[1],0],0,0);
			break;
	}
	/**setPos 
	 *  1.根据轴类型
	 *  	1)确定x或y的区域范围baseRegion
	 *  	2)确定各项布局值，如轴位置，刻度线位置，网格线位置，文本位置等；
	 *  2.根据刻度类型 确定刻度线数及每个刻度线的偏移量
	 * cbFn 回调函数，用于render或resize
	 */
	function setPos(cbFn){
		baseRegion = type == 'x' ? rect[0] :  rect[1];
		switch(tickMarkPlacement){
			case 'on':
				iPerTrans = baseRegion/(marks.length-1);
				aTicksData = d3.range(marks.length);
				break;
			case 'between':
				iPerTrans = baseRegion/(marks.length);
				aTicksData = d3.range(marks.length+1);
				break;
		}
		var basePos = {x1:0,y1:0,x2:0,y2:0};
		if(type == 'x'){
			placement = {
				axisLine : IX.inherit(basePos,{x2:rect[0]}),
				tickLine : IX.inherit(basePos,{y2:3}),
				text : {x:tickMarkPlacement == 'on' ? 0 : iPerTrans/2,y:tickPadding},
				gridLine : IX.inherit(basePos,{y2:-rect[1]})
			};
		}else{
			placement = {
				axisLine : IX.inherit(basePos,{y2:rect[1]}),
				tickLine : IX.inherit(basePos,{x2:-3}),
				text : {x:-(tickPadding+8),y:6},
				gridLine : IX.inherit(basePos,{x2:rect[0]})
			};
		}
		if(cbFn)	cbFn();
	}
	function _render(){
		ticksEl = axisEl.selectAll('.tick').data(aTicksData)
			.enter().append('g').classed('tick',true)
			.attr('transform',function(d){
				var trans = [iPerTrans*d,0];
				return 'translate('+(type == 'x' ? trans.join(',') : trans.reverse().join(',')) +')';
			});
		
		var len = aTicksData.length;
		ticksEl.each(function(d,idx){
			if(type == 'x' && len>7){
				if(idx%3 === 0 || idx === 0 || idx == len-1){
					
				}else{
					d3.select(this).classed("hidden",true);
				}
			}
			d3.select(this).append('line')
				.attr(placement.tickLine);
			d3.select(this).append('text')
				.attr(placement.text)
				.text(marks[d]).style('text-anchor', 'middle');
		});
		if(showAxisLine){
			axisEl.append('line').classed('domain', true).attr(placement.axisLine);
		}else{
			axisEl.classed('axisNone','none');
		}
		if(showGridLine)
			axisEl.selectAll('g.tick')  
				.append('line')  
				.classed('grid-line',true)
				.attr(placement.gridLine);
	}
	function _resize(){
		var animate = axisEl.transition().duration(1000);
			animate.attr('transform',type == 'y' ?　'translate(0,0)' : 'translate(0,'+rect[1]+')');
		setPos(function(){
			var ticksEl = animate.selectAll('.tick').attr('transform', function(d,idx){
				var trans = [iPerTrans*d,0];
				return 'translate('+(type == 'x' ? trans.join(',') : trans.reverse().join(',')) +')';
			});
			animate.selectAll('.domain').attr(placement.axisLine);
			ticksEl.selectAll('text').attr(placement.text);
			ticksEl.selectAll('.grid-line').attr(placement.gridLine);
		});
	}
	return {
		resize : function(_rect){
			rect = _rect;
			switch(valueType){
				case 'int':
					scale.range(type=='x'?[0,rect[0]] : [rect[1],0]);
					break;
				case 'enum':
					scale.rangeBands(type == 'x' ? [0,rect[0]] : [rect[1],0]);
					break;
			}
			_resize();
		},
		refresh : function(values){
			marks = values;
			if(valueType == 'int'){
				scale.domain([0,d3.max(values)]);
			}else{
				scale.domain(values);
			}
			setPos(_render);
		},
		getPos : function(value){
			if(valueType == 'enum'){
				return iPerTrans*value;
				//return tickMarkPlacement == 'on' ? iPerTrans*value : iPerTrans*value + iPerTrans/2;
			}else{
				return scale(value);
			}
		},
		getRangeBand : function(){
			return iPerTrans;
		}
	};
}
/**Legend,按照用户自定义绘制图例方式，或者默认绘制正方形的图例与文字 
 	gEl 容器标签
 	rect : [w, h]
 	options : {
		align : 'right-top'		//标签对齐方式，x-y
		category : {
			name1 :{name : 'in', text: '本地', 
				color:'#777', fill: 'rgba(1,2,2,0.4)',	// color/fill如不提供，则填充默认颜色，后期绘制折线图或柱形图时，可以通过getLegendColor来获得到。
				renderer : function(gEl){} //自定义绘制的样式，将忽略color,fill, type;
			},
			name2 :{同上},
		},
		renderer : function(el)		//自定义绘制图例样式
 	}
 	return ｛
		refresh : function(){},
		resize : function(_rect){},		
		getLegendColor : function(){}	//未设置图例的颜色值fill或color时，使用了默认颜色。供外部获得该默认值
	｝ 
 */
function Legend(gEl,rect,options){
	var legendSize = 10,legendSpacing = 20,textRectGap = 5;
	var category = $XP(options,'category');
	var lengendCfgs = d3.values(category);
	var align = $XP(options,'align','right-top').split('-'),
		x = align[0],
		y = align[1];
	var renderer = $XP(options,'renderer');
	var colorScale = d3.scale.category10();
	var legendColor = {};
	var legendG = gEl.append('g').attr('class','legends');
	var initFlag = false;
	//设置图例组的x||y 轴的偏移
	var w = 0,h = 0;	//lengedG的宽高
	function setLegendAlign(){
		var offsetX = 0;
		var offsetY = 0;
		switch(x){
			case 'left':
				offsetX = 0;
				break;
			case 'right':
				offsetX = rect[0] - w;
				break;
			case 'middle':
				offsetX = (rect[0] - w)/2;
				break;
		}
		switch(y){
			case 'top':
				offsetY = -h;
				break;
			case 'bottom':
				offsetY = rect[1] + h;
				break;
			case 'middle':
				offsetY = (rect[1] - h)/2;
				break;
		}
		(initFlag ? legendG.transition().duration(1000) : legendG)
			.attr('transform','translate('+ offsetX +','+offsetY+')');
	}
	//渲染图例图形，默认10*10矩形
	function drawFigure(figureEl){
		var color = null;
		function getFillColor(d,idx){
			if(d.legendColor)
				color = d.legendColor;
			else if(d.seriesFill)
				color = d.seriesFill;
			else 
				color = colorScale(idx);
			legendColor[d.name] = color;
			return color;
		}
		d3.select(figureEl).append('rect')
			.attr('width',legendSize)
			.attr('height',legendSize)
			.style('fill',function(d,idx){return getFillColor(d,idx);});
	}
	//渲染图例与文字，如果传入了renderer自定义绘制函数，则执行自定义绘制函数
	function _render(){
		var legendEl = legendG.selectAll('legend')
					.data(lengendCfgs).enter()
					.append('g');
		legendEl.append('g')
			.attr('class','figure')
			.each(function(d){
				IX.isFn($XP(d,'renderer')) ? d.renderer() : drawFigure(this);
			});
		legendEl.append('text')
			.text(function(d){return d.text;})
			.attr('x',function(){
				return this.previousSibling.getBBox().width + textRectGap;
			})
			.attr('y',function(){
				return this.previousSibling.getBBox().height;
			});
		var legendElWidth = [];
		legendEl.each(function(d,i){
			legendElWidth.push(parseInt(this.getBBox().width) + parseInt(legendSpacing));
			var transX = i === 0 ? 0 : d3.sum(legendElWidth.slice(0,i));
			d3.select(this).attr('transform','translate('+ transX +',0)');
		});
		w = legendG.node(0).getBBox().width;
		h = legendG.node(0).getBBox().height + 6;
		setLegendAlign();
		initFlag = true;
	}
	function _refresh(lengendData){
		lengendCfgs = lengendData;
	}
	return {
		resize : function(_rect){
			rect = _rect;
			initFlag ?　setLegendAlign() : _render();
		},
		refresh : _refresh,
		getLegendColor : function(){
			return legendColor;
		},
	};
}

function BaseChart(gEl,rect,options,DataModel){
	var type = $XP(options,'type');
	var xOpts = $XP(options,'xAxis');
	var yOpts = $XP(options,'yAxis');
	var category = $XP(options,'category');
	var isShowLegend = $XP(options,'isShowLegend',false);

	var names = d3.keys(category);
	var dataModel = new DataModel(names,{
		xFormatter: $XP(xOpts,'formatter'),
		xKey: $XP(xOpts,'key'),
		dataType: $XP(xOpts,'dataType'),
		iTicks: $XP(yOpts,'iTicks',5)
	});
	var chartData = null;
	var xAxis = new BaseAxis(gEl,rect,xOpts);
	var yAxis = new BaseAxis(gEl,rect,yOpts);
	var legend = new Legend(gEl,rect,IX.inherit($XP(options,'legend'),{category : category}));
	return {
		resize : function(rect){
			xAxis.resize(rect);
			yAxis.resize(rect);
			if(isShowLegend){
				legend.resize(rect);
			}
		},
		refresh : function(data,lengendData){
			chartData = dataModel.getData(data);
			xAxis.refresh(chartData.xValues);
			yAxis.refresh(chartData.yValues);
			if(isShowLegend){
				legend.refresh(lengendData);
			}
		},
		getSeries : function(){
			return chartData.series;
		},
		getXAxis : function(){
			return xAxis;
		},
		getYAxis : function(){
			return yAxis;
		}
	};
}
function LineChart(gEl,rect,options,DataModel){
	var type = $XP(options,'type');
	var baseChart = new BaseChart(gEl,rect,options,DataModel);
	var category = $XP(options,'category');
	var names = d3.keys(category);
	var gLineArea = gEl.append('g').classed('areaLine',true);
	var linePath = null,areaPath = null;
	var xAxis = null,yAxis = null;
	var series = [];
	var initFlag = false;
	var markLineEl = null;
	var tips = $XP(options,'tips');
	//genPath 通过xAxis和yAxis的getPos获得的坐标，初始化折线函数，区域函数
	function genPath(cbFn){
		linePath = d3.svg.line()
			.x(function(d,idx){return xAxis.getPos(idx);})
			.y(function(d){return yAxis.getPos(d.num);});
		areaPath = d3.svg.area()
			.x(function(d,idx){return xAxis.getPos(idx);})
			.y0(rect[1])
			.y1(function(d){ return yAxis.getPos(d.num);});
		if(cbFn) cbFn();
		//if(tips) bindLineChartEvent(gEl,rect,tips,xAxis,yAxis,series);
	}
	//渲染折线
	function renderLine(){
		function strokeColor(d){
			var strokeStr = $XP(category[d.category],'legendColor');
			return strokeStr ? strokeStr : $XP(category[d.category],'seriesFill');
		}
		function createPath(values){
			return linePath(IX.map(values,function(item){
				//return {time : item.time,category : item.category,num :0};
				return {time : item.time,category : item.category,num :item.num};
			}));
		}
		gLineArea.selectAll('.line')
			.data(series).enter()
			.append('path')
			.attr('d',function(d){ 
				return createPath(d.values);
			})
			.style('fill','none')
			.style('stroke-width',3)
			.style('stroke',function(d){
				return strokeColor(d);
			});
			/*.transition()
			.duration(800).ease('linear')
			.attr('d', function(d){ return linePath(d['values']);});*/
	}
	//渲染区域图
	function renderArea(){
		function createArea(values){
			return areaPath(IX.map(values,function(item){
				//return {time : item.time,category : item.category,num :0};
				return {time : item.time,category : item.category,num :item.num};
			}));
		}
		function fillColor(d){
			var fillStr = $XP(category[d.category],'seriesFill');
			return fillStr ? fillStr : $XP(category[d.category],'legendColor');
		}
		gLineArea.selectAll('.area')
			.data(series).enter().append('path')
			.attr('class',function(d){
				//var hidden = d.category == 'baseData' ? '' : ' hidden';
				return 'area ' + d.category;// + hidden;
			})
			.attr('d', function(d) {return createArea(d.values);})
			.style('fill',function(d){return fillColor(d);});
			/*.transition()
			.duration(800).ease('linear')
			.attr('d',function(d){
				return areaPath(d['values']);
			});*/
	}
	//渲染标记线
	function renderMarkLine(){
		markLineEl = gEl.append('rect')
			.attr('class','markLine hidden')
			.attr('width',1)
			.attr('height',rect[1]<0?0:rect[1]);
	}
	//渲染标记
	function renderSymbol(){
		var symbolEl = gEl.append('g').classed('symbols',true);
		var wrapper = symbolEl.selectAll('wrapper')
				.data(series).enter()
				.append('g')
				.attr('class',function(d){
					return 'wrapper ' + d.category;
				});

		wrapper.each(function(d){
			d3.select(this).selectAll('circle')
				.data(d.values).enter()
				.append('rect')
				.attr('x',function(d,idx) { 
					return xAxis.getPos(idx) - 7; 
				})
				.attr('y',function(d) { 
					return yAxis.getPos(d.num) - 7; 
				})
				.attr('width',function(d){
					return 14;
				})
				.attr('height',function(d){
					return 14;
				})
				.style('fill', function(d){
					return "#e85298";
					//return $XP(category[d.category],'legendColor');
				})
				.style('stroke-width',function(d){
					return 1.5; //d.isMaxFlag ? 3 : 2;
				})
				.style('stroke',function(d){
					//return $XP(category[d.category],"rgba(255,255,255,1)");
				});
		});
	}
	function init(){
		genPath();
		switch(type){
			case 'line':
				renderLine();
				break;
			case 'area':
				renderArea();
				break;
			default:
				renderLine();
				renderArea();
				break;
		}
		renderSymbol();
		renderMarkLine();
		if(tips) bindLineChartEvent();
		initFlag = true;
	}
	function _resize(){
		genPath();
		var animate = gEl.transition().duration(1000);
		animate.selectAll('.areaLine .line').attr('d', function(d) {
			return linePath(d['values']); 
		});
		animate.selectAll('.areaLine .area').attr('d', function(d) {
			return areaPath(d['values']); 
		});
		animate.selectAll('.symbols .wrapper').each(function(d){
			d3.select(this).selectAll('circle')
				.transition().duration(1000)
				.attr('cx', function(d,idx) { return xAxis.getPos(idx); })
				.attr('cy',function(d) { return  yAxis.getPos(d.num)-2; });
		});
		gEl.select('.markLine').attr('height',rect[1]<0?0:rect[1]);
	}

	/* bindLineChartEvent 鼠标在图形区域上移动时的交互,该函数在折线图或区域图绘制完成之后，通过回调开始执行。*/
	function bindLineChartEvent(){
		var symbolWrapperEl = gEl.select('.symbols').selectAll('.wrapper');
		function getData(index){
			return IX.map(series,function(item){
				for(var i = 0;i<item.values.length;i++){
					if(index == i){
						return item.values[i];
					}
				}
			});
		}
		//初始化刻度位置，及数据
		var ticksData = [];
		gEl.select('.x-axis').selectAll('.tick').each(function(d,idx){
			var posX = xAxis.getPos(idx);
			ticksData.push({
				posX: posX,
				data: getData(idx)
			});
		});
		/**mouseover
			1.以所有的刻度位置ticksData为基础与鼠标移入的位置进行对比，得到距离最短的点，
			2.通过步骤1,得到的id及数据
			3.如果用户传入了tips对象，显示toolTips
		  *mouseout 鼠标移出图形区域的交互
		    1.隐藏markLine
		    2.隐藏symbol
		    3.隐藏tooltips*/
		function mouseMoveFn(mousePos){
			var minX = 100000,minY = 100000;
			var id = null;
			var linePosX = null,posY = null;
			IX.iterate(ticksData,function(item,index){
				var dx = Math.abs(mousePos[0]  - item.posX );
				if( dx < minX){
					minX = dx;
					linePosX = xAxis.getPos(index);
					id = index;
				}
			});

			markLineEl.attr({x : linePosX}).classed('hidden', false);

			symbolWrapperEl.each(function(){
				d3.select(this).selectAll('rect').each(function(d,idx){
					if(id == idx){
						d3.select(this).attr({stroke:"#fff"});
						posY = Math.round(this.getBBox().y);
					}else{
						d3.select(this).attr({stroke:""});
					}
				});
			});
			tips.show(linePosX,posY,ticksData[id].data,rect[1]);
		}
		gEl.on({
			mousemove:function(){
				mouseMoveFn(d3.mouse(this));
			},
			mouseout: function(){
				markLineEl.classed('hidden', true);
				symbolWrapperEl.selectAll('rect').attr("stroke","");
				tips.hide();
			}
		});
	}

	return {
		resize : function(_rect){
			rect = _rect;
			baseChart.resize(rect);
			if(initFlag)	_resize();
		},
		refresh : function(data){
			baseChart.refresh(data);
			series = IX.map(baseChart.getSeries(),function(d){
				return IX.extend(d,category[d.category]);
			});
			xAxis = baseChart.getXAxis();
			yAxis = baseChart.getYAxis();
			init();
		},
		switchShowFn: function(name,checked){
			if($XP(options,'switchShowFn')){
				$XP(options,'switchShowFn')(gEl,name,checked);
			}
		}
	};
}

function ColumnChart(gEl,rect,options){
	var category = $XP(options,'category');
	var names = d3.keys(category);
	var rectScale = d3.scale.ordinal().domain(names);
	var rangeBand = 0;
	var xAxis = null,yAxis = null;	//x轴，y轴
	var series = [];
	var rectGap = 2;		//柱形间隔
	var rectWidth = 16;		//柱形宽
	var initFlag = false;	//是否进行初始化
	var tips = $XP(options,'tips');		//提示框
	
	function bindBarChartEvent(){
		function hoverRect(targetEl,event){
			var animate = d3.select(targetEl).transition().duration(500);
			if(event.type == "mouseenter"){
				animate.selectAll(".rectGroup rect").each(function(d,idx){
					d3.select(this).attr("fill",category[d.category].legendColor);
				});
				animate.select(".wrapperBg").attr("fill","rgba(255,255,255,.1)");
				tips.show(xAxis.getPos($XH.getIndex(targetEl)),rect[1],d3.select(targetEl).data()[0].values);
			}else{
				animate.select(".wrapperBg").attr("fill","rgba(255,255,255,0)");
				animate.selectAll(".rectGroup rect").each(function(d,idx){
					d3.select(this)
						.attr("fill",category[d.category].seriesFill);
				});
				tips.hide();
			}
		}
		gEl.selectAll(".rects .wrapper").on({
			mouseenter : function(d,ev){
				hoverRect(this,d3.event);
			},
			mouseleave : function(){
				hoverRect(this,d3.event);
			}
		});
	}

	var baseChart = new BaseChart(gEl,rect,options,nsD3Lib.getBarChartData);

	function getRectWidth(){
		var perWidth = rectScale.rangeBand() - rectGap;
		return perWidth > rectWidth ? rectWidth : perWidth;
	}
	function getRectHeight(num){
		var h = rect[1] - yAxis.getPos(num);
		return h < 0 ? 0 : h;
	}
	function getFillColor(d){
		var fillStr = $XP(category[d.category],'seriesFill');
		return fillStr ? fillStr : $XP(category[d.category],'legendColor');
	}
	function _render(){
		var rectsG = gEl.append('g').classed('rects',true).attr('clip-path','url(#clipRect)');
		var wapperEl = rectsG.selectAll('.wrapper')
					.data(series).enter().append('g').classed('wrapper',true)
					.attr('transform', function(d,idx) {
						return 'translate(' + xAxis.getPos(idx) + ',0)';
					});
		wapperEl.append('rect')
			.classed('wrapperBg',true)
			.attr('x',0).attr('y',0)
			.attr('width',rangeBand).attr('height',rect[1])
			.attr('fill','rgba(255,255,255,0)');
		
		var groupG  = wapperEl.append('g').classed('rectGroup',true);

		groupG.selectAll('rect')
			.data(function(d){return d.values;}).enter()
			.append('rect')
			.attr('x',function(d,idx){return rectScale(d.category);})
			.attr('y',rect[1])
			.attr('width',getRectWidth())
			.attr('height',0)
			.attr('fill',function(d){return getFillColor(d);})
			.transition().duration(800)
			.attr('y',function(d){return yAxis.getPos(d.num);})
			.attr('height',function(d){return getRectHeight(d.num);});
		initFlag = true;
		if(tips)	bindBarChartEvent();
	}
	function _resize(){
		var animate = gEl.transition().duration(1000);
		animate.selectAll('.rects .wrapper')
			.attr('transform', function(d,idx) {
				return 'translate(' + xAxis.getPos(idx) + ',0)';
			});
		animate.selectAll('.rectGroup rect')
			.attr('x',function(d,idx){return rectScale(d.category);})
			.attr('y',function(d){return yAxis.getPos(d.num);})
			.attr('width',getRectWidth())
			.attr('height',function(d){return getRectHeight(d.num);});
		animate.selectAll('.wrapperBg')
			.attr('x',0).attr('y',0)
			.attr('width',rangeBand).attr('height',rect[1]);
	}
	return {
		resize : function(_rect){
			rect = _rect;
			baseChart.resize(rect);
			if(initFlag)	{
				rangeBand = xAxis.getRangeBand();
				rectScale.rangeRoundBands([0,rangeBand],0.1,1);
				_resize();
			}
		},
		refresh : function(data){
			baseChart.refresh(data);
			series = baseChart.getSeries();
			xAxis = baseChart.getXAxis();
			yAxis = baseChart.getYAxis();
			rangeBand = xAxis.getRangeBand();
			rectScale.rangeRoundBands([0,rangeBand],0.1,1);
			_render();
		}
	};
}
function BarChart(){


}
function MixChart(gEl,rect,options){
	return {resize:function(){},refresh:function(){}};
}
/**
 * [showAxisGraph 渲染带主标轴的图表]
 *  svgEl	svg元素
 * 	rect 	[width,height]
 *  cfg     {配置项}:
	type : 'line-area', //图表类型(2种)
			//1.柱状图'column'（纵向） || 'bar' （横向）；
			//2.折线图 'line'（折线） || 'area' （区域） || 'line-area' （折线+区域）  
			//default:'line-area'
	padding : [],    //[top,right,bottom,left]，图表区域边空，刻度文字不计入,default:[40,30,20,50]
	xAxis :{
		type : 'x', //轴类型,dafult : 'x'
		valueType : 'enum',  //刻度值类型,int整型，enum枚举型 default:int
		tickMarkPlacement : 'on'   //刻度文字与刻度线的对齐方式，on(与刻度线对齐)/between(两个刻度中间);default:on
		tickPadding : 10,       //刻度文字与轴之间的距离，default:10
		showGridLine : true,	//是否显示网格线 default : true
		showAxisLine : true     //是否显示轴线 default : true
	}
	yAxis : {//参考x轴},
 	legend : {  // 如果没有提供，则认为不需要图例
		align : //optional,默认top-right，可选值top-left,top,bottom-left,bottom,bottom-right等;
 		renderer : function(gEl){} //自定义绘制图例的样式,如果没有，调用缺省图例
 	},	
 	tips : {    // 如果没有提供，则认为不需要信息提示
		show : function(x,y,item),
		hide : function()
 	}，
	category : {
		'categoryName' : {	name : 'in', text: '本地', 
			color:'#777', fill: 'rgba(1,2,2,0.4)',// color/fill如不提供，则认为不需要调用属性设置。
			type : //表现类型，缺省为：折线图line，可以是line,lineArea及area, 柱形图column
		}
	}
 * @return {
		resize : function(w,h){}
		refresh : function(data){
			//data结构如下:
			//[{categoryName1:100,categoryName2:200,time:'yyyy-mm-dd'},{categoryName1:100,categoryName2:200,time:'yyyy-mm-dd'}.......]
		}
 	}
*/
var defaultCfgs = {
	/*type : 'line-area',*/
	padding : [40,30,20,50],
	xAxis : {
		type : 'x',
		valueType : 'enum',
		tickMarkPlacement : 'on',
		showGridLine : true,
		showAxisLine : true
	},
	yAxis : {
		type : 'y',
		valueType : 'int',
		tickMarkPlacement : 'on',
		showGridLine : true,
		showAxisLine : false,
		iTicks : 5
	},
	legend : {
		align : 'right-top',
	}
};
nsD3.showAxisGraph = function(svgEl,rect,cfg,DataModel){
	var padding = $XP(cfg,'padding');
	var rangeW = rect[0] - padding[1] - padding[3] ;
	var rangeH = rect[1] - padding[0] - padding[2];
	var options = jQuery.extend(true,{},defaultCfgs,cfg);
	var chart = null;
	var gEl = svgEl.append('g').attr('transform','translate('+padding[3]+','+padding[1]+')');
	
	switch($XP(options,'type',null)){
		case 'line':
		case 'area':
		case 'line-area':
			chart = new LineChart(gEl,[rangeW,rangeH],options,DataModel);
			break;
		case 'column':
			chart = new ColumnChart(gEl,[rangeW,rangeH],options);
			break;
		case 'bar':
			chart = new BarChart(gEl,[rangeW,rangeH],options);
			break;
		case null:
			chart = new MixChart(gEl,[rangeW,rangeH],options);
	}
	return {
		resize : function(w,h){
			rangeW = w - padding[1] - padding[3];
			rangeH = h - padding[0] - padding[2];
			chart.resize([rangeW,rangeH]);
		},
		refresh : function(data){
			chart.refresh(data);	
		},
		switchShowFn: function(name,checked){
			chart.switchShowFn(name,checked);
		}
	};
};

})();