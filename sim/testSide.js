(function(){
	IX.ns("Test");
	var ixDate = IX.Date;
	function getRandom(x, y){
		return Math.round(Math.random()*(y-x)+x);
	}
	var citys = [
		'连云港市局',
		'连云区',
		'海州区',
		'赣榆区',
		'开发区',
		'高新区',
		'徐圩区',
		'灌云县',
		'东海县',
		'灌南县',
	];
	function genDeviceList(type){
		return IX.map(citys,function(name){
			return {
				name: name,
				online: getRandom(100,15000),
				offline: getRandom(0, 100)
			}
		});
	}
	Test.getDeviceList = function(params){
		return {
			code: 400,
			data: genDeviceList(params.type)
		};
	}
	Test.getDeviceInfo = function(){
		return {
			code: 200,
			data: {
				"deviceStatistic":{
					total: 48569,
					camera: 5541,
					iod: 459
				},
				"deviceList": genDeviceList(),
				"deviceRank": {
					iod: {percent:80,ranking:1},
					video: {percent:90,ranking:1},
				}
			}
		}
	} 
	function genData(from,type){
		var date = new Date(from);
		var range = 7;
		var randFrom = 5000,
			randEnd = 10000,
			timeFun = 'getDateOfDays',
			formatFun = 'formatDate';
		switch(type){
			case 'hour':
				range = 24;
				randFrom = 100;
				randEnd = 1000;
				timeFun = 'getDateOfHours';
				formatFun = 'format';
				break;
			case 'week':
				range = 7;
				break;
			case 'month':
				range = 30;
				break;
		}

		var list = [],num = 0;
		for(var i=0; i<range; i++){
			num = getRandom(randFrom,randEnd);
			time = ixDate[formatFun](ixDate[timeFun](date, i-(range-1)));
			list.push({name:"traffic",num: num, time : time});
		}
		return list;
	}
	Test.trafficData = function(params){
		return {
			code: 200,
			data: genData(params.from,params.type)
		};
	}
	
	Test.trafficStatic = function(){
		return {
			code: 200,
			data: {
				emphasis: 105,
				deck: 67,
				nocturnal: 132
			}
		}
	}
	
	var carTypes = ["emphasis","deck","nocturnal"];
	var imgFiles  = [
		{id: 1, url : IXW_BaseUrl+"/sim/cars/1.jpg",width:1616,height:1280},
		{id: 2, url : IXW_BaseUrl+"/sim/cars/2.jpg",width:1616,height:1328},
		{id: 3, url : IXW_BaseUrl+"/sim/cars/3.jpg",width:1600,height:1280},
		{id: 4, url : IXW_BaseUrl+"/sim/cars/4.jpg",width:1616,height:1280},
		{id: 5, url : IXW_BaseUrl+"/sim/cars/5.jpg",width:1616,height:1328},
		{id: 6, url : IXW_BaseUrl+"/sim/cars/6.jpg",width:1616,height:1280},
		{id: 7, url : IXW_BaseUrl+"/sim/cars/7.jpg",width:1616,height:1280},
		{id: 8, url : IXW_BaseUrl+"/sim/cars/8.jpg",width:1600,height:1232},
		{id: 9, url : IXW_BaseUrl+"/sim/cars/9.jpg",width:1616,height:1280},
		{id: 10, url : IXW_BaseUrl+"/sim/cars/10.jpg",width:1616,height:1292},
		{id: 11, url : IXW_BaseUrl+"/sim/cars/11.jpg",width:1600,height:1280},
		{id: 12, url : IXW_BaseUrl+"/sim/cars/12.jpg",width:1600,height:1280},
		{id: 13, url : IXW_BaseUrl+"/sim/cars/13.jpg",width:1616,height:1280}
	];
	Test.getCarList = function(params){
		function getUrls(total){
			var imgTotal = imgFiles.length,
				arr = [];
			for(var i=1;i<=total; i++){
				var nIndex = i % imgTotal;
				if(nIndex == 0){
					nIndex = 1;
				}
				arr.push(imgFiles[nIndex]);
			}
			return arr;
		}
		var obj = {};
		var data = IX.iterate(carTypes,function(type){
			var num = getRandom(1, 20);
			obj[type]= {
				name: type,
				num: num,
				urls: getUrls(num)
			};
		});

		return {
			code: 200,
			data: obj
		};
	};

	Test.getOutCar = function(){
		return {
			code: 200,
			data: {
				total: 27256,
				province: {
					percent: 30
				},
				city: {
					percent: 25
				}
			}
		}
	};

	var provinces = IX.map([
		"北京:300", "上海:3000", "天津:180", "重庆:350", "河北:800", "山西:900",
		"辽宁:10", "吉林:10", "黑龙江:10", "浙江:2000", "福建:400", "山东:2500",
		"河南:1000", "湖北:600", "湖南:400", "广东:300", "海南:5", "四川:400",
		"贵州:10", "云南:20", "江西:400", "陕西:100", "青海:60", "甘肃:50",
		"广西:20", "新疆:10", "内蒙古:20", "西藏:4", "宁夏:30", "台湾:4",
		"香港:5", "澳门:5", "安徽:2000", "江苏:0"
	], function(item){
		var arr = item.split(":");
		var base = arr[1] - 0; base0 = Math.floor(base / 2);
		return {name: arr[0], value: getRandom(base0, base)} ;
	});
	Test.getOutCarOrigin = function(){
		return provinces;
	};
})();