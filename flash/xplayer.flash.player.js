;
(function(xplayer, $) {
	/**
	 * Flash播放器类
	 * @class xplayer.FlashPlayer
	 * @extends xplayer.BaseFlash
	 */
	xplayer.flash.Player = function(vWidth, vHeight) {
		xplayer.BaseFlash.maxId++;
	}

	/*
	 * 从xplayer.BasePlayer继承，这句话很关键，谁注释掉谁SB
	 */
	xplayer.flash.Player.fn = xplayer.flash.Player.prototype = new xplayer.flash.BasePlayer();

	$.extend( xplayer.flash.Player.fn, {
		getPlayerType: function() {
			return "flash";
		},
		play: function(video) {},
		pause: function() {},
		getFlashVar: function() {
			var flashvar = '';
			return flashvar;
		},
		getCurrentTime: function() {},
		seek: function() {},
		seekTo: function() {}
	});

})(xplayer, xplayer.$);