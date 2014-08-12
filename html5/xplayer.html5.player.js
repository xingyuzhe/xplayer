
;
(function(xplayer, $) {

	if(xplayer.Html5Tiny){
		return;
	}
	var _isInited = false,
		curVid = "",
		pauseCheckTimer = null,
		isAdrPlayTrack = false,
		_adfirsttu = false;

	/**
	 * 判断当前设备是否需要不断的去调用load和play去重试播放
	 * @return {Boolean} [description]
	 */
	function isNeedAdrTrick() {
		return $.os.android && !isAdrPlayTrack && !$.os.HTC && !$.os.VIVO;
	}

	/**
	 * 不断重试调用load和play，因为有些安卓设备会卡在某个网络状态
	 * @param  {[type]} video [description]
	 * @return {[type]}       [description]
	 */
	function adrInvalidPauseCheck(video,t) {
		var currt = video.currentTime;
		var cnt = 0;
		var flag = false;
		var cbTimer = null;

		isAdrPlayTrack = true;

		//video.pause();
		video.play();

		video.addEventListener("playing", function() {
			clearTimeout(cbTimer);
			cbTimer = setTimeout(cb, 320); //currentTime响应时间在300毫秒
		}, false);

		var cb = function() {
			xplayer.debug("cb");
			if (video.currentTime == currt && !flag) {
				cnt++;
				video.play();
				if (cnt % 10 == 0 && video.currentTime == currt) { //为什么需要再判断一次，因为可能上面play了以后已经可以正常播放了
					video.load();
					video.play();
				}
				cbTimer = setTimeout(cb, 1000);
			} else {
				flag = true;
			}
		}
		cbTimer = setTimeout(cb, 1000);
	};

	/**
	 * @class xplayer.Html5TinyPlayer
	 * @param {number}
	 *          vWidth 宽度，单位像素
	 * @param {number}
	 *          vHeight 高度，单位像素
	 * @extends xplayer.BasePlayer
	 */
	function Html5TinyPlayer(vWidth, vHeight) {
		var h5EvtAdapter = {},
			$me = this;
		this.videoTag = null, // <video>标签对象
		this.$video = null, // 播放器 $对象
		this.config.width = xplayer.$.filterXSS(vWidth),
		this.config.height = xplayer.$.filterXSS(vHeight),
		this.protectedFn = {},
		this.isUseControl = true,

		$.extend(this.h5EvtAdapter, {
			"onEnded": function() {
				if(this.isPlayingLoadingAd()){
					return ;
				}
				this.$video.trigger("xplayer:player:ended");
				this.callCBEvent("onended", curVid);
				var nextVid = "",
					vidArr = this.curVideo.getVidList().split("|"),
					vidIndexOf = $.inArray(curVid, vidArr);
				//修复curVid根本不在vidArr里的情况,modifyed by jarvanxing 2014-06-05
				if (vidIndexOf > - 1 &&　vidIndexOf < (vidArr.length - 1)) {
					nextVid = vidArr[vidIndexOf + 1];
				}
				if (nextVid != "") { //同时传入了多个视频id，那么就一个一个播放
					this.play(nextVid);
					return;
				}
				this.callCBEvent("onallended");
				this.$video.trigger("xplayer:player:allended"); //触发自定义的全部播放完毕事件

				if (this.config.isHtml5ShowPosterOnEnd) {
					this.setPoster();
				}

				var nextVideoInfo = this.callCBEvent("ongetnext", curVid, this.curVideo);
				if ( !! nextVideoInfo && nextVideoInfo instanceof xplayer.VideoInfo) {
					this.play(nextVideoInfo);
				}
			},
			"onError": function(ts, e) {
				//this.showError(0, errContent);
			},
			"onPlaying" : function() {
				this.callCBEvent("onplaying", curVid, this.curVideo);										
			},
			"onTimeupdate" : function(){
				this.callCBEvent("ontimeupdate", curVid, this.$video);
			},
			"onPause" : function(){
				//解决android系统全屏后返回暂停出原生皮肤的问题
				if($.os.android && this.config.isHtml5UseUI){
					this.$video.addClass('xplayer_video_with_skin');
				}				
				this.callCBEvent("onpause", curVid, this.$video);
			}
		});

	};

	Html5TinyPlayer.fn = Html5TinyPlayer.prototype = new xplayer.BaseHtml5();

	$.extend(Html5TinyPlayer.prototype, {
		/**
		 * 注册各种插件
		 */
		registerPlugins: function() {
			var t = this,
				//官方插件，不容亵渎，必须使用！
				authorityPluginsList = [];
			$.each(authorityPluginsList, function(i, v) {
				try {
					var evtName = "build" + v;
					if ($.isFunction(t[evtName])) {
						t[evtName](t);
					}
				} catch (err) {
					xplayer.debug("[registerPlugins]:" + err.message);
				}
			});
		},

		/**
		 * 输出播放器
		 * @override
		 * 
		 * @public
		 */
		write: function(modId) {
			xplayer.BaseHtml5.prototype.write.call(this, modId);
			if(this.config.specialVideoFileDomain && xplayer.h5Helper && $.isFunction(xplayer.h5Helper.setSpecialVideoFileDomain)){
				xplayer.h5Helper.setSpecialVideoFileDomain(this.config.specialVideoFileDomain);
			}
			this.registerPlugins();
			this.callProtectFn("onwrite");
			this.play(this.curVideo, this.config.autoplay);

			var t = this;

			this.$video.one("timeupdate", function() {
				if (isNeedAdrTrick()) {
					adrInvalidPauseCheck(t.videoTag,t);
				}
			});

			if ($.os.android && $.browser.WeChat) {
				this.$video.one("click", function() {
					this.load();
				});
			}
		}
	});


	$.extend(Html5TinyPlayer.prototype, {
		pause: function() {
			this.videoTag.pause();
		},
		/**
		 * 获取当前播放的视频vid，如果有多个视频，则返回第一个视频vid（主vid）
		 * @override
		 * @public
		 */
		getCurVid: function() {
			if (curVid == "") return (this.curVideo instanceof xplayer.VideoInfo) ? this.curVideo.getVid() : "";
			return curVid;
		},

		/**
		 * 播放指定的视频
		 */
		play: function(v, isAutoPlay, isUseHLS) {
			var t = this,
				isVidChange = false;
			if ($.isUndefined(isAutoPlay)) isAutoPlay = true;
			if ($.isUndefined(isUseHLS)) isUseHLS = this.config.isHtml5UseHLS;
			if ($.isUndefined(v)) {
				t.videoTag.pause();
				t.videoTag.load();
				t.videoTag.play();
				return;
			}

			if (v instanceof xplayer.VideoInfo) {
				isVidChange = (v.getVid() != curVid && curVid != "");
				t.setCurVideo(v);
				if (isVidChange) {
					t.callCBEvent("onchange", t.curVideo.getFullVid());
					//触发自定义事件，告知各种插件组件当前播放器要准备播放视频了
					this.$video.trigger("xplayer:player:videochange");
					//iphone有个怪异的问题，换视频，要先暂停再播放，才能从0位置开始播
					if ($.os.iphone) {
						try {
							t.videoTag.pause();
							t.videoTag.play();
						} catch (err) {};
					}
				}
				v.setPid($.createGUID()); //每播放一次换一次
				curVid = t.curVideo.getFullVid();
			}

			if (t.config.isHtml5ShowPosterOnChange) {
				t.setPoster();
			}

			t.isGetingInfo = true; //当前是否正在获取数据
			try {
				t.videoTag.pause();
			} catch (err) {}

			//从一个独立的CGI判断是否要走HLS
			//逻辑步骤:
			//1. 如果外部没设置为auto，走2，否则走3
			//2.1 走内部逻辑，先判断当前设备是否支持HLS
			//2.2 如果支持HLS，则访问CGI判断当前vid是否用HLS
			//2.3 如果不支持HLS，则走MP4
			//3. 如果设置了参数，则遵循外部参数 
			var _isUseHLS = false;
			if (isUseHLS === "auto") {
				if (xplayer.common.isUseHLS()) {
					xplayer.h5Helper.loadIsUseHLS({
						vid: curVid
					}).done(function(dltype) {
						_isUseHLS = (dltype == 3);
					}).fail(function() {
						_isUseHLS = false;
					}).always(function() {
						_play.call(t, _isUseHLS);
					})
				} else {
					_isUseHLS = false;
					_play.call(t, _isUseHLS);
				}
			} else {
				_isUseHLS = isUseHLS;
				_play.call(t, _isUseHLS);
			}

			function _play(isUseHls) {
				isUseHls = !! isUseHls; //强制转换为boolean
				t.$video.trigger("xplayer:video:ajaxstart", v instanceof xplayer.VideoInfo ? v.getVid() : v, isUseHls);
				var fn = isUseHls ? t.curVideo.getHLS : t.curVideo.getMP4Url,
					  loadingAdDefer = $.Deferred(),
					  videoUrl,defer;
				if(!isUseHls && t.curVideo.callGetMp4UrlDefer){
					t.curVideo.callGetMp4UrlDefer.done(function(_defer){
						if(_defer && $.isFunction(_defer.done)){
							defer = _defer;
							t.curVideo.callGetMp4UrlDefer = null;
						}
					});
				}
				if(!defer){
					defer = fn.call(t.curVideo, v);
				}
				if(!t.config.isHtml5UseUI || (!t.config.isHtml5ShowLoadingAdOnStart && !t.config.isHtml5ShowLoadingAdOnChange)){
					loadingAdDefer.resolve();
				}
				else{
					t.$video.one("xplayer:loadingad:ended",function(){
						loadingAdDefer.resolve();
					});
				}
				defer.done(function(videourl){
					videoUrl = videourl;
					t.$video.trigger("xplayer:video:ajaxsuc", videourl);
					//显示限播提示
					if(t.config.isShowDurationLimit){
						xplayer.html5DurationLimit.create(t);
					}
				});
				$.when(defer,loadingAdDefer).done(function(videourl) {
					videourl = videourl || videoUrl;
					if($.os.android && $.browser.wechat){
						videourl+='&nocache=1&time='+new Date().getTime();
					}					
					t.isGetingInfo = false;
					t.videoTag.preload = navigator.platform.indexOf("Win") > -1 ? "none" : "auto";
					if (!($.browser.WeChat) && "setAttribute" in t.videoTag) {
						t.videoTag.setAttribute("src", videourl);
					} else {
						t.videoTag.src = videourl;
					}
					t.$video.trigger("xplayer:video:src"); //触发自定义事件，video的src设置

					if (!_isInited) {
						_isInited = true;
						t.callCBEvent("oninited");
					}	

					//触发onplay事件
					t.callCBEvent("onplay", t.curVideo.lastQueryVid, t.curVideo);
					if (isAutoPlay) {
						t.videoTag.load();
						t.videoTag.play();
					}

					//播放看点视频
					var offset = t.curVideo.getTagStart() || t.curVideo.getHistoryStart() || 0;
					if (offset > 0) {
						t.seek(offset);
					}

				}).fail(function(errcode, errcontent) {
					//如果使用了hls，且hls失败，则再次拉取MP4文件
					if (isUseHls) {
						xplayer.debug("get hls url fail,reload mp4...");
						_play(false);
						return;
					}
					if (!_isInited) {
						_isInited = true;
						t.callCBEvent("oninited");
					}
					t.$video.trigger("xplayer:video:ajaxerror");
					t.$video.trigger("xplayer:video:error", errcode, errcontent);
					t.showError(errcode, errcontent);
					t.isGetingInfo = false;
				}).always(function() {
					curVid = t.curVideo.lastQueryVid;
				});
			}

		},
		seek: function(time) {
			// 时间，必须确保这是数值类型，公共方法啊，不验证伤不起啊
			if (isNaN(time)) return;

			time = Math.min(time, this.getDuration() - 5), time = Math.max(time, 0);
			var t = this,
				seekTimer = null;
			if (seekTimer) {
				clearTimeout(seekTimer);
				seekTimer = null;
			}

			var seeks = this.videoTag.seekable;
			if (seeks.length == 1 && time < seeks.end(0)) {
				this.seekTo(time);
			} else {
				seekTimer = setTimeout(function() {
					t.seek(time);
				}, 100);
			}
		},
		seekTo: function(time) {
			var t = this;
			try {
				this.videoTag.currentTime = time;
				this.videoTag.paused && (this.videoTag.play());
			} catch (e) {
				this.$video.one("canplay", function() {
					t.videoTag.currentTime = time;
					t.videoTag.paused && (t.videoTag.play());
				});
			}
		},
		/**
		 * 获取当前播放的时间
		 * @return {[type]} [description]
		 */
		getCurTime: function() {
			return this.videoTag.currentTime;
		},
		/**
		 * @see getCurTime
		 * @return {[type]} [description]
		 */
		getPlaytime: function() {
			return this.getCurTime();
		},
		/**
		 * 设置播放时间
		 * @param {[type]} time [description]
		 */
		setPlaytime: function(time) {
			this.seek(time);
		},
		/**
		 * 循环检查是否开始播放了
		 * @param  {[type]} times [description]
		 * @return {[type]}       [description]
		 */
		checkIsPlayingLoop: function(times) {
			times = times || 0;
			var t = this;
			if ( !! this.playinglooptimer) clearTimeout(this.playinglooptimer);
			if (this.videoTag.currentTime === 0 && times <= 30) {
				this.videoTag.load();
				this.videoTag.play();
				this.playinglooptimer = setTimeout(function() {
					t.checkIsPlayingLoop(++times);
				}, 1000);
			}
		},
		/**
		 * 将video的poster属性设置到播放器的poster属性
		 */
		setPoster: function() {
			var poster = this.curVideo.getPoster();
			//不带皮肤时如果设置了pic参数 则暂时通过poster属性来显示封面
			if(!poster && this.config.pic && !this.config.isHtml5UseUI){
				poster = this.config.pic;
			}			
			if ($.isString(poster) && poster.length > 0) {
				this.videoTag.poster = poster
			} else {
				this.hidePoster();
			}
		},
		hidePoster: function() {
			this.videoTag.removeAttribute("poster");
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
			return this.videoTag.duration;
		},
		/**
		 * 获取文件大小
		 * @return {Number} 返回文件大小
		 */		
		getFileSize:function(){
			var size = this.curVideo.getFileSize();
			if (!isNaN(size) && size > 0) {
				return size
			}
			return 0;			
		},
		// 确保不会中途卡死，导致无法操作
		checkPause: function() {
			var _timelist = [],
				t = this;
			pauseCheckTimer = setInterval(function(e) {
				if (t.videoTag.paused) {
					return;
				}
				_timelist.push(t.videoTag.currentTime);

				if (_timelist.length >= 2) {
					//xplayer.log(Math.abs(_timelist[0] - _timelist[2]));
					if (Math.abs(_timelist[0] - _timelist[1]) == 0) {
						if ( !! pauseCheckTimer)
							clearInterval(pauseCheckTimer);
						_timelist = [];
						t.videoTag.load();
						t.videoTag.play();
					} else {
						if ( !! pauseCheckTimer)
							clearInterval(pauseCheckTimer);
					}
					_timelist = [];
				}
			}, 500);
		},
		/**
		 * 是否正在播放loading广告
		 */
		isPlayingLoadingAd : function(){
			return this.$video.data("data-playing-loadingad") == 1;
		}
	});


	// extend Html5TinyPlayer to xplayer namespace
	xplayer.Html5Tiny = Html5TinyPlayer;



})(xplayer, xplayer.$);

/**
 * @fileOverview 腾讯视频统一播放器 HTML5播放器
 *
 */

/*
 * @include "../xplayer.define.js"
 * @include "../../extend/zepto.js"
 * @include "../xplayer.common.js"
 * @include "../xplayer.baseplayer.js"
 * @include "./xplayer.html5tiny.js"
 */

;
(function(xplayer, $) {

	if(xplayer.Html5Player){
		return;
	}

	/**
	 * 腾讯视频统一播放器 带有控制栏的HTML5播放器
	 */

	function Html5Player(vWidth, vHeight) {
		this.isUseControl = false;
		this.config.width = xplayer.$.filterXSS(vWidth);
		this.config.height = xplayer.$.filterXSS(vHeight);
		this.control = null;
		this.$UILayer = null;

		var $self = this;
		$.extend(this.protectedFn, {
			onwrite: function() { //注意这个会覆盖tinyplayer的onwrite接口哦	
				var cssname = xplayer.html5skin.noSVGClassName;
				if ($.isString(cssname) && cssname.length > 0 && !xplayer.common.isSupportSVG()) {
					this.videomod.classList.add(cssname);
				}

				//开始创建各种UI皮肤和皮肤里的各种零件
				this.control = new xplayer.Html5UI($self);
				this.control.init();
				this.$UILayer = this.control.$UILayer;
			}
		});

		$.extend(this.h5EvtAdapter, {
			"onCanPlayThrough": function() {
				var prefix = $self.getCurVideo().getPrefix();
				if (prefix > 0) {
					this.seek(prefix);
					$self.showTips("播放器已经为您自动跳过片头");
				}
			}
		});
	};
	Html5Player.fn = Html5Player.prototype = new xplayer.Html5Tiny();

	$.extend(Html5Player.prototype, {
		createVideoHtml: function() {
			var videoTagHtml = xplayer.Html5Tiny.prototype.createVideoHtml.call(this), // 调用父类的方法
				html = xplayer.html5skin.getHtml(this.config);
			return html.replace("$VIDEO$", videoTagHtml);
		},
		hideControl: function() {
			this.control.hide();
		},
		showControl: function() {
			this.control.show();
		}
	});

	// extends Html5Player to xplayer namespace
	xplayer.Html5Player = Html5Player;

})(xplayer, xplayer.$);