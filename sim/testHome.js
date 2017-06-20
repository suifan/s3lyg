(function (){
IX.ns("Test");
var ixDate = IX.Date;
function getRandom(x, y){
	return Math.round(Math.random()*(y-x)+x);
}
var BranchOffice = [
	{id:0, name: "连云港市局"},
	{id:1, name: "赣榆分局"},
	{id:2, name: "海州分局"},
	{id:3, name: "连云分局"},
	{id:4, name: "开发分局"},
	{id:5, name: "徐圩分局"},
	{id:6, name: "高新分局"},
	{id:7, name: "景区分局"},
	{id:8, name: "机场分局"},
	{id:9, name: "公交分局"},

	{id:10, name: "东海县局"},
	{id:11, name: "灌云县局"},
	{id:12, name: "灌南县局"}
];

var LoginInfo = {
	total: 14568,
	today: 1031,
	online: 537 
};

var CarInfo = {
	total: 43120343177,
	today: 723107021, // 今日新增通行记录总数
	lib: 34219,	// 车辆库
	taxi: 8612,	// 出租车总数
	pics: 8975,  // 二次识别图片数
	fake: 6212	// 套牌车数
};
var FaceInfo = {
	total: 53190543184,
	today: 1112227231, // 今日新增人脸数据总数
	vip: 12219,	// 重点人员库
	popular: 380627,	// 人口库数
	escaped: 391,  //全国在逃人员库
	pics: 5779  // 人脸比对
};

var prevTS = (new Date()).getTime();
Test.getBasicData= function(type) {
	var ts = (new Date()).getTime();
	var intv = ts -  prevTS;
	prevTS = ts;

	var n = Math.floor(Math.random() * intv / 1000);
	LoginInfo.total += n; 
	LoginInfo.today += n;
	LoginInfo.online = 421 + Math.floor(Math.random() * intv  / 10); 

	n = Math.floor(Math.random() * intv / 50);
	CarInfo.total +=  n,
	CarInfo.today +=  n,
	CarInfo.lib += Math.random()  > 0.98 ? 1 : 0;
	CarInfo.taxi += Math.random()  > 0.99 ? 1 : 0;;
	CarInfo.pics += Math.floor(Math.random() * intv  / 40);
	CarInfo.fake += Math.random()  > 0.95 ? 1 : 0;

	n = Math.floor(Math.random() * intv / 40);
	FaceInfo.total +=  n,
	FaceInfo.today +=  n,
	FaceInfo.vip += Math.random()  > 0.98 ? 1 : 0;
	FaceInfo.popular += Math.random()  > 0.99 ? 1 : 0;;
	FaceInfo.escaped += Math.random()  > 0.999 ? 1 : 0;
	FaceInfo.pics += Math.random()  > 0.95 ? 1 : 0;

	var res = null;
	switch(type){
		case "user":
			res = LoginInfo;
			break;
		case "car":
			res = CarInfo;
			break;
		case "face":
			res = FaceInfo;
			break;
	}
	return res;
};
Test.getBasicData4User = function(){
	return Test.getBasicData("user");
};
Test.getBasicData4Face = function(){
	return Test.getBasicData("face");
};
Test.getBasicData4Car = function(){
	return Test.getBasicData("car");
};


var Lnglats = [
	[ 119.10003662109374, 34.89494244739732 ],
	[ 119.08355712890625, 34.800272350556824 ],
	[ 118.84185791015625, 34.68065238482746 ],
	[ 118.78692626953125, 34.45448326886296 ],
	[ 118.97918701171874, 34.495239092669046 ],
	[ 119.07531738281251, 34.687427949314845 ],
	[ 119.39941406249999, 34.655803905058974 ],
	[ 119.24285888671874, 34.56764471968292 ],
	[ 119.5147705078125, 34.30714385628804 ],
	[ 119.74273681640624, 34.42050488013386 ],
	[ 119.34997558593749, 34.38877925439021 ],
	[ 119.20989990234374, 34.42956713470528 ],
	[ 119.20166015625, 34.25948651450623 ],
	[ 119.26483154296875, 34.14136162745489 ],
	[ 119.10278320312499, 34.51787261401661 ],
	[ 119.23736572265625, 34.719039917647905 ],
	[ 118.8446044921875, 34.70549341022547 ],
	[ 118.82537841796876, 34.908457853981396 ],
	[ 118.7017822265625, 34.68065238482746 ],
	[ 119.63836669921875, 34.47712785074854 ],
	[ 119.26208496093751, 34.05948596794815 ]
];
var PosLen = Lnglats.length;
var Pos1 = Math.floor(PosLen * 0.45), Pos2 = PosLen - Pos1;

/*  IMAGE = {id, url, lon, lat}
*/
var i = 0; CarImages = [], FaceImages = [];

for (i=0; i < 21; i++){
	CarImages.push({
		id: i+1, url: IXW_BaseUrl+"/sim/car/"+ (i+1) +".jpg", pos: Lnglats[i % Pos1]
	});
}
for (i=0; i < 30; i++){
	FaceImages.push({
		id: i+1, url: IXW_BaseUrl+"/sim/face/"+ (i+1) +".jpg", pos: Lnglats[Pos1 + i % Pos2]
	});
}

var carMatchedIdx = [2,1,0], faceMatcedIdx = [4,3,2,1,0];
var prevCarTS = (new Date()).getTime();
var prevFaceTS = (new Date()).getTime();
Test.getCapturedAndMatched = function(type){
	var ticks = (new Date).getTime();

	if (ticks - prevCarTS > 15000) { //(180000 + 1800000 *  Math.random())) {
		carMatchedIdx.pop();
		carMatchedIdx.unshift((carMatchedIdx[0] +1) % CarImages.length);
		prevCarTS = ticks;
	}
	if (ticks - prevFaceTS > 10000) { //(540000 + 7200000 *  Math.random())) {
		console.log("face item:", ticks);
		faceMatcedIdx.pop();
		faceMatcedIdx.unshift((faceMatcedIdx[0] +1) % FaceImages.length);
		prevFaceTS = ticks;
	}

	var res = null;
	switch(type){
		case "carCaptured": 
			res = IX.map(CarImages, function(img){
				return {id: ticks + "/" + img.id, url: img.url};
			});
			break;
		case "carMatched": 
			res = IX.map(carMatchedIdx, function(idx){
				return CarImages[idx];
			});
			break;
		case "faceCaptured": 
			res = IX.map(FaceImages, function(img){
				return {id: ticks + "/" + img.id, url:  img.url};
			});
			break;
		case "faceMatched": 
			res = IX.map(faceMatcedIdx, function(idx){
				return FaceImages[idx];
			});
			break;
	}
	return res;
};
Test.getCarCaptured = function(){
	return Test.getCapturedAndMatched("carCaptured");
}
Test.getCarMatched = function(){
	return Test.getCapturedAndMatched("carMatched");
}
Test.getFaceCaptured = function(){
	return Test.getCapturedAndMatched("faceCaptured");
}
Test.getFaceMatched = function(){
	return Test.getCapturedAndMatched("faceMatched");
}

var Data4SiteColumns = [
	{name: "连云港市局",	id: 320700, num: 2312 },
	{name: "赣榆分局",	id: 320721, num: 647 },
	{name: "海州分局",	id: 320706, num: 1531 },
	{name: "连云分局",	id: 320703, num: 1821 },
	{name: "东海县局",	id: 320722, num: 723 },
	{name: "灌云县局",	id: 320723, num: 853 },
	{name: "灌南县局",	id: 320724, num: 908 }
];

Test.getSiteColumnsOnMap = function(){
	return Data4SiteColumns;
};

function getCarDetail(){
	return {
		iod: "秦东门大街枪机一号",
		time: ixDate.format(new Date(new Date().getTime()-24*3600*getRandom(1,3))),
		number: "苏G 12345",
		level: "二级",
		status: "yes",
		site: "通灌南路卡口2",
		percent: getRandom(1, 99),
		imgs:[
			{name:"布控车辆",url:IXW_BaseUrl+"/sim/car/1.jpg",width:1616,height:1280},
			{name:"预警车辆",url:IXW_BaseUrl+"/sim/car/2.jpg",width:1616,height:1328}
		]
	};
}
function getFaceDetail(){
	return {
		iod: "海宁中路枪机一号",
		time: ixDate.format(new Date(new Date().getTime()-24*3600*getRandom(1,3))),
		name: "李某某",
		sex: "女",
		database: "重点人员库",
		idCard: "134215199007251235",
		percent: getRandom(1, 99),
		imgs:[
			{name:"布控图片",url:IXW_BaseUrl+"/sim/face/1.jpg",width:186,height:231},
			{name:"抓拍人脸",url:IXW_BaseUrl+"/sim/face/2.jpg",width:186,height:231}
		]
	};
}
Test.getDetailData = function(params){
	var data = null;
	switch(params.type){
		case "car":
			data = getCarDetail();
			break;
		case "face":
			data = getFaceDetail();
			break;
	}
	return data;
}
})();
