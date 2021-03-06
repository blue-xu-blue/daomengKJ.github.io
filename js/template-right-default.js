/**
步骤:
	1:调用搜狐ip地址库，获取当前用户ip
	2.根据ip调用接口获取当前城市id
	3.根据城市id,从"中国天气"网站获取当前城市的天气数据
	4.获取34个省份，并从"中国天气"网站，获取到34个省份的天气数据
	5.对数据进行处理，并动态显示在页面上
*/

$(function(){	
	//执行线条动画	
	barOneAnimate();
	barTwoAnimate();
	barThreeAnimate();

	//解决跨域及混合内容问题(不可移除，否则无法访问"中国天气"网站和"http://api.k780.com")
	$.ajaxPrefilter(function (options) {
        if (options.crossDomain && jQuery.support.cors) {
            var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
            options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
            //options.url = "http://cors.corsproxy.io/url=" + options.url;
        }
    });

	//调用搜狐ip地址库，获取当前用户ip，获取到ip后再执行下一步操作
	var current_visit_ip = "";
	var getIPInterval = setInterval(function(){
		if(current_visit_ip != "" && current_visit_ip != null){
			//停止getIPInterval
			clearInterval(getIPInterval);
			console.log("当前ip: " + current_visit_ip);

			//接口:根据ip获取cityid，及weather数据(不太准确),这里只用到了cityid和citynm
			getCurrentAreaData(current_visit_ip);
			var areaInterval = setInterval(function(){
				if(currentAreaData != null && currentAreaData != "" && Object.keys(currentAreaData).length > 0){
					//停止areaInterval
					clearInterval(areaInterval);

					var current_cityid = currentAreaData["result"][0]["cityid"];
					var current_citynm = currentAreaData["result"][0]["citynm"];
					console.log("当前城市id:" + current_cityid + "-" + current_citynm);

					//根据cityid从“中国天气”网站获取天气数据
					loadCityWeather(current_cityid,current_citynm);
				}
			},2);

		}else{
			current_visit_ip = returnCitySN["cip"];
		}
		
	},2);

	//获取中国34省份cityid,并将天气数据存入provincesJson
	getProvinces34Data();

});



//接口:根据ip获取cityid，及weather数据(不太准确)
var currentAreaData;
function getCurrentAreaData(ip){
	/*$.ajax({
		url:'https://api.k780.com/?app=weather.future&weaid='+ip+'&&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json',
		//url:'http://api.k780.com:88/?app=weather.future&weaid='+ip+'&&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json',
		type:'get',
		dataType:'jsonp',
		jsonp:'jsoncallback',
		success:function(data){
			currentAreaData = data;
			console.log(data);
		},
		error:function(XMLHttpRequest, textStatus, errorThrown){
			alert(XMLHttpRequest.status);
            alert(XMLHttpRequest.readyState);
            alert(textStatus);
		},
		//async:false  //jsonp跨域请求，设置此属性无效
	});*/

	$.ajax({
		url:'http://api.k780.com/?app=weather.future&weaid='+ip+'&&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json',
		type:'get',
		dataType:'json',
		success:function(data){
			currentAreaData = data;
			//console.log(data);
		},
		error:function(){
			alert("获取cityId失败!");
		}
	});
	
}

//动态加载当前所在城市的天气数据
function loadCityWeather(cityId,cityName){
	var cityData = getChinaWeather(cityId,cityName,false);
	var interval = setInterval(function(){
		if(cityData != null && cityData != "" && Object.keys(cityData).length > 0){
			clearInterval(interval);
			console.log(cityData);

			//停止加载线条动画
			barOneAnimate_flg = false;
			$(".loading").hide();

			//将数据动态添加到html中
			$(".current_city > p > span").text(cityData["cityName"]);

			var current_time = cityData["currentData"]["current_time"];
			$(".current_time").text(current_time);
			$(".current_condition").text(cityData["currentData"]["current_condition"]);
			$(".current_temperature").text(cityData["currentData"]["current_temperature"]);
			$(".current_wind_direction").text(cityData["currentData"]["current_wind_direction"]);

			var forecast_time = cityData["forecastData"]["forecast_time"];
			$(".forecast_time").text(forecast_time);
			$(".forecast_condition").text(cityData["forecastData"]["forecast_condition"]);
			$(".forecast_temperature").text(cityData["forecastData"]["forecast_temperature"]);
			$(".forecast_wind_direction").text(cityData["forecastData"]["forecast_wind_direction"]);

			$(".current_weather,.forecast_weather").show();

			//整合折线图需要的数据
			console.log(cityData["weatherHourData"]);
			var weatherHourData = cityData["weatherHourData"];
			var time_array = [];
			var temperature_array = [];
			var wind_direction_array = [];
			for(var i in weatherHourData){
				var hourWeather = weatherHourData[i].split(",");

				time_array.push(hourWeather[0]);
				var temperature = hourWeather[3].substring(0,hourWeather[3].indexOf("℃"));
				temperature_array.push(temperature);
				wind_direction_array.push(hourWeather[4] + hourWeather[5]);
			}
			//console.log(time_array);
			//console.log(temperature_array);
			//console.log(wind_direction_array);

			//停止加载线条动画
			barTwoAnimate_flg = false;

			//绘制折线图
			drawLineEchart(time_array,temperature_array,wind_direction_array);
			$("#hourWeather").css("opacity","1");

			//添加时间分布区段  白天/夜间
			$(".timeDistribute > select").empty().append('<option value="currentData">'+current_time+'</option><option value="forecastData">'+forecast_time+'</option>').show();
			
		}
	},50);
}

//自定义json数据格式,存储中国34个省份的天气数据
var provincesJson = {};

//获取中国34省份cityid,并将天气数据存入provincesJson
function getProvinces34Data(){
	//从data/provinces34.json 中获取中国34个省份数据
	var data = getProvinces();
	
	for(var key in data){
		//console.log(key + " : " + data[key]);
		getChinaWeather(key,data[key],true);
	}
}


/**
*抓取“中国天气”网站数据
*cityId : 城市id
*cityName : 城市名称
*forFlg : true(循环获取多个城市数据)/false(单独只获取一个城市数据)
*/
function getChinaWeather(cityId,cityName,forFlg){
	var cityJson = {};
	$.get('http://www.weather.com.cn/weather1d/'+cityId+'.shtml',function (response) {
    	//截取需要用到的html内容
    	var startIndex = response.indexOf('<div class="today clearfix" id="today">');
    	var endIndex = response.indexOf('<script>',startIndex);

    	
    	var weatherHtml = response.substring(startIndex,endIndex+9);

    	//截取7天内的天气预报
    	var hourDataStartIndex = response.indexOf('{',startIndex);

    	var hourDataEndIndex = response.indexOf('}',startIndex);

    	var hourData = response.substring(hourDataStartIndex,hourDataEndIndex+1);

    	//json格式字符串转换为json对象
    	hourData = JSON.parse(hourData);

		/*for(var key in hourData){
    		console.log(key);
    		console.log(hourData[key]);
    	}*/

    	//console.log(hourData);

		//只获取当前一天内的天气预报
    	var weatherHourData = hourData["1d"];
    	//7天天气预报
    	//var sevenDayWeather = hourData["7d"];

    	/*for(var i in weatherHourData){
    		console.log(weatherHourData[i]);
    	}*/

    	//console.log(weatherHtml);
    	$(".storeData").html(weatherHtml);

    	if(!forFlg){
    		//获取当前所在城市的城区
    		getCityArea();

    	}

    	//基本情况:07月30日08时 周一  晴  34/25°C
    	//var basicMessage = $(".storeData > #today > #hidden_title").val();

    	//console.log(basicMessage);

    	//var weather_conditions = basicMessage.substring(basicMessage.indexOf("周")+4,basicMessage.lastIndexOf(" ")-1);

    	//console.log(basicMessage);

    	//获取当前时间段天气预报
    	var currentData = $(".storeData > #today > .t > .clearfix > li").first();

    	var current_time = currentData.children("h1").text();

    	var current_condition = currentData.children(".wea").text();

    	var current_temperature = currentData.children(".tem").children("span").text()+"°C";

    	var current_wind_direction = currentData.children(".win").children("span");

    	current_wind_direction = current_wind_direction.attr("title") + " " + current_wind_direction.text();

    	//获取预测时间段天气预报
    	var forecastData = $(".storeData > #today > .t > .clearfix > li").last();

    	var forecast_time = forecastData.children("h1").text();

    	var forecast_condition = forecastData.children(".wea").text();

    	var forecast_temperature = forecastData.children(".tem").children("span").text()+"°C";

    	var forecast_wind_direction = currentData.children(".win").children("span");

    	forecast_wind_direction = forecast_wind_direction.attr("title") + " " + forecast_wind_direction.text();


    	//将存放数据的html清空，便于下次使用
    	//$(".storeData").empty();

    	//将数据添加到自定义json中
    	if(forFlg){
			provincesJson[cityName] = cityJson;
    	}
    	cityJson["cityName"] = cityName;
    	//cityJson["weather_conditions"] = weather_conditions;
    	cityJson["currentData"] = {"current_time":current_time,"current_temperature":current_temperature,"current_condition":current_condition,"current_wind_direction":current_wind_direction};
    	cityJson["forecastData"] = {"forecast_time":forecast_time,"forecast_temperature":forecast_temperature,"forecast_condition":forecast_condition,"forecast_wind_direction":forecast_wind_direction};
    	cityJson["weatherHourData"] = weatherHourData;

    	if(forFlg){
    		//34个省份数据获取完成
    		if(Object.keys(provincesJson).length == 34){
        		console.log(provincesJson);

        		//对数据进行处理，得到地图需要的数据格式,默认加载当前时间段数据
        		var title = current_time + " 全国34省温度状况";
        		makeMapData("currentData",title);
        	}
    	}
    	
    });
    if(!forFlg){
    	return cityJson;
    }
}

//获取当前所在城市的城区
function getCityArea(){
	var selectHtml = "";
	$(".storeData > #today").find("#select > ul li").each(function(){
		var tip = $(this).attr("tip");
		var cityAreaName = $(this).text();
		selectHtml += '<option value="'+tip+'">'+cityAreaName+'</option>';
	});
	$(".cityArea").empty().append(selectHtml).show();			
}

//动态加载城区天气数据
function getCityAreaWeather(city){
	var cityId = $(city).val();
	var cityName = $(city).children("option:selected").text();
	loadCityWeather(cityId,cityName);

	barOneAnimate();
	barTwoAnimate();
	$(".loading").show();
	$(".current_weather,.forecast_weather").hide();
	$("#hourWeather").css("opacity","0");
}

//切换地图时段
function timeDistribute(time){
	makeMapData($(time).val());
}

/**
*对数据进行处理，得到地图需要的数据格式
*timeDistribute: currentData / forecastData
*/
function makeMapData(timeDistribute){
	var mapData = [];
	var title;
	for(var city in provincesJson){
		var data = provincesJson[city];
		var cityName = data["cityName"];
		if(cityName.indexOf("内蒙古") != -1 || cityName.indexOf("黑龙江") != -1){
			cityName = data["cityName"].substr(0,3);
		}else{
			cityName = data["cityName"].substr(0,2);
		}
		var temperature;
		if(timeDistribute == "currentData"){
			temperature = data["currentData"]["current_temperature"];
			title = data["currentData"]["current_time"] + " 全国34省温度状况";
		}else{
			temperature = data["forecastData"]["forecast_temperature"];
			title = data["forecastData"]["forecast_time"] + " 全国34省温度状况";
		}
		temperature = temperature.substring(0,temperature.indexOf("°C"));

		//console.log(cityName + ":" + temperature);

		var json = {"name":cityName,"value":temperature};
		mapData.push(json);
	}
	console.log(mapData);

	//停止barThreeAnimate动画
    barThreeAnimate_flg = false;

	//绘制地图
	drawMapEchart(mapData,title);
}

//加载echart折线图
function drawLineEchart(time_array,temperature_array,wind_direction_array){
	var myChart = echarts.init(document.getElementById('hourWeather'));
	option = {
	    tooltip:{
	        show: true,
	        formatter:'{b}:{c}°C'
	    },
	    grid:{
	        top: '25px',
	        left: '0',
	        right: '0',
	        bottom: '25px'
	    },
	    xAxis: [
	        {
	            type: 'category',
	            data: time_array,
	            axisLine:{
	                show : false
	            },
	            axisTick:{
	                show : false
	            },
	            axisLabel:{
	            	color:'white'
	            }
	        },
	        {
	            type: 'category',
	            data: wind_direction_array,
	            axisLine:{
	                show : false
	            },
	            axisTick:{
	                show : false
	            },
	            axisLabel:{
	            	color:'white'
	            }
	        }
	    ],
	    yAxis: {
	        show: false,
	        max: 50
	    },
	    series: [{
	        data: temperature_array,
	        type: 'line',
	        itemStyle:{
	            color: '#01e4d8',
	            borderWidth:5,
	            borderType: 'solid'
	        },

	    }]
	};
	myChart.setOption(option);
}

//加载echart地图
function drawMapEchart(mapData,title){
	var myChart = echarts.init(document.getElementById('chinaMap'));

    option = {
		title : {
			text: title,
	        x:'left',
	        textStyle:{
	        	color:'white'
	        }
	    },
        tooltip: {},
        visualMap: {
            min: 0,
            max: 40,
            left: 'left',
            top: 'bottom',
            text: ['High','Low'],
            seriesIndex: [1],
            inRange: {
                color: ['#7acffa', '#f5f649','#ec441f']
            },
            calculable : true,
            textStyle:{
            	color:'white'
            }
        },
        geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        color: 'rgba(0,0,0,0.4)'
                    }
                }
            },
            itemStyle: {
                normal:{
                    borderColor: 'rgba(0, 0, 0, 0.2)'
                },
                emphasis:{
                    areaColor: null,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowBlur: 20,
                    borderWidth: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        },
        series : [
           {
               type: 'scatter',
               coordinateSystem: 'geo',
               symbolSize: 20,
               symbol: 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z',
               symbolRotate: 35,
               label: {
                   normal: {
                       formatter: '{b}',
                       position: 'right',
                       show: false
                   },
                   emphasis: {
                       show: true
                   }
               },
               itemStyle: {
                   normal: {
                        color: '#F06C00'
                   }
               }
            },
            {
                name: '温度°C',
                type: 'map',
                geoIndex: 0,
                // tooltip: {show: false},
                data:mapData
            }
        ]
    };
	myChart.setOption(option);
}

//html class = barOne 动画
var barOneAnimate_flg = true;
function barOneAnimate(){
	$(".barOne").animate({
		width : '0',
		opacity : '1'
	},600,function(){
		$(".barOne").animate({
			width : '943px'
		},600,function(){
			$(".barOne").css("float","right");
			$(".barOne").animate({
				width : '0'
			},600,function(){
				$(".barOne").animate({
					width : '943px',
					opacity : '0.2'
				},600,function(){
					$(".barOne").css("float","left");
					if(barOneAnimate_flg){
						barOneAnimate();
					}
				});
			});
		});
	});
}

//html class = barTwo 动画
var barTwoAnimate_flg = true;
function barTwoAnimate(){
	$(".barTwo").animate({
		width : '0',
		opacity : '1'
	},800,function(){
		$(".barTwo").animate({
			width : '943px'
		},800,function(){
			$(".barTwo").css("float","left");
			$(".barTwo").animate({
				width : '0'
			},800,function(){
				$(".barTwo").animate({
					width : '943px',
					opacity : '0.2'
				},800,function(){
					$(".barTwo").css("float","right");
					if(barOneAnimate_flg){
						barTwoAnimate();
					}
				});
			});
		});
	});
}

//html class = barThree 动画
var barThreeAnimate_flg = true;
function barThreeAnimate(){
	$(".barThree").animate({
		width : '0',
		opacity : '1'
	},1000,function(){
		$(".barThree").animate({
			width : '943px'
		},1000,function(){
			$(".barThree").css("float","right");
			$(".barThree").animate({
				width : '0'
			},1000,function(){
				$(".barThree").animate({
					width : '943px',
					opacity : '0.2'
				},1000 	,function(){
					$(".barThree").css("float","left");
					if(barOneAnimate_flg){
						barThreeAnimate();
					}
				});
			});
		});
	});
}