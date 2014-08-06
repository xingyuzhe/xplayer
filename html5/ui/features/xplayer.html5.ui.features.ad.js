/**
 * @fileOverview 初始化h5 loading广告插件模块代码
 */
;(function(tvp,$){
	function init(player, $video, $control, $UILayer){
		var adPlayer = new tvp.Html5LoaingAd(),
				  $container = $UILayer.find(tvp.html5skin.elements.loadingAd.main),
				  $control = $container.find(tvp.html5skin.elements.loadingAd.control),
				  $countdownContainer = $container.find(tvp.html5skin.elements.loadingAd.countdown),
				  $skipLink = $container.find(tvp.html5skin.elements.loadingAd.skip),
				  $moreLink = $container.find(tvp.html5skin.elements.loadingAd.more),
				  $adLink = $container.find(tvp.html5skin.elements.loadingAd.adLink);
			$video.on("tvp:player:videochange",function(){
				if(player.config.isHtml5ShowLoadingAdOnChange){
					adPlayer.getAdId();
				}
			});
			adPlayer.onEnd = function(){
				$container.hide();
				$video.data("data-playing-loadingad","0");
				$video.trigger("tvp:loadingad:ended");
			}
			adPlayer.onStart = function(){
				$video.data("data-playing-loadingad","1");
				$container.show();
			}
			adPlayer.create(player,{
				$container : $container,
				$control : $control,
				$countdownContainer : $countdownContainer,
				$skipLink : $skipLink,
				$moreLink : $moreLink,
				$adLink : $adLink,
				$copyrightTips : $container.find(tvp.html5skin.elements.loadingAd.copyrightTips),
				$qqvipSkip : $container.find(tvp.html5skin.elements.loadingAd.qqVipSkip)
			});
	}
	var hasInit = false;
	$.extend(tvp.Html5UI.fn,{
		buildloadingAd : function(player, $video, $control, $UILayer){
			if(hasInit){				
				return ;
			}
			hasInit = true;
			if(!player.config.isHtml5ShowLoadingAdOnStart){
				return ;
			}
			else if(typeof tvp.Html5LoaingAd != "function"){
				var jsurl = FILEPATH + 'plugins/loadingad.js?max_age=86400';
				$.getScript(jsurl, function() {		
					if(typeof tvp.Html5LoaingAd != "function"){
						$video.data("data-playing-loadingad","0");
						$video.trigger("tvp:loadingad:ended");
					}
					else{
						init(player, $video, $control, $UILayer);
					}
				});	
				return ;
			}
			init(player, $video, $control, $UILayer);
		}
	});
})(tvp,tvp.$);