/**
 * @fileoverview 腾讯视频统一播放器H5内核 poster遮罩层
 *
 */


;
(function(xplayer, $) {

	// extends control any feature ...
	$.extend(xplayer.Html5UI.fn, {
		/**
		 * 扩展poster遮罩
		 * @param  {xplayer.Player} player    xplayer.Player实例
		 * @param  {$("video")} $video     video标签$查询结果
		 * @param  {$("control")} $control   控制栏标签$查询结果
		 * @param  {$("container")} $UILayer UI容器$查询结果
		 */
		buildposterlayer: function(player, $video, $control, $UILayer) {
			var $poster = $UILayer.find(xplayer.html5skin.elements.posterlayer.main),
				$img = $poster.find(xplayer.html5skin.elements.posterlayer.img),
				t = this,
				setPoster = function(url) {
					url = url || player.curVideo.getPoster() || player.config.pic;
					if (url.length == 0) {
						var _url = $img.attr("src");
						if (_url != "") {
							url = _url;
						}
					}
					if ($.isString(url) && url.length > 0) {
						url = $.filterXSS(url);
						$img.attr("src", url);
						showPoster();
					} else {
						hidePoster();
					}
				},
				showPoster = function() {
					$poster.show();
					$video.one("play playing", hidePoster);
					//$video.on("timeupdate", hidePoster);
				},
				hidePoster = function() {
					$poster.hide();
					//$video.off("timeupdate", hidePoster);
				};

			//$poster.css("height", player.config.height).css("width", player.config.width);

			if (player.config.isHtml5ShowPosterOnStart) {
				setPoster();
			}

			$.extend(this, {
				setPoster: setPoster,
				showPoster: showPoster,
				hidePoster: hidePoster
			});

			$.extend(player, {
				setPoster: setPoster
			});

			if (($.os.iphone || $.os.ipod) && player.config.isiPhoneShowPosterOnPause) {
				$video.on("pause paused", function() {
					t.setPoster();
				})
			}



		}
	});
})(xplayer, xplayer.$);