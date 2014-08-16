/**
 * @fileOverview  腾讯视频移动端暂停/结束时显示App下载提示banner和微信推荐视频
 * @author jarvanxing
 * @copyright TencentVideo Web Front-end Team
 */



;
(function(xplayer, $) {
	var defaultConfig = {
		pluginName: 'AppRecommend',
		text1: "查看公众号更多视频",
		picCgi: 'http://like.video.qq.com/fcgi-bin/rmd_mobile',
		navCurrentClass: 'current',
		tpl: [
			'<div  data-role="relatebox" class="xplayer_related" id="${relateid}">',
			'   <div data-role="relatemove" class="xplayer_related_inner">',
			'		<% for(var i=0;i<list.length;i++) {%>',
			'			<% if(i==0) {%>',
			'			<ul class="${listclass}">',
			'			<% }%>',
			'			<% if(i>0 && i%3==0) {%>',
			'			</ul>',
			'			<ul class="${listclass}">',
			'			<% }%>',
			'			<li class="xplayer_item">',
			'				<a data-action="applink" ${iframe} data-role="relatelink" data-url="#" href="#" data-vid="<%=list[i].id%>" class="xplayer_related_link"><img class="xplayer_figure" src="<%=list[i].picurl%>" /><strong class="xplayer_title"><%=list[i].title%></strong></a>',
			'			</li>',
			'			<% if(i==list.length-1) {%>',
			'			</ul>',
			'			<% }%>',
			'		<% }%>',
			'   </div>',
			'	<% if(list.length>3) {%>',
			'	<div class="xplayer_related_nav">',
			'	<% for(var i=0;i<list.length;i++) {%>',
			'		<% if(i%3==0) {%>',
			'			<i data-role="relatetrigger" class="dot"></i>',
			'		<% }%>',
			'	<% }%>',
			'   </div>',
			'	<% }%>',			
			'</div>',
			'<div data-role="replay" class="xplayer_replay"><i class="xplayer_icon_replay"></i>重新播放</div>'
		].join(''),
		// relateTpl: [
		// 	'<div style="display:none" data-role="relatebox" class="xplayer_related" id="${relateid}">',
		// 	'   <div class="xplayer_related_inner">',
		// 	//'	<div data-role="relatereplay" class="xplayer_replay"><i class="xplayer_icon_replay"></i>重新播放</div>',
		// 	'	<ul class="${listclass}">',
		// 	'		${listitem}',
		// 	'	</ul>',
		// 	'   </div>',
		// 	'</div>'
		// ].join(''),
		//replayTpl: '<div data-role="relatereplay" class="xplayer_replay"><i class="xplayer_icon_replay"></i>重新播放</div>',
		// picTpl: '<ul data-role="recommend" class="${listclass}"></ul>',
		// picItemTpl: [
		// 	'	<li class="xplayer_item">',
		// 	'		<a data-action="applink" ${iframe} data-role="relatelink" data-url="#" href="#" data-vid="${id}" class="xplayer_related_link"><img class="xplayer_figure" src="${picurl}" /><strong class="xplayer_title">${title}</strong></a>',
		// 	'	</li>'
		// ].join(''),
		bannerTpl: [
			'<div data-role="appbannerbox" class="xplayer_app_download" style="display:none">',
			'   <a data-action="applink" data-role="appbannerlink" class="xplayer_download_app" href="${url}" ${iframe}>',
			'		<i class="xplayer_icon_logo"></i>',
			'		<span class="xplayer_download_app_wording"><span class="xplayer_download_app_title" data-role="appbannertext1">${text1}</span><span data-role="appbannertext2" class="xplayer_download_app_desc">${text2}</span></span>',
			'		<span data-role="appbannerbtntext" class="xplayer_app_btn_em">${btnText}</span>',
			'	</a>',
			'</div>'
		].join('')
	};

	function AppRecommend(op) {
		this.userop = op;
		var newop = $.extend({}, defaultConfig, op);
		this.op = newop;
		this.init(newop);
		return this;
	}


	$.extend(AppRecommend.prototype, {
		init: function(op) {
			var t = op.t;
			var self = this;
			this.op = $.extend(op, {
				$mod: t.$UILayer || t.$videomod,
				currentIndex: 0,
				relateid: "xplayer_related_" + t.playerid,
				eventType: $.os.hasTouch ? 'touchend' : 'click',
				//ios直接从全屏切回普通状态时，currentTime总是为0,
				//此处自己根据timeupdate记录当前播放时间				
				currentTime: 0,
				replayClicked: false,
				//拿到推荐列表后返回的算法id参数,好上报
				tjReportParams: "",
				//滑动，记录哪些条目已经上报曝光过了
				tjReportFlag:[],
				//是否是微信中嵌入iframe的情况
				isWechatIframe: (op.type == 2 ? true : false),
				//微信推荐热门视频vid集合
				vidArray: []
			});
			//拿到微信url中的账号相关参数
			this.fixParams(op);

			this.initFirstEvent(op).done(function() {
				//只有拿到推荐数据才处理
				self.getList(op).done(function(dataList) {
					if (dataList) {
						$.loadPluginCss(defaultConfig.pluginName).done(function() {
							self.initRoles(dataList);
							self.fixVideoUrl(op);
							self.fixVideoUrlEvent(op);
							self.initEvent(op);
							// if (op.isWechatIframe) {
							// 	self.fillBanner(op);
							// }
						});
					}
				});
			});

		},

		initRoles: function(dataList) {
			this.fixUI();
			var op = this.op;
			var $mod = op.$mod;
			var tpl = defaultConfig.tpl;
			var listclass = 'xplayer_related_list xplayer_related_list_v2';
			// if (op.isWechatIframe) {
			// 	listclass = 'xplayer_related_list';
			// }

			//先替换样式
			tpl = $.formatTpl(tpl, {
				relateid: op.relateid,
				listclass: listclass,
				//listitem: dataHtml,
				iframe: window != top ? 'target="_parent"' : ""
			});

			//再替换数据
			var render = $.tmpl(tpl);
			var html = render({
				"list": dataList
			});

			$mod.append(html);
			this.$relateBox = $mod.find('[data-role=relatebox]');
			this.$replay = $mod.find('[data-role=replay]');
			this.$links = $mod.find('[data-role=relatelink]');
			this.$triggers = $mod.find('[data-role=relatetrigger]');
			this.$mover = $mod.find('[data-role=relatemove]');

			//为了解决android下的样式问题
			this.$lists = $mod.find('.xplayer_related_list');
			this.$lists.width($mod.width());

			this.fixTrigger();
		},

		//没有用h5皮肤时
		fixUI: function() {
			var op = this.op;
			var t = op.t;
			var $mod = op.$mod;
			if (!t.$UILayer) {
				$mod.addClass('xplayer_container');
				var shadow = $mod.find('.xplayer_shadow');
				if (!shadow.length) {
					shadow = $('<div class="xplayer_shadow"></div>').appendTo($mod);
					shadow.hide();
				}
				this.$shadow = shadow;
			}
		},

		fixShow: function(isShow) {
			var self = this;
			var op = this.op;
			var t = op.t;
			var $mod = op.$mod;
			var $shadow = this.$shadow;
			var $relateBox = this.$relateBox;
			var $replay = this.$replay;
			var $videotag = op.t.$video[0];
			if (isShow) {
				t.hidePlayer($videotag);
				//没有用h5皮肤时
				if (!t.$UILayer) {

					$mod.addClass('xplayer_finished');
					$shadow.show();
				} else {
					t.hideControl();
					//self.fixControl(1);
				}

				$relateBox.show();

				$replay.show();
				//广告显示出来上报,结束的时候会同时触发(end和pause事件,为避免多次上报,此处加个标识)
				if (op.vidArray.length > 0 && !self.hasReport) {
					self.hasReport = true;
					self.tjreport(op.vid, 0, op.vidArray.slice(0,3));
					if (!op.isWechatIframe) {
						return;
					}
					//此时appbanner才显示,则进行曝光上报
					if (self.AppBanner) {
						self.AppBanner.report(0);
					}
				}

			} else {
				self.hasReport = false;
				if (!op.replayClicked) {
					$relateBox.hide();
					$replay.hide();
					t.showPlayer($videotag);
					//没有用h5皮肤时
					if (!t.$UILayer) {
						$mod.removeClass('xplayer_finished');
						$shadow.hide();

					} else {
						//self.fixControl(0);
					}

				}
			}
		},

		getList: function(op) {
			var defer = $.Deferred();
			var self = this;
			var cgi = defaultConfig.picCgi;
			var params = {
				otype: 'json',
				size: op.size || 3
			};
			if (op.isWechatIframe) {
				cgi = 'http://like.video.qq.com/fcgi-bin/rmd_weixin';
				params = $.extend(params, {
					size:9,
					playvid: op.vid,
					account: op.biz
				});
			} else {
				params = $.extend(params, {
					tablist: 9,
					playright: 7,
					id: op.vid
				});
			}

			//有些android机器uc/qq浏览器滑动有问题,本次版本暂时屏蔽		
			if($.os.android && !($.browser.WeChat || $.browser.MQQClient)){
				params.size = 3;
			}

			$.ajax({
				url: cgi,
				data: params,
				dataType: "jsonp",
				jsonCache: 600
			}).done(function(json) {
				//为了得到上报时需要的cgi算法参数
				op.tjReportParams = json;

				var curdata = false;
				//for rmd_weiixn
				if (json && json.videos && json.videos.length) {
					curdata = json.videos;
				}
				//for rmd_mobile
				if (json && json.tablist && json.tablist.length) {
					$.each(json.tablist, function(i, o) {
						if (o.tabid == 9) {
							op.tjReportParams = o;
							curdata = o.cover_info;
							curdata = curdata.length ? curdata : false;
							return;
						}
					});
				}

				if (curdata) {
					//var html = "";
					$.each(curdata, function(i, obj) {
						//window != top ? obj.iframe = 'target="_parent"' : obj.iframe = "";
						//html += $.formatTpl(defaultConfig.picItemTpl, obj);
						op.vidArray.push(obj.id);
					});
					defer.resolve(curdata);
				} else {
					defer.resolve();
				}
			}).fail(function() {
				defer.resolve();
			});

			return defer;
		},

		/**
		 * [getAppBanner 加载appBanner,为能拿到appbanner里面判断app安装状态的方法]
		 * @return {[type]} [description]
		 */
		getAppBanner: function() {
			var t = this.op.t;
			var defer = $.Deferred();
			if ($.createAppBanner) {
				defer.resolve();
			} else {
				var url = t.config.libpath + t.config.pluginUrl['AppBanner'];
				$.getScript(url, function() {
					defer.resolve();
				});
			}

			return defer;
		},
		fixUrl: function(url, vid) {
			if (vid) {
				url = url.replace('${vid}', vid);
			}
			return url + '&from=' + this.op.appmsgid + '&extend=' + this.op.biz;
		},
		/**
		 * [fixUrl 根据是否安装腾讯视频app处理推荐视频的链接]
		 * @return {[type]} [description]
		 */
		fixVideoUrl: function() {
			var self = this;
			var op = this.op;
			var $links = this.$links;
			var _op = $.extend({}, op);
			//此处为了获得打开地址的模板
			_op.vid = '';
			xplayer.app.check(_op).done(function(rs) {
				if (rs && rs.url) {
					$links.each(function(i, o) {
						var vid = $(o).data('vid');
						o.href = self.fixUrl(rs.url, vid);
						$(o).attr('data-url', self.fixUrl(rs.openUrl, vid));
					});
				}
			});
		},
		fixControl: function(isShow) {
			var op = this.op;
			var t = op.t;
			var _index = 5;
			var control = t.control.$control;
			//如果是全屏状态且使用伪全屏
			var state = t.instance.isFullScreen && t.config.isHtml5UseFakeFullScreen;
			var relateBox = this.$relateBox;
			if (isShow == 1 && state) {
				var index = relateBox.css('z-index');
				control.css('z-index', index + 1);
				t.showControl();
			}
			//控制栏恢复原状
			if (isShow !== 1) {
				control.css('z-index', _index);
			}
			//如果非全屏状态且结束推荐显示了出来
			if (isShow == 2 && relateBox.is('not:hidden')) {
				t.hideControl();
			}
		},

		fixVideoUrlEvent: function(op) {
			var self = this;
			var a = this.$links;
			//如果开启了下载器
			if (op.downloader) {
				if ($.downloadClick_wechat && $.downloadClick_wechat.hasDownloader) {
					$.downloadClick_wechat.bindDownloader(a);
				}
				if ($.downloadClick_mqq && $.downloadClick_mqq.hasDownloader) {
					$.downloadClick_mqq.bindDownloader(a);
				}
			}
			a.on(op.eventType, function(e) {
				var vid = $(e.currentTarget).data('vid');
				self.tjreport(op.vid, 1, vid);
			});
		},

		//推荐上报
		tjreport: function(vid, action, _vid) {
			var op = this.op;

			function getItype() {
				var rs = 0;
				if ($.browser.WeChat) {
					rs = 2;
				}
				if ($.browser.MQQClient) {
					rs = 4;
				}
				return rs;
			}

			var int1 = 0,
				int2 = 0,
				int3 = 0,
				itype = getItype(),
				ctype = 0,
				val2 = 0;
			//微信热门
			if (op.isWechatIframe) {
				int1 = op.tjReportParams && op.tjReportParams.int1 ? op.tjReportParams.int1 : 640000;
				ctype = 10;
				val2 = 11;

			} else {
				int1 = op.tjReportParams && op.tjReportParams.algfilever ? op.tjReportParams.algfilever : int1;
				int2 = op.tjReportParams && op.tjReportParams.algver ? op.tjReportParams.algver : int2;
				int3 = op.tjReportParams && op.tjReportParams.algsubver ? op.tjReportParams.algsubver : int3;
				ctype = 13;
				val2 = 23;
			}

			xplayer.report({
				vid: vid,
				itype: itype,
				ctype: ctype,
				cmd: action == 0 ? 1801 : 1802,
				int1: int1,
				int2: int2,
				int3: int3,
				val: 1,
				str1: op.biz,
				val2: val2,
				host: $.getHost(),
				str2: action == 0 ? _vid.join('+') : _vid,
				_: new Date().getTime()
			});
		},
		/**
		 * 滑动时上报
		 * @return {[type]} [description]
		 */
		swipeReport:function(direction,toIndex){
			var op = this.op;
			var tjReportFlag = op.tjReportFlag;
			var hasReport = false;
			var ids = 0;
			xplayer.report({
				cmd:3556,
				val:direction,
				val2:toIndex
			});

			//首次已经上报过了
			if(toIndex == 0){
				return;
			}

			ids = op.vidArray.slice(toIndex*3,(toIndex+1)*3);
			$.each(tjReportFlag,function(i,obj){
				if(obj == toIndex){
					hasReport = true;
				}
			});
			if(!hasReport){
				this.tjreport(op.vid,0,ids);
				op.tjReportFlag.push(toIndex);
			}
			
		},

		/**
		 * [fixParams 拿到公众账号id]
		 * @return {[type]} [description]
		 */
		fixParams: function() {
			var curl = window != top ? document.referrer : document.location.href;
			var op = this.op;

			function get(key) {
				var v = $.getUrlParam(key, curl);
				if (v) {
					v = decodeURIComponent(v);
					v = $.filterXSS(v);
				}
				return v;
			}

			op.biz = get('__biz');
			op.appmsgid = get('appmsgid');

		},

		move: function(direction) {
			var op = this.op,
				toIndex = 0,
				fromIndex = op.currentIndex,
				distance = 0,
				width = op.$mod.width(),
				length = Math.ceil(op.vidArray.length / 3) - 1;
			if (direction == 'left') {
				toIndex = fromIndex + 1;
			}
			if (direction == 'right') {
				toIndex = fromIndex - 1;
			}

			if(!direction){
				toIndex = fromIndex;
			}

			this.swipeReport(direction,toIndex);

			if (toIndex < 0 || toIndex > length) {
				return;
			}

			distance -= toIndex * width;

			//xplayer.log(distance);

			this.$mover.css({
				//"-webkit-transition": "0.5s ease-out",
				"-webkit-transform": "translateX(" + distance + "px)"
			});
			op.currentIndex = toIndex;
			this.fixTrigger();
		},

		/**
		 * [fillBanner 初始化banner提示,for 微信+iframe]
		 * @return {[type]} [description]
		 */
		fillBanner: function(op) {
			var self = this;
			var params = $.extend({}, self.userop, {
				//禁止appbanner插件使用自己默认的style
				style: 'none',
				//禁止appbanner自动上报曝光
				isAutoReport: false,
				//区分是微信结束推荐
				reportParams: {
					//int2: 1,
					int5: 1
				},
				t: op.t,
				vid: op.vid,
				tpl: defaultConfig.bannerTpl,
				modId: op.relateid
			});
			// if (op.isWechatIframe) {
			// 	params.text1 = defaultConfig.text1;
			// }
			this.getAppBanner().done(function() {
				$.createAppBanner(params).done(function(banner) {
					//把appbanner实例保存当当前apprecommend实例
					self.AppBanner = banner;
					var a = banner.$btn;
					var href = a.attr('href');
					a.attr('href', self.fixUrl(href));
				});
			});
		},
		fixTrigger: function() {
			if (this.$triggers.length) {
				var index = this.op.currentIndex,
				    op = this.op;
				this.$triggers.removeClass(op.navCurrentClass).eq(index).addClass(op.navCurrentClass);
			}
		},
		initFirstEvent: function(op) {
			var t = op.t;
			var self = this;
			var $video = t.$video;
			var $videoTag = $video[0];
			var hasData = false;
			var defer = $.Deferred();

			$video.on('timeupdate', function() {
				//ios在非用户主动触发暂停结束事件时会自动把currentTime设为0.......
				if ($videoTag.currentTime) {
					op.currentTime = $videoTag.currentTime;
				}
				if (!hasData && ((parseInt(t.getDuration()) - parseInt(op.currentTime)) < 7)) {
					hasData = true;
					defer.resolve();
				}
			});
			return defer;
		},
		initEvent: function(op) {
			var t = op.t;
			var self = this;
			var $video = t.$video;
			var $videoTag = $video[0];
			var $replay = this.$replay;

			$replay.on(op.eventType, function(e) {
				op.replayClicked = true;
				setTimeout(function() {
					op.replayClicked = false;
					//$('body').append('<div>ended-PLAY</div>');
					//最后5s的话直接重新播放
					$videoTag.play();
					if ((parseInt(t.getDuration()) - parseInt(op.currentTime)) < 6) {
						$videoTag.load();
					}
					$videoTag.play();
				}, 500);
			});
			$video.on('pause paused', function(e) {
				//$('body').append('<div>pause</div>');
				//如果当前是正在拖动控制栏，也会触发pause
				if (!!t.isTouching) {
					return;
				}
				var duration = parseInt(t.getDuration());
				var curTime = parseInt($.os.iphone ? op.currentTime : $videoTag.currentTime);
				//只有最后5s才显示广告
				if ((duration - curTime) > 5) {
					self.fixShow(0);
					return;
				}

				self.fixShow(1);
			});

			$video.on('ended', function() {
				//$('body').append('<div>ended</div>');
				self.fixShow(1);
			});

			$video.on('play playing', function() {
				//$('body').append('<div>play</div>');
				self.fixShow(0);
			});

			this.$relateBox.on('swipeLeft', function() {
				self.move('left');
			});

			this.$relateBox.on('swipeRight', function() {
				self.move('right');
			});

			if (t.control) {
				var $control = t.control.$control;
				var $fullscreen = $control.find(xplayer.html5skin.elements.fullscreen);
				$fullscreen.on(op.eventType, function() {
					//self.fixControl(2);
					//全屏切换时要重新设置下滑动内容的宽度
					self.$lists.width(op.$mod.width());
					//重新定位下位移
					self.move();
				});
			}

		}
	});

	$.extend($, {
		createAppRecommend: function(config) {
			var defer = $.Deferred();
			var appRecommend = new AppRecommend(config);

			//把appRecommend实例保存住方便其它地方使用
			if (config.t) {
				config.t.AppRecommend = appRecommend;
			}
			defer.resolve(appRecommend);
			return defer;
		}
	});
})(xplayer, xplayer.$);


;
(function(xplayer, $) {
	$.extend(xplayer.Player.fn, {
		/**
		 * 创建腾讯视频暂停/结束后的推荐视频和banner
		 */
		buildAppRecommend: function(config) {
			var self = this;
			//unable for flash
			if (this.flashobj) {
				return;
			}
			// unable for mp4link
			if (!this.$videomod) {
				return;
			}
			//不支持app的平台
			if (xplayer.app && !xplayer.app.isSupportApp) {
				return;
			}
			//检查是否是限播视频,如果是限播的话就不再显示结束推荐了
			setTimeout(function() {
				//这里限播实例挂载在内核上了
				if (self.instance && self.instance.DurationLimitInstance && self.instance.DurationLimitInstance.enable) {
					return;
				}
				config = config || {};
				config.t = self;
				config.vid = self.curVideo.getVid();
				$.createAppRecommend(config);
			}, 5000);

		}
	});
})(xplayer, xplayer.$);