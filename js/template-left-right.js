$(function(){
	liAddAnimate("leftnav",function(){
		setTimeout(function(callback){
			$(".leftnav > li").first().click();
		},300,loadRightDefault());

	});

	$(".leftnav > li").click(function(){
		$(this).siblings().find("ol").slideUp("fast");
		var ol = $(this).find("ol");
		if(ol != null && ol != ""){
			ol.slideToggle("fast");	
		}
	});
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
function loadRightDefault(){
	$(".template-right").load("../html/template-right-default.html");
}