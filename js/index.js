$(function(){
	$(".user").animate({
		opacity:'1'
	},3000,function(){
		$(".lamplight").animate({opacity:'1'},300);
		$(".leftShadow").animate({opacity:'1'},300);
		$(".rightShadow").animate({opacity:'1'},300,
			function(){
				eachImg("textTagTop",function(){
					eachImg("textTagBottom",function(){
						setTimeout(function(){
							window.location.href = "html/template.html"
						},800);
					});
				});	
			});
		$(".snowflake").animate({opacity:'0.6'},300);
	});
});

function eachImg(containerName,callback){
	var className = $("."+containerName).children("img:first-child").attr("class");
	showImg(className,callback);
}

function showImg(img,callback){
	var _img = $("."+img);
	_img.animate({opacity:'1'},360,function(){
		var nextImgName = _img.next().attr("class");
		if(nextImgName != "" && nextImgName != null){
			showImg(nextImgName,callback);
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