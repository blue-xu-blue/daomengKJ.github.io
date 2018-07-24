$(function(){
	liAddAnimate("leftnav",function(){
		setTimeout(function(callback){
			$(".leftnav > li").first().click();
			$(".top-bar").animate({
				width : '945px'
			},200,function(){
				$(".top-time").animate({
					opacity : '1'
				},200);
			});
		},300,loadRightDefault());

	});

	$(".leftnav > li").click(function(){
		$(this).siblings().find("ol").slideUp("fast");
		var ol = $(this).find("ol");
		if(ol != null && ol != ""){
			ol.slideToggle("fast");	
		}
	});

	//加载翻页时间表
	$("#time-flipcountdown").flipcountdown({speedFlip:50});
	getWeekDay();

});
function liAddAnimate(ul,callback){
	var _li = $("."+ul+" li").first();
	eachli(_li,callback);
}
function eachli(li,callback){
	li.animate({
		left : '0'
	},220,function(){
		var nextLi = li.next();
		if(nextLi.length != 0){
			eachli(nextLi,callback);
		}else{
			if (callback != "" && callback != null) {
				if(typeof(callback) === "function"){
					callback();
				}else{
					alert("Callback is not a function");
				}
			}
		}
	});
}
function getWeekDay(){
	var date = new Date();
	var num = date.getDay();
	var fromWeekNum = 5 - num;
	var weekText = "";
	switch(num){
		case 1: 
		weekText = "今天是星期一,距离周末还有 <em>"+fromWeekNum+"</em> 天";
		break;
		case 2:
		weekText = "今天是星期二,距离周末还有 <em>"+fromWeekNum+"</em> 天";
		break;
		case 3:
		weekText = "今天是星期三,距离周末还有 <em>"+fromWeekNum+"</em> 天";
		break;
		case 4:
		weekText = "今天是星期四,距离周末还有 <em>"+fromWeekNum+"</em> 天";
		break;
		case 5:
		weekText = "今天是星期五,明天就是周末！";
		break;
		case 6:
		weekText = "今天是星期六,周末愉快！";
		break;
		case 0:
		weekText = "今天是星期日,明天又要上班了！";
		break;
	}
	$(".weekendText").append(weekText);
}
function loadRightDefault(){
	$(".rightbar").animate({
		height : '100%'
	},200,function(){
		$(".switchConainer").load("../html/template-right-default.html");
	});
}