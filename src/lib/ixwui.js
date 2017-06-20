(function(){
var ixwActionsConfig = IXW.Actions.configActions;
// <tpl id="cmpTpl">
// 	<div id="{id}" class="ixw-cmp {clz}">....</div>
// </tpl>

function createComponent(actionsCfg, tpl){
	var fnHT = new IX.IListManager(), isInitialized = false;
	function bindCmpTrigger(id, fn){
		fnHT.register(id, fn);
		if(isInitialized)
			return;
		ixwActionsConfig(actionsCfg);
		isInitialized = true;
	}
	/** cfg :{
		id : used to mark the groups;
		onchange(...) :
	 * }
	 * return obj : {
		getHTML (),
		bind(onchange(...))

		getId()
 	 * }
	 */
	function ClzBase(cfg, tpldataFn){
		var id = $XP(cfg, "id") || IX.id();
		bindCmpTrigger(id, $XF(cfg, "onchange"));
		return {
			getHTML : function(){return tpl.renderData("", tpldataFn());},
			bind : function(onchange){bindCmpTrigger(id, onchange);},

			getId : function(){return id;}
		};
	}
	return {
		ClzBase : ClzBase,

		clear : function(){
			fnHT.iterate(function(dpt, dptId){!$X(dptId) && fnHT.remove(dptId);});
		},
		get : function(id){return fnHT.get(id);}
	};
}
function createChosableComponent(name, abbrName, choseFn, tpl, tpldataFn, valueFn) {
	var cmp = createComponent([["ixw." + abbrName + ".check", function(params, aEl){
		var el = choseFn(params, aEl);
		if (!el)
			return;
		var onchange = cmp.get(el.id);
		IX.isFn(onchange) && onchange(valueFn(el, aEl));
	}]], tpl);
	IXW.Lib[name] = function(cfg){
		var tpldata = null;
		var inst = new cmp.ClzBase(cfg, function(){return tpldata;});
		var id = inst.getId(), items = $XP(cfg, "items", []), value = $XP(cfg, "value");
		tpldata = tpldataFn(id, items, value);

		function _apply(){
			var containerEl = $X(id);
			if (!containerEl)
				return;
			if (!IX.isEmpty(tpldata.clz))
				return $XH.addClass(containerEl, "invisible");
			containerEl.innerHTML = IX.map(tpldata.items, function(item){
				return tpl.renderData("items", item);
			}).join("");
			$XH.removeClass(containerEl, "invisible");
		}
		return {
			getHTML : inst.getHTML,
			bind : inst.bind,
			apply : function(_items, _value){
				if (_items || _value)
					tpldata = tpldataFn(id, _items || items, _value || value);
				_apply();
			},
			getValue : function(){return valueFn($X(id));}
		};
	};
	IXW.Lib["clear" + name] = cmp.clear;
}

IX.ns("IXW.Lib");
// function(actionsCfg, tpl)
// return {
//		ClzBase(cfg, tpldataFn()),
//		get(id),
//		clear()
//}
IXW.Lib.createComponent = createComponent; 
// function("Checkboxs", "chk", choseFn(params, aEl), tpl, tpldataFn(id, items, value), valueFn(el, aEl))
// return undefined; 
IXW.Lib.createChosableComponent = createChosableComponent;
})();

(function(){
var CommonDialogHTML = '<div class="ixw-mask"></div><div class="ixw-body">';

function BaseLayerView(id, clz){
	function _init(){
		var panelEl = IX.createDiv(id, clz);
		panelEl.innerHTML = CommonDialogHTML;
	}
	function _checkPanel(){
		if (!$X(id))
			_init();
		return $X(id);
	}

	return {
		getPanel  :function(){return _checkPanel();},
		getBodyContainer : function(){ return $XH.first(_checkPanel(), "ixw-body");},
		isVisible : function(){return $X(id) && ($X(id).style.display != "none");},
		show : function(){_checkPanel().style.display = "block";},
		hide: function(){$X(id) && ($X(id).style.display = "none");},
		destory : function(){
			var panelEl = $X(id); 
			panelEl && panelEl.parentNode.removeChild(panelEl);
		}
	};
}

function resetPos(el, wh){
	el.style.left = wh[0] + "px";
	el.style.top = wh[1] + "px";
}

function setRelativePos(panel, rect, scrnSize, isBottom){
	var panelWH = [panel.offsetWidth, panel.offsetHeight];
	var scrnArea = [scrnSize[0] - panelWH[0], scrnSize[1] - panelWH[1]];
	var borderArea = [panelWH[0] - rect[0], panelWH[1] - rect[1]];
	var pos = [rect[0], rect[1]];
	function _calPos(_idx, delta, posDelta){
		if (pos[_idx] >scrnArea[_idx] && delta > borderArea[_idx])
			pos[_idx] = delta - borderArea[_idx] + posDelta;
	}
	var idx = isBottom ? 1 : 0;
	pos[idx] = rect[idx] + rect[idx+2] - 2;
	_calPos(1-idx, rect[3-idx], 0); 
	_calPos(idx, 0, 2);

	resetPos(panel, pos);
}

// offset : {dx, dy}
function setAroundPos(el, rect, scrnSize, offset){
	var delta = [offset.dx, offset.dy];
	var deltaWH = [el.offsetWidth +offset.dx , el.offsetHeight + offset.dy];
	var center = [rect[0]+ rect[2]/2, rect[1]+rect[2]/2];

	var xy = [];
	function _calc(idx, primeClz, altClz){
		var ifPrime = scrnSize[idx] > center[idx] + deltaWH[idx];

		$XH.removeClass(el, ifPrime ? altClz : primeClz);
		$XH.addClass(el, ifPrime ? primeClz : altClz);
		xy[idx] = center[idx] + (ifPrime ? delta[idx] : (0-deltaWH[idx]));
	}
	_calc(0, "atRight", "atLeft");
	_calc(1, "atDown", "atUp");

	resetPos(el, xy);
}

IX.ns("IXW.Lib");
/** only DO position by the trigger.
 * cfg {
 * 		id :
 *		zIndex : 
 * 		trigger : el,
 * 		position : around/right/bottom/offset; default "bottom"
 *		offset : { // vertical offset;
 *			left:
 *			top:
 *			height:
 *			width:
 *		}
 *		onhide : function(){}
 * 	}
 * 
 * functions  :{
 		getId : function(){return id;},
		destroy : function() { panel && panel.parentNode.removeChild(panel);},
		reset : function(newCfg),
		isVisible : function(){return true;},
		hide : function(){},
		show : function(triggerEl)
 * }
 */
IXW.Lib.PopPanel = function (cfg){
	var id = $XP(cfg, "id");	
	if (IX.isEmpty(id))
		id = IX.id();
	var baseView = new BaseLayerView(id, "ixw-pop");
	var panel = null;

	var _zIndex = $XP(cfg, "zIndex");
	var position = $XP(cfg, "position", "bottom");	
	var triggerEl = $XP(cfg, "trigger"); 
	var onhide = $XF(cfg, "onhide");

	var offset = $XP(cfg, "offset", {}); // only for position == "offset"
 
	function getZIndex(el) {return  _zIndex && !isNaN(_zIndex) ? (_zIndex - 0) : $XH.getZIndex(el);}	
	function setOffsetPosition(panel, wh){
		//console.log("popEl:",wh);
		if(wh[2] === undefined){
			resetPos(panel, [wh[0] - 30, wh[1] - 100]);
		}else{
			resetPos(panel, [wh[0]+ (offset.left||0), wh[1]+wh[3]+ (offset.top||0)]);
		}
		panel.style.maxHeight = ((offset.height || 200)-6) + "px";
		panel.style.width = (offset.width || 100) + "px";
	}

	function _show(el){
		panel = baseView.getPanel();
		triggerEl = $X(el || triggerEl);

		var zIndex = getZIndex(triggerEl);
		if (zIndex!==null)
			panel.style.zIndex = zIndex+5;
		baseView.show();

		setPos();
	}

	function setPos(){
		var isFixed = $XH.isPositionFixed(triggerEl);
		panel.style.position = isFixed?"fixed":"";
		var rect = $XH.getPosition(triggerEl, isFixed);
		if (position=="offset")
			return setOffsetPosition(panel, rect);

		var scrn = $Xw.getScreen();
		var scrnSize = isFixed? scrn.size : [scrn.scroll[0] + scrn.size[0], scrn.scroll[1] + scrn.size[1]];
		if (position=="around")
			return setAroundPos(panel, rect, scrnSize, offset);
		setRelativePos(panel, rect, scrnSize, position=="bottom");
	}
	
	return {
		getId : function(){return id;},
		getBodyContainer : baseView.getBodyContainer,
		destroy : baseView.destory,
		getTrigger : function(){return triggerEl;},

		reset : function(newCfg){
			position = $XP(newCfg, "position", position);
			if (position == "offset")
				offset = $XP(newCfg, "offset", {});
			_show($XP(newCfg, "trigger"));
		},
		setPos : setPos,
		isVisible : baseView.isVisible,
		hide : function(){
			baseView.hide();
			onhide();
		},
		show : _show
	};
};
/** TO trigger panel position to trigger if action("triggerMode") on trigger or its icon("triggerIcon")
 * cfg {
 * 		id :
 *		triggerMode : "mouseover" // default "click";
 * 		position : right/bottom/offset; default "bottom"
 *		offset : { // vertical offset;
 * 			height:	
 *			width:
 *		},
 *		ifKeepPanel : function(target, triggerEl),
 *		bodyRefresh : function(bodyEl, triggerEl)
 *		bodyListen : function(bodyEl, triggerEl)
 * 	}
 * 
 * functions  :{
 * 		trigger: function(triggerEl)
 * }
 */
IXW.Lib.PopTrigger = function(cfg){	
	var eventName = $XP(cfg, "triggerMode", "click");
	var ifKeepPanel = $XF(cfg, "ifKeepPanel");
	var bodyRefresh = $XF(cfg, "bodyRefresh");
	var bodyListen = $XF(cfg, "bodyListen");

	var _popPanel = null;
	cfg.id = cfg.id||IX.id();

	var eventHandlers = {};
	eventHandlers[eventName] = function(e){
		if (!(_popPanel && _popPanel.isVisible()))
			return;
		var target = e.target;
			var panel = $XH.ancestor(target, "ixw-pop");
			if (panel && panel.id==_popPanel.getId())
			return;
		if (!ifKeepPanel(target, _popPanel.getTrigger()))
			_popPanel.hide();
	};
	if(!$X(cfg.id))
		$Xw.bind(eventHandlers);

	return {
		trigger : function(el) {
	 		if (!_popPanel) 
				_popPanel = new IXW.Lib.PopPanel(cfg);
			var bodyEl = _popPanel.getBodyContainer();
			bodyRefresh(bodyEl, el);
			_popPanel.show(el);
			bodyListen(bodyEl);
		},
		destroy : function(){_popPanel && _popPanel.destroy();},
		reset : function(_cfg){ _popPanel && _popPanel.reset(_cfg);},
		isVisible : function(){ return _popPanel && _popPanel.isVisible();},
		hide : function(){ _popPanel && _popPanel.hide();},
		setPos : function(){ _popPanel && _popPanel.setPos();}
	};
};

/** cfg : {
	id:
	bodyRefresh : function(el)
 * }
 */
IXW.Lib.ModalDialog = function(cfg){
	var id = cfg.id || IX.id();
	var baseView = new BaseLayerView(id, "ixw-modal-dialog");
	var bodyRefreshFn = $XF(cfg, "bodyRefresh");

	function _resize(){
		if (!baseView.isVisible())
			return;
		var bodyEl = baseView.getBodyContainer();
		var scrnH = $Xw.getScreen().size[1], bodyH = bodyEl.offsetHeight;
		var posY = (scrnH - bodyH)/2;
		var marginTop = (posY < 120) ? (120 - scrnH) : Math.floor(0 - bodyH - Math.max(posY + 50, 0));
		bodyEl.style.marginTop = marginTop + "px";
	}
	$Xw.bind({resize : _resize});

	return {
		show : function (){
			baseView.show();
			bodyRefreshFn(baseView.getBodyContainer());
			_resize();
		},
		hide: baseView.hide,
		destory : baseView.destory
	};
};

})();
(function () {var t_alert = new IX.ITemplate({tpl: [
	'<div>',
		'<div class="ixw-bg"></div>',
		'<span class="content">{content}</span>',
		'<span class="ixw-close"><a data-href="$ixw.alert.close">&times;</a></span>',
	'</div>',
'']});
var t_info = new IX.ITemplate({tpl: [
	'<span class="content">{content}</span>',
'']});

IXW.Actions.configActions([["ixw.alert.close", function(params, el){
	$X("IXW-alert").style.display = "none";
}]]);

IX.ns("IXW.Lib");

var AlertId = "IXW-alert";
IXW.Lib.alert = function(content){
	var divEl = $X(AlertId);
	if (!divEl) 
		divEl = IX.createDiv(AlertId, "ixw-alert");
	divEl.innerHTML = t_alert.renderData("", {content: content});
	divEl.style.display = "block";
	return divEl;
};

var InfoId = "IXW-info";
IXW.Lib.info = function(content, clz, speed){
	var _id = "IXW-info-" + IX.id();
	var divEl = IX.createDiv(_id, "ixw-info " + (clz ? clz : ""));
	divEl.innerHTML = t_info.renderData("", {content: content});
	if(speed !== -1){
		window.setTimeout(function(){
			if($X(_id)) $XD.remove($X(_id));
		}, speed > 0? speed: 3500);
	}
	return divEl;
};
})();
(function () {var t_uploader = new IX.ITemplate({tpl: [
	'<form action="{url}" id="{id}_form" name="{id}_form" enctype="multipart/form-data" method="post" target="{id}_frame">',
		'<input type="hidden" name="tkey" id="{id}_key"/>',
		'<input type="hidden" id="{id}_rnd" name="rnd"/>',
		'<input type="file" id="{id}_file" name="file" title="{title}"/>',
		'<iframe name="{id}_frame" id="{id}_frame" style="display:none" src = "about:blank"></iframe>',
	'</form>',
'']});

var uploadedCbHT = new IX.IListManager(); 
var FileUploadURL = null;
function adjustForBrowsers(fileEl){
	var ml = 0;
	if (IX.isMSWin){ // as font-size: 30px
		if (IX.isFirefox) // 330-440
			ml = 330;
		else if (IX.isChrome)//140-578
			ml = (window.ActiveXObject) ? 330 : 140;
		else if (IX.isMSIE)//330-530
			ml = 330;
	}else{
		if (IX.isFirefox) //410-425
			ml = 420;
		else if (IX.isChrome) //153-580
			ml=160;
	}
	ml>0 && (fileEl.style.marginLeft = (0-ml) + "px");
}

function refreshContainer(config, id, trigger){
	var url = $XP(config, "fileUploadURL", FileUploadURL);
	var container = IX.createDiv(id, "ixw-fileUploader");

	url  += (url.indexOf("?")>0?"&":"?") + ("tkey=" + id);
	trigger.parentNode.insertBefore(container, trigger && trigger.nextSibling);
	container.innerHTML = t_uploader.renderData("", {
		id : id,
		url: url,
		title: $XP(config, "title", "文件")
	});

	var width = $XP(config, "width", trigger.offsetWidth);
	var height = $XP(config, "height", trigger.offsetHeight); 

	container.style.zIndex = $XH.getZIndex(trigger)+2;
	container.style.marginLeft = (0-width) + "px";
	container.style.width = width + "px";
	container.style.height = height + "px";
	if(config.isHide)
		container.style.visibility = 'hidden';

	return container;
}

function listenOnFile(config, id, trigger){
	var fileEl = $X(id + "_file");
	adjustForBrowsers(fileEl);

	var focusFn = $XF(config, "onfocus");
	var changeFn = $XF(config, "onchange");
	fileEl.onfocus = function(){focusFn(fileEl);};
	fileEl.onchange = function(){changeFn(fileEl);};
	fileEl.onmouseover = function(){$XH.addClass(trigger, "hover");};
	fileEl.onmouseout = function(){$XH.removeClass(trigger, "hover");};
	return fileEl;
}

IX.ns("IXW.Lib");
/**	
 *  config : {
 *  	fileUploadURL  //optional
 *		trigger : "el", //required 
 *		title : '' //optional
 *		width : //optional
 *		height : //optional
 *		onfocus : function(fileEl){} //optional
 *		onchange : function(fileEl){} //optional
 *  }
 *  return {
 *		submit : function(cbFn){}
 *	}
 *	cbFn : function(info){}
 *	info : {
 		"id" : 
		"file" : "http://s.img/pf13",
		"size : [100, 100]
		"area" : [0,0, 100,100]
 *	}	
 */
IXW.Lib.FileUploader = function(config){
	var trigger = $X($XP(config, "trigger"));
	if (!trigger)
		return;
	var id = IX.id();
	var container = refreshContainer(config, id, trigger);
	if(!container)
		return; 

	var fileEl = listenOnFile(config, id, trigger);
	var formEl = $X(id + "_form");
	function submitForm(cbFn) {
		if (IX.isEmpty(fileEl.value))
			return IXW.alert("没有选择文件,请选择文件再提交!");
		$X(id + "_rnd").value = IX.getTimeInMS();
		$X(id + "_key").value = id;
		uploadedCbHT.register(id, function(retData){
			retData.fileEl = window.ActiveXObject ? fileEl : {
				value : fileEl.value,
				files : [fileEl.files[0]]
			};
			IX.isFn(cbFn) && cbFn(retData);
			formEl.reset();
		});
		formEl.submit();
	}

	return {
		// getId : function(){return id;},
		// clear : function(){formEl.reset();},
		submit : submitForm,
		// destroy : function(){
		// 	var divEl = $X(id);
		// 	divEl && divEl.parentNode.removeChild(divEl);
		// },
		click : function(e){
			if(!config.isHide)
				return;
			$X(id).querySelectorAll('input[type="file"]')[0].click();
			e.stopPropagation();
		}
	};
};

/** it is used to be called by iframe page: like parent.IXW.Lib.FileUploadedCB(data);
 *	data : {
 *		tkey : submit form id :
 *		size : [w,h],
 *		area : [sx,px, ex, ey]
 *		id : id in server 
 *		file : url based on fsURL  	 
 *	}
 */
IXW.Lib.FileUploadedCB = function(data, error){
	var fn = uploadedCbHT.get(data.tkey); 
	if(error && error.code === 0)
		return IXW.alert(error.msg);
	fn(data);
};

IXW.Lib.FileUploader.init = function(url){ 
	FileUploadURL = url;
};
})();
(function () {
var ixDate = IX.Date;
var ixwActionsConfig = IXW.Actions.configActions;
var DatePickerPopPanelID = "ixw-datePickerPanel";
var DayInMS = 24*3600*1000;
var Weeks = IX.map('日一二三四五六'.split(""), function(name, idx){
	return {clz : (idx===0 || idx===6) ? "weekend" : "", text : name};
});
var Months = '一月,二月,三月,四月,五月,六月,七月,八月,九月,十月,十一月,十二月'.split(',');

function getLength4DateArea(timeFmt){
	if (IX.isEmpty(timeFmt))
		return 3; // [Year, Month, Day]
	var str = timeFmt.toLowerCase();
	if (str == "hh:mm") return 5;// [Year, Month, Day, Hour, minute]
	if (str == "hh:mm:ss") return 6;// [Year, Month, Day, Hour, Minute, Second]
	return 3;
}

function getTodayYMD(){return ixDate.formatDate(new Date()).split(/-|\//g);}

var t_dateTpl = new IX.ITemplate({tpl: [
	'<div class="ixw-dp">',
		'<div class="dp-header">',
			'<a data-href="$ixw.dp.prevy" class="dt-prevy"></a>',
			'<a data-href="$ixw.dp.prevm" class="dt-prevm"></a>',
			'<a data-href="$ixw.dp.year" class="dp-year"><input value="{year}" type="text"></a>',
			'<a data-href="$ixw.dp.month" class="dp-month"><input value="{month}" type="text"></a>',
			'<a data-href="$ixw.dp.nextm" class="dt-nextm"></a>',
			'<a data-href="$ixw.dp.nexty" class="dt-nexty"></a>',
		'</div>',
		'<ul class="dp-weeks">','<tpl id="weeks">','<li class="{clz}">{text}</li>','</tpl>','</ul>',
		'<ul class="dp-days">','<tpl id="days">',
			'<li class="{clz}"><a class="dp-day" data-href="$ixw.dp.day" data-value="{value}">{text}</a></li>',
		'</tpl>','</ul>',
		'<div class="time-area {timeClz}">',
			'<span>时间</span>',
			'<span class="areas">',
				'<a class="dp-hour" data-href="$ixw.dp.hour"><input value="{hour}" data-name="hour" type="text"></a>',
				'<b>:</b>',
				'<a class="dp-minute" data-href="$ixw.dp.minute"><input value="{minute}" data-name="minute" type="text"></a>',
				'<b class="sec">:</b>',
				'<a class="dp-second" data-href="$ixw.dp.second" class="sec"><input value="{second}" data-name="second" type="text"></a>',
			'</span>',
			'<span class="icons">',
				'<a data-href="$ixw.dp.next"><span class="dt-prev"></span></a>',
				'<a data-href="$ixw.dp.prev"><span class="dt-next"></span></a>',
			'</span>',
		'</div>',
		'<div class="dp-btns">',
			'<a class="dp-btn" data-href="$ixw.dp.clear">清除</a>',
			'<a class="dp-btn" data-href="$ixw.dp.today">今天</a>',
			'<a class="dp-btn" data-href="$ixw.dp.ok">确认</a>',
		'</div>',
	'</div>',
'']});

// [{clz: "",value : "", text: ""}],
function getDays4Month(year, month, date){
	var d = new Date(year, month, 1);
	var dday = d.getDay(), dt = d.getTime();
	var today = getTodayYMD();
	var todayInMS = (new Date(today[0], today[1] -1, today[2])).getTime();
	var chosedDateInMS = dt  + date * DayInMS - DayInMS;
	function _getTpldate4Day(_d){
		var dInMS = _d.getTime();
		var dweek = _d.getDay();
		var clzArr = [];
		if (_d.getMonth() != month) clzArr.push("out-month");
		if (dweek === 0  ||dweek === 6) clzArr.push("weekend");
		if (dInMS == todayInMS) clzArr.push("today");
		if (dInMS == chosedDateInMS) clzArr.push("selected");
		return {
			clz : clzArr.join(" "),
			value : ixDate.formatDate(_d),
			text : _d.getDate()
		};
	}
	var arr = [];
	for (var i = 0 - dday; i < 42 - dday; i++)
		arr.push(_getTpldate4Day(new Date(dt + i * DayInMS)));
	return arr;
}

var YM_RANGE = [[1000,3000], [1,12]];
var ymdArea = (function(){
	var yearInput = null, monthInput = null, daysEl = null;
	var curYmd = null, tpldate = {};
	function resetTpldate() {
		tpldate = {
			year : (curYmd[0] + "年"),
			month : Months[curYmd[1] - 1],
			weeks : Weeks,
			days: getDays4Month(curYmd[0]-0, curYmd[1]-1, curYmd[2])
		};
	}
	function _refreshYMD(){
		resetTpldate();
		yearInput && (yearInput.value = tpldate.year);
		monthInput && (monthInput.value = tpldate.month);
		daysEl && (daysEl.innerHTML = IX.map(tpldate.days, function(day){
			return t_dateTpl.renderData("days", day);
		}).join(""));
	}
	function refreshNextYMD(deltaM){
		if (deltaM==12 || deltaM==-12)
			curYmd[0] = curYmd[0]-(deltaM>0?-1:1);
		else if(deltaM==-1 && curYmd[1]==1) {
			curYmd[0] -= 1;
			curYmd[1] = 12;
		} else if(deltaM==1 && curYmd[1]==12){
			curYmd[0] -= -1;
			curYmd[1] = 1;
		} else
			curYmd[1] = curYmd[1] - (deltaM>0?-1:1);
		_refreshYMD();
	}
	function selectDay(aEl){
		var liEl = aEl.parentNode;
		if (!liEl || $XH.hasClass(liEl, "selected"))
			return;
		$XH.removeClass($XH.first(daysEl, "selected"),"selected");
		$XH.addClass(liEl, "selected");
		curYmd = $XD.dataAttr(aEl, "value").split(/[^0-9]/);
		resetTpldate();
	}
	function _hover(e, fname){
		var aEl = $XH.ancestor(e.target, "dp-day");
		aEl && $XH[fname](aEl.parentNode, "hover");
	}
	function _bindOn(inputEl, isYear){
		var idx = isYear ? 0 : 1, range = YM_RANGE[idx];
		IX.bind(inputEl, {
			focus : function(){inputEl.value = curYmd[idx];},
			blur : function(){
				var v = inputEl.value;
				v = isNaN(v)? -1 : Math.ceil(v);
				if (v == curYmd[idx] || v >range[1] || v < range[0])
					return inputEl.value = tpldate[isYear?"year":"month"];
				curYmd[idx]  = v;
				_refreshYMD();
			},
			keydown :function(e){if (e.which == 13) inputEl.blur();}
		});
	}
	return {
		changeMonth : refreshNextYMD,
		selectDay : selectDay,

		////////////// used by popDPPanel
		getValue : function(){return curYmd;},
		setValue : function(dateArr){
			curYmd = dateArr;
			_refreshYMD();
		},
		getTplData : function(){return tpldate;},
		bind : function(dpEl){
			var dpHdr = $XH.first(dpEl, "dp-header");
			yearInput = $XD.first($XH.first(dpHdr, "dp-year"), "input");
			monthInput = $XD.first($XH.first(dpHdr, "dp-month"), "input");
			daysEl = $XH.first(dpEl, "dp-days");

			_bindOn(yearInput, "year");
			_bindOn(monthInput);
			IX.bind(daysEl, {
				mouseover: function(e){_hover(e, "addClass");},
				mouseout : function(e){_hover(e, "removeClass");}
			});
		}
	};
})();

var HMS_MAX = [24,60,60], HMS_NAMES = ["hour","minute","second"];
var hmsArea = (function HMSArea(){
	var inputs = [null, null, null], areaEl = null; 
	var focusedIdx = 0, timeClz = "", curHms= ["00","00", "00"];
	function _resetValue(idx, v){
		var value = "00"  + v;
			value = value.substring(value.length-2);
		curHms[idx] = value;
		inputs[idx] && (inputs[idx].value = value);
	}
	function _bindOn(inputEl, idx){
		var max = HMS_MAX[idx];
		inputs[idx] = inputEl;
		IX.bind(inputEl, {
			focus : function(){focusedIdx = idx;},
			blur : function(){
				var v = inputEl.value;
				v = isNaN(v)? -1 : (Math.ceil(v) % max);
				if (v == curHms[idx] || v >= max || v < 0)
					return inputEl.value = curHms[idx];
				_resetValue(idx, v);
			},
			keydown :function(e){if (e.which == 13) inputEl.blur();}
		});
	}
	return {
		changeHMS : function (delta){
			if (!inputs[focusedIdx]) 
				return;
			var max = HMS_MAX[focusedIdx];
			_resetValue(focusedIdx, (curHms[focusedIdx] -0 + delta + max) % max);
			inputs[focusedIdx].focus();
		},

		////////////// used by popDPPanel
		getValue : function(){return curHms;},
		setValue : function(timeArr, dateAreaLen){
			timeClz = dateAreaLen==6?"hms":(dateAreaLen==5?"hm":"");
			areaEl && (areaEl.className = "time-area "+ timeClz);
			for (var i= 0; i<dateAreaLen-3; i++)
				_resetValue(i, timeArr[i]);
		},
		getTplData : function(){return {
			timeClz : timeClz,
			hour : curHms[0],
			minute: curHms[1],
			second: curHms[2]
		};},
		bind : function(dpEl){
			areaEl = $XH.first(dpEl, "time-area");
			var areaEl = $XH.first(areaEl, "areas");
			IX.iterate(HMS_NAMES, function(name, idx){
				_bindOn($XD.first($XH.first(areaEl, "dp-" + name), "input"), idx);
			});
		}
	};
})();

var popDPPanel = (function(){
	var dateAreaLen = 3;
	var onchangeFn = IX.emptyFn;
	var srcInputEl = null, panelEl = null;

	var popTrigger = new IXW.Lib.PopTrigger({
		id : DatePickerPopPanelID,
		position : "bottom",
		triggerMode : "click",
		ifKeepPanel : function(target, trigger){
			return (trigger && !!$XD.isAncestor(target, trigger)) || $XD.isAncestor(target, panelEl);
		},
		bodyRefresh : bodyRefresh
	});
	function _setAreas(value){
		var _str = IX.isEmpty(value) ? ixDate.format(new Date()) : ixDate.formatStr(value);
		var arr = _str.split(" ");
		ymdArea.setValue(arr[0].split(/[^0-9]/));
		hmsArea.setValue(arr[1].split(/[^0-9]/), dateAreaLen);
	}
	function bodyRefresh(bodyEl){
		panelEl = $XH.first(bodyEl, "ixw-dp");
		if (panelEl) return;
		bodyEl.innerHTML = t_dateTpl.renderData("", IX.inherit(ymdArea.getTplData(), hmsArea.getTplData()));
		panelEl = $XH.first(bodyEl, "ixw-dp");
		ymdArea.bind(panelEl);
		hmsArea.bind(panelEl);
	}
	function _change(ymd, hms){
		var value = "";
		if (ymd){
			var arr = [ymd.join("-")];
			hms.length = Math.max(0, dateAreaLen-3);
			if (hms.length>0) arr.push(hms.join(":"));
			value = arr.join(" ");
		}
		srcInputEl && (srcInputEl.value = value);
		onchangeFn(value);
		popTrigger.hide();
	} 

	return {
		/** 
			timeFmt : "hh:mm", // "hh:mm:ss",  default none;
			onchange : function("YYYY-MM-DD hh:mm:ss")
			value : "YYYY-MM-DD hh:mm:ss"
		 */
		show : function(trigger, datefmt, onchange, value){
			dateAreaLen = getLength4DateArea(datefmt);
			IX.isFn(onchange) && (onchangeFn = onchange);
			srcInputEl = $XD.first(trigger, "input");
			_setAreas(srcInputEl ? srcInputEl.value : (value || ""));
			popTrigger.trigger(trigger);
		},
		hide : function(){popTrigger.hide();},
		apply : _setAreas,
		onclear : function(){_change();},
		onOK : function(){_change(ymdArea.getValue(), hmsArea.getValue());}
	};
})();

var ActionConfigurations =IX.map([
["prevy", function(){ymdArea.changeMonth(-12);}],
["prevm", function(){ymdArea.changeMonth(-1);}],
["year", function(params, aEl){}],
["month", function(params, aEl){}],
["nextm", function(){ymdArea.changeMonth(1);}],
["nexty", function(){ymdArea.changeMonth(12);}],
["day", function(params, aEl){ymdArea.selectDay(aEl);}],

["hour", function(params, aEl){}],
["minute", function(params, aEl){}],
["second", function(params, aEl){}],
["next", function(){hmsArea.changeHMS(1);}],
["prev", function(){hmsArea.changeHMS(-1);}],

["clear", function(){popDPPanel.onclear();}],
["today", function(){popDPPanel.apply();}],
["ok", function(){popDPPanel.onOK();}]
], function(action){return ["ixw.dp." + action[0], action[1]];});

function showDatePicker(trigger, options){
	if (!$X(DatePickerPopPanelID))
		ixwActionsConfig(ActionConfigurations);
	popDPPanel.show(trigger, $XP(options, "timeFmt", ""), $XF(options, "onchange"), $XP(options, "value", ""));
}

var t_triggerTpl = new IX.ITemplate({tpl: [
	'<div class="ixw-dpt {clz}">',
		'<label>{label}：</label>',
		'<a data-href="$ixw.dpt.pick" {attrs} data-format="{fmt}">',
			'<input type="text" id="{id}" value="{value}" readonly/>',
			'<span class="dt-"></span>',
		'</a>',
	'</div>',
'']});

var dptCmp = IXW.Lib.createComponent([
["ixw.dpt.pick", function(params, aEl){
	if ($XH.hasClass(aEl.parentNode, "disabled"))
		return;
	showDatePicker(aEl, {
		timeFmt : $XD.dataAttr(aEl, "format"), 
		onchange : function(newValue){onDateChange($XD.first(aEl, "input"),newValue);}
	});
}]], t_triggerTpl);

function onDateChange(inputEl, newValue) {
	var onchangeFn = dptCmp.get(inputEl.id);
	//console.log("DPT: " + newValue);
	IX.isFn(onchangeFn) && onchangeFn(ixDate.getTickInSec(newValue));
}
function inputOnFocus(inputEl){
	$XD.setDataAttr(inputEl, "value", inputEl.value);
}
function inputOnKeyup(inputEl, e){
	var ch = e.which;
	if (ch == 13 || ch==27 || ch==9){
		if (ch != 13) {
			inputEl.value = $XD.dataAttr(inputEl, "value");
			popDPPanel.hide();
		} else 
			popDPPanel.onOK();
		return inputEl.blur();
	}
	var d = new Date(inputEl.value);
	if (!isNaN(d.getTime()))
		popDPPanel.apply(ixDate.format(d));
}
function formatDateBySec(secTick, timeFmt){
	var len = getLength4DateArea(timeFmt);
	return isNaN(secTick)? "" : ixDate.formatBySec(secTick, "time").substring(0, 1+ len * 3);
}
function DatePickTrigger(cfg){
	var tpldata = null;
	var inst = new dptCmp.ClzBase(cfg, function(){return tpldata;});
	var id = inst.getId(), value = $XP(cfg, "value", "");
	var fmt = $XP(cfg, "timeFmt", "hh:mm:ss"), isEnable = !$XP(cfg, "disabled");
	tpldata = {
		id : id,
		clz : $XP(cfg, "extraClz", ""),
		label : $XP(cfg, "label", ""),
		attrs : IX.map($XP(cfg, "dataAttrs", []), function(dataAttr){
			return 'data-' + dataAttr[0] + '="' + dataAttr[1] + '"';
		}).join(" "),
		fmt : fmt,
		value : formatDateBySec(value, fmt)
	};

	function _enable(inputEl){
		var containerEl = $XH.ancestor(inputEl, "ixw-dpt");
		$XH[isEnable?"removeClass":"addClass"](containerEl, "disabled");
		$XD.setAttr(inputEl, "disabled", isEnable? "" : "false");
	}
	function _apply(){
		var inputEl = $X(id);
		if (!inputEl)
			return;
		inputEl.value = tpldata.value;
		IXW.Pages.bindOnInput(inputEl, {
			focus : function(){inputOnFocus(inputEl);},
			keyup :function(e){inputOnKeyup(inputEl, e);}
		});
		$XD.setDataAttr(inputEl.parentNode, "format", fmt);
		_enable(inputEl);
	}
	return {
		getHTML : inst.getHTML,
		enable : function(){isEnable = true; _enable($X(id));},
		disable : function(){isEnable = false; _enable($X(id));},
		bind : function(onchange, _fmt){
			inst.bind(onchange);
			if (!IX.isEmpty(_fmt)){
				fmt = _fmt;
				tpldata.fmt = _fmt;
				tpldata.value = formatDateBySec(value, fmt);
			}
			_apply();
		},
		apply : function(_value){
			value = _value;
			tpldata.value = formatDateBySec(value, fmt);
			_apply();
		}
	};
}
IX.ns("IXW.Lib");

/** options :{
	timeFmt : "hh:mm", // default none;
	value :"YYYY-MM-DD HH:MM:SS"
	onchange : function(dateString)
  }
 */
IXW.Lib.showDatePicker = showDatePicker; //(trigger, options)

/**	cfg {
	id : used to get value of trigger:$X('id').value;
	value : tickInSec
	disabled : true, //default false,
	extraClz :""
	label : "Text",
	dataAttrs : [["name", "value"]]
	onchange : function(tickInSec)
 * }
 * return obj : {
	getHTML (),
	enable (),
	disable (),
	bind (onchange(tickInSec), timeFmt)
	apply(tickInSec)
 * }	
 */
IXW.Lib.DatePickTrigger = DatePickTrigger; // (cfg)
IXW.Lib.clearDatePickTrigger = dptCmp.clear;
})();
(function () {var t_pagination = new IX.ITemplate({tpl: [
	'<div id="{id}" class="ixw-pg {clz}">',
		'<div class="pg">','<tpl id="pages">',
			'<a class="{clz}" data-href="$ixw.pg.jump" data-key="{key}"><span class="{extra}">{text}</span></a>',
		'</tpl>','</div>',
		'<div class="go" ><input data-max="{total}" id="pgInput" /><a data-href="$ixw.pg.go">GO</a></div>		',
	'</div>',
'']});

var paginCmp = IXW.Lib.createComponent([
["ixw.pg.jump", pgJump],
["ixw.pg.go", pgGo]
], t_pagination);

function getArrowData(arrow, ifDisable){return {
	clz : (ifDisable? " disabled" : ""),
	extra : "pg-"+ arrow,
	key : arrow,
	text : ""
};}
function getNumData(idx, ifActive){return {
	clz : (ifActive? " disabled actived" : ""),
	extra : "",
	key : idx,
	text : idx
};}
function getDotted(){return {
	clz : "dotted disabled",
	"extra " : "",
	key : "",
	text : "..."
};}

function getTplData(id, totalPages, curPageNo){
	if (totalPages <= 1 )
		return {
			id : id,
			clz : "invisible",
			total : totalPages,
			pages : []
		};
	var arr = [];

	var curIdx = curPageNo + 1, 
		isFirst = curIdx == 1, isLast = curIdx == totalPages;

	arr.push(getArrowData("prev", isFirst));
	arr.push(getNumData(1, isFirst));
	if (curIdx >= 4)
		arr.push(getDotted());
	for (var i=Math.max(2, curIdx-1); i<=Math.min(curIdx + 1, totalPages-1); i++)
		arr.push(getNumData(i, i==curIdx));
	if (curIdx <= totalPages - 3)
		arr.push(getDotted());
	arr.push(getNumData(totalPages, isLast));
	arr.push(getArrowData("next", isLast));

	return {
		id : id,
		clz :"",
		pages : arr,
		total : totalPages
	};
}
function showErrMsg(err){
	IXW.alert(err || "请输入正确的页码数字。");
}
function getCurPageIdx(pgEl){
	var el = $XH.first($XH.first(pgEl, "pg"), "actived");
	return $XD.dataAttr(el, "key");
}
function onPageChanged(pgEl, idx){
	var onchange = paginCmp.get((IX.isString(pgEl) || !isNaN(pgEl))?pgEl : pgEl.id);
	IX.isFn(onchange) && onchange(idx -1);
}
function pgGo(params, aEl){
	var inputEl = $XD.first(aEl.parentNode, "input");
	var idx = inputEl.value;
	if (isNaN(idx) || idx <1 )
		return showErrMsg();
	idx = idx - 0;
	var pgEl = $XH.ancestor(inputEl, "ixw-pg");
	if (idx==getCurPageIdx(pgEl))
		return showErrMsg("当前已经是第" + idx + "页，请重新输入。");
	var max = $XD.dataAttr(inputEl, "max") - 0;
	if (idx>max)
		return showErrMsg();
	onPageChanged(pgEl, idx);
	inputEl.value = "";
}
function pgJump(params, aEl){
	if ($XH.hasClass(aEl, "disabled"))
		return;
	var pgEl = $XH.ancestor(aEl, "ixw-pg");
	var key = params.key;
	var idx = key;
	if (key == "next" || key == "prev")
		idx = getCurPageIdx(pgEl) - (key == "next"? -1 : 1);
	onPageChanged(pgEl, idx);
}

//////////////////////////////
function inputOnKeyDown(inputEl, e){
	if (e.which != 13) return;
	e.preventDefault();
	pgGo(null, inputEl);
}
function Pagination(cfg){
	var tpldata = null;
	var inst = new paginCmp.ClzBase(cfg, function(){return tpldata;});
	var id = inst.getId(), total = $XP(cfg, "total", 0), 
		current = Math.min($XP(cfg, "current", 0), total-1);
	tpldata = getTplData(id, total, current);

	function _apply(){
		var containerEl = $X(id);
		if (!containerEl)
			return;
		if (!IX.isEmpty(tpldata.clz))
			return $XH.addClass(containerEl, "invisible");

		var inputEl =$XD.first($XH.first(containerEl, "go"), "input");
		$XD.setDataAttr(inputEl, "max", tpldata.total);
		IXW.Pages.bindOnInput(inputEl, { 
			keydown : function(e){inputOnKeyDown(inputEl, e);}
		});
		var el = $XH.first(containerEl, "pg");
		el.innerHTML = IX.map(tpldata.pages, function(page){
			return t_pagination.renderData("pages", page);
		}).join("");
		$XH.removeClass(containerEl, "invisible");
	}

	return {
		getHTML : inst.getHTML,
		getCurrentPageNo : function(){return current;},
		bind : inst.bind,
		apply : function(_current, _total, onlyData){
			var isChanged = false;
			if (!isNaN(_total) && _total >= 0 && _total != total){
				total = _total - 0;
				isChanged = true;
			}
			if (!isNaN(_current) && _current >= 0 && _current != current){
				current = Math.max(0, Math.min(total-1, _current - 0));
				isChanged = true;
			}
			if (isChanged)
				tpldata = getTplData(id, total, current);
			if (!onlyData) _apply();
		},
		jump : function(pageNo){
			onPageChanged(id, Math.max(0, pageNo===undefined?current:pageNo) + 1);
		}
	};
}
IX.ns("IXW.Lib");
/**	cfg {
	id : used to mark the unique;
	total : 4
	current : 0 ( from 0 to 3)
	onchange 
 * }
 * return obj : {
	getHTML (),
	bind(onchange(current))
	apply(total, current)
	jump(pageNo) : force to jump pageNo(or current PageNo), no matter if PageNo existed!
 * }	
 */
IXW.Lib.Pagination = Pagination;
IXW.Lib.clearPaginations = paginCmp.clear;
})();
(function () {
function _tpldataFn(id, items, ifSelectFn){return  {
	id : id,
	clz : items.length===0?"invisible":"",
	items : IX.map(items, function(item){return {
		clz : ifSelectFn(item.id) ? "selected" : "",
		id : item.id,
		title : item.name.replace(/\'|\"/g, '“'),
		text : IX.encodeTXT(item.name || "")
	};})
};}

var MultiChosableCmpCfg = {
	choseFn : function(params, aEl){ 
		$XH.toggleClass(aEl, "selected");
		return aEl.parentNode;
	}, 
	tpldataFn : function(id, items, value){
		var valuedHT = {};
		IX.iterate(value, function(sid){valuedHT[sid] = sid;});
		return _tpldataFn(id, items, function(itemId){
			return valuedHT[itemId] == itemId;
		});
	}, 
	valueFn : function(el){
		if (!el) return [];
		var ids = [];
		var aEl = $XH.first(el, "selected");
		while(aEl){
			ids.push($XD.dataAttr(aEl, "key"));
			aEl = $XH.next(aEl, "selected");
		}
		return ids;
	}
};
var SingleChosableCmpCfg = {
	choseFn : function(params, aEl){
		if ($XH.hasClass(aEl, "selected"))
			return null;
		var el =  aEl.parentNode;
		$XH.removeClass($XH.first(el, "selected"), "selected");
		$XH.addClass(aEl, "selected");
		return el;
	}, 
	tpldataFn : function(id, items, value){
		var _value = (value===null || value === undefined)?$XP(items, "0.id") : value;
		return _tpldataFn(id, items, function(itemId){
			return _value == itemId;
		});
	}, 
	valueFn : function(el, aEl){
		if (!el && !aEl) return null;
		aEl = aEl || $XH.first(el, "selected");
		return $XD.dataAttr(aEl, "key");
	}
};

var t_checkboxs = new IX.ITemplate({tpl: [
	'<div id="{id}" class="ixw-chks {clz}">','<tpl id="items">',
		'<a class="{clz}" data-key="{id}" title="{title}" data-href="$ixw.chk.check">',
			'<span class="ixpic-"></span><span>{text}</span>',
		'</a>',
	'</tpl>','</div>',
'']});

//IX.ns("IXW.Lib");
/**	cfg {
	id : used to mark the groups;
	items : [{id, name}]
	value : [selectedId]
	onchange(selectedIds) :
 * }
 * return obj : {
	getHTML (),
	bind(onchange(selectedIds))
	apply(items, [selectedId])
	getValue ()
 * }
 */
//IXW.Lib.Checkboxs = function(cfg){};
//IXW.Lib.clearCheckboxs = function(){};
IXW.Lib.createChosableComponent("Checkboxs", "chk", MultiChosableCmpCfg.choseFn, 
	t_checkboxs, MultiChosableCmpCfg.tpldataFn, 
	MultiChosableCmpCfg.valueFn
);

var t_radios = new IX.ITemplate({tpl: [
	'<div id="{id}" class="ixw-radios {clz}">','<tpl id="items">',
		'<a class="{clz}" data-key="{id}" title="{title}" data-href="$ixw.radio.check">',
			'<span class="ixpic-"></span><span>{text}</span>',
		'</a>',
	'</tpl>','</div>',
'']});
var t_opts = new IX.ITemplate({tpl: [
	'<div id="{id}" class="ixw-opts {clz}">','<tpl id="items">',
		'<a class="{clz}" data-key="{id}" title="{title}" data-href="$ixw.opt.check">{text}</a>',
	'</tpl>','</div>',
'']});

//IX.ns("IXW.Lib");
/**	cfg {
	id : used to mark the groups;
	items : [{id, name}]
	value : selectedId
	onchange(selectedId) :
 * }
 * return obj : {
	getHTML (),
	bind(onchange(selectedId))
	apply(selectedId)
	getValue ()
 * }
 */
//IXW.Lib.Radios = function(cfg){};
//IXW.Lib.clearRadios = function(){};
//IXW.Lib.Options = function(cfg){};
//IXW.Lib.clearOptions = function(){};
IXW.Lib.createChosableComponent("Radios", "radio", SingleChosableCmpCfg.choseFn, 
	t_radios, SingleChosableCmpCfg.tpldataFn, 
	SingleChosableCmpCfg.valueFn
);
IXW.Lib.createChosableComponent("Options", "opt", SingleChosableCmpCfg.choseFn, 
	t_opts, SingleChosableCmpCfg.tpldataFn, 
	SingleChosableCmpCfg.valueFn
);
})();