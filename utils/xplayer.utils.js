
/**
 * 封装通用函数
 *
 * @namespace xplayer.utils
 * @type {Object}
 */
xplayer.utils = {
	/**
	 * 是否使用HTML5播放器播放
	 */
	isUseHtml5: function() {
		var ua = navigator.userAgent,
			m = null;

		if (/ipad|ipod|iphone|lepad_hls|IEMobile|WPDesktop/ig.test(ua)) {
			return true;
		}

		//Android系统
		if (!!xplayer.$.os.android) {

			// 如果支持HTML5的<video>标签并且支持H.264解码，则也认为支持HTML5
			if (xplayer.common.isSupportMP4()) {
				return true;
			}

			//Android下 手机QQ浏览器4.2原生支持HTML5和HLS 对方接口人susiehuang
			if (xplayer.$.browser.MQQ && xplayer.$.browser.getNumVersion() >= 4.2) {
				return true;
			}
			if (ua.indexOf("MI2") != -1) { // 小米手机4.0支持HTML5
				return true;
			}

			//微信4.2版本以上原生支持html5
			if (xplayer.$.os.version >= "4" && (m = ua.match(/MicroMessenger\/((\d+)\.(\d+))\.(\d+)/))) {
				if (m[1] >= 4.2) {
					return true;
				}
			}

			//安卓4.1基本都支持HTML5了，遇到特例就case by case解决吧
			if (xplayer.$.os.version >= "4.1") {
				return true;
			}
		}

		return false;
	},
	/**
	 * 是否使用HLS
	 * @return {Boolean} [description]
	 */
	isUseHLS: function() {
		if (xplayer.$.os.ios) return true;
	},
	/**
	 * 直播是否用HTML5
	 *
	 * @return {}
	 */
	isLiveUseHTML5: function() {
		if (xplayer.$.os.ios) return true;
		if (xplayer.$.os.ipad) return true;
		if (!!xplayer.$.os.android) {
			if (xplayer.common.isSupportM3u8()) {
				return true;
			}
		}
		return false;
	},
	isSupportM3u8: function() {
		var video = document.createElement("video");
		var list = [
			'application/x-mpegURL',
			'audio/mpegurl',
			'vnd.apple.mpegURL',
			'application/vnd.apple.mpegURL'
		];
		var rs = false;
		if (typeof video.canPlayType == "function") {
			xplayer.$.each(list, function(i, o) {
				if (video.canPlayType(o)) {
					rs = true;
					return;
				}
			});
		}
		video = null;
		if (!!xplayer.$.os.android) {
			//Chrome能播放m3u8但是检测不出
			if (xplayer.$.os.version >= "4" && xplayer.$.browser.Chrome) {
				rs = true;
			}

			//uc9.6以下有问题(小米1)
			// if(xplayer.$.browser.UC && xplayer.$.compareVersion(xplayer.$.browser.version,'9.6') < 0){
			// 	rs = false;
			// }

			//小米1除了qq浏览器基本都有问题
			if (xplayer.$.browser.M1) {
				rs = false;
			}

			//天宇v8播不了
			if (/V8 Build/.test(navigator.userAgent)) {
				rs = false;
			}

			//qq浏览器4.2以上总是支持的
			if (xplayer.$.browser.MQQ && xplayer.$.browser.getNumVersion() >= 4.2) {
				rs = true;
			}
		}
		return rs;
	},
	/**
	 * 是否支持HTML5的MP4解码
	 *
	 * @return {Boolean}
	 */
	isSupportMP4: function() {
		var video = document.createElement("video");
		if (typeof video.canPlayType == "function") {
			//MP4
			if (video.canPlayType('video/mp4; codecs="mp4v.20.8"') == "probably") {
				return true;
			}
			//H.264
			if (video.canPlayType('video/mp4; codecs="avc1.42E01E"') == "probably" || video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') == "probably") {
				return true;
			}
		}
		return false;
	},
	/**
	 * 当前设备是支持SVG
	 * @return {Boolean} [description]
	 */
	isSupportSVG: function() {
		if (!document.implementation || !xplayer.$.isFunction(document.implementation.hasFeature)) {
			return false;
		}
		return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
	},

	/**
	 * 是否强制使用MP4直接链接
	 *
	 * @return {Boolean}
	 */
	isEnforceMP4: function() {
		var ua = navigator.userAgent,
			m = null;
		if (!!xplayer.$.os.android) {
			if (xplayer.$.browser.firefox) {
				return true;
			}
			if (xplayer.$.os.version >= "4.0" && xplayer.$.browser.MQQ && xplayer.$.browser.version < "4.0") { // 手机QQ浏览器3.*版本在Android4无法使用H5和flash
				return true;
			}
		}
		return false;
	},
	/**
	 * 获取当前用户的QQ号码
	 */
	getUin: function() {
		var skey = xplayer.$.cookie.get("skey"),
			lskey = xplayer.$.cookie.get("lskey"),
			suin = "",
			uin = 0,
			useLeak = false;
		isLeak = typeof(isLeak) == "undefined" ? false : true;
		useLeak = !!isLeak && lskey != "";

		if (!useLeak && skey == "") {
			return 0;
		}

		suin = xplayer.$.cookie.get("uin");
		if (suin == "") {
			if (!!useLeak) {
				suin = xplayer.$.cookie.get("luin");
			}
		}
		uin = parseInt(suin.replace(/^o0*/g, ""), 10);
		if (isNaN(uin) || uin <= 10000) {
			return 0;
		}
		return uin;
	},
	/**
	 * 获取登录的skey
	 *
	 * @return {}
	 */
	getSKey: function() {
		var skey = xplayer.$.cookie.get("skey"),
			lskey = xplayer.$.cookie.get("lskey"),
			key = "";
		if (!!isLeak) {
			if (skey != "" && lskey != "") {
				key = [skey, lskey].join(";");
			} else {
				key = skey || lskey;
			}
		} else {
			key = skey;
		}
		return key;
	},
	/**
	 * 打开登录框
	 */
	openLogin: function() {

	},
	/**
	 * 获取指定视频vid的截图
	 *
	 * @param {string}
	 *          lpszVID 视频vid
	 * @param {number}
	 *          idx 视频看点 默认是0
	 * @return {string} 视频截图
	 */
	getVideoSnap: function(lpszVID, idx) {
		var szPic;
		var uin;
		var hash_bucket = 10000 * 10000;
		var object = lpszVID;

		if (lpszVID.indexOf("_") > 0) {
			var arr = lpszVID.split("_");
			lpszVID = arr[0];
			idx = parseInt(arr[1]);
		}

		var uint_max = 0x00ffffffff + 1;
		var hash_bucket = 10000 * 10000;
		var tot = 0;
		for (var inx = 0; inx < lpszVID.length; inx++) {
			var nchar = lpszVID.charCodeAt(inx);
			tot = (tot * 32) + tot + nchar;
			if (tot >= uint_max) tot = tot % uint_max;
		}
		uin = tot % hash_bucket;
		if (idx == undefined) idx = 0;
		if (idx == 0) {
			szPic = ["http://vpic.video.qq.com/", uin, "/", lpszVID, "_160_90_3.jpg"].join("");
		} else {
			szPic = ["http://vpic.video.qq.com/", uin, "/", lpszVID, "_", "160_90_", idx, "_1.jpg"].join("");
		}
		return szPic;
	},
	/**
	 * 得到手机设备上用的截图
	 * @param  {[type]} vid   [description]
	 * @param  {[type]} index [description]
	 * @return {[type]}       [description]
	 */
	getVideoSnapMobile:function(vid,index){
		index = index || 0;
		var sizeArr = ['496_280'],
			url = 'http://shp.qpic.cn/qqvideo_ori/0/{vid}_{index}/0';
		return url.replace('{vid}',vid).replace('{index}',sizeArr[index]);
	},

	/**
	 * 为了 缩略图 传入错误的情况
	 * @param  {[type]} img [description]
	 * @return {[type]}     [description]
	 */
	picerr:function(img){
		//img.src="http://imgcache.gtimg.cn/tencentvideo_v1/vstyle/mobile/v2/style/img/player/bg_poster.jpg";
	},

	/**
	 * 获取设备上报映射id值
	 * @return {Number}
	 */
	getDeviceId: function() {
		var id = xplayer.DEVICE.other;
		if (xplayer.$.os.iphone) {
			id = xplayer.DEVICE.iphone;
		} else if (xplayer.$.os.ipad) {
			id = xplayer.DEVICE.ipad;
		} else if (xplayer.$.os.android && xplayer.$.os.phone) {
			id = xplayer.DEVICE.aphone;
		}
		return id;
	},

	/**
	 * 获取平台上报映射id值
	 * @return {Number}
	 */
	getPlatformId: function() {
		var id = xplayer.PLATFORM.other;
		if (xplayer.$.browser.WeChat) {
			id = xplayer.PLATFORM.wechat;
		} else if (xplayer.$.browser.MQQClient) {
			id = xplayer.PLATFORM.mqq;
		} else if (xplayer.$.browser.MQQ) {
			id = xplayer.PLATFORM.qqbrowser;
		}
		return id;
	}
};

xplayer.version = (function() {
	/** private */
	var vOcx = "0.0.0.0",
		vflash = "0.0.0",
		actObj, reportObj = new Image(),reported = false, needReport = false;
	if(document.location.host == "film.qq.com") {
		needReport = true;
	}
	/**
	 * 将数字格式的控件的版本号转换成标准的带有.符号分隔的版本号
	 */

	function changeVerToString(nVer) {
		if (checkVerFormatValid(nVer)) {
			return nVer;
		}
		if (/\d+/i.test(nVer)) {
			var nMain = parseInt(nVer / 10000 / 100, 10);
			var nSub = parseInt(nVer / 10000, 10) - nMain * 100;
			var nReleaseNO = parseInt(nVer, 10) - (nMain * 100 * 10000 + nSub * 10000);
			strVer = nMain + "." + nSub + "." + nReleaseNO;
			return strVer;
		}
		return nVer;
	}

	/**
	 * 检查控件版本号是否合法
	 *
	 * @ignore
	 */

	function checkVerFormatValid(version) {
		return (/^(\d+\.){2}\d+(\.\d+)?$/.test(version));
	};


	return {
		/**
		 * 获取用户当前安装的腾讯视频播放器版本
		 * @return {String}
		 */
		getOcx: function(enableCache) {
			// 相当于有个变量做cache，不再重复判断了
			if (xplayer.$.isUndefined(enableCache)) {
				enableCache = true;
			}
			if (!!enableCache && vOcx != "0.0.0.0") {
				return vOcx;
			}
			var step;
			// IE
			if (!!xplayer.$.browser.ie) {
				try {
					step = "IE begin";
					// 据说这个做成全局的可能减少错误概率
					actObj = new ActiveXObject(QQLive.config.PROGID_QQLIVE_INSTALLER);
					if (typeof actObj.getVersion != "undefined") {
						vOcx = actObj.GetVersionByClsid(QQLive.config.OCX_CLSID);
						step = "get actObj.GetVersionByClsid:"+vOcx;
					} else {
						step = "no function:actObj.GetVersionByClsid";
					}
				} catch (err) {
					needReport && (!reported) && (reported = true) && (reportObj.src = "http://btrace.qq.com/collect?sIp=&iQQ=" + xplayer.common.getUin() + "&sBiz=IE&sOp=" + encodeURIComponent(navigator.userAgent) + "&iSta=0&iTy=2432&iFlow=&sUrl=" + encodeURIComponent(location.toString()) + "&sRef=" + encodeURIComponent(document.referrer) + "&sMsg=" + encodeURIComponent(err.message) + "&sStep=" + encodeURIComponent(step) + "&_=" + Math.random());
				}
			} else if (xplayer.$.browser.isNotIESupport()) {
				step = "no IE begin";
				var plugs = navigator.plugins,
					plug;
				if (!xplayer.$.isUndefined(plugs.namedItem)) {
					step = "plugs.namedItem";
					plug = plugs.namedItem("腾讯视频");
				}
				if (!plug) {
					step = "no plugs.namedItem:tencentvideo";
					// 循环找出腾讯视频的plugins信息
					for (var i = 0, len = plugs.length; i < len; i++) {
						// 找到腾讯视频的plugin信息
						if (plugs[i] && plugs[i].name == "腾讯视频" || plugs[i].filename == "npQQLive.dll") {
							plug = plugs[i];
							break;
						}
					}
				}
				if (!!plug) {
					// FF有version的属性（强烈顶下FF的这个接口）
					// 但是Chrome没有，只能从description中截取，这个描述信息是“version:”开头（跟lexlin约定好的）
					if (!xplayer.$.isUndefined(plug.version)) {
						step = "plug.version:" + plug.version;
						vOcx = plug.version;
					} else {
						step = "plug.description:" + plug.description;
						var r;
						var desc = plug.description;
						if (r = desc.match(/version:((\d+\.){3}(\d+)?)/)) {
							vOcx = r[1];
						}
					}
				} else {
					step = "no plugs[i].filename:npQQLive.dll";
				}
			}
			if (!parseInt(vOcx, 10)) {
				needReport && (!reported) && (reported = true) && (reportObj.src = "http://btrace.qq.com/collect?sIp=&iQQ=" + xplayer.common.getUin() + "&sBiz=" + (xplayer.$.browser.ie ? "IE" : "NOIE") + "&sOp=" + encodeURIComponent(navigator.userAgent) + "&iSta=0&iTy=2432&iFlow=&sUrl=" + encodeURIComponent(location.toString()) + "&sRef=" + encodeURIComponent(document.referrer) + "&sMsg=" + vOcx + "&sStep=" + encodeURIComponent(step) + "&_=" + Math.random());
			}
			vOcx = changeVerToString(vOcx);
			return vOcx;
		},
		/**
		 * 获取当前用户安装的flash插件版本号
		 *
		 *
		 */
		getFlash: function() {
			if (vflash != "0.0.0") {
				return vflash;
			}
			var swf = null,
				ab = null,
				ag = [],
				S = "Shockwave Flash",
				t = navigator,
				q = "application/x-shockwave-flash",
				R = "SWFObjectExprInst"
			if (!!xplayer.$.browser.ie) {
				try {
					var step = "IE begin";
					swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
					step = "new ActiveXObject";
					if (swf) {
						ab = swf.GetVariable("$version");
						step = "swf.GetVariable";
						if (ab) {
							ab = ab.split(" ")[1].split(",");
							ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
						}
					}
				} catch (err) {
					needReport && (!reported) && (reported = true) && (reportObj.src = "http://btrace.qq.com/collect?sIp=&iQQ=" + xplayer.common.getUin() + "&sBiz=IE&sOp=" + encodeURIComponent(navigator.userAgent) + "&iSta=1&iTy=2432&iFlow=&sUrl=" + encodeURIComponent(location.toString()) + "&sRef=" + encodeURIComponent(document.referrer) + "&sMsg=" + encodeURIComponent(err.message) + "&sStep=" + encodeURIComponent(step) + "&_=" + Math.random());
				}
			} else if (!xplayer.$.isUndefined(t.plugins) && typeof t.plugins[S] == "object") {
				var step = "no IE begin";
				ab = t.plugins[S].description;
				step = "plugins[S].description";
				if (ab && !(!xplayer.$.isUndefined(t.mimeTypes) && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
					step = "parse description";
					ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
					ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
					ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
					ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
				} else {
					step = "no mimeTypes or disable";
				}
			}
			vflash = ag.join(".");
			if (!parseInt(vflash, 10)) {
				needReport && (!reported) && (reported = true) && (reportObj.src = "http://btrace.qq.com/collect?sIp=&iQQ=" + xplayer.common.getUin() + "&sBiz=" + (xplayer.$.browser.ie ? "IE" : "NOIE") + "&sOp=" + encodeURIComponent(navigator.userAgent) + "&iSta=1&iTy=2432&iFlow=&sUrl=" + encodeURIComponent(location.toString()) + "&sRef=" + encodeURIComponent(document.referrer) + "&sMsg=" + vflash + "&sStep=" + encodeURIComponent(step) + "&_=" + Math.random());
			}
			return vflash;
		},
		/**
		 * 获取flash主版本号
		 *
		 * @return {Number}
		 */
		getFlashMain: function() {
			return parseInt(xplayer.version.getFlash().split(".")[0], 10);
		}
	}
})();