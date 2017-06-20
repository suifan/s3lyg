(function(){
var nsLib = IXW.ns("Lib");

nsLib.getIFrameHTML = function(id, url){
	// console.log("iframe", id, url);
	return '<iframe name="' + id + '" id="' + id + '" class="iframe" src="' + url + '"></iframe>';
};
}());