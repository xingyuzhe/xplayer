;
(function(xplayer, $) {
	/**
	 * Flash直播播放器类
	 * @class xplayer.FlashPlayer
	 * @extends xplayer.BaseFlash
	 */
	xplayer.flash.LivePlayer = function() {
		xplayer.BaseFlash.maxId++;
	}

	/*
	 * 从xplayer.BaseFlash继承
	 */
	xplayer.flash.LivePlayer.prototype = new xplayer.flash.BasePlayer();

	$.extend(xplayer.FlashLivePlayer.prototype, {

		getPlayerType: function() {
			return "liveflash";
		},
		/**
		 * 获得播放器的flashvars
		 * @return {[type]} [description]
		 */
		getFlashVar: function() {
			var flashvar = '';
			return flashvar;
		},
		play: function(video) {},
		pause: function() {}
	});
})(xplayer, xplayer.$);