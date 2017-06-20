(function(){
	var nsLib = IXW.ns("Lib");
	/*千位分隔数字*/
	nsLib.changeNumSegWithComma=function(strNum){
		strNum=String(strNum);
		if (strNum.length <= 3) {
			return strNum;
		}
		if (!/^(\+|-)?(\d+)(\.\d+)?$/.test(strNum)) {
			return strNum;
		}
		var a = RegExp.$1, b = RegExp.$2, c = RegExp.$3;
		var re = new RegExp();
		re.compile("(\\d)(\\d{3})(,|$)");
		while (re.test(b)) {
			b = b.replace(re, "$1,$2$3");
		}
		return a + "" + b + "" + c;
	};
	/**
	 * 图片水平垂直居中
	 * @param  img       [图片信息,包括url,width,height]
	 * @param  maxWidth  [div区域宽]
	 * @param  maxHeight [div区域高]
	 * @return "width:*px;height:*px;margin-left:*px;margin-top:*px;";
	 */
	nsLib.handleImg = function (img,maxWidth,maxHeight){
		var imgW = img.width,imgH = img.height;
		var ratio = Math.min(maxWidth / imgW, maxHeight / imgH); 
		var style = IX.map([
				{name:"width",base:imgW},
				{name:"height",base:imgH}
			],function(item){
				return item.name + ":" + ratio*(item.base) +"px";
			});
		style.push("margin-left:" + (Math.abs(maxWidth-imgW*ratio)/2)+"px");
		style.push("margin-top:" + (Math.abs(maxHeight-imgH*ratio)/2)+"px"); 
		return IX.extend(img,{style:style.join(";")});
	};
	/**
	 * svg绘制箭头
	 */
	nsLib.drawArrow = function(){
		var pts = [
			[0,0],
			[16,6],
			[0,12]
		];
		var r = Math.tan(25*(Math.PI/180))*16;
		var Arc = [
			[r,r],
			[0,0],
			[0],
			[0,0]
		];
		return [
			"M", pts[0].join(),
			"L", pts[1].join(),
			"L", pts[2].join(),
			"A", IX.map(Arc,function(item){
				return item.join(" ");
			}).join(","),
			"Z"
		].join(" ");
	};
})();