/**
 * @fileOverview 初始化h5 loading广告插件模块代码
 */
;(function(xplayer,$){
	function init(player, $video, $control, $UILayer){
		var adPlayer = new xplayer.Html5LoaingAd(),
				  $container = $UILayer.find(xplayer.html5skin.elements.loadingAd.main),
				  $control = $container.find(xplayer.html5skin.elements.loadingAd.control),
				  $countdownContainer = $container.find(xplayer.html5skin.elements.loadingAd.countdown),
				  $skipLink = $container.find(xplayer.html5skin.elements.loadingAd.skip),
				  $moreLink = $container.find(xplayer.html5skin.elements.loadingAd.more),
				  $adLink = $container.find(xplayer.html5skin.elements.loadingAd.adLink);
			$video.on("xplayer:player:videochange",function(){
				if(player.config.isHtml5ShowLoadingAdOnChange){
					adPlayer.getAdId();
				}
			});
			adPlayer.onEnd = function(){
				$container.hide();
				$video.data("data-playing-loadingad","0");
				$video.trigger("xplayer:loadingad:ended");
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
				$copyrightTips : $container.find(xplayer.html5skin.elements.loadingAd.copyrightTips),
				$qqvipSkip : $container.find(xplayer.html5skin.elements.loadingAd.qqVipSkip)
			});
	}
	var hasInit = false;
	$.extend(xplayer.Html5UI.fn,{
		buildloadingAd : function(player, $video, $control, $UILayer){
			if(hasInit){				
				return ;
			}
			hasInit = true;
			if(!player.config.isHtml5ShowLoadingAdOnStart){
				return ;
			}
			else if(typeof xplayer.Html5LoaingAd != "function"){
				var jsurl = FILEPATH + 'plugins/loadingad.js?max_age=86400';
				$.getScript(jsurl, function() {		
					if(typeof xplayer.Html5LoaingAd != "function"){
						$video.data("data-playing-loadingad","0");
						$video.trigger("xplayer:loadingad:ended");
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
})(xplayer,xplayer.$);