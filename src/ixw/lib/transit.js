(function(){
var nsLib = IXW.ns("Lib");

function Timer(intv){
	var working = false;
	var fnArr = [];
	function work(){
		setTimeout(work, intv);

		if (!working) return;
		var ticks = (new Date()).getTime();
		for (var i = 0; i < fnArr.length; i++ )
			fnArr[i](ticks);
	}
	work();

	return {
		start: function(){ working = true; },
		stop: function(){ working = false; },
		clear: function(){ fnArr = []; },
		register: function(fn){ fnArr.push(fn); }
	};
}

function doTransition(intv, _times, stepFn, endFn){
	var times = 0;

	function work(){
		var i = 0;
		if (times >= _times)
			return endFn();

		setTimeout(work, intv);
		times += 1;
		stepFn(times);
	}
	setTimeout(work, intv);
}

nsLib.Timer = Timer;
nsLib.doTransition = doTransition;
}());
