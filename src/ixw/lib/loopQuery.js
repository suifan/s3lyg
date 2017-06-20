(function(){
var nsLib = IXW.ns("Lib");

/** cfg : {
		interval: 2000, default 2 seconds
		max: 200, default 200 item 
		mapItem : function(item){return item; }
		getTpldata : function(items){ return {items: items};}
		getItemEl : function(item){return $X(item.id);} //MUST
		getItemsEl : function(rootEl){ return $XH.first(rootEl, "items");} //MUST
		tpl : tpl //MUST

		doQuery: function(cbFn){cbFn(items);} // MUST
	
	}

 */
nsLib.QueryLooper = function(cfg){
	var QueryInterval = $XP(cfg, "interval", 2000);
	var MaxItems = $XP(cfg, "max", 200);
	var mapItem = IX.isFn(cfg.mapItem) ? cfg.mapItem : IX.selfFn;
	var getTpldata = IX.isFn(cfg.getTpldata) ? cfg.getTpldata : function(items){
		return {items: items};
	};
	var getItemEl = cfg.getItemEl;
	var getItemsEl = cfg.getItemsEl;
	var tpl = cfg.tpl;
	var doQuery = cfg.doQuery;

	var rootEl = null, ulEl = null;
	var queryTimeout = null;
	var itemList = [];

	function getItemsHTML(items){
		return IX.map(items, function(item){
			return tpl.renderData("items", mapItem(item));
		}).join("");
	}
	function query(items) {
		var len = items.length;

		itemList = items.concat(itemList);
		if (len === 0 || !ulEl) return;
		ulEl.innerHTML = getItemsHTML(items) + ulEl.innerHTML;	
		while(itemList.length > MaxItems) {
			var item = itemList.pop();
			var itemEl = getItemEl(item);
			if (itemEl)
				ulEl.removeChild(itemEl);
		}
	}
	function loopQuery(){
		if (queryTimeout) clearTimeout(queryTimeout);
	
		queryTimeout = setTimeout(function(){
			doQuery(query);
			loopQuery();
		}, QueryInterval);
	}
	function renderItems(items){
		if (ulEl)
			ulEl.innerHTML = getItemsHTML(items);
	}
	function renderAll(items){
		rootEl.innerHTML = tpl.renderData("", getTpldata(IX.map(items, mapItem)));
		ulEl = getItemsEl(rootEl);
	}

	return {
		stop: function(){
			ulEl = null;
			rootEl = null;
			clearTimeout(queryTimeout);
		},
		setRootEl: function(el){
			rootEl = $X(el);
		},
		refresh: function(data, ifAll){
			itemList = data;
			(ifAll? renderAll: renderItems)(data);
			loopQuery();
		},
		getItemById: function(id){
			for (var i = 0 ;i < itemList.length; i++){
				if (itemList[i].id == id)
					return itemList[i];
			}
			return null;
		},
		getFirstItem: function(){
			return itemList[0] || null;
		}
	};
};
}());