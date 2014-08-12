(function(xplayer, $) {

	// extends control any feature ...
	$.extend(xplayer.Html5UI.fn, {
		buildbigben: function(player, $video, $control, $UILayer) {

			var $elements = {}, t = this,
				videoTag = $video[0],
				temp_time = 0; //临时变量，记录上次获取到的时间，用于判断左移右移

			$.each(xplayer.html5skin.elements.bigben, function(k, v) {
				$elements[k] = $UILayer.find(v);
			});

			$control.on("xplayer:progress:touchstart", function(e, data) {
				$elements.main.show();
				$elements.desc.text($.formatSeconds(data.time));
				$elements.bar.width(data.time / player.getDuration() * 100 + "%");
				if (data.time < temp_time) {
					$elements.ffrw.addClass("xplayer_ico_rw");
				} else {
					$elements.ffrw.removeClass("xplayer_ico_rw");
				}
				temp_time = data.time;
			}).on("xplayer:progress:touchend", function() {
				$elements.main.hide();
				$elements.desc.text("");
			});

		}
	});
})(xplayer, xplayer.$);