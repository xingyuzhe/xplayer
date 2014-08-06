/**
 * @fileoverview 腾讯视频统一播放器H5内核控制栏下载App文字提示
 *
 */

(function(tvp, $) {

	$.extend(tvp.Html5UI.fn, {
		/**
		 * 扩展播放暂停按钮
		 * @param  {tvp.Player} player    tvp.Player实例
		 * @param  {$("video")} $video     video标签$查询结果
		 * @param  {$("control")} $control   控制栏标签$查询结果
		 * @param  {$("container")} $UILayer UI容器$查询结果
		 */
		buildpromotion: function(player, $video, $control, $UILayer) {
			if (!$.os.ipad) return; //目前只针对iPad才有这个提示

			var $elements = {},
				t = this;


			$.each(tvp.html5skin.elements.promotion, function(k, v) {
				$elements[k] = $UILayer.find(v);
			});

			function report(val) {
				var data = {
					cmd: 3526,
					val: val,
					itype: (function() {
						if ($.os.iPad) return 2;
						if ($.os.iPhone || $.os.ipod) return 1;
						if ($.os.android) return 3;
						return 4;
					})(),
					url: window != top ? document.referrer : document.location.href
				}
				tvp.report(data);
			}

			$elements.link.bind("click", function() {
				report(2);
			});

			if ($.isString(player.config.iPadPromotionText) && player.config.iPadPromotionText.length > 0) {
				$elements.link.text(player.config.iPadPromotionText);
			}

			$elements.main.show();

			report(1);


		}
	});
})(tvp, tvp.$);