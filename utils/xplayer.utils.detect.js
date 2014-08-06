/**
 * 扩展cookies
 */
/**
 * 扩展浏览器和操作系统判断
 */
;
(function($) {
	function detect(ua) {

		var MQQBrowser = ua.match(/MQQBrowser\/(\d+\.\d+)/i),
			MQQClient = ua.match(/QQ\/(\d+\.(\d+)\.(\d+)\.(\d+))/i) || ua.match(/V1_AND_SQ_([\d\.]+)/),
			WeChat = ua.match(/MicroMessenger\/((\d+)\.(\d+))\.(\d+)/) || ua.match(/MicroMessenger\/((\d+)\.(\d+))/),
			MacOS = ua.match(/Mac\sOS\sX\s(\d+\.\d+)/),
			WinOS = ua.match(/Windows(\s+\w+)?\s+?(\d+\.\d+)/),
			MiuiBrowser = ua.match(/MiuiBrowser\/(\d+\.\d+)/i),
			M1 = ua.match(/MI-ONE/),
			MIPAD = ua.match(/MI PAD/),
			UC = ua.match(/UCBrowser\/(\d+\.\d+(\.\d+\.\d+)?)/) || ua.match(/\sUC\s/),
			IEMobile = ua.match(/IEMobile(\/|\s+)(\d+\.\d+)/) || ua.match(/WPDesktop/),
			ipod = ua.match(/(ipod\sOS)\s([\d_]+)/),
			Chrome = ua.match(/Chrome\/(\d+\.\d+)/),
			AndriodBrowser = ua.match(/Mozilla.*Linux.*Android.*AppleWebKit.*Mobile Safari/),
			HTC = ua.indexOf("HTC") > -1;

		$.browser = $.browser || {}, $.os = $.os || {};
		// 扩展ie判断
		if (window.ActiveXObject) {
			var vie = 6;
			(window.XMLHttpRequest || (ua.indexOf('MSIE 7.0') > -1)) && (vie = 7);
			(window.XDomainRequest || (ua.indexOf('Trident/4.0') > -1)) && (vie = 8);
			(ua.indexOf('Trident/5.0') > -1) && (vie = 9);
			(ua.indexOf('Trident/6.0') > -1) && (vie = 10);
			$.browser.ie = true, $.browser.version = vie;
		} else if (ua.indexOf('Trident/7.0') > -1) {
			$.browser.ie = true, $.browser.version = 11;
		}

		if (ipod) os.ios = os.ipod = true, os.version = ipod[2].replace(/_/g, '.');
		//windows 系统
		if (WinOS) this.os.windows = true, this.os.version = WinOS[2];
		//Mac系统
		if (MacOS) this.os.Mac = true, this.os.version = MacOS[1];
		//乐Pad
		if (ua.indexOf("lepad_hls") > 0) this.os.LePad = true;
		//小米pad
		if (MIPAD) this.os.MIPAD = true;
		//补充一些国内主流的手机浏览器
		//手机QQ浏览器
		if (MQQBrowser) this.browser.MQQ = true, this.browser.version = MQQBrowser[1];
		//IOS手机QQ打开
		if (MQQClient) this.browser.MQQClient = true, this.browser.version = MQQClient[1];
		//微信
		if (WeChat) this.browser.WeChat = true, this.browser.version = WeChat[1];
		//MIUI自带浏览器
		if (MiuiBrowser) this.browser.MIUI = true, this.browser.version = MiuiBrowser[1];
		//UC浏览器
		if (UC) this.browser.UC = true, this.browser.version = UC[1] || NaN;
		//IEMobile
		if (IEMobile) this.browser.IEMobile = true, this.browser.version = IEMobile[2];
		//android default browser
		if (AndriodBrowser) {
			this.browser.AndriodBrowser = true;
		}
		//for 小米1
		if (M1) {
			this.browser.M1 = true;
		}
		//chrome 
		if (Chrome) {
			this.browser.Chrome = true, this.browser.version = Chrome[1];
		}
		if (this.os.windows) {
			if (typeof navigator.platform != "undefined" && navigator.platform.toLowerCase() == "win64") {
				this.os.win64 = true;
			} else {
				this.os.win64 = false;
			}
		}

		var osType = {
			iPad7: 'iPad; CPU OS 7',
			LePad: 'lepad_hls',
			XiaoMi: 'MI-ONE',
			SonyDTV: "SonyDTV",
			SamSung: 'SAMSUNG',
			HTC: 'HTC',
			VIVO: 'vivo'
		}

		for (var os in osType) {
			this.os[os] = (ua.indexOf(osType[os]) !== -1);
		}

		this.os.getNumVersion = function() {
			return parseFloat($.os.version, "10");
		}

		//当前系统是否支持触屏触摸,ios5以下的版本touch支持有问题，当作不支持来处理
		this.os.hasTouch = 'ontouchstart' in window;
		if (this.os.hasTouch && this.os.ios && this.os.getNumVersion() < 6) {
			this.os.hasTouch = false;
		}

		//微信4.5 tap事件有问题
		if ($.browser.WeChat && $.browser.version < 5.0) {
			this.os.hasTouch = false;
		}

		$.extend($.browser, {
			/**
			 * 获取数字格式的版本号
			 */
			getNumVersion: function() {
				return parseFloat($.browser.version, "10");
			},
			/**
			 * 是否是受支持的firefox版本
			 *
			 * @memberOf QQLive.browser
			 * @return {Boolean}
			 */
			isFFCanOcx: function() {
				if ( !! $.browser.firefox && $.browser.getNumVersion() >= 3.0) {
					return true;
				}
				return false;
			},
			/**
			 * 当前浏览器是否支持QQLive
			 */
			isCanOcx: function() {
				return ( !! $.os.windows && ( !! $.browser.ie || $.browser.isFFCanOcx() || !! $.browser.webkit));
			},
			/**
			 * 是否是支持的非IE浏览器
			 */
			isNotIESupport: function() {
				return ( !! $.os.windows && ( !! $.browser.webkit || $.browser.isFFCanOcx()));
			}
		});

		// 兼容老的userAgent接口
		$.userAgent = {};
		$.extend($.userAgent, $.os);
		$.extend($.userAgent, $.browser);
		$.userAgent.browserVersion = $.browser.version;
		$.userAgent.osVersion = $.os.version;
		delete $.userAgent.version;

	}
	detect.call($, navigator.userAgent);
})(xplayer.$);