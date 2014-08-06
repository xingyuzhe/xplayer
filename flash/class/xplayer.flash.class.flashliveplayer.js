/**
 * @fileOverview 腾讯视频云播放器 Flash直播播放器
 */

/*
 * @include "./tvp.define.js"
 * @include "./tvp.jquery.js"
 * @include "./tvp.common.js"
 * @include "./tvp.baseplayer.js"
 */

;
(function(tvp, $) {
	/**
	 * Flash直播播放器类
	 *
	 * @class tvp.FlashPlayer
	 * @param {number}
	 *          vWidth 宽度，单位像素
	 * @param {number}
	 *          vHeight 高度，单位像素
	 * @extends tvp.BaseFlash
	 */
	tvp.FlashLivePlayer = function(vWidth, vHeight) {

		var $me = this;
		tvp.BaseFlash.maxId++;
		/**
		 * flashvars参数对应全局配置的映射关系
		 * @type {Object}
		 */
		this.flashVarsKeyMapToCfg = {
			"showcfg": "isLiveFlashShowCfg",
			"loadingswf": "loadingswf",
			"share": "share",
			"oid": "oid",
			"apptype": "liveFlashAppType",
			"full": "isLiveflashShowFullBtn",
			"wmark": "liveFlashWatermark",
			"autoplay": "autoplay"
		};


		this.swfPathRoot = "http://imgcache.qq.com/minivideo_v1/vd/res/";

		/**
		 * 宽度
		 *
		 * @public
		 */
		this.config.width = $.filterXSS(vWidth);
		/**
		 * 高度
		 *
		 * @public
		 */
		this.config.height = $.filterXSS(vHeight);

		/**
		 * flash播放器登录后的回调
		 */
		this.loginResponse = function() {
			if (!this.flashobj || typeof this.flashobj.loginCallback == "function") {
				this.flashobj.loginCallback(tvp.FlashLivePlayer.flashloginParam);
				tvp.FlashLivePlayer.flashloginParam = {};
			}
		}

		window.playerInit = function() {
			$me.trigger(tvp.ACTION.onFlashPlayerInited);
			$me.callCBEvent("oninited");
			// 2013年10月3日 注释掉下面的内容 不在想想playerInit调用play接口，改为直接从flashvars里传入初始视频信息
			// if ($me.config["autoplay"] == 1) {
			// 	$me.play($me.curVideo);
			// } 
			$me.callCBEvent("onplay", $me.curVideo.getChannelId());
		}

	}

	/*
	 * 从tvp.BaseFlash继承，这句话很关键，谁注释掉谁SB
	 */
	tvp.FlashLivePlayer.prototype = new tvp.BaseFlash();

	$.extend(tvp.FlashLivePlayer.prototype, {
		getChannelURl: function(cnlid) {
			return "http://zb.v.qq.com:1863/?progid=" + cnlid;
		},

		getPlayerType:function(){
			return "liveflash";
		},		
		/**
		 * 获得播放器的flashvars
		 * @return {[type]} [description]
		 */
		getFlashVar: function() {
			var flashvar = '',
				funPrefix = "TenVideo_FlashLive_",
				varsVal = this.getFlashVarVal(),
				host = window != top ? document.referrer : document.location.href,
				linkChar = "";


			flashvar += "vid=" + this.curVideo.getChannelId();
			flashvar += "&vurl=" + this.getChannelURl(this.curVideo.getChannelId());
			flashvar += "&sktype=" + ( !! this.curVideo.getIsLookBack() ? "vod" : "live");
			linkChar = "&";


			// 通过flashvars
			flashvar += linkChar;
			flashvar += "funCnlInfo=" + funPrefix + "GetChannelInfo" // 获取直播节目信息
			flashvar += "&funTopUrl=" + funPrefix + "GetTopUrl"; // 获取当前页面地址，之前加的用意是解决iframe嵌入的问题
			flashvar += "&funLogin=" + funPrefix + "IsLogin"; // 是否登录
			flashvar += "&funOpenLogin=" + funPrefix + "OpenLogin"; // 打开登录框
			flashvar += "&funSwitchPlayer=" + funPrefix + "SwitchPlayer"; // 切换播放器
			flashvar += "&host="+encodeURIComponent(host);
			flashvar += "&txvjsv=2.0"; 
			$.each(varsVal, function(k, v) {
				if (($.isString(v) && v.length > 0) || $.type(v) == "number") {
					flashvar += "&" + k + "=" + $.filterXSS(v);
				}
			});

			for (var p in this.config.liveFlashExtVars) {
				flashvar += ["&", encodeURIComponent(p), "=", encodeURIComponent(this.config.liveFlashExtVars[p])].join("");
			}

			//autoplay=1时不调用play方法,需要传flashp2p参数
			flashvar += '&p=' + tvp.livehub.g_flashp2p || 0;

			return flashvar;
		},
		play: function(video) {
			if (!this.flashobj) {
				return;
			}

			video = video || this.curVideo;

			if (!video instanceof tvp.VideoInfo) {
				throw new Error("传入的对象不是tvp.VideoInfo的实例");
			}

			var islookback = !! video.getIsLookBack(),
				cnild = video.getChannelId(),
				rurl = this.getChannelURl(cnild),
				flashp2p = tvp.livehub.g_flashp2p || 0;

			if (cnild == "") {
				return;
			}

			if (typeof this.flashobj.setSkinType != "undefined") {
				this.flashobj.setSkinType(islookback ? "vod" : "live");
			}

			if (typeof this.flashobj.loadAndPlayVideoFromVID != "undefined") {
				this.flashobj.loadAndPlayVideoFromVID(rurl, cnild, video.getLiveReTime() || "", "", flashp2p);
			}

			this.callCBEvent("onplay", video.getChannelId());

			this.setCurVideo(video);
			this.callCBEvent("onchange", video.getChannelId());
		},
		stop: function() {
			if (!this.flashobj) {
				return;
			}

			if (!$.isUndefined(this.flashobj.stopVideo)) {
				this.flashobj.stopVideo();
			}
		}


	});

	/**
	 * 播放器所在业务枚举
	 *
	 * @type
	 */
	tvp.FlashLivePlayer.ADTYPE = {
		/**
		 * 微电台
		 *
		 * @type String
		 */
		"WEI_DIAN_TAI": "weidiantai",
		/**
		 * 微电视
		 *
		 * @type String
		 */
		"WEI_DIAN_SHI": "weidianshi",
		/**
		 * 腾讯直播
		 *
		 * @type String
		 */
		"LIVE": "live",
		/**
		 * 公司内部直播
		 *
		 * @type String
		 */
		"IN_LIVE": "inlive"
	}

	window.TenVideo_FlashLive_GetChannelInfo = function() {
		return tvp.livehub.g_curCnlInfo;
	}
	window.TenVideo_FlashLive_GetTopUrl = function() {
		var href = "";
		try {
			href = top.location.href;
		} catch (err) {
			href = document.location.href;
		}
		return href;
	}
	window.TenVideo_FlashLive_IsLogin = function() {
		return tvp.common.getUin() > 10000;
	}
	window.TenVideo_FlashLive_OpenLogin = function(config) {
		tvp.FlashLivePlayer.flashloginParam = config || {};
		tvp.common.openLogin();
	}
	window.TenVideo_FlashLive_SwitchPlayer = $.noop;
})(tvp, tvp.$);