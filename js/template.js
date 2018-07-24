$(function(){
	$(".bgImg").animate({
		width : '300px',
		opacity : '1'
	},360,function(){
		$(".template-top-line").animate({
			width : '100%'
		},500,function(){
			setTimeout(function(){
				$(".bgImg").animate({
					width : '600px',
					opacity : '0.5',
				},180,function(){
					$(".bgImg").animate({
						width : '100px',
						opacity : '1'
					},300,function(){
						$(".bgImg").animate({
							opacity : '0'
						},1800);
						$(".logoImg").animate({
							opacity : '1'
						},2000,function(){
							$(".nav a").animate({
								opacity : '1'
							},200);
							setTimeout(function(){
								$(".middlebar").animate({
									height : '100%'
								},400);
								setTimeout(function(){
									$(".leftbar").animate({
										height : '100%'
									},400,function(){
										$(".template-main").load("../html/template-left-right.html");
									});
								},100);
							},200);
						});
					});
				});
			},300);
		});
	});
	
});
