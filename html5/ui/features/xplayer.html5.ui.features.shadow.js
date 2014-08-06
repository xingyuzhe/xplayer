/**
 * @fileoverview 腾讯视频统一播放器H5内核shadow遮罩层用于覆盖一个透明div放到video标签正上方拦截用户直接对video的触摸操作的默认逻辑
 *
 */


;
(function(tvp, $) {
	$.extend(tvp.Html5UI.fn, {
		/**
		 * 建立shadow插件创建入口
		 * @param  {tvp.Player} player    tvp.Player实例
		 * @param  {$("video")} $video     video标签$查询结果
		 * @param  {$("control")} $control   控制栏标签$查询结果
		 * @param  {$("container")} $UILayer UI容器$查询结果
		 */
		buildshadow: function(player, $video, $control, $UILayer) {
			var $shadow = $('<div class="tvp_shadow"></div>').appendTo($UILayer);
			var t = this;
			//如果不是设置为永远显示控制栏，就要做自动化隐藏逻辑
			if (!player.config.isHtml5ControlAlwaysShow) {
				$shadow.bind(t.getClickName(), function(e) {
					if (t.isHidden() && (t.videoTag.currentTime || t.overlayPlayClicked)) {
						t.show();
						t.beginHide(8e3); //显示了控制栏以后倒计时8秒，8秒内啥都不做，直接关闭，除非点击了其他控制区域
					} else {
						t.hide();
					}
					e.preventDefault();
					e.stopPropagation();
				});
			}
		}

	});
})(tvp, tvp.$);