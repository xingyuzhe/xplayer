/**
 * @fileoverview 腾讯视频统一播放器 H5内核 腾讯视频logo
 */

;
(function(xplayer, $) {
	// extends control any feature ...
	$.extend(xplayer.Html5UI.fn, {
		    buildlogo : function(player, $video, $control, $UILayer) {
				var $elements = {}, t = this,
					videoTag = $video[0];

				$.each(xplayer.html5skin.elements.logo, function(k, v) {
					$elements[k] = $UILayer.find(v);
				});

				if(!xplayer.app){
					return;
				}

				xplayer.app.check({
					vid:player.getCurVid()
				}).done(function(rs){
					if(window!=top){
						$elements.btn.attr('target','_parent');
					}
					$elements.btn.attr('href',rs.url);
					$elements.btn.attr('data-url',rs.openUrl);
				});	    	
		    }
	    });
})(xplayer, xplayer.$);