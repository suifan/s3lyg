(function(){
var nsD3 = IXW.ns('D3');
// 背景
function drawBgs(gEl,arrBg){
	var bgEls = gEl.append("g").attr("class","bgs");
	IX.map(arrBg,function(item){
		bgEls.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",item.r)
			.style("fill",item.fill)
			.style("stroke",item.stroke)
			.style("stroke-width",item.strokeWidth);
	});
}

// 弧 
function drawArc(gEl,cfg,data){
	var arcEl = gEl.append("g").attr("class","arc");
	var radius = cfg.r + (cfg.strokeWidth/2);  //半径
	var perimeter = 2*Math.PI*radius;  //周长
	var strokeDasharray = [perimeter*(data/100),perimeter+1].join(" ");  //（路径动画）虚线描边 "线段长度 线段间长度"
	arcEl.append("circle")
		.attr("class","animate-arc")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",radius)
		.style("stroke",cfg.fillUrl ? cfg.fillUrl : cfg.stroke)
		.attr("stroke-dasharray","0 "+ (perimeter+1))
		.attr("transform","rotate(-90)")
		.style("stroke-width",cfg.strokeWidth)
		.style("stroke-linecap",cfg.strokeLinecap)
		.style("fill","none");
	arcEl.select(".animate-arc")
		.transition()
		.duration(1000)
		.attr("stroke-dasharray",strokeDasharray);
}
function drawBall(gEl,cfg,data){
	var ballEl = gEl.append("g").attr("class","ball");
	var radius = cfg.r + (cfg.strokeWidth/2);  //半径
	var perimeter = 2*Math.PI*radius;  //周长
	var strokeDasharray = [perimeter*(data/100),perimeter+1].join(" ");  //（路径动画）虚线描边 "线段长度 线段间长度"
	ballEl.append("circle")
		.attr("class","animate-ball")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",radius)
		.attr("stroke-dasharray","2.5 "+ (perimeter+1))
		.attr("stroke-dashoffset",0)
		.attr("transform","rotate(-90)")
		.style("stroke",cfg.stroke)
		.style("stroke-width",cfg.strokeWidth)
		.style("stroke-linecap","round")
		.style("fill","none");
	ballEl.select(".animate-ball")
		.transition()
		.duration(1000)
		.attr("stroke-dashoffset",-perimeter*(data/100)+2);
}
function drawText(gEl,cfg){
	var textEl = gEl.append("g").attr("class",cfg.clz);
	textEl.append("text")
		.text(cfg.text)
		.style("font-size",cfg.fontSize)
		.attr("x",cfg.offsetX)
		.attr("y",cfg.offsetY)
		.style("font-family",cfg.fontFamily)
		.style("font-weight",cfg.fontWeight)
		.style("fill",cfg.fill);

	if("underline" in cfg){
		var underLineCfg = $XP(cfg,"underline");
		textEl.append("rect")
			.attr("width",underLineCfg.width)
			.attr("height",underLineCfg.height)
			.attr("x",underLineCfg.offsetX)
			.attr("y",underLineCfg.offsetY)
			.style("fill",underLineCfg.fill);
	}
}            
function renderTexts(gEl,cfg,percent){
	var numCfg = cfg.num, 
		nameCfg = cfg.desc;
	drawText(gEl,IX.inherit(numCfg,{
		clz: 'percent',
		text: percent +"%"
	}));
	drawText(gEl,IX.inherit(nameCfg,{
		clz: 'text',
		text: cfg.name
	}));
}

function drawRanking(gEl,cfg,data){
	var rankingEl = gEl.append("g")
		.attr("class","ranking")
		.attr("transform",function(){
			var offset = [cfg.offsetX,cfg.offsetY].join(",");
			return "translate("+offset+")";
		});
	rankingEl.append("image")
		.attr("x",0)
		.attr("y",0)
		.attr("width",cfg.width)
		.attr("height",cfg.height)
		.attr("xlink:href",cfg.url);

	rankingEl.append("text")
		.text("NO." + data)
		.attr("x",26)
		.attr("y",-10)
		.attr("font-size",cfg.fontSize)
		.attr("font-family", cfg.fontFamily)
		.style("fill",cfg.fill);
}

nsD3.showPieGraph = function(svg,options,data){
	var maxRadius = $XP(options,"maxRadius");
	var margin = $XP(options,"margin");
	var cx =  maxRadius + margin[1],
		cy = maxRadius + margin[0];
	
	var gEl = svg.append("g") 
		.attr("class","wrapper")
		.attr("transform",'translate('+cx+','+cy+')');

	drawBgs(gEl,$XP(options,"bgRadius"));
	drawArc(gEl,$XP(options,"arc"),data.percent);
	renderTexts(gEl,IX.inherit(options.text,{
		name: $XP(options,"name")
	}),data.percent);
	if($XP(options,"ball")){
		drawBall(gEl,$XP(options,"ball"),data.percent);
	}
	if($XP(options,"ranking")){
		drawRanking(gEl,$XP(options,"ranking"),data.ranking);
	}
};
})();