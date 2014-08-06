/**
 * @fileOverview 腾讯视频云播放器 MP4文件地址直接链接
 *
 */



;
(function(tvp, $) {
	var curVid = "";
	tvp.MP4Skin = {
		html: (function() {
			return [
				'<div style="background:#000000 url(http://i.gtimg.cn/qqlive/images/20121119/i1353305744_1.jpg) center center no-repeat;">',
				'	<a style="width:100%;height:100%;display:block" class="tvp_mp4_link"></a>',
				'</div>'].join("");
		})()
	}

	tvp.MP4Link = function(vWidth, vHeight) {
		this.config.width = tvp.$.filterXSS(vWidth);
		this.config.height = tvp.$.filterXSS(vHeight);
		this.$elements = null;
		this.$mp4linker = null;
	};

	tvp.MP4Link.fn = tvp.MP4Link.prototype = new tvp.BaseHtml5();
	$.extend(tvp.MP4Link.fn, {

		/**
		 * 输出播放器
		 * @override
		 * @param  {[type]} id [description]
		 * @return {[type]}    [description]
		 */
		write: function(id) {
			var el = null,
				t = this;
			if ($.type(id) == "object" && id.nodeType == 1) {
				el = id;
			} else {
				el = tvp.$.getByID(id);
			}
			if (!el) return;

			this.playerid = this.config.playerid;
			if (!this.playerid) {
				this.playerid = "tenvideo_video_player_" + (tvp.MP4Link.maxId++);
			}
			this.modId = id;
			this.$mod = $("#" + id);
			this.oninited();

			var htmlBuf = tvp.MP4Skin.html;
			videoModId = "mod_" + this.playerid;

			var $videomod = $('<div id="' + videoModId + '"></div>').appendTo(t.$mod);

			this.$elements = $(htmlBuf).appendTo($videomod)
				.css("width", t.config.width)
				.css("height", t.config.height);

			this.videomod = $.getByID(videoModId);
			this.$mp4linker = this.$elements.find(".tvp_mp4_link");
			this.callCBEvent("onwrite");
			this.registerMonitor();

			this.play(this.curVideo);

			if(this.checkPlayerSize){
				this.checkPlayerSize();
			}
			
		},
		/**
		 * 播放指定视频
		 * @override
		 * @param  {[type]} v [description]
		 * @return {[type]}   [description]
		 */
		play: function(v) {
			var t = this;

			if (v instanceof tvp.VideoInfo) {
				isVidChange = (v.getVid() != curVid && curVid != "");
				t.setCurVideo(v);
				if (isVidChange) {
					t.callCBEvent("onchange", t.curVideo.getFullVid());
				}
				curVid = t.curVideo.getFullVid();
			}

			t.$mp4linker.trigger("tvp:mp4:ajaxstart", v instanceof tvp.VideoInfo ? v.getVid() : v);

			t.curVideo.getMP4Url().done(function(url) {
				t.$mp4linker.trigger("tvp:mp4:ajaxsuc", url);
				t.$mp4linker.attr("href", url);
				t.$mp4linker.trigger("tvp:mp4:src", url);
				t.callCBEvent("onplay", t.curVideo.lastQueryVid, t.curVideo);
				if(window!=top){
					t.$mp4linker.bind($.os.hasTouch?'touchend':'click',function(e){
						e.preventDefault();
						top.location.href = url;
					});
				}	
			}).fail(function(errCode, errContent) {
				t.showError(errCode, errContent);

				t.$mp4linker.trigger("tvp:mp4:ajaxerror");
				t.$mp4linker.trigger("tvp:mp4:error", errcode, errcontent);

				t.callCBEvent("onerror", errCode, errContent);
			}).always(function() {
				curVid = t.curVideo.lastQueryVid;
			});
		},
		/**
		 * 返回当前视频播放器烈性
		 * @override
		 * @return {[type]} [description]
		 */
		getPlayerType: function() {
			return "mp4";
		},
		/**
		 * 获取总时长
		 * @return {Number} 返回总时长
		 */
		getDuration: function() {
			var dur = this.curVideo.getDuration();
			if (!isNaN(dur) && dur > 0) {
				return dur
			}
			return 0;
		}
	});

	tvp.MP4Link.maxId = 0;
})(tvp, tvp.$);