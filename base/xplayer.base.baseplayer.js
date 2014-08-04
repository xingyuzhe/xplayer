/**
 * @fileOverview 腾讯视频云播放器 播放器基类
 */

/*
 * @include "./tvp.define.js"
 * @include "./tvp.jquery.js"
 * @include "./tvp.common.js"
 */

;
(function(tvp, $) {
	/**
	 * 播放器基类
	 *
	 * @class tvp.BasePlayer
	 * @param {number}
	 *          vWidth 宽度
	 * @param {number}
	 *          vHeight 高度
	 */
	tvp.BasePlayer = function() {
		var fnMap = {};//回调存储对象
		this.modId = "",
		this.sessionId = $.createGUID(), //当前回话id，每次创建播放器都有自己的sessionid，主要用于一些统计上报，区分每次输出播放器的多次上报
		this.$mod = null, //显示整个统一播放器输出内容的容器，$查询结果
		this.videomod = null, //仅播放器的容器
		this.playerid = "", // 当前实例
		this.curVideo = null, // 视频对象
		//this.curVid = "", //当前播放的视频vid
		this.instance = null, //当前创建的实例
		this.dataset = {}, //数据集,用于当前播放器内部的一些全局变量存储，
		/**
		 * 对外提供的播放事件
		 */
		this.eventList = [
			"inited",
			"play",
			"playing",
			"ended",
			"allended",
			"pause",
			"timeupdate",
			"getnext",
			"error",
			"stop",
			"fullscreen",
			"change",
			"write",
			"flashpopup",
			"getnextenable",
			"msg"
		];
		/**
		 * addParam可以接受的参数
		 */
		this.config = {};
		/**
		 * 劫持tvp.Player对象的公共方法列表，外壳播放器调用这些方法实际上调用的实际new出来的播放器实例
		 */
		this.hijackFun = [
			"getPlayer",
			"getCurVideo",
			"showPlayer",
			"hidePlayer",
			"play",
			"pause",
			"getPlaytime",
			"setPlaytime",
			"getPlayerType",
			"resize"
		];

		this.prototype = {};

		(function(me) { // 对外提供的公开方法
			var arr = ["init", "addParam", "write", "setPlayerReady"];
			arr = arr.concat(me.hijackFun);
			for (var i = 0, len = arr.length; i < len; i++) {
				me.prototype[arr[i]] = tvp.$.noop; // 设置为空函数
			}
		})(this);
		/**
		 * 向播放器传递config配置参数
		 *
		 * @public
		 */
		this.addParam = function(k, v) {
			this.config[k] = v;
		}
		
		/**
		 * 挂载自定义事件回调到统一播放器实例上
		 * @param {String} name
		 * @param {Function} fn
		 */
		this.on = function(name,fn){
			if(name && $.isFunction(fn)){
				fnMap[name] = $.isArray(fnMap[name]) ? fnMap[name] : [];
				fnMap[name].push(fn);
			}
		}
		
		/**
		 * 触发自定义事件回调
		 * @param {String} name
		 */
		this.trigger = function(name){
			var args,idx,len;
			if(name && $.isArray(fnMap[name])){
				for(idx = 0,len = fnMap[name].length;idx < len;idx++){
					if($.isFunction(fnMap[name][idx])){
						args = Array.prototype.slice.call(arguments,1);
						fnMap[name][idx].apply(null,args);
					}
				}
			}
		},
		
		/**
		 * 删除自定义事件回调
		 * @param {String} name
		 * @param {Function} fn
		 */
		this.off = function(name,fn){
			var idx;
			if(name && $.isArray(fnMap[name])){
				if(fn){
					idx = $.inArray(fn,fnMap[name]);
					if(idx >= 0){
						fnMap[name][idx] = undefined;
					}
				}
				else{
					fnMap[name] = undefined;
				}
			}
		}
	}

	tvp.BasePlayer.prototype = {
		/**
		 * 设置当前播放视频对象
		 */
		setCurVideo: function(videoinfo) {
			// if (this.curVideo === null) {
			// 	this.curVideo = new tvp.VideoInfo();
			// }
			// if (videoinfo instanceof tvp.VideoInfo) {
			// 	videoinfo.clone(this.curVideo);
			// }
			this.curVideo = videoinfo;
		},
		getPlayer: function() {
			return null;
		},
		/**
		 * 获取当前传入的视频对象
		 *
		 * @ignore
		 */
		getCurVideo: function() {
			return this.curVideo;
		},

		/**
		 * 获取当前播放的视频vid，如果有多个视频，则返回第一个视频vid（主vid）
		 *
		 * @public
		 */
		getCurVid: function() {
			return (this.curVideo instanceof tvp.VideoInfo) ? this.curVideo.getVid() : "";
		},
		/**
		 * 获取当前播放的视频列表
		 *
		 * @public
		 */
		getCurVidList: function() {
			return (this.curVideo instanceof tvp.VideoInfo) ? this.curVideo.getVidList() : "";
		},

		/**
		 * 初始化
		 * @param  {[Object]} config 配置项
		 */
		init: function(config) {

			$.extend(this.config, config);

			// this.config.modWidth = this.config.modWidth || this.config.width;
			// this.config.modHeight = this.config.modHeight || this.config.height;

			for (var i = 0, len = this.eventList.length; i < len; i++) {
				var evtName = "on" + this.eventList[i];
				this[evtName] = $.isFunction(this.config[evtName]) ? this.config[evtName] : tvp.$.noop;
			}

			this.setCurVideo(this.config.video);
			this.write(this.config.modId);
		},
		/**
		 * 输出播放器
		 * @param  {[string]} id DOM结构id
		 */
		write: function(id) {
			$("#" + id).html("here is player of base");
		},
		/**
		 * 日志接口
		 * @param  {string} msg 日志正文
		 */
		log: function(msg) {
			if (window.console) {
				window.console.log(msg);
			}
		},

		/**
		 * 获得事件回调函数
		 * @param  {[type]} eventName [description]
		 * @return {[type]}           [description]
		 */
		getCBEvent: function(eventName) {
			var fn = undefined;
			//看看外壳对象是否有定义自定义的事件回调
			//这一般是创建完播放器以后player.onwrite=function(){}传入
			if (this.instance && $.isFunction(this.instance[eventName]) && this.instance[eventName] != tvp.$.noop) {
				fn = this.instance[eventName];
			}
			//如果当前对象定义了自定义的对应事件回调，并且不是默认的空函数，则优先执行
			//一般是由player.create({onwrite:function(){code here}})初始化时传入
			else if ($.isFunction(this[eventName]) && this[eventName] != tvp.$.noop) {
				fn = this[eventName];
			}
			return fn;
		},
		/**
		 * 调用事件回调
		 * @param  {[type]} eventName [description]
		 * @return {[type]}          [description]
		 */
		callCBEvent: function(eventName) {
			var fn = this.getCBEvent(eventName);
			if ($.isFunction(fn)) {
				var args = Array.prototype.slice.call(arguments, 1);
				return fn.apply(this, args);
			}
			return undefined;
		},
		/**
		 * 重新设置播放器尺寸
		 * @param  {[type]} width  [description]
		 * @param  {[type]} height [description]
		 * @return {[type]}        [description]
		 */
		resize: function(width, height) {
			var playerobj = this.getPlayer();
			if (!playerobj) return;
			playerobj.style.width = $.formatSize(width);
			playerobj.style.height = $.formatSize(height);
		},
		/**
		 * 显示播放器
		 */
		showPlayer: function() {
			var p = this.getPlayer();
			if (!p) return;
			p.style.position = "relative";
			p.style.left = "0px";
			p.style.top = "0px";
			//for qq浏览器
			if($.browser.MQQ){
				p.style.height = parseInt(this.config.height)+'px';
			}
		},
		/**
		 * 隐藏播放器
		 * @return {[type]} [description]
		 */
		hidePlayer: function() {
			var p = this.getPlayer();
			if (!p) return;
			p.style.position = "absolute"
			p.style.left = "-200%";
			//for qq浏览器
			if($.browser.MQQ){
				p.style.height = '1px';
			}			
		},
		
		/**
		 * 执行flash播放器提供的方法
		 * @param {String} 要执行的方法名
		 * @return {Mix}
		 */
		execFlashMethod : function(fnName){
			var playerobj = this.getPlayer(),
				argArr = [],ret;
			if (!playerobj || !playerobj[fnName]){
				return;
			}
			argArr = [].slice.call(arguments,1);
			try{
				ret = playerobj[fnName].apply(playerobj,argArr);
				return ret;
			}catch(e){
				
			}
		}
	}

})(tvp, tvp.$);