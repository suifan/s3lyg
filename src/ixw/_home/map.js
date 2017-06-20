(function(){
var nsGlobal = IXW.ns("Global");
var nsMapData= IXW.ns("MapData");
var ixwD3 = IXW.LibD3;
var markNumber = IX.Math.markNumber;

var localMap = nsMapData.Local;
var Sites = nsMapData.PoliceSites;
var Bounds = IX.map(nsMapData.Bounds, function(b){  return IX.inherit(b, {type: "LineString"});  });
var BoundNames = ["province", "region", "city", "kernel"];

function getTranslateMatrix(pos){
	return "translate(" + pos.join() + ") ";
}

var ColumnImgUrl = nsGlobal.getMapImageUrl("column");
var ColumnWidth = 19, ColumnBaseHeight = 20, ColumnHeight = 128;
function getColumnMatrix(r){
	var h = ColumnBaseHeight + ColumnHeight * r;
	var scaley = h / (ColumnBaseHeight + ColumnHeight);
	return "translate(" + (0 - ColumnWidth / 2) + "," + (0 - h) + ") scale(1, " + scaley + ") translate(0," + ColumnBaseHeight + ") ";
}
function showSiteColumns(dataLayer, sites, data){
	var maxV = 1;
	var valHT = IX.loop(data, {}, function(acc, item){
		acc[item.id] = item.num;
		maxV = Math.max(maxV, item.num);
		return acc;
	});
	var items = IX.map(sites, function(site){
		var val = valHT[site.id];
		var ry = val / maxV;
		return IX.inherit(site, {
			value:  markNumber(val),
			transform: getTranslateMatrix(site.pos),
			ry: ry,
			ty: ColumnBaseHeight + ColumnHeight * ry
		});
	});

	var columnEls = dataLayer.selectAll('.column').data(items, function(d){return d.id;});
	var newColumns = columnEls.enter().append("g").attr("class", "column")
			.attr("transform", function(d){return d.transform;});
	// newColumns.append("circle")
	// 		.attr("cx", 0)
	// 		.attr("cy", 0)
	// 		.attr("r", 6);
	newColumns.append("image")
			.attr("xlink:href", ColumnImgUrl)
			.attr("opacity", 0)
			.attr("width", ColumnWidth)
			.attr("height", ColumnHeight)
			.attr("transform", getColumnMatrix(0));
	newColumns.append("text")
			.attr("dx", 0)
			.attr("dy", function(d){return 0 - d.ty;});

	columnEls.selectAll("text")
			.attr("opacity", 0)
			.text(function(d){return d.value;});

	columnEls.on("mouseover", function(d){
		d3.select(this).classed("hover", true);
	}).on("mouseout", function(d){
		d3.select(this).classed("hover", false);
	});			

	var animate = columnEls.transition().duration(1000);		
	animate.selectAll("image").attr("opacity", 1)
			.attr("transform", function(d){return getColumnMatrix(d.ry); });
	// animate.each("end", function(){
	// 	columnEls.selectAll("text").attr("opacity", 1);
	// });
}

var alarmImgUrls = IX.map([0, 1, 2], function(idx){return nsGlobal.getMapImageUrl("alarm" + idx); });
var AlarmIconWidth = 48, AlarmHeight = 48;
var AlarmIconX =  -24, AlarmIconY = -24;
var triggerEl = null;
function AlaramLayer(gEl, onfocus){
	var isAnimating = false;
	function repeatAnimate(){
		var imageEls =  gEl.selectAll("image");
		imageEls.attr("opacity", function(){
			var alarmEl = d3.select(this);
			var isAlarm0 = alarmEl.classed("alarm0") ;
			var isAlarm2 = alarmEl.classed("alarm2") ;
			if(!isAlarm2){
				return isAlarm0 ? 0.4 : 1; 
			}else{
				return 0;
			}
			return d3.select(this).classed("alarm0") ? 0.4 : 1;
		});
		imageEls.transition().duration(3000).attrTween("opacity", function(){
			var alarmEl = d3.select(this);
			var isAlarm0 = alarmEl.classed("alarm0") ;
			var isAlarm2 = alarmEl.classed("alarm2") ;
			return function(t){
				if(!isAlarm2 && !alarmEl.classed("focused")){
					var v = Math.abs(1 - 2 * t);
					return isAlarm0 ? (1 - 0.6 * v) : (0.2 + 0.8 * v); 
				}else{
					return 0;
				}
			};
		}).each("end", repeatAnimate);
	}
	function focus(alarmEl, d){
		//console.log("alarm: ",alarmEl, d);
		triggerEl = alarmEl;
		gEl.selectAll(".alarm").classed("focused",false);
		triggerEl.classed("focused",true);
		onfocus(d, alarmEl);
	}
	function refresh(alarms){
		var alarmEls = gEl.selectAll(".alarm").data(alarms, function(d){return d.id;});
		var newAlarms = alarmEls.enter().append("g")
				.attr("class", function(d){ return d.id + " alarm"; })
				.attr("transform", function(d){ return getTranslateMatrix(d.pos); });
		newAlarms.selectAll("image").data(alarmImgUrls).enter().append("image")
				.attr("xlink:href", function(d){ return d; })
				.attr("class", function(d, idx){ return "alarm" + idx; })
				.attr("x", AlarmIconX)
				.attr("y", AlarmIconY)
				.attr("width", AlarmIconWidth)
				.attr("height", AlarmHeight)
				.attr("opacity",function(d,idx){
					if(idx == 2){ return 0;}
				});
		newAlarms.on("click", function(d){
			focus(d3.select(this), d);
		}).on("mouseover", function(d){
			d3.select(this).classed("hover", true);
			if(triggerEl && !triggerEl.classed("focused")){
				alarmEls.classed("focused",false);
				triggerEl.classed("focused", true);
			}
		}).on("mouseout", function(d){
			d3.select(this).classed("hover", false);
		});
		alarmEls.exit().remove();

		if (!isAnimating) {
			isAnimating = true;
			repeatAnimate();
		}
	}

	return {
		refresh: refresh,
		focus: function(alarmId){
			var alarmEl = gEl.select("." + alarmId);
			focus(alarmEl, alarmEl.data()[0]);
		}
	};
}

var nsModule = IXW.ns("Homepage");
nsModule.showMapInfo = function(el){
	var model = new ixwD3.GeoModel(localMap);
	var getXY4Site = model.getXY4Site;
	var policeSites = IX.map(Sites, function(s){ return {
		id: s.id,
		pos: getXY4Site(s.coordinate)
	}; });
	var onfocusFn = IX.emptyFn;
	var mapView = new ixwD3.GraphWrapper(el, function(svg){
		return new ixwD3.LayerMap(svg, model, "bound,over,data,alarm".split(","));
	}, { draggable: false });

	var dataLayer = mapView.getLayerByName("data");
	var boundLayer = mapView.getLayerByName("bound");
	var alarmView = new AlaramLayer(mapView.getLayerByName("alarm"), function(d,alarmEl){
		var arr = d.id.split("-"), pos = d.pos;
		var cx = el.offsetLeft + el.offsetWidth / 2,
			cy = el.offsetTop + el.offsetHeight / 2;
		onfocusFn({
			id : arr[1],
			type: arr[0],
			pos: d.lnglat,
			xy: [Math.floor(cx + pos[0]), Math.floor(cy + pos[1])]
		}, [cx, cy]);
	});

	function processAlaramData(type, items){
		return IX.map(items, function(evt){ return {
			id: type + "-" + evt.id,
			lnglat: evt.pos,
			pos : getXY4Site(evt.pos) 
		}; });
	}

	boundLayer.selectAll("path").data(Bounds).enter().append("path")
			.attr("d", model.getGeoPath())
			.attr("class", function(d){ return d.id + " bound"; });
	nsGlobal.serviceCaller("getData4Map", {}, function(data){
		showSiteColumns(dataLayer, policeSites, data);
	});

	return {
		toggleBound: function(name){
			var boundEl = boundLayer.select("." + name);
			var ifVisible = boundEl.classed("hidden");
			boundEl.classed("hidden", !ifVisible);
		},
		refresh: function(carEvts, faceEvts){
			alarmView.refresh([].concat(
				processAlaramData("car", carEvts),
				processAlaramData("face", faceEvts)
			));
		},
		onfocus: function(fn){
			if (IX.isFn(fn)) onfocusFn = fn;
		},
		focus: function(evtId, type){
			alarmView.focus((type.indexOf("car")>=0 ? "car-": "face-") + evtId);
		},
		blur: function(){
			triggerEl.classed("focused",false);
			triggerEl = null;
		}
	};
};
})();