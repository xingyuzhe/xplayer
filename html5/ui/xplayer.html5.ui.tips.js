/**
 * @fileoverview 腾讯视频统一播放器H5内核 功能性tips
 *
 */

;
(function(xplayer, $) {

	// 扩展UI的功能性TIPS提醒
	$.extend(xplayer.Html5UI.fn, {
		/**
		 * 建立shadow插件创建入口
		 * @param  {xplayer.Player} player    xplayer.Player实例
		 * @param  {$("video")} $video     video标签$查询结果
		 * @param  {$("control")} $control   控制栏标签$查询结果
		 * @param  {$("container")} $UILayer UI容器$查询结果
		 */
		buildtips: function(player, $video, $control, $UILayer) {
			var $elements = {}, t = this;

			$.each(xplayer.html5skin.elements.tips, function(k, v) {
				$elements[k] = $UILayer.find(v);
			});

			function showTips(msg, hideTime) {
				if ($.isUndefined(hideTime)) {
					hideTime = 5;
				}
				$elements.main.addClass("xplayer_show");
				$elements.desc.text(msg);

				if (hideTime != 0) {
					setTimeout(function() {
						$elements.main.removeClass("xplayer_show");
						$elements.desc.text("");
					}, hideTime * 1000);
				}
			}

			/**
			 * 扩展showTips
			 */
			$.extend(xplayer.Html5Player.fn, {
				"showTips": showTips
			})
		}

	});
})(xplayer, xplayer.$);