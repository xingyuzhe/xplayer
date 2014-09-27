/**
 * @fileoverview 腾讯视频统一播放器 H5内核 腾讯视频logo
 */

;
(function(xplayer, $) {
	/**
	 * 建立HTML5播放器视频标题显示面板
	 * @param  {xplayer.Player} player    xplayer.Player实例
	 * @param  {$("video")} $video     video标签$查询结果
	 * @param  {$("control")} $control   控制栏标签$查询结果
	 * @param  {$("container")} $UILayer UI容器$查询结果
	 */
	$.extend(xplayer.Html5UI.fn, {
		buildtitle: function(player, $video, $control, $UILayer) {
			var $elements = {}, t = this;

			$.each(xplayer.html5skin.elements.title, function(k, v) {
				$elements[k] = $UILayer.find(v);
			});

			$video.on("xplayer:video:ajaxsuc", function() {
				$elements.text.text(player.curVideo.getTitle());
			});
		}
	});
})(xplayer, xplayer.$);