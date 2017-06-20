/*
 * IXW library  
 * https://github.com/lance-amethyst/IXW
 *
 * Copyright (c) 2015 Lance GE, contributors
 * Licensed under the MIT license.
 */
(function(){
IX.ns("IXW");

IXW.ns = function(subNS){
	return IX.ns([IXW_NS].concat(subNS).join("."));
};

IXW.alert = function(s){alert(s);};

IXW.ready = function(_fname, fn){
	var fname = _fname;
	IX.checkReady(function(){
		if (IX.isString(fname) && IX.nsExisted(fname))
			fname = IX.getNS(fname);
		return IX.isFn(fname);
	}, function(){
		fn(fname);
	}, 40, {
		maxAge : 15000, //15 seconds
		expire : function(){fn(fname);}
	});
};

IXW.openUrl = function(url) {
	window.open(url);
};

function CmpManager(){
	var ht = {};
	return {
		register : function(name, cmpClz){ht[name] = cmpClz;},
		getInstance : function(name){return ht[name];}
	};
}

IXW.Popups = new CmpManager();
IXW.Popups.defInstance = {
	setOffset :function(el){},
	show : function(el){},
	hide : function(){},
	toggle : function(){},
	destory : function(){}
};
IXW.Navs = new CmpManager();
IXW.Navs.AbsNavRefresh = function(cfg, pageParams){};

/**  
actionConfigs : [
	["name", function()], ...
]
*/
var actionsHT = new IX.IListManager();
function newAction(cfg){
	var name = cfg[0], handler = cfg[1];
	if (IX.isEmpty(name))
		return;
	if (IX.isString(handler))
		handler = IX.getNS(handler);
	if (!IX.isFn(handler)) {
		if (actionsHT.hasKey(name))
			return;
		handler = IX.emptyFn;
	}
	actionsHT.register(name, handler);
}
IXW.Actions = {
	configActions : function(actionConfigs){
		IX.iterate(actionConfigs, newAction);
	},
	doAction : function(name, params, el, evt){
		var fn = actionsHT.get(name);
		if (IX.isFn(fn))
			fn(params, el, evt);
	}
};
})();
/*
 * IXW Session  
 * https://github.com/lance-amethyst/IXW
 *
 * Copyright (c) 2015 Lance GE, contributors
 * Licensed under the MIT license.
 */
(function(){
IX.ns("IXW");
var isFoundInArray = IX.Array.isFound;
var smClass = function DefaultSessionManager(data){
	var sessionData = data;
	var userName = $XP(data, "name", "");
	var userId = $XP(data, "id", null);
	var enabledModules = $XP(data, "modules", []);

	return {
		hasAuth : function(){return userId !== null;},
		getUserName : function(){return userName;},
		getUserId : function(){return userId;},
		checkIfModuleEnabled : function(module){
			return enabledModules == "all"   || isFoundInArray(module, enabledModules);
		}
	};
};

var sessionMgr = new smClass();
var clearSessionFn = null;
var startSessionFn = null;
var loadSessionFn = null;

/** cfg : {
		load : //MUST: function(cbFn)
		managerClass : //optional: function(data)
		onstart: // optional : function()
		onclear: // optional : function()
	}
 */
function configSession(cfg){
	if (!IX.isFn(cfg.load)){
		alert("Session loader must be applied to IXW.Session!");
		return;
	}
	loadSessionFn = cfg.load;

	if (IX.isFn(cfg.managerClass)){
		smClass = cfg.managerClass;
		sessionMgr = new smClass();
	}
	if (IX.isFn(cfg.onclear))
		clearSessionFn = cfg.onclear;
	if (IX.isFn(cfg.onstart))
		startSessionFn = cfg.onstart;
}
function resetSession(data){
	sessionMgr = new smClass(data);
	IX.isFn(startSessionFn) && startSessionFn(data);
}
function clearSession(){
	sessionMgr = new smClass();
	IX.isFn(clearSessionFn) && clearSessionFn();
}
function loadSession(cbFn){
	loadSessionFn(function(data){
		if (!data || !data.id)
			return clearSession();
		resetSession(data);
		cbFn();
	});
}

IXW.Session = {
	config : configSession,
	get : function(){return sessionMgr;},
	clear : clearSession,
	reset : resetSession,
	load : loadSession,
	reload : function(){
		loadSession(function(){
			IXW.Pages.reload();
		});
	},
	isValid : function(){return sessionMgr.hasAuth();}
};

})();
/*
 * IXW library  
 * https://github.com/lance-amethyst/IXW
 *
 * Copyright (c) 2015 Lance GE, contributors
 * Licensed under the MIT license.
 */
(function(){
IX.ns("IXW");
var RouteAttrDefValue = {name :"", url : "", urlType : "base", type : "GET", "dataType" : "json"};
// columns : ["name", "url", "urlType"] , // or  ["name", "url", "urlType", "type", "dataType"]
function parseRouteDef(columns, urlDef){
	return IX.loop(columns, {}, function(acc, name, idx){
		var _value = urlDef.length>idx?urlDef[idx]:null;
		acc[name] = IX.isEmpty(_value) ? RouteAttrDefValue[name] : _value;
		return acc;
	});
}
function UrlStore(columns){
	var _routes = new IX.IListManager();
	function _map(category, urlList){IX.iterate(urlList, function(urlDef){
		var name = urlDef[0];
		if (IX.isEmpty(name))
			return;
		var channelName = category + "-" + name;
		var routeDef = parseRouteDef(columns, urlDef);
		routeDef.channel =channelName;
		_routes.register(channelName, routeDef);
	});}
	return {
		map : _map,
		getAll : _routes.getAll,
		get :  _routes.get
	};
}

var urlEngine = IX.urlEngine, urlStore = new UrlStore(["name", "url", "urlType"]);
var ajaxEngine = IX.ajaxEngine, ajaxStore = new UrlStore(["name", "url", "urlType", "type", "dataType"]);

function initEngine (cfg){
	//urlEngine.init(cfg);
	ajaxEngine.init(cfg);
}

var urlGenerator = null; //function(name, params){return "";};
function _urlGenerator(name, params){
	return  IX.isFn(urlGenerator)?urlGenerator(name, params):"";
}

IXW.urlEngine = {
	init : initEngine,
	reset :initEngine,
	/**  urlList : [ [name, url, urlType], ...]  */
	mappingUrls : function(urlList){
		urlStore.map("", urlList);
		urlGenerator = urlEngine.createRouter(urlStore.getAll());
	},
	genUrls : function(names){
		return IX.map(names, function(name){return _urlGenerator(name, {});});
	},
	genUrl : _urlGenerator
};

var DefAjaxSetting= {
	preAjax : function(name, params){return params;},
	onsuccess : function(data, cbFn, params){
		cbFn(data.data);
	},
	onfail: function(data){
		switch(data.retCode){
		case -401: //无权查看的页面
			return IXW.Pages.reload("401");
		case -404: //未找到的页面
			return IXW.Pages.reload("404");
		}
	}
};
/** routeDef : "routeName" or  {
 * 		name:  "name",
 * 		channel: "",
 * 		url : function(params){},
 * 		preAjax : function(name, params){return paramsl;}, // default null;
 * 		postAjax : function(name, params, cbFn){}, //default null;
 * 		onsuccess : function(data,cbFn, params), 
 * 		onfail : function(data, failFn, params) // default null;
 *  }
 *	routeName =  category + "-" + name;
 */
function createAjaxEntries(category, routes){
	function _convert(routeDef){
		var isRef = IX.isString(routeDef);
		return IX.inherit(ajaxStore.get(isRef?routeDef:(category + "-"+ routeDef.name)), DefAjaxSetting, isRef?{}:routeDef);
	}
	return ajaxEngine.createCaller(IX.map(routes, _convert));
}

IXW.ajaxEngine = {
	init : initEngine,
	reset :initEngine,
	resetSetting : function(settings){IX.extend(DefAjaxSetting, settings);},
	/**  urlList : [ [name, url, urlType, type], ...]  */
	mappingUrls : ajaxStore.map, //function(category, urlList)
	createCaller :  createAjaxEntries //function(category, routes)
};
})();
/*
 * IXW library  
 * https://github.com/lance-amethyst/IXW
 *
 * Copyright (c) 2015 Lance GE, contributors
 * Licensed under the MIT license.
 */
(function(){
IX.ns("IXW.Pages");

var DefaultPageName = null;
var Path2NameMapping = {};
var PageConfigurations = {};
var PageParamKeys = {};

function _checkDyncPath(_p){
	var l = _p.length;
	return l>2 && _p.charAt(0)=="{" && _p.charAt(l-1) == "}" ?_p.substring(1, l-1) : null;
}
function _splitPath(_path){
	return IX.Array.compact(_path.split("/"));
}
function mapPageConfig(_name, cfg){
	var _pathFormat = cfg.path.replace(/\./g, "#");
	if (IX.isEmpty(_name) || IX.isEmpty(_pathFormat))
		return false;
	var keys = [];

	var _arr = IX.map(_splitPath(_pathFormat), function(_p){
		var dp = _checkDyncPath(_p);
		if (dp) keys.push(dp);
		return dp ? "*" : _p;
	});
	_arr.push("#");

	IX.setProperty(Path2NameMapping, _arr.join("."), _name);
	Path2NameMapping["#" + _pathFormat] = _name;
	PageConfigurations[_name] = cfg;
	if (keys.length>0)
		PageParamKeys[_name] = keys;
	if (cfg.isDefault)
		DefaultPageName = _name;
	return true;
}

function getNameByPath(path){
	var obj = Path2NameMapping;
	IX.iterbreak(_splitPath(path), function(item){
		if (item in obj) obj = obj[item];
		else if ("*" in obj) obj = obj["*"];
		else{
			obj = null;
			throw IX;
		}
	});
	return (obj && "#" in obj) ? obj["#"] : null;
}
function getPageParams(_pathFormat, path){
	var params = {
		_name : Path2NameMapping["#" + _pathFormat.replace(/\./g, "#")]
	};
	var arr = _splitPath(_pathFormat), 
		_arr = _splitPath(path);
	IX.iterate(arr, function(_p, idx){
		var dp = _checkDyncPath(_p);
		if(dp) params[dp] = _arr[idx] == "-" ? "" : _arr[idx];
	});
	return params;
}
function getPathByName(name, params){
	var cfg = PageConfigurations[name];
	if (!cfg){		
		console.error("Can't find route : " + name);
		return "";
	}
	return IX.loop(PageParamKeys[name] || [], cfg.path, function(acc, key){
		return acc.replace('{' + key + '}', $XP(params, key, "") || "-");
	});
}

function checkPageConfigs(pageConfigs, done){
	var ht = new IX.I1ToNManager();
	var fnames = [];

	function _detect(name, fname){
		var _fn = null;
		if (IX.isFn(fname))
			_fn = fname;
		else if (!IX.isString(fname))
			return IXW.alert("Configuration failed : invalid Page initialized for " + name);
		else if (IX.nsExisted(fname))
			_fn = IX.getNS(fname);
		
		if (IX.isFn(_fn)) {
			PageConfigurations[name].init = _fn;
			return;
		}
		ht.put(fname, name);
		fnames.push(fname);
	}
	function _checkItem(acc, fname){
		var _fn = IX.getNS(fname);
		if (!IX.isFn(_fn)) {
			acc.push(fname);
			return acc;
		}
		IX.iterate(ht.get(fname), function(_name){
			PageConfigurations[_name].init = _fn;
		});
		ht.remove(fname);
		return acc;
	}
	
	IX.iterate(pageConfigs, function(cfg){
		var _name = cfg.name;
		if (!mapPageConfig(_name, cfg))
			return;

		var _pageInit = "initiator" in cfg? cfg.initiator : null;
		if (IX.isString(_pageInit))
			_detect(_name, _pageInit);
		else if (!IX.isFn(_pageInit))
			IXW.alert("Configuration : error page initiator for " + _name);
	});
	fnames = IX.Array.toSet(fnames);		
	IX.checkReady(function(){
		fnames = IX.loop(fnames, [], _checkItem);
		return fnames.length===0;
	}, done, 40, {
		maxAge : 15000, //15 seconds
		expire : function(){ 
			IXW.alert("Can't find page initalizor: \n" + fnames.join("\n"));
		}
	});
}

var isSupportPushState = "pushState" in window.history; 
function _updByContext(_context, isNew){
	var path = _context.path;
	// console.log((isNew?"push state :" : "replace state :") + path);
	if (isSupportPushState )
		window.history[isNew ? "pushState" : "replaceState"](_context, "", "#" + path);
	else if (isNew)
		document.location.hash = path;
}
function _loadByContext(_context, _saveFn, cbFn){
	//console.log("_load: " + _context.path + "::" + !!_saveFn);
	var cfg = PageConfigurations[_context.name];
	var pageParams = $XP(_context, "page", {});

	var _bodyClz = $XP(cfg, "bodyClz", "");
	if (document.body.className != _bodyClz)
		document.body.className = _bodyClz;	

	var navRefresh = $XP(cfg, "nav");
	if (IX.isString(navRefresh))
		navRefresh = IXW.Navs.getInstance(navRefresh);
	if (IX.isFn(navRefresh))
		navRefresh(cfg, pageParams);

	IXW.ready(cfg.init, function(initFn){
		if (!IX.isFn(initFn))
			return IXW.alert("in Framework: " + initFn  + " is not function");
		_context.serialNo = IX.UUID.generate();
		(_saveFn || IX.emptyFn)(_context);

		initFn(cfg, pageParams, cbFn || IX.emptyFn);
		window.scrollTo(0, 0); //after jump page ,scroll reset to (0,0)
	});
}

function PageHelper(){
	var isInitialized = false;
	var context = null; //{name, path, page, serialNo}
	var pageAuthCheckFn = function(){return true;};

	function resetContext(_context){
		$XF(context && PageConfigurations[context.name], "switchOut")(context, _context);
		context = _context;
	}
	function _loadByPath(path, isNewRec, cbFn){
		var name = getNameByPath(path) || DefaultPageName,
			cfg = PageConfigurations[name];
		if(!pageAuthCheckFn(name, cfg))
			return;
		//console.log('load:' + path + ":::" +name);
		isInitialized = true;
		_loadByContext({
			path : path,
			name :  name,
			page : getPageParams(cfg.path, path)
		}, function(_context){
			resetContext(_context);
			_updByContext(_context, isNewRec);
		}, cbFn);
	}
	function _loadByState(state, cbFn){
		var name = (state && state.name) || DefaultPageName;
		var cfg = PageConfigurations[name];
		if(!pageAuthCheckFn(name, cfg))
			return IXW.alert("该页面已经失效，无法浏览。请登录之后重新尝试。");
		isInitialized = true;
		_loadByContext(state || cfg, resetContext, cbFn);
	}
	function _stateChange(e){
		//console.log("popstate:",e, e.state);
		if (!history.state && !e.state) {
			var path = document.location.hash.substring(1);
			_loadByPath(path.length>0?path:"");
			return;
		}
		var state = e.state;
		if (!isInitialized) 
			resetContext(state);
		else
			_loadByState(state, IX.emptyFn);
	}
	function _hashChange(e){
		//console.log("onhashchange:", e, context);
		if (!(context && "serialNo" in context)) //hashchanged by pop state
			return;
		// if (window.history.state && window.history.state.path == e.newURL.split('#')[1]) 
		// 	return;
		var path = e.newURL.split("#");
		_loadByPath(path.length>1?path[1]:"");
	}

	if (isSupportPushState)
		window.onpopstate= _stateChange;
	else if ("onhashchange" in window)	
		window.onhashchange = _hashChange;

	return {
		init : function(authCheckFn){pageAuthCheckFn = authCheckFn;},
		start : function(cbFn){
			if (context)
				return _loadByState(context, cbFn);
			_loadByPath(document.location.hash.replace(/^#/, ''), false, cbFn);
		},
		reload : function(name, params){
			if (arguments.length>0)
				 _loadByPath(getPathByName(name, params), true);
			else
				_loadByPath(context.path);
		},
		load : function(path, cbFn){_loadByPath(path || "", true, cbFn);},
		getCurrentContext : function(){return context;},
		getCurrentName : function(){return $XP(context, "name");},
		getCurrentPath : function(){return $XP(context, "path");},
		isCurrentPage : function(hash){return hash == $XP(context, "path");}
	};
}
var pageHelper = new PageHelper();

function jumpFor(el, evt){
	var _href = $XD.dataAttr(el, "href");
	if (IX.isEmpty(_href))
		return;	
	var ch = _href.charAt(0), name = _href.substring(1);
	if (ch ==="~"){ // pop up panel
		var instance = IXW.Popups.getInstance(name);
		if (instance) instance.show(el);
	} else if (ch ==='+') // open new window
		IXW.openUrl(document.location.href.split("#")[0] + "#" + name);
	else if(ch === '$') // do named actions
		IXW.Actions.doAction(name, {key : $XD.dataAttr(el, "key")}, el, evt);
	else if (!pageHelper.isCurrentPage(_href))
		pageHelper.load(_href);
}
/**  
pageConfigs : [{
	name: "prjConfig", 
	path: "projects/{key}/config", 
	initiator : "Prj.Project.init",
	[Optional:]
	isDefault : true/, default false
	bodyClz : "minor projectPage projectConfigPage",
	nav : "String" or function navRefresh(){}
	[user-defined page config :]
	navItem : "string"
	needAuth : true/false
	}]
pageAuthCheckFn :function(name, cfg)
 *
 */
IXW.Pages.configPages = function(pageConfigs, pageAuthCheckFn){
	checkPageConfigs(pageConfigs, IX.emptyFn);
	if (IX.isFn(pageAuthCheckFn))
		pageHelper.init(pageAuthCheckFn); 
};
IXW.Pages.createPath = getPathByName;
IXW.Pages.start = pageHelper.start;
IXW.Pages.load = pageHelper.load;
IXW.Pages.reload = pageHelper.reload;

IXW.Pages.getCurrentContext = pageHelper.getCurrentContext;
IXW.Pages.getCurrentName = pageHelper.getCurrentName;
IXW.Pages.getCurrentPath = pageHelper.getCurrentPath;
IXW.Pages.isCurrentPage = pageHelper.isCurrentPage;

IXW.Pages.jump = jumpFor;
IXW.Pages.listenOnClick = function(el){
	IX.bind(el, {click : function(e){
		var _el = $XD.ancestor(e.target, "a");
		if (_el) jumpFor(_el, e);
	}});
};
IXW.Pages.bindOnInput = function(inputEl, handlers){
	if ($XD.dataAttr(inputEl, "binded"))
		return;
	$XD.setDataAttr(inputEl, "binded", "true");
	IX.bind(inputEl, handlers);
};
})();
(function () {
var fnHT = {};
var evtHT = IX.I1ToNManager();

IX.ns('IXW');
IXW.publish = function (evtname, params) {
	IX.iterate(evtHT.get(evtname), function (key) {
		var fn = fnHT[key];
		if (!IX.isFn(fn))
			return;
		fn(params);
	});
};
IXW.subscribe = function (evtname, fn) {
	var key = evtname + IX.UUID.generate();

	fnHT[key] = fn;
	evtHT.put(evtname, key);
	return {
		unsubscribe: function () {
			fnHT[key] = undefined;
			evtHT.remove(evtname, key);
		}
	};
};
}());
(function(){
var fnHT = {};

window.onmessage=function(e){
	var data = e.data;
	//console.log("on messge:", e);
	var name = $XP(data, "name");
	if (name in fnHT)
		fnHT[name](data.message);
};
//window.addEventListener("message", onmessage, false ); 

IX.ns("IXW");
IXW.listenOnMessage = function(name, fn){
	fnHT[name] = fn;
};
IXW.postMessage = function(acceptor, name, message){
	var w = acceptor || window;
	// console.log("IXW:", w, name, message);
	w.postMessage({
		name: name,
		message: message
	},"*");
};
}());
(function(){
IX.ns("IXW");
IXW.startup = function(fn){
	window[IXW_NS].init = fn;
};
IXW.ready(IXW_NS + ".init", function(fn){
	if (!IX.isFn(fn))
		alert("Can't initialize page for not found init function : " + fn);
	else 
		fn();
});
})();