/**
 * @fileoverview 腾讯视频统一播放器H5内核控制栏上的进度条
 *
 */

(function(tvp, $) {

	/**
	 * 扩展控制栏进度条
	 * @param  {tvp.Player} player    tvp.Player实例
	 * @param  {$("video")} $video     video标签$查询结果
	 * @param  {$("control")} $control   控制栏标签$查询结果
	 * @param  {$("container")} $UILayer UI容器$查询结果
	 */
	$.extend(tvp.Html5UI.fn, {
		buildprogress: function(player, $video, $control, $UILayer) {

			var t = this,
				videoTag = $video[0],
				$elements = {},
				mouseIsDown = false;
			this.isTouching = false;

			$.each(tvp.html5skin.elements.progress, function(k, v) {
				$elements[k] = $control.find(v);
			});

			/**
			 * handleMove  处理鼠标或者手势移动
			 *
			 * @ignore
			 * @param  {[TouchEvent]} touchEvent 触摸事件
			 * @return {[type]}            [description]
			 */

			function handleMove(touchEvent) {
				if (!player.getDuration()) return null;

				var x = touchEvent.pageX,
					offset = $elements.total.offset().left, // 记录点击左边的相对偏移量
					precent = 0, // 点击位置的百分比
					progressWidth = $elements.total.width(),
					expectTime = 0, // 最后算出的期望拖拽到的时间点
					pos = 0;

				if (x < offset) {
					x = offset;
				} else if (x > progressWidth + offset) {
					x = progressWidth + offset;
				}
				pos = x - offset;

				precent = pos / progressWidth;
				expectTime = player.getDuration() * precent;
				var data = {
					"pos": pos,
					"precent": precent,
					"time": expectTime
				}
				$control.trigger("tvp:progress:touchstart", data);
				return data;
			}



			$elements.total.bind("touchstart", function(e) {
				e = !! e.originalEvent ? e.originalEvent : e;
				if (e.targetTouches.length != 1 || t.isTouching) return;
				t.isTouching = true;
				e.preventDefault();
				videoTag.pause();
				var d = handleMove(e.targetTouches[0]); !! d && (t.setProgress(d.pos, $elements));
				player.isDefinitionSwitching = false;

				$elements.total.bind("touchmove", function(e) {
					e = !! e.originalEvent ? e.originalEvent : e;
					if (e.targetTouches.length != 1) return;
					var d = handleMove(e.targetTouches[0]); !! d && (t.setProgress(d.pos, $elements));
					e.preventDefault();

				}).bind("touchend", function(e) { //看清楚哦，这里写的是one，而不是on哦
					e = !! e.originalEvent ? e.originalEvent : e;
					t.isTouching = false;
					if (e.changedTouches.length != 1) return;
					var d = handleMove(e.changedTouches[0]); !! d && (t.setProgress(d.pos, $elements));
					player.seek(d.time);
					e.preventDefault();
					e.stopPropagation();
					$elements.total.unbind("touchmove");
					$elements.total.unbind("touchend");
					$control.trigger("tvp:progress:touchend");
				});

			})

			$video.bind("timeupdate", function(e) {
				e = !! e.originalEvent ? e.originalEvent : e;
				if (t.isHidden() || !! player.isDefinitionSwitching) return; //隐藏了就不计算了，浪费资源啊
				if (e.target.readyState == 4) {
					var curLeft = videoTag.currentTime / player.getDuration() * $elements.total.width();
					t.setProgress(curLeft, $elements);
				}
			});

			$video.bind("progress", function(e) {
				if (t.isHidden() || !! player.isDefinitionSwitching) return;
				var bufferd = 0,
					curLeft = 0;
				if (videoTag.buffered && videoTag.buffered.length > 0 && videoTag.buffered.end && player.getDuration()) {
					curLeft = videoTag.buffered.end(0) / player.getDuration() * $elements.total.width();
					$elements.loaded.css("width", curLeft);
				}
			}).bind("tvp:video:src", function() {
				if ( !! player.isDefinitionSwitching) return;
				t.resetProgress();
			})

			$control.bind("tvp:control:show", function() {
				var curLeft = videoTag.currentTime / player.getDuration() * $elements.total.width();
				t.setProgress(curLeft, $elements);
			});

			$.extend(this, {
				resetProgress: function() {
					$elements.cur.css('width', "0px");
					$elements.handle.css('left', "0px");
					$elements.loaded.css("width", "0px");
				}
			});
		},
		/**
		 * 设置进度条
		 * @param {[Number]} curLeft   宽度
		 * @param {Object} $elements DOM元素集合
		 */
		setProgress: function(curLeft, $elements) {
			var progressWidth = $elements.total.width(), // 记录进度条总体宽度
				handlWidth = $elements.handle.width(),
				handlLeft = curLeft - handlWidth / 2;

			handlLeft = Math.min(handlLeft, progressWidth - handlWidth);
			handlLeft = Math.max(handlLeft, 0);

			$elements.cur.css('width', curLeft + "px");
			$elements.handle.css('left', handlLeft + "px");
		}
	});
})(tvp, tvp.$);