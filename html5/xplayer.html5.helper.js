/**
 * @fileOverview HTML5获取服务器视频文件信息通用接口
 */

;
(function(xplayer, $) {
	var globalCfg = {
			isHLS: false,
			isPay: false,
			vid: "",
			fmt: "auto",
			platform: 11001,
			host: window != top ? document.referrer : document.location.host
		};

	globalCfg.cgi = (function() {
		return {
			getinfo: 'http://vv.video.qq.com/getinfo?callback=?&'
		};
	})();

	globalCfg.retryCgi = (function() {
		if ($.browser.WeChat || $.browser.MQQClient) {
			return {
				getinfo: globalCfg.cgi.getinfo.replace(/(\/\/)(.+?)(\/|$)/, "$1bkpush.video.qq.com$3")
			}
		} else {
			return {
				getinfo: globalCfg.cgi.getinfo.replace(/(\/\/)(.+?)(\/|$)/, "$1tt.video.qq.com$3")
			}
		}
	})();

	/**
	 * 获取要增加到MP4文件的后缀参数
	 *
	 * @ignore
	 * @private
	 */

	function getMp4Key() {
		if ($.os.iphone || $.os.ipod) {
			return "v3010";
		}

		if ($.os.ipad) {
			return "v4010";
		}
		if ($.os.android) {
			// userAgent里说了这是pad，或者屏幕宽度大于600，说明这是Android Pad
			if ($.os.tablet || screen.width >= 600) {
				return "v6010";
			}
			return "v5010"
		}
		if ($.browser.IEMobile) {
			return "v7010";
		}
		return "v1010";
	}

	/**
	 * 获得请求getkey时的format参数
	 * @param  {type} fi [description]
	 * @return {type}    [description]
	 */

	function getKeyFormat(cfg, fi) {
		for (var i = 0, len = fi.length; i < len; i++) {
			if (fi[i].sl == 1) {
				return fi[i].id;
			}
		}
		return -1;
	}

	/**
	 * 拼接mp4文件地址
	 */
	function getMp4Url(json) {
		json = json || {};
		var videourl,
			hasAlias = false;
		if (json.alias && typeof json.fn == "string" && json.vid) {
			json.fn = json.fn.replace(json.vid, json.alias);
			hasAlias = true;
		}

		if (json["path"].indexOf('?') > -1) {
			videourl = json["path"] + '&' + json["fn"] + "&vkey=" + json.vkey + "&br=" + json["br"] + "&platform=2&fmt=" + json.fmt + "&level=" + json.level + "&sdtfrom=" + getMp4Key();
		} else {
			videourl = json["path"] + json["fn"] + "?vkey=" + json.vkey + "&br=" + json["br"] + "&platform=2&fmt=" + json.fmt + "&level=" + json.level + "&sdtfrom=" + getMp4Key();
		}

		if ($.isString(json.sha) && json.sha.length > 0) {
			videourl += "&sha=" + json.sha;
		}
		if (hasAlias) {
			videourl += "&vidalias=1";
		}
		return videourl;
	}

	/**
	 * 为请求的cgi增加hash参数
	 * @param {String} url 请求的url
	 */
	function appendHashParams(url) {
		var platform, vid, sdtfrom,
			tmpStr = '',
			sts = 1,
			hashObj = {};
		if (typeof Qvsec == 'object' && typeof Qvsec.$xx == 'function' && typeof url == 'string') {
			platform = $.getUrlParam('platform', url);
			vid = $.getUrlParam('vids', url);
			sdtfrom = getMp4Key();
			try {
				hashObj = Qvsec.$xx(platform, vid, sdtfrom, sts);
			} catch (e) {
				if (typeof xplayer.reportErr == 'function' && e && e.message) {
					xplayer.reportErr(e.message);
				}
			}
			if (hashObj) {
				// tmpStr = '_qv_rnd=' + hashObj.u;
				tmpStr = tmpStr + '&_qv_rmt=' + hashObj.u1;
				tmpStr = tmpStr + '&_qv_rmt2=' + hashObj.u2;
				tmpStr = tmpStr + '&sdtfrom=' + sdtfrom;
				url = url + (url.indexOf('?') == -1 ? '?' : '&') + tmpStr;
				$.cookie.set('qv_als', hashObj.c);
			}
		}
		return url;
	}
	xplayer.h5Helper = {
		/**
		 * 读取视频MP4文件
		 * @param  {Object} cfg 配置
		 * @return {$.Deferred}    $.Deferred对象
		 */
		loadVideoUrlByVid: function(cfg, rs) {
			var s = {},
				infoData = {},
				defer = $.Deferred();
			$.extend($.extend(s, globalCfg), cfg);
			var isRetry = false,
				getinfocgi = globalCfg.cgi.getinfo,
				url = "",
				reportToBossFn = $.noop;
			if (cfg.retryDefer && $.isFunction(cfg.retryDefer.reject)) {
				isRetry = true;
				defer = cfg.retryDefer;
				getinfocgi = globalCfg.retryCgi.getinfo;
			}
			if (cfg.loadingAdCgi) { // 如果当前请求的是loading广告
				getinfocgi = cfg.loadingAdCgi;
			}
			url = getinfocgi + $.param({
				vids: s.vid,
				platform: s.platform,
				charge: s.isPay ? 1 : 0,
				otype: "json",
				defaultfmt: s.fmt,
				sb: 1,
				nocache: ($.browser.MQQClient || $.browser.WeChat) ? 1 : 0,
				_rnd: new Date().valueOf()
			});

			url = appendHashParams(url);
			$.ajax({
				url: url,
				dataType: "jsonp"
			}).done(function(infojson) {
				var iRetCode = 0,
					// 返回码
					exVal = undefined,
					vi;
				if (!infojson || !infojson.s) {
					iRetCode = 50;
				} else if (infojson.s != "o") {
					iRetCode = infojson.em || 50;
					exVal = infojson.exem;
				} else if (!infojson.vl || !infojson.vl.vi || !$.isArray(infojson.vl.vi) || infojson.vl.cnt == 0) {
					iRetCode = 68;
				} else {
					// TODO:多个视频vids需要循环做判断，现在这里只判断了一个视频
					vi = infojson.vl.vi[0];
				}
				// 视频文件不可以播放，或者视频文件不允许访问，或者根本就没有播放地址，就告知62错误，表示视频状态不合法
				// TODO:区分视频付费状态码
				if (iRetCode == 0 && (vi.fst != 5 || !$.isPlainObject(vi.ul) || !$.isArray(vi.ul.ui) || vi.ul.ui.length == 0)) {
					iRetCode = 62; // 视频状态不合法
				}

				// 视频状态不对
				else if (iRetCode == 0 && vi.st != 2) {
					if (vi.st != 8) {
						iRetCode = 62; // 视频状态不合法
					} else {
						iRetCode = 83;
						exVal = vi.ch;
					}
				}
				if (iRetCode != 0) {
					defer.reject(iRetCode, exVal);
					return;
				}
				// 如果是广告就不用再拉取vkey也不用拼接播放地址了
				if (cfg.loadingAdCgi) {
					defer.resolve(vi.ul.ui[0].url, {
						vl: infojson.vl,
						fl: infojson.fl,
						sfl: infojson.sfl,
						exem: infojson.exem,
						preview: infojson.preview
					});
					return;
				}
				if (vi.fvkey) { // getinfo 已经把key带上了就不用再去请求getkey了。
					exVal = getMp4Url({
						path: vi.ul.ui[0].url,
						fn: vi.fn,
						vkey: vi.fvkey,
						br: vi.br,
						platform: 2,
						fmt: s.fmt,
						level: vi.level,
						sdtfrom: getMp4Key(),
						sha: vi.fsha,
						vid: s.vid,
						alias: vi.alias
					});
					defer.resolve(exVal, {
						vl: infojson.vl,
						fl: infojson.fl,
						sfl: infojson.sfl,
						exem: infojson.exem,
						preview: infojson.preview
					});
					return;
				}
			}).fail(function() {
				if (!isRetry) {
					cfg.retryDefer = defer;
					xplayer.h5Helper.loadVideoUrlByVid(cfg);
				} else {
					defer.reject(500, 1);
				}
			});
			return defer;
		},
		/**
		 * 读取高清MP4地址
		 */
		loadHDVideoUrlByVid: function(cfg) {
			cfg.fmt = "mp4";
			xplayer.h5Helper.loadVideoUrlByVid(cfg);
		},		
		/**
		 * 读取手机200K码率的视频文件MP4地址
		 * @param  {Object} cfg 配置
		 * @return {[type]}     [description]
		 */
		load3GVideoUrl: function(cfg) {
			cfg.fmt = "msd";
			xplayer.h5Helper.loadVideoUrlByVid(cfg);
		},

		/**
		 * 读取软字幕，CGI接口详情访问http://tapd.oa.com/v3/shiping_dev/wikis/view/getsurl
		 * @return {[type]} [description]
		 */
		loadSRT: function(cfg) {
			var s = {},
				infoData = {},
				defer = $.Deferred();
			$.extend($.extend(s, globalCfg), cfg);

			$.ajax({
				url: "http://vv.video.qq.com/getsurl?" + $.param({
					"vid": s.vid,
					"format": s.sflid,
					"platform": s.platform,
					"pid": s.pid,
					"otype": "json",
					"_rnd": new Date().valueOf()
				}),
				dataType: "jsonp"
			}).done(function(json) {
				// 数据源错误
				if ($.type(json) != "object") {
					defer.reject(500);
					return;
				}

				if (json.s != "o") {
					defer.reject(isNaN(json.em) ? 500 : json.em, json.msg || "");
					return;
				}
				defer.resolve(json);
			}).fail(function() {
				defer.reject(500);
			});
			return defer;
		}
	}
})(xplayer, xplayer.$);