/**
 * @fileoverview 腾讯视频统一播放器 H5内核 腾讯视频logo
 */

;
(function(tvp, $) {
	// extends control any feature ...
	$.extend(tvp.Html5UI.fn, {
		    buildlogo : function(player, $video, $control, $UILayer) {
				var $elements = {}, t = this,
					videoTag = $video[0];

				$.each(tvp.html5skin.elements.logo, function(k, v) {
					$elements[k] = $UILayer.find(v);
				});

				if(!tvp.app){
					return;
				}

				tvp.app.check({
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
})(tvp, tvp.$);