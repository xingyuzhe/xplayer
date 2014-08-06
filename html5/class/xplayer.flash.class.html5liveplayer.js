/**
 * @fileOverview 腾讯视频云播放器 HTML5直播播放器
 */

/*
 * @include "./tvp.define.js"
 * @include "./tvp.jquery.js"
 * @include "./tvp.common.js"
 * @include "./tvp.baseplayer.js"
 * @include "./tvp.livehub.js"
 */

;
(function(tvp, $) {
	if(tvp.Html5LiveTiny){
		return;
	}

	var _isInited = false;

	function _reportCanPlayHls(t, canplay) {
		var op = {
			cmd: 3543,
			vid: t.curVideo.getChannelId(),
			contentId: t.config.contentId,
			appId: t.config.appid,
			//当前h5直播支持判断结果
			int5: tvp.common.isLiveUseHTML5() ? 1 : 0,
			//能不能播
			int6: canplay,
			str8: navigator.userAgent
		};
		tvp.report(op);
	}

	function _getCgiParams() {
		var op = {
			cmd: 2,
			qq: tvp.common.getUin(),
			guid: encodeURIComponent(tvp.$.createGUID()),
			txvjsv: '2.0',
			stream: 2
		};
		var extData = {
			debug: "",
			ip: ""
		}
		$.each(extData, function(el) {
			extData[el] = $.getUrlParam(el);
		})
		$.extend(op, extData);
		if ($.os.windows) {
			op.system = 0;
		}
		if ($.os.iphone) {
			op.system = 1;
			op.sdtfrom = 113;
		}
		if ($.os.ipad) {
			op.sdtfrom = 213;
		}
		if ($.os.android) {
			op.system = 2;
			op.sdtfrom = 313;
		}
		if ($.os.mac) {
			op.system = 3;
		}

		return op;
	}

	function _stepReort(num,op){
		if(tvp.livehub && tvp.livehub.stepReport){
			tvp.livehub.stepReport(num,op);
		}
	}

	function Html5LiveTiny(vWidth, vHeight) {
		this.config.width = tvp.$.filterXSS(vWidth),
		this.config.height = tvp.$.filterXSS(vHeight),

		this.videoTag = null, // <video>标签对象
		this.$video = null, // 播放器 $对象
		this.protectedFn = {},
		this.isUseControl = true;

		$.extend(this.h5EvtAdapter, {
			"onPlaying": function() {
				var t = this;
				//如果能播放hls,上报且上报一次
				if (!this.hasReportCanPlayHls) {
					this.hasReportCanPlayHls = true;
					_reportCanPlayHls(t, 1);
				}			
			},		
			"onError": function(ts, e) {
				var t = this;
				//播放hls失败,收集黑名单
				_reportCanPlayHls(t, 0);
				var errContent = -1;
				if ( !! e.target && e.target.error) {
					errContent = e.target.error.code;
				}
				//this.showError(0, errContent);
				//没办法播hls则显示下载/打开 按钮
				$.each(tvp.html5LiveFrontShow.plugins,function(i,o){
					if(o.name=='liveDownloader'){
						new o.key(t,true);
					}
				});
				this.callCBEvent("onerror", 0, errContent);
			}
		});
	}

	Html5LiveTiny.fn = Html5LiveTiny.prototype = new tvp.BaseHtml5();

	$.extend(Html5LiveTiny.fn, {
		/**
		 * 输出播放器
		 */
		write: function(id) {

			tvp.BaseHtml5.prototype.write.call(this, id);

			this.callProtectFn("onwrite");
			this.callCBEvent("onwrite");

			this.play(this.curVideo, this.config.autoplay);
		},

		play: function(video, isAutoPlay) {
			var t = this;
			if (!this.videoTag) {
				throw new Error("未找到视频播放器对象，请确认<video>标签是否存在");
			}
			if (!video instanceof tvp.VideoInfo) {
				throw new Error("传入的对象不是tvp.VideoInfo的实例");
			}
			if ($.isUndefined(isAutoPlay)) isAutoPlay = true;

			this.setCurVideo(video);

			var new_url;
			var userUrl = this.config.playUrl;
			var params = {
				cnlid: video.getChannelId(),
				host: tvp.$.getHost()
			};
			params = $.extend(params, _getCgiParams());
			var defer = $.Deferred();
			//如果直接传入了playUrl 
			if (userUrl) {
				if (/.*\.?qq\.com$/.test(params.host) || /.*\.?qq\.com$/.test(userUrl)) {
					new_url = userUrl;
					//直接使用外部参数地址播放
					_stepReort(9,{
						config:t.config
					});
					defer.resolve(new_url);					
				}else{
					//外部播放地址不合法
					_stepReort(10,{
						config:t.config
					});
					throw new Error("当前域或者播放地址不在白名单内!");
				}
			} else {
				//开始获取播放地址
				_stepReort(11,{
						config:t.config
					});
				var now = $.now();
				$.ajax({
					url: "http://info.zb.qq.com",
					data: params,
					dataType:'jsonp'
				}).done(function(rs, delay) {
					delay = $.now() - now;
					if (rs.playurl) {
						//获取播放地址成功
						_stepReort(12,{
							delay:delay,
							config:t.config
						});
						defer.resolve(rs.playurl);
					} else {
						//获取播放地址失败
						_stepReort(13,{
							delay:delay,
							config:t.config,
							code:rs.iretcode
						});
						defer.reject();
					}
				}).fail(function(error, delay) {
					delay = $.now() - now;
					//请求播放地址失败
					_stepReort(14,{
						delay:delay,
						config:t.config
					});					
					defer.reject();
				});

			}

			defer.then(function(url) {
				_cb(url);
			});

			function _cb(url) {
				t.videoTag.src = url;
				t.$video.trigger("tvp:video:src"); //触发自定义事件，video的src设置
				if (!_isInited) {
					_isInited = true;
					t.callCBEvent("oninited");
				}

				t.videoTag.pause();
				if (isAutoPlay) {
					t.videoTag.load(); // 重新加载数据源
					t.videoTag.play(); // 播放
				}
				//加载前贴行为(直播下载/跳转app)
				tvp.html5LiveFrontShow.create(t);
				t.callCBEvent("onchange", t.curVideo.getChannelId());
			}
		}
	});

	tvp.Html5LiveTiny = Html5LiveTiny;
	tvp.Html5LiveTiny.maxId = 0;
})(tvp, tvp.$);
/**
 * @fileOverview 腾讯视频统一播放器 HTML5播放器
 *
 */

/*
 * @include "../tvp.define.js"
 * @include "../../extend/zepto.js"
 * @include "../tvp.common.js"
 * @include "../tvp.baseplayer.js"
 * @include "./tvp.html5tiny.js"
 */

;
(function(tvp, $) {
	if(tvp.Html5Live){
		return;
	}

	/**
	 * 腾讯视频统一播放器 带有控制栏的HTML5播放器
	 */

	function Html5Live(vWidth, vHeight) {
		this.isUseControl = false;

		this.config.width = tvp.$.filterXSS(vWidth);
		this.config.height = tvp.$.filterXSS(vHeight);

		this.control = null;
		this.$UILayer = null;

		var $self = this;
		$.extend(this.protectedFn, {
			onwrite: function() {
				this.control = new tvp.Html5UI($self);
				this.control.feature = this.config.html5LiveUIFeature;
				this.control.init();
				this.$UILayer = this.control.$UILayer;
			}
		});
	};
	Html5Live.fn = Html5Live.prototype = new tvp.Html5LiveTiny();

	$.extend(Html5Live.prototype, {
		createVideoHtml: function() {
			var videoTagHtml = tvp.Html5LiveTiny.prototype.createVideoHtml.call(this), // 调用父类的方法
				html = tvp.html5skin.getHtml(this.config);
			return html.replace("$VIDEO$", videoTagHtml);
		},
		getPlayerType: function() {
			return "html5live";
		}
	});

	// extends Html5Live to tvp namespace
	tvp.Html5Live = Html5Live;

})(tvp, tvp.$);