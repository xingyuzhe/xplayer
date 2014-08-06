/**
 * @fileoverview 腾讯视频统一播放器 H5内核 腾讯视频logo
 */

;
(function(tvp, $) {
	/**
	 * 建立HTML5播放器视频标题显示面板
	 * @param  {tvp.Player} player    tvp.Player实例
	 * @param  {$("video")} $video     video标签$查询结果
	 * @param  {$("control")} $control   控制栏标签$查询结果
	 * @param  {$("container")} $UILayer UI容器$查询结果
	 */
	$.extend(tvp.Html5UI.fn, {
		buildtitle: function(player, $video, $control, $UILayer) {
			var $elements = {}, t = this;

			$.each(tvp.html5skin.elements.title, function(k, v) {
				$elements[k] = $UILayer.find(v);
			});

			$video.on("tvp:video:ajaxsuc", function() {
				$elements.text.text(player.curVideo.getTitle());
			});
		}
	});
})(tvp, tvp.$);