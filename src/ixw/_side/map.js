(function(){
var nsGlobal = IXW.ns("Global");
var nsMapData= IXW.ns("MapData");
var ixwD3 = IXW.LibD3;
var markNumber = IX.Math.markNumber;

var chinaMap = nsMapData.China;

function getSimpleProvinceName(prvName){
	return prvName.replace(/省|市|自治区|壮族|维吾尔|回族|中国|特别行政区/g, "");
}

var MaxColor = d3.rgb(10,160,229); //255, 255, 0); //10,160,229);
var MinColor = d3.rgb(2,56,83);//0,31,63); //2,56,83);
var computeColor = d3.interpolate(MinColor, MaxColor);
// 230 X 126
function showValueColorIndics(gEl){
	var defs = gEl.append("defs");
	var linearGradient = defs.append("linearGradient")
			.attr("id","value-color-indics")
			.attr("x1","0%")
			.attr("y1","0%")
			.attr("x2","0%")
			.attr("y2","100%");
	linearGradient.selectAll("stop").data([MaxColor, MinColor]).enter().append("stop")
			.attr("offset",function(d, idx){return (idx === 0 ?0 : 100) +"%"; })
			.style("stop-color", function(d){return d.toString(); });

	var colorRect = gEl.append("rect")
			.attr("x", 200)
			.attr("y", 20)
			.attr("width", 10)
			.attr("height", 100)
			.style("fill","url(#value-color-indics)");
	// gEl.append("text")
	// 		.attr("class","min")
	// 		.attr("x", 190)
	// 		.attr("y", 40)
	// 		.attr("dy", "1em")
	// 		.text(function(){ return 0; });
	// gEl.append("text")
	// 		.attr("class","max")
	// 		.attr("x", 190)
	// 		.attr("y", 120)
	// 		.attr("dy", "0em")
	// 		.text(function(){ return 1; });
}
function showTrafficOrigin(dataLayer, geodata, data){
	var dataHT = {};
	var max = 0;

	IX.iterate(data, function(item){
		var value = /*item.value || 0 ; */ Math.log(item.value  || 1 );
		dataHT[getSimpleProvinceName(item.name)] = value;
		max = Math.max(max, value);
	});

	var scaler = d3.scale.linear()
			.domain([0, max])
			.range([0, 1]);	
	dataLayer.selectAll(".part").attr("fill", function(d){
		var value = scaler(dataHT[getSimpleProvinceName(d.properties.name)] || 0);
		var color = computeColor(value);
		return color.toString();
	});
}

var nsPanel = IXW.ns("Panel");
nsPanel.showMapInfo = function(container){
	var model = new ixwD3.GeoModel(chinaMap);
	var geodata = model.getGeoData();
	var mapView = new ixwD3.GraphWrapper(container, function(svg){
		return new ixwD3.LayerMap(svg, model, ["bound", "over"]);
	}, { draggable: false });

	var dataLayer = mapView.getLayerByName("map");
	var boundLayer = mapView.getLayerByName("bound");

	showValueColorIndics(dataLayer);
	boundLayer.selectAll("path").data([model.getGeoBound()]).enter().append("path")
			.attr("d", model.getGeoPath())
			.attr("class", "bound");

	nsGlobal.serviceCaller("getOutCarOrigin", {}, function(data){
		showTrafficOrigin(dataLayer, geodata, data);
	});
};
})();