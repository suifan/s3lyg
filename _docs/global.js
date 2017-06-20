(function(){
var nsGlobal = IXW.ns("Global");

var baseUrl = IXW_BaseUrl + "/sim";
var imgUrl = IXW_BaseUrl + "/images";
var urlEngine = IXW.urlEngine;
var ixwGenUrl = urlEngine.genUrl;

IXW.ajaxEngine.init({
	ajaxFn : jQuery.ajax,
	baseUrl : baseUrl,
	imgUrl : imgUrl
});

IXW.ajaxEngine.mappingUrls("common", [
	/* PVA 提供 */
	["session", "/sessionData.json", "", "GET", "form"],
]);

urlEngine.mappingUrls([
	["cubeImage", "/cube/{name}.png", "img"],
	["pieImage", "/pie/{name}.png", "img"],
	["map", "/map/{name}.png", "img"]
]);


function getFileUrl(type, name){return ixwGenUrl(type, {name: name});}
nsGlobal.getCubeImageUrl = function(name){return getFileUrl("cubeImage", name);};
nsGlobal.getPieFillUrl = function(name){return getFileUrl("pieImage", name);};
nsGlobal.getMapImageUrl = function(name){return getFileUrl("map", name);};

nsGlobal.commonCaller = IXW.ajaxEngine.createCaller("common",[
	"common-session"
]);
nsGlobal.serviceCaller = function(name, params, cbFn, failFn){
	switch(name){
	/* PVA提供 */
	/*cbFn(
		"deviceStatistic":{total: 48569,camera: 5541,iod: 459},
		"deviceList": [
			{name: "连云区",online: 10000,offline: 100}...
		],
		"deviceRank": {
			iod: {percent:80,ranking:1},   //{percent:完好率,ranking:排名}
			video: {percent:90,ranking:1},
		}
	)*/
	case "getDeviceInfo":
		setTimeout(function(){
			cbFn(Test.getDeviceInfo().data);
		}, 1000);
		break;
	/**
	 * PVA 提供
	 * params:{type:"iod"||"camera"}
	 * cbFn([{
	  		name: name,
			online: getRandom(100,15000),
			offline: getRandom(0, 100)
	 * }])
	 */
	case "getDeviceList": //各区摄像机、卡口建设
		setTimeout(function(){
			cbFn(Test.getDeviceList(params).data);
		}, 1000);
		break;
	/** PVD
	 * params:{
			from: "当前时间",
			type: "hour||week||month"  表示 近24小时||近一周||近一月
	    }
	 * cbFn({
		 	emphasis: {  //重点车辆
				name: "emphasis",
				num: 20,
				urls: ["./sim/cars/1.jpg"......]
			}, 
			deck: {  //套牌车辆
				name: "deck",
				num: 20,
				urls: ["./sim/cars/1.jpg"......]
			},		
			nocturnal: {  //昼伏夜出
				name: "nocturnal",
				num: 20,
				urls: ["./sim/cars/1.jpg"......]
			}
		})
	 */
	case "getCarList":
		setTimeout(function(){
			cbFn(Test.getCarList().data);
		}, 1000);
		break;
	/*  PVD
		params:{
			from: "当前时间",
			type: "hour||week||month"  表示 近24小时||近一周||近一月
		}
	 	cbFn([{name:"traffic",num: 200, time : 02} ...])
	 */
	case "trafficData":
		setTimeout(function(){
			cbFn(Test.trafficData(params).data);
		});
		break;
	/*  PVD  
		cbFn({
		total: 27256,  //总量
		province: {		//外省
			percent: 30
		},
		city: {			//外市
			percent: 25
		}
	})*/
	case "getOutCar":  //外地车辆
		setTimeout(function(){
			cbFn(Test.getOutCar().data);
		});
		break;
	/*cbFn([
		{name: "安徽", value: 99}, ...
	])*/
	case "getOutCarOrigin":  //外地车辆
		setTimeout(function(){
			cbFn(Test.getOutCarOrigin());
		});
		break;
	/* user 信息 PVA提供*/
	/* cbFn({
			user: { // PVA
				total: 14568,
				today: 1031,
				online: 537 
			},
			car: { //  PVD
				total: 43120343177,
				today: 217231, // 今日新增通行记录总数
				lib: 34219,	// 车辆库
				taxi: 8612,	// 出租车总数  //！ 无法得到
				pics: 8975,  // 二次识别图片数
				fake: 6212	// 套牌车数
			},
			face: { // ?face
				total: 53190543184,
				today: 227231, // 今日新增人脸数据总数
				vip: 12219,	// 重点人员库
				popular: 380627,	// 人口库数
				escaped: 391,  //全国在逃人员库
				pics: 5779  // 人脸比对
			}
		})
	*/
	case "getBasicData":
		setTimeout(function(){
			cbFn(Test.getBasicData());
		}, 1000);
		break;
	/* cbFn({
			// PVD
			carCaptured: [{id, url}], //取最近18个，管控人员车辆
			carMatched: [{id, url, pos}], //取最近3个， 布控告警 

			// face			
			faceCaptured: [{id, url}], //取最近30个
			faceMatched: [{id, url, pos}]  //取最近5个
		})
	 */	
	case "getCapturedAndMatched":
		setTimeout(function(){
			cbFn(Test.getCapturedAndMatched());
		}, 1000);
		break;

	/* //  PVD
		cbFn([{id, num }])
		id: 320700, // "连云港市局"
		id: 320721, //"赣榆分局",
		id: 320706,// "海州分局",
		id: 320703,// "连云分局",
		id: 320722, // "东海县局",
		id: 320723, // "灌云县局",
		id: 320724, // "灌南县局",
	*/
	case "getData4Map":
		setTimeout(function(){
			cbFn(Test.getSiteColumnsOnMap());
		}, 1000);
		break;
	/*  
		params:{id:2,type:"car"||"face"}
		//车辆布控报警 // PVD
		cbFn({
			iod: "某某路枪机一号",		//枪机位置
			time: "",
			number: "苏G 12345",		//车牌号码
			level: "二级",				//报警级别
			status: "yes",				//报警状态 yes=有效
			site: "海州区某某路2卡口",	//报警地点
			percent: 70,					//
			imgs: [
				{name:'',url:""},
				{name:'',url:""}
			]
		});
		//人脸布控报警 // ?face
		cbFn({
			iod: "某某路枪机一号",			//枪机位置
			time: "",
			name: "李丫丫",					//姓名
			sex: "女",						//性别
			database: "重点人员库",			//所在库
			idCard: "134215199007251235",	//证件号
			percent: 80,
			imgs: [
				{name:'',url:""},
				{name:'',url:""}
			]
		});
	 */
	case "getDetailData":
		setTimeout(function(){
			cbFn(Test.getDetailData(params));
		}, 1000);
		break;
	}
};

})();