/**
 * @fileOverview 腾讯视频云播放器 Flash播放器
 */

/*
 * @include "./tvp.define.js"
 * @include "./tvp.jquery.js"
 * @include "./tvp.common.js"
 * @include "./tvp.baseplayer.js"
 */

// ===========================================================
/**
 * flash 播放器播放前一个回调
 *
 * @ignore
 * @type {function}
 */
var preplay = tvp.$.noop,
	/**
	 * flash 播放器播放下一个回调
	 *
	 * @ignore
	 * @type {function}
	 */
	nextplay = tvp.$.noop,
	/**
	 * 看点联播回调
	 *
	 * @type
	 */
	attrationstop = tvp.$.noop,
	/**
	 * flash播放器开始播放时回调
	 *
	 * @ignore
	 * @type {function}
	 */
	thisplay = tvp.$.noop,
	/**
	 * flash播放器初始化后的回调
	 *
	 * @ignore
	 * @type {function}
	 */
	playerInit = tvp.$.noop;

// ===============================================================


;
(function(tvp, $) {
	var curVid = "",
		pauseTime = -1,
		$me = null;

	/**
	 * Flash播放器类
	 *
	 * @class tvp.FlashPlayer
	 * @param {number}
	 *          vWidth 宽度，单位像素
	 * @param {number}
	 *          vHeight 高度，单位像素
	 * @extends tvp.BaseFlash
	 */
	tvp.FlashPlayer = function(vWidth, vHeight) {

		$me = this;

		/**
		 * flashvars参数对应全局配置的映射关系
		 * @type {Object}
		 */
		this.flashVarsKeyMapToCfg = {
			"cid": "coverId",
			"tpid": "typeId",
			"showend": "isVodFlashShowEnd",
			"showcfg": "isVodFlashShowCfg",
			"searchbar": "isVodFlashShowSearchBar",
			"loadingswf": "loadingswf",
			"share": "isVodFlashShowShare",
			"pic": "pic", //同名的也需要列出来，因为config会有很多配置，但不是所有的配置项都要传入到flashvars
			"oid": "oid",
			"skin": "vodFlashSkin",
			"shownext": "isVodFlashShowNextBtn",
			"list": "vodFlashListType",
			"autoplay": "autoplay"
		};

		this.swfPathRoot = "http://imgcache.qq.com/tencentvideo_v1/player/";


		tvp.BaseFlash.maxId++;

		/**
		 * 设置当前是否在播放
		 *
		 * @ignore
		 */
		this.isStartPlay = false;

		/**
		 * 获取播放器类型
		 */
		this.getPlayerType = function() {
			return "flash";
		}

		/**
		 * 宽度
		 *
		 * @public
		 */
		this.config.width = tvp.$.filterXSS(vWidth);
		/**
		 * 高度
		 *
		 * @public
		 */
		this.config.height = tvp.$.filterXSS(vHeight);



		window.thisplay = function(vid,obj) {
			$me.isStartPlay = true;
			$me.callCBEvent("onplaying", $me.getCurVid(),obj);
		}
		window.playerInit = function() {
			if (typeof $me.flashobj.setNextEnable == "function") {
				$me.flashobj.setNextEnable($me.callCBEvent("ongetnextenable", $me.curVideo.getFullVid()) ? 1 : 0);
			}
			$me.trigger(tvp.ACTION.onFlashPlayerInited);
			$me.callCBEvent("oninited");
			$me.callCBEvent("onplay", $me.curVideo.getFullVid());
		}
		window.attrationstop = window.nextplay = function(vid) {
			$me.callCBEvent("onended", vid);
			var video = $me.callCBEvent("ongetnext", vid);
			if (!video) {
				$me.callCBEvent("onallended");
				return;
			}
			$me.play(video);
		}
		window.__flashplayer_ismax = function(ismax) {
			$me.callCBEvent("onfullscreen", ismax);
		};
		window.__tenplay_popwin = function() {
			if (tvp.$.isFunction($me.onflashpopup)) {
				$me.callCBEvent("onflashpopup");
			}
		}
		window._showPlayer = function() {
			$me.showPlayer();
		}

		window._hidePlayer = function() {
			$me.hidePlayer();
		}
	}

	/*
	 * 从tvp.BasePlayer继承，这句话很关键，谁注释掉谁SB
	 */
	tvp.FlashPlayer.fn = tvp.FlashPlayer.prototype = new tvp.BaseFlash();

	$.extend(tvp.FlashPlayer.fn, {
		play: function(video) {

			function converVideoInfoToJson(video) {
				var videoInfo = {
					vid: video.getVidList() || video.getIdx(),
					duration: video.getDuration() || "",
					start: tagstart,
					end: tagend,
					history: video.getHistoryStart() || 0,
					vstart: vstart,
					vend: vend,
					title: video.getTitle() || "",
					exid: extid,
					pay: video.getPay(),
					cdntype: video.getCDNType(),
					bulletid : $.isFunction(video.getBulletId) ? video.getBulletId() : ""
				};
				return videoInfo;
			}

			if (!this.flashobj) {
				throw new Error("未找到视频播放器对象，请确认flash播放器是否存在");
			}
			if ($.isUndefined(video) && typeof this.flashobj.setPlaytime === "function") {
				if (pauseTime == -1) {
					if (typeof this.flashobj.loadAndPlayVideoV2 == 'function') {
						this.flashobj.loadAndPlayVideoV2(converVideoInfoToJson(this.getCurVideo()));
					}
				} else {
					this.flashobj.setPlaytime(pauseTime);
					pauseTime = -1;
					this.isStartPlay = true;
				}
				return;
			}
			if (!video instanceof tvp.VideoInfo) {
				throw new Error("传入的对象不是tvp.VideoInfo的实例");
			}

			var isVideChange = curVid != video.getFullVid();
			this.setCurVideo(video);
			if (isVideChange) {
				this.callCBEvent("onchange", this.curVideo.getFullVid());
			}
			curVid = this.curVideo.getFullVid();

			this.isStartPlay = false;
			var vstart = 0,
				vend = 0,
				tagstart = 0,
				tagend = 0;
			if (video.getIdx() == 0) {
				vstart = video.getPrefix() || 0;
				vend = video.getEndOffset() || 0;
			} else {
				tagstart = video.getTagStart();
				tagend = video.getTagEnd();
			}
			var extid = video.getIdx() == 0 ? 0 : ("k" + video.getIdx());
			if (this.curVideo.getVidList() != video.getVidList() || video.getIdx() == 0) {
				var videoInfo = converVideoInfoToJson(video);
				if (this.config["starttips"] == 0) {
					videoInfo["t"] = video.getHistoryStart() || 0;
				}
				if (typeof this.flashobj.loadAndPlayVideoV2 == 'function') {
					this.flashobj.loadAndPlayVideoV2(videoInfo);
				}
			} else if (video.getTagEnd() - video.getTagStart() > 0) {
				this.flashobj.attractionUpdate(video.getTagStart(), video.getTagEnd(), extid);
			}
			this.isStartPlay = true;
			this.callCBEvent("onplay", video.getFullVid());

			if (typeof this.flashobj.setNextEnable == "function") {
				this.flashobj.setNextEnable(this.callCBEvent("ongetnextenable", this.curVideo.getFullVid()) ? 1 : 0);
			}
		},
		pause: function() {
			// 没开始播放就别调用pauseVideo
			if (!$me.isStartPlay) return;
			//不要用$.isFunction 因为flash接口在各种浏览器返回的对象并不一致
			if ( !! this.flashobj && typeof this.flashobj.getPlaytime === "function" && typeof this.flashobj.pauseVideo === "function") {
				pauseTime = this.flashobj.getPlaytime();
				this.flashobj.pauseVideo();
				this.isStartPlay = false;
			}
		},
		/**
		 * @override 获得flashvars字符串
		 * @return {string} 处理后的flashvars
		 */
		getFlashVar: function() {
			var flashvar = '',
				varsVal = this.getFlashVarVal();

			flashvar += 'vid=' + this.curVideo.getVidList();
			// if (this.curVideo.getTypeId() != 0) {
			// 	flashvar += "&tpid=" + this.curVideo.getTypeId();
			// }
			// if (this.curVideo.getCoverId() != 0) {
			// 	flashvar += "&cid=" + this.curVideo.getCoverId();
			// }
			if (this.curVideo.getTagEnd() - this.curVideo.getTagStart() > 0) {
				flashvar += "&attstart=" + tvp.$.filterXSS(this.curVideo.getTagStart());
				flashvar += "&attend=" + tvp.$.filterXSS(this.curVideo.getTagEnd());
			}
			if (this.curVideo.getDuration() > 0) {
				flashvar += '&duration=' + (this.curVideo.getDuration() || "");
			}
			if (this.curVideo.getHistoryStart() > 0) {
				flashvar += "&history=" + tvp.$.filterXSS(this.curVideo.getHistoryStart());
			}

			if (this.curVideo.getTstart() > 0) {
				flashvar += "&t=" + tvp.$.filterXSS(this.curVideo.getTstart());
			}
			if (this.curVideo.getIdx() == 0 && (this.curVideo.getPrefix() > 0 || this.curVideo.getTail() > 0)) {
				var _piantou = this.curVideo.getPrefix(),
					_endoffset = this.curVideo.getEndOffset();
				if (_piantou > 0 || _endoffset) {
					flashvar += "&vstart=" + tvp.$.filterXSS(_piantou);
					flashvar += "&vend=" + tvp.$.filterXSS(_endoffset);
				}
			}

			tvp.$.each(varsVal, function(k, v) {
				if (($.isString(v) && v.length > 0) || $.type(v) == "number") {
					flashvar += "&" + k + "=" + tvp.$.filterXSS(v);
				}
			});

			if ( !! this.curVideo.getPay()) {
				flashvar += "&pay=" + ($.isTrue(this.curVideo.getPay()) ? 1 : 0);
			}

			// 增加标记看点的统计上报参数
			if ( !! this.curVideo.getIdx()) {
				flashvar += "&exid=k" + tvp.$.filterXSS(this.curVideo.getIdx());
			}

			if (this.curVideo.getCDNType() > 0) {
				flashvar += "&cdntype=" + this.curVideo.getCDNType();
			}

			for (var p in this.config.vodFlashExtVars) {
				flashvar += ["&", encodeURIComponent(p), "=", encodeURIComponent(this.config.vodFlashExtVars[p])].join("");
			}
			
			if($.isFunction(this.curVideo.getBullet) && this.curVideo.getBullet() === true){
				flashvar += "&bullet=1";
				if($.isFunction(this.curVideo.getBulletId)){
					flashvar += "&bulletid=" + this.curVideo.getBulletId();
				}
			}
			
			//将title放到最后，防止title编码后过长将其他参数截断--by walkerwang
			if (this.curVideo.getTitle().length > 0) {
				flashvar += "&title=" + encodeURIComponent(this.curVideo.getTitle());
			}
			
			return flashvar;
		},
		getPlaytime: function() {
			if ( !! this.flashobj && typeof this.flashobj.getPlaytime === "function") {
				return this.flashobj.getPlaytime();
			}
			return -1;
		},

		/**
		 * 设置播放时间
		 * @param {[Number]} time [要播放的时间点]
		 * @param {Object} opt 额外的参数对象
		 */
		setPlaytime: function(time,opt) {
			if ( !! this.flashobj && typeof this.flashobj.setPlaytime === "function") {
				return this.flashobj.setPlaytime(time,opt);
			}
		},
		/**
		 * 显示播放器
		 */
		showPlayer: function() {
			if (!this.flashobj) return;
			var width = "" + this.config.width,
				height = "" + this.config.height;
			if (width.indexOf("px") < 0) {
				width = parseInt(width) + "px";
			}
			if (height.indexOf("px") < 0) {
				height = parseInt(height) + "px";
			}
			this.flashobj.style.width = width;
			this.flashobj.style.height = height;
		},

		hidePlayer: function() {
			if (!this.flashobj) return;
			this.flashobj.style.width = "1px";
			this.flashobj.style.height = "1px";
		}
	});

})(tvp, tvp.$);