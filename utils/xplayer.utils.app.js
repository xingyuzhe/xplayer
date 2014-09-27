;
(function(xplayer, $) {

	var PACKAGEINFO = {
		qqlive: {
			text1: '腾讯视频客户端',
			text2: "可观看更多视频",
			md5Cgi: 'http://mcgi.v.qq.com/commdatav2?cmd=39&otype=json&confid=${id}',
			payUrl: 'http://film.qq.com/weixin/detail/${index}/${cid}.html',
			scheme: 'tenvideo2://',
			logoClass:'',
			openUrl: "tenvideo2://?action=5&video_id=${vid}",
			liveOpenUrl: 'tenvideo2://?action=8&channel_id=${lid}',
			ipadDownloadUrl: "https://itunes.apple.com/cn/app/teng-xun-shi-pinhd/id407925512?mt=8",
			iphoneDownloadUrl: "http://itunes.apple.com/cn/app/id458318329?mt=8",
			aphoneDownloadUrl: "http://mcgi.v.qq.com/commdatav2?cmd=4&confid=140&platform=aphone",
			VIA: "ANDROIDQQ.QQLIVE",
			appId: '100730521',
			downloadId: "TencentVideo",
			taskName: "TencentVideo",
			packageName: $.os.iphone ? 'com.tencent.live4iphone' : "com.tencent.qqlive",
			packageUrl: 'tenvideo2://can_open_me_if_install_and_regeister_this_scheme'
		},
		weishi: {
			text1: '微视客户端',
			text2: "发现更多精彩",
			logoClass:'xplayer_download_app_solo_weishi',
			md5Cgi: 'http://www.weishi.com/api/packdata.php?confid=${id}',
			scheme: $.os.iphone ? ' weishiiosscheme://' : 'weishiandroidscheme://',
			openUrl: $.os.iphone ? ' weishiiosscheme://detail?tweetid=${id}' : 'weishiandroidscheme://detail?tweetid=${id}',
			iphoneDownloadUrl: "http://www.weishi.com/download/index.php?pgv_ref=weishi.shipin.xinwenfenxiang",
			aphoneDownloadUrl: "http://www.weishi.com/download/index.php?pgv_ref=weishi.shipin.xinwenfenxiang",
			ipadDownloadUrl: '',
			VIA: "ANDROIDQQ.WEISHI",
			appId: '1101083114',
			downloadId: "TencentWeishi",
			taskName: "TencentWeishi",
			packageName: $.os.iphone ? 'com.tencent.microvision' : "com.tencent.weishi",
			packageUrl: $.os.iphone ? 'weishiiosscheme://can_open_me_if_install_and_regeister_this_scheme' : 'weishiandroidscheme://can_open_me_if_install_and_regeister_this_scheme'
		}
	};

	xplayer.app = {
		config: {
			//默认app索引名称
			defaultName: 'qqlive',
			//qq api地址
			QQApiUrl: "http://pub.idqqimg.com/qqmobile/qqapi.js",
			//手q浏览器 api地址
			mqqApiUrl: "http://res.imtt.qq.com/browser_lightapp/QQBrowserApi/getCryptext/browser_interface_getCryptext.js"
		},
		//是否已安装视频app
		// hasApp: 0,
		//手q中加载qqapi的defer对象
		loadQQClientDefer: false,
		//加载下载器api的defer对象
		loadDownloaderDefer: false,
		//加载qq浏览器的api的defer对象
		loadMqqDefer: false,
		//根据设备和app名字索引获取app默认下载地址
		getDownloadUrl: function(url, name) {
			name = name || xplayer.app.config.defaultName;
			url = $.os.iphone ? PACKAGEINFO[name].iphoneDownloadUrl : (url || PACKAGEINFO[name].aphoneDownloadUrl);
			url = $.os.ipad ? PACKAGEINFO[name].ipadDownloadUrl : url;
			return url;
		},
		getPayUrl:function(cid){
			var h5url = $.formatTpl(PACKAGEINFO.qqlive.payUrl, {
				index: cid.slice(0, 1),
				cid: cid
			});
			return h5url;
		},
		/**
		 * [getOpenUrl 返回app打开地址]
		 * @param openId 例如weishi的消息id
		 * @param openUrl 直接指定app打开地址
		 * @param appName app名称索引,例如weishi
		 * @param type 打开方式(详情页/播放页/专题页/web专题页)
		 * @param lid 直播id
		 * @param vid 视频id
		 * @param tid 专题id
		 * @param cid 专辑id
		 * @param pay 是否付费
		 * @param version app版本号
		 * @return {string} app打开地址
		 */
		getOpenUrl: function(op) {
			var params = {};
			var url = false;
			if (!op) {
				return url;
			}
			//如果指定为其它app,则直接取相应打开地址
			if (op.appName && op.appName !== xplayer.app.config.defaultName) {
				url = op.openId ? PACKAGEINFO[op.appName].openUrl.replace('${id}', op.openId) : PACKAGEINFO[op.appName].scheme;
				return url;
			}

			//for 视频app
			//直播电视台
			if (op.lid) {
				params.channel_id = op.lid;
			}
			//好莱坞有专辑id
			else if(op.cid){
				params.cover_id = op.cid;
			}
			//传入专题id
			else if (op.tid) {
				params.topic_id = op.tid;
			}
			//传入了vid数组或者没有vid返回模板
			else if (op.vidArray || !op.vid) {
				params.video_id = '${vid}';
			}
			//传入了视频id
			else if (op.vid) {
				params.video_id = op.vid;
			}

			if(op.vid2){
				params.video_id = op.vid2;
			}

			switch (op.openType) {
				//专辑详情页
				case 6:
					if(op.cid){
						params.action = 1;
					}
					break;
				//for 全屏
				case 2:
					if (op.lid) {
						params.action = 8;
					} else {
						params.action = 7;
					}
					break;
				//专题页
				case 3:
					if (op.lid) {
						params.action = 8;
					} else if (op.tid) {
						params.action = 6;
					} else {
						params.action = 5;
					}
					break;
				//好莱坞付费
				case 4:
					if (op.cid) {
						params.action = 1;
					}
					break;					
					//默认就是详情页
				default:
					//直播电视台
					if (op.lid) {
						params.action = 8;
					}
					else if(op.cid){
						params.action = 1;
					} 
					else {
						params.action = 5;
					}
			}

			//增加渠道号方便app统计
			if(op.promotionId){
				params.from = op.promotionId+'_'+(op.contentId?op.contentId:'');
			}

			params.action = params.action || 5;

			url = PACKAGEINFO.qqlive.scheme + '?' + decodeURIComponent($.param(params));

			//好莱坞付费
			if ((op.cid||op.h5Url) && parseInt(op.pay)) {
				var h5url = op.cid?xplayer.app.getPayUrl(op.cid):op.h5Url;

				if ($.os.iphone) {
					url = h5url;
					//蛋疼此处为了ios在打开付费页时不带额外参数
					op.openUrl = url;
				}
				//android3.2以前的版本直接走付费h5链接
				else if (op.version && parseInt(op.version) < 5852) {
					url = h5url;
				}
			}

			//直接指定打开地址(付费强制走自己页面)
			if(url !== h5url && op.openUrl){
				url = $.filterXSS(op.openUrl);
				if(url.indexOf('from')<0 && url.indexOf('?')>-1 && op.promotionId){
					url+='&from='+op.promotionId+'_'+(op.contentId?op.contentId:'');
				}
			}

			return url;
		},
		//方便别处获取配置信息
		getPackageInfo: function() {
			return PACKAGEINFO;
		},
		//当前webview类型
		pageType: function() {
			//微信
			if ($.browser.WeChat) {
				return 1;
			}
			//QQ浏览器
			if ($.browser.MQQ) {
				return 3;
			}
			//在手机qq下
			if ($.browser.MQQClient) {
				return 2;
			}
			return 0;
		}(),
		/**
		 * 平台是否有app
		 */
		isSupportApp: function() {
			if ($.os.iphone || $.os.ipod || $.os.ipad) {
				return true;
			}
			if ($.os.android) {
				return true;
			}
			return false;
		}(),
		/**
		 * 去除绑定尝试打开app,有些情况要特殊处理
		 */
		unbindTryOpenAppBanner:function(banner){
			banner?banner.noTryOpen = true:"";
		},
		/**
		 * 绑定尝试打开app事件
		 * @param  {[type]}  src      [description]
		 * @param  {Boolean} isIosOld [description]
		 * @return {[type]}           [description]
		 */
		bindTryOpenAppBanner: function(banner) {
			if (!(banner && banner.rewriteText)) {
				return;
			}
			//微信/手q/qq浏览器用内部接口判断
			if(xplayer.app.pageType){
				return;
			}

			var clickEvent = xplayer.$.os.hasTouch ? 'touchend' : 'click',
				$btn = banner.$btn,
				// downloadUrl = $btn.attr('href'),
				openUrl = $btn.attr('data-url'),
				isChrome = xplayer.$.browser.Chrome,
				canOpen = function() {
					var ua = navigator.userAgent;
					if(!xplayer.$.os.android && !xplayer.$.os.iphone){
						return false;
					}					
					if (ua.indexOf("qqnews/") != -1) {
						return false;
					}
					if(xplayer.$.os.android && isChrome){
						return false;
					}
					if((/^http|https/g).test(openUrl)){
						return false;
					}
					return true;
				};
			if(!canOpen()){
				return false;
			}
			//显示为打开
			//banner.rewriteText(1);			
			$btn.bind('touchend click',function(e){
				if(!banner.noTryOpen){
					e.preventDefault();
				}	
			});	
			$btn.bind(clickEvent, function() {
				if(!banner.noTryOpen){
					xplayer.app.tryOpenAppBanner($btn);
				}
			});
		},
		/**
		 * 尝试打开app
		 * @return {[type]} [description]
		 */
		tryOpenAppBanner: function($btn) {
			if(!$btn.length){
				return;
			}
			var self = this,
				targetDownloadUrl = $btn.attr('href'),
				targetOpenUrl = $btn.attr('data-url'),			
			 	downloadAppBanner = function() {
					location.href = targetDownloadUrl;
				},
				openAppBanner = function(){
					if(xplayer.$.os.android){
						var e = document.createElement("iframe");
						e.style.cssText = "width:1px;height:1px;position:fixed;top:0;left:0;";
						e.src = targetOpenUrl;
						document.body.appendChild(e);
					}
					else if(xplayer.$.os.iphone){
						location.href = targetOpenUrl;
					}
				};

			setTimeout(function() {
				var startTime = new Date().valueOf();
				openAppBanner();
				startTime = new Date().valueOf();

				setTimeout(function() {
					var endTime = new Date().valueOf();
					if (1550 > endTime - startTime) {
						downloadAppBanner();
					}
				}, 1500);
			}, 100);
		},
		/**
		 * 加载qq浏览器api(仅ios需要),可以判断是否安装app及拿到鉴权key来开放限速
		 */
		loadMqqAPI: function() {
			if(xplayer.app.loadMqqDefer){
				return xplayer.app.loadMqqDefer;
			}
			var defer = $.Deferred();
			xplayer.app.loadMqqDefer = defer;
			if (window.x5) {
				defer.resolve();
			}else {
				var apiurl = this.config.mqqApiUrl;
				$.getScript(apiurl, function() {
					window.x5 ? defer.resolve() : defer.reject();
				});
			}
			setTimeout(function() {
				defer.reject();
			}, 3000);
			return defer;
		},
		/**
		 * qq浏览器中检测是否安装app
		 * @return defer 1安装0未安装
		 */
		invokeQQBrowserAPI: function(op) {
			//蛋疼用手q打开qq浏览器,ua是qq浏览器但是判断得用手qapi判断
			if(!$.os.iphone && window.QQApi && QQApi.checkAppInstalled){
				return this.invokeQQClientAPI(op);
			}
			var defer = $.Deferred();

			function cb() {
				if (window.x5 && x5.ios && x5.ios.getMobileAppSupport) {
					var a = {
						"scheme": op.packageInfo.packageUrl
					};
					x5.ios.getMobileAppSupport(a, function(rs) {
						defer.resolve(rs && rs.isSupportApp == 1 ? 1 : 0);
					}, function() {
						defer.resolve(0);
					});
				} else {
					defer.resolve(0);
				}
				//超过300ms没结果就算没安装
				setTimeout(function() {
					defer.resolve(0);
				}, 300)
			}
			if (!$.os.iphone && window.x5mtt && window.x5mtt.isApkInstalled) {
				var _flag = window.x5mtt.isApkInstalled('{"packagename": ' + op.packageInfo.packageName + '}');
				defer.resolve(_flag != -1 ? 1 : 0);
			} else if ($.os.iphone && parseInt($.os.version)>5) {
				xplayer.app.loadMqqAPI().done(function() {
					cb();
				}).fail(function() {
					defer.resolve(0);
				});
			} else {
				defer.resolve(0);
			}

			setTimeout(function() {
				defer.resolve(0);
			}, 3000);		
			return defer;
		},
		/**
		 * 手q中加载qqapi,拉稀的andriod+手q api,只要js重复载入就挂掉了,此处为了保证jsapi只拉取一次
		 */
		loadQQClientAPI: function() {
			if (xplayer.app.loadQQClientDefer) {
				return xplayer.app.loadQQClientDefer;
			} 			
			var defer = $.Deferred();
			xplayer.app.loadQQClientDefer = defer;
			if (window.mqq || window.QQApi) {
				defer.resolve();
			}else {			
				var apiurl = this.config.QQApiUrl;
				$.getScript(apiurl, function() {
					defer.resolve();
				});
			}
			setTimeout(function() {
				defer.reject();
			}, 3000);
			return defer;
		},
		/**
		 * 手q中检测是否安装app
		 * @return defer 1安装0未安装
		 */
		invokeQQClientAPI: function(op) {
			var defer = $.Deferred();
			var ios = $.os.iphone;
			var scheme = ios ? op.packageInfo.packageUrl : op.packageInfo.packageName;

			this.loadQQClientAPI().done(function() {
				cb();
			}).fail(function() {
				defer.resolve(0);
			});

			function cb() {
				if (!ios && window.QQApi && QQApi.checkAppInstalled) {
					QQApi.checkAppInstalled(scheme, function(r) {
						if (r && r != 0) {
							r = r.split('\.');
							r = r[r.length - 1];
							defer.resolve(1, r);
						} else {
							defer.resolve(0);
						}
					})
				} else if (window.mqq && mqq.app && mqq.app.isAppInstalled) {
					mqq.app.isAppInstalled(scheme, function(rs) {
						if (mqq.invoke) {
							mqq.invoke('QQApi', 'checkAppInstalled', scheme, function(ver) {
								if (ver && ver.length) {
									ver = ver.split('\.');
									ver = ver[ver.length - 1];
								}
								defer.resolve(rs ? 1 : 0, ver);
							});
						} else {
							defer.resolve(rs ? 1 : 0);
						}

					});
				} else {
					defer.resolve(0);
				}
			}

			setTimeout(function() {
				defer.resolve(0);
			}, 5000);

			return defer;

		},
		/**
		 * 根据渠道号和app名称获取app下载包和md5
		 * @param  {number} 渠道号
		 * @param  {string} app名字索引
		 * @return defer
		 */
		getAppMd5: function(id, name) {
			id = id || 140;
			name = name || xplayer.app.config.defaultName;
			var defer = $.Deferred();
			var url = PACKAGEINFO[name].md5Cgi.replace('${id}', id);
			$.ajax({
				"url": url,
				"dataType": "jsonp"
			}).then(function(json) {
				//兼容新旧格式
				defer.resolve(json && json.data ? json.data : json);
			});
			return defer;
		},
		report: function(op, t) {
			var params = {};
			var t = t && t.curVideo ? t : false;
			if (t) {
				params = {
					vid: t.curVideo.getVid() || t.curVideo.getChannelId(),
					appId: t.config.appid || t.config.appId,
					contentId: t.config.contentId
				};
			}
			if (op) {
				op = $.extend(op, params);
				xplayer.report(op);
			}
		},
		/**
		 * 微信中判断是否安装app
		 * @param  {object}
		 * @return defer 1安装0未安装2升级
		 */
		invokeWeChatAPI: function(op) {
			var defer = $.Deferred();
			var self = this;
			//判断在正常页面和在iframe内部的情况			
			if (window != top) {
				WeixinJSBridge = top.WeixinJSBridge;
			}
			if (!WeixinJSBridge.invoke) {
				defer.resolve(0);
			}

			//拿到上网环境方便banner上报
			self.getNetworkTypeInWechat().done(function(nettype) {
				if (op && op.t && op.t.config) {
					op.t.config.nettype = nettype;
				}
			});

			if ($.os.iphone) {
				WeixinJSBridge.invoke('getInstallState', op.packageInfo, function(n) {
					var o = n.err_msg;
					if (o.indexOf("get_install_state:yes") > -1) {
						defer.resolve(1);
					} else {
						defer.resolve(0);
					}
				});
			} else { //aphone
				WeixinJSBridge.invoke('getInstallState', op.packageInfo, function(n) {
					var o = n.err_msg;
					if (o.indexOf("get_install_state:yes") > -1) {
						var arr = o.split("yes_"),
							ver = 0;
						if (arr.length >= 2) {
							ver = parseInt(arr[1], 10);
						}
						ver = isNaN(ver) ? 0 : ver;
						defer.resolve(1, ver);
					} else {
						defer.resolve(0);
					}
				})
			}

			setTimeout(function(){
				defer.resolve(0);
			},6000);

			return defer;
		},
		/**
		 * 微信中获取网络类型
		 * @return defer
		 */
		getNetworkTypeInWechat: function() {
			var defer = $.Deferred();
			WeixinJSBridge.invoke("getNetworkType", {}, function(res) {
				var nettype = -1; //未知
				if (res && res.err_msg) {

					if (res.err_msg === 'network_type:fail') {
						nettype = 0; //无网络连接
					}
					if (res.err_msg === 'network_type:wifi') {
						nettype = 1; //wifi
					}
					if (res.err_msg === 'network_type:edge') {
						nettype = 2; //2G/3G
					}
					if (res.err_msg === 'network_type:wwan') {
						nettype = 3; //2G/3G
					}
				}
				defer.resolve(nettype);
			});
			return defer;
		},
		/**
		 * 获取场景,是否安装app,app链接等信息
		 */
		check: function(config) {
			var self = xplayer.app,
				pageType = self.pageType,
				ios = $.os.iphone,
				config = config || {},
				defer = $.Deferred();

			//默认为视频app
			config.appName = config.appName || xplayer.app.config.defaultName;
			config.packageInfo = PACKAGEINFO[config.appName];

			//在微信里就需要尝试获取微信接口判断是否安装了App
			if (pageType == 1) {
				var dc = window == top ? document : top.document;
				if (!top.WeixinJSBridge) {
					try{
						dc.addEventListener("WeixinJSBridgeReady", function() {
							self.invokeWeChatAPI(config).then(function(rs, ver) {
								defer.resolve(self.buildResult(rs, config, ver));
							});
						});
					}catch(e){
						defer.resolve(self.buildResult(0, config));
					}				
				} else {
					self.invokeWeChatAPI(config).then(function(rs, ver) {
						defer.resolve(self.buildResult(rs, config, ver));
					});
				}

			}
			//在qq浏览器下
			else if (pageType == 3) {
				try{
					self.invokeQQBrowserAPI(config).then(function(rs, ver) {
						defer.resolve(self.buildResult(rs, config, ver));
					});
				}catch(e){
					defer.resolve(self.buildResult(0, config));
				}
			}
			//在手机qq下
			else if (pageType == 2) {
				try{
					self.invokeQQClientAPI(config).then(function(rs, ver) {
						defer.resolve(self.buildResult(rs, config, ver));
					});
				}catch(e){
					defer.resolve(self.buildResult(0, config));
				}				
			} else {
				defer.resolve(self.buildResult(0, config));
			}

			return defer;

		},
		/**
		 * 微信手q中加载下载器js
		 * @return {boolean}
		 */
		loadDownloaderAPI: function() {
			if (xplayer.app.loadDownloaderDefer) {
				return xplayer.app.loadDownloaderDefer;
			} 			
			var defer = $.Deferred();
			xplayer.app.loadDownloaderDefer = defer;
			var url = "";
			if (this.pageType == 1) {
				url = xplayer.defaultConfig.libpath + xplayer.defaultConfig.pluginUrl.AppDownloadClickWechat;
			}
			if (this.pageType == 2) {
				url = xplayer.defaultConfig.libpath + xplayer.defaultConfig.pluginUrl.AppDownloadClickMqq;
			}

			if (!url) {
				defer.reject();
			}

			if ($.downloadClick_wechat || $.downloadClick_mqq) {
				defer.resolve();
			}else {
				$.getScript(url, function() {
					defer.resolve();
				});
				setTimeout(function() {
					defer.reject();
				}, 3000);
			}

			return defer;
		},
		/**
		 * 检测是否可以开启下载器
		 * @param  {Boolean} hasApp 是否安装了app
		 * @param  {[type]}  op     检测开启下载器需要的参数
		 * @param  {[type]}  params 调用下载器需要的参数
		 * @return defer
		 */
		checkCanDownloader: function(hasApp, op, params) {
			var defer = $.Deferred();
			var that = this;
			if ($.os.iphone || $.os.ipad || !op || hasApp == 1) {
				defer.resolve(0);
				return defer;
			}

			var enableWechatDownloader = false;
			var enableMqqDownloader = false;

			var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
			//下载地址和md5必须同时传入
			if (!isAndroid || hasApp == 1 || !op.downloader || (op.downloadUrl && !op.md5) || (!op.downloadUrl && op.md5)) {
				defer.resolve(0);
				return defer;
			}
			//如果传入了作用范围
			if ($.isArray(op.range)) {
				$.each(op.range, function(i, o) {
					if (o == 1) {
						enableWechatDownloader = true;
					}
					if (o == 2) {
						enableMqqDownloader = true;
					}
				});
			}
			//如果没有传入广播回调函数则作用范围不限制
			if (!op.downloaderCallback) {
				enableWechatDownloader = true;
				enableMqqDownloader = true;
			}

			if (($.browser.WeChat && enableWechatDownloader) || ($.browser.MQQClient && enableMqqDownloader)) {

				this.loadDownloaderAPI().done(function() {
					cb();
				}).fail(function() {
					defer.resolve(0);
				});

			} else {
				defer.resolve(0);
			}

			function cb() {
				if ($.downloadClick_wechat) {
					params && $.downloadClick_wechat(params);
				}
				if ($.downloadClick_mqq) {
					params && $.downloadClick_mqq(params);
				}

				defer.resolve(1);
			}

			return defer;
		},
		buildResult: function(num, config, ver) {
			var url = "";
			var pageType = this.pageType;
			var ios = $.os.iphone;
			var ipad = $.os.ipad;
			config.version = ver;

			//处理得到的打开地址,为新安装app的情况使用
			// var openUrl = PACKAGEINFO[config.appName].openUrl;
			// var liveOpenUrl = PACKAGEINFO.qqlive.liveOpenUrl;

			var openUrl = xplayer.app.getOpenUrl(config);
			//var liveOpenUrl = openUrl;
			var self = this;

			// //如果传入vid直接返回打开app地址,否则返回地址模板
			// config.vid ? openUrl = openUrl.replace('${vid}', encodeURIComponent(config.vid)) : "";
			// //如果传入的直播id直接返回直播app地址
			// config.lid ? liveOpenUrl = liveOpenUrl.replace('${lid}', encodeURIComponent(config.lid)) : "";
			//已指定打开地址则覆盖
			//config.openUrl ? openUrl = $.filterXSS(config.openUrl) : "";

			if (ios && !config.openUrl) {
				if (pageType == 1) {
					openUrl += "&callback=weixin%3A%2F%2F&sender=%e5%be%ae%e4%bf%a1";
				}
				if (pageType == 2) {
					openUrl += "&callback=mqqapi%3A%2F%2F&sender=%E6%89%8B%E6%9C%BAQQ";
				}
				if (pageType == 3) {
					openUrl += "&callback=mqqbrowser%3A%2F%2F&sender=QQ%E6%B5%8F%E8%A7%88%E5%99%A8";
				}
			}

			if (num == 1) {
				//xplayer.app.hasApp = 1;
				url = openUrl;
				// //直播情况更换直播app地址
				// config.lid ? url = liveOpenUrl : "";
			} 
			//如果是ios且是付费视频没安装app也直接走h5付费页 
			else if($.os.iphone && config.pay && config.cid){
				url = xplayer.app.getPayUrl(config.cid);
			}
			else {
				url = self.getDownloadUrl(config.downloadUrl, config.appName);
			}

			return {
				hasApp: num,
				pageType: pageType,
				os: ios,
				version: ver,
				openUrl: openUrl,
				//liveOpenUrl: liveOpenUrl,
				liveOpenUrl: openUrl,
				url: url
			};
		}
	};

})(xplayer, xplayer.$);