/**
 * @fileOverview xplayer播放器 入口文件
 *
 */

;
(function(xplayer, $) {

	/**
	 * 加载内核,防止重复加载
	 * @return {defer}
	 */
	function loadModule(playerClass) {
		var deferName = playerClass + 'Defer';
		if (xplayer[deferName]) {
			return xplayer[deferName];
		}
		var defer = $.Deferred();
		xplayer[deferName] = defer;
		var jsurl = FILEPATH;
		var jsfile = playerClass.toLowerCase();
		var url = jsurl + "module/" + jsfile + ".js?max_age=$MAXAGE$&v=$DATE$";

		if (typeof xplayer[playerClass] === "function") {
			defer.resolve();
		} else {
			$.getScript(url, function() {
				if (typeof xplayer[playerClass] !== "function") { //加载失败
					defer.reject();
				} else {
					defer.resolve();
				}
			});
		}
		return defer;
	}

	/**
	 * 检测是否已经加载了css,如果还没有加载,就需要自己异步加载了
	 * @return {boolean}
	 */
	function checkIsNeedLoadCss(playerClass) {
		if (!playerClass.match(/html5|mp4/i)) {
			return false;
		}
		var $links = $('link'),
			hasCss = false;
		$links.each(function(i, obj) {
			if (obj.href.match(/player\.css/)) {
				hasCss = true;
			}
		});

		return !hasCss;
	}


	/**
	 * 通过配置和外壳创建内核播放器
	 * @param  {[type]} config [description]
	 * @param {tvp.Player} player 统一播放器对象
	 * @return {[type]}        [description]
	 */
	function getPlayerClass(config) {
		var defer = $.Deferred();

		$.when(xplayer.utils.selectPlayer()).then(function(playerClass) {
			if (!playerClass) {
				xplayer.error.fix(3);
				return;
			}

			if ($.inArray(playerClass, xplayer.PLAYERNAMES) < 0) {
				xplayer.error.fix(2);
				return;
			}
			if (typeof xplayer[playerClass] !== "function") {
				loadModule(playerClass).done(function() {
					defer.resolve(playerClass);
				})
					.fail(function() {
						xplayer.error.fix(4);
					});
			} else {
				defer.resolve(playerClass);
			}
		});

		return defer;
	};

	/**
	 * 过滤非法参数
	 * @return {[type]} [description]
	 */
	// function filterConfig(config, playerClass) {
	// 	var t = tvp[playerClass],
	// 		res = {};
	// 	for (var p in config) {
	// 		if (p == "instance") continue; //instance是很重要的对象，不能透传
	// 		if (p.substr(0, 2) == "on" && $.isFunction(t[p]) && t[p] != tvp.$.noop) continue;
	// 		res[p] = config[p];
	// 	}
	// 	return res;
	// }


	/**
	 * 运行插件
	 * @return {[type]} [description]
	 */
	function runPlugins(t) {
		function invoke(k, cfg) {
			try {
				var evtName = "build" + k;
				if ($.isFunction(t[evtName])) {
					t[evtName].call(t, cfg);
					return true;
				} else {
					return false;
				}
			} catch (err) {}
		}

		$.each(t.config.plugins, function(k, v) {
			if (!!v && k in t.config.pluginUrl) {
				var _cfg = $.isPlainObject(v) ? v : {};
				if (!invoke(k, _cfg)) {
					var url = t.config.libpath + t.config.pluginUrl[k];
					if ($.isString(url) && $.trim(url) != "") {
						$.getScript(url, function() {
							invoke(k, _cfg);
						})
					}
				}
			}
		});
	}

	/**
	 * 创建播放器内核实例
	 */
	function createRealPlayer(config, player) {
		var defer = $.Deferred(),
			playerClass;

		if (!config.video instanceof xplayer.VideoInfo) {
			xplayer.error.fix(1);
			return;
		}
		config.video.setCurPlayer(player);

		function _invoke() {
			var isinvoke = false,
				timer = null;

			function __invoke() {
				if (!!isinvoke) return;
				isinvoke = true;

				var t = new xplayer[playerClass]();
				t.init(config);
				defer.resolve(t, playerClass);
			}
			if (checkIsNeedLoadCss(playerClass)) {
				timer = setTimeout(function() {
					xplayer.error.fix(5);
				}, 3000);
				$.loadCss(cfg.cssPath + cfg.Html5CssName).done(function() {
					clearTimeout(timer);
					__invoke();
				});
			} else {
				__invoke();
			}
		}

		getPlayerClass(config).done(function(playerClass) {
			_invoke.call(player);
		});

		return defer;
	};


	/**
	 * 腾讯视频统一播放器对象
	 *
	 * @class xplayer.Player
	 * @param {number} vWidth 播放器宽度 单位像k素
	 * @param {number} vHeight 播放器高度 单位像素
	 *
	 */
	xplayer.Player = function() {
		this.sessionId = $.createGUID();
		xplayer.log("before create player");
		this.instance = null, this.config = {};
		$.extend(this.config, xplayer.defaultConfig);
	};

	xplayer.Player.fn = xplayer.Player.prototype = new xplayer.BasePlayer();

	$.extend(Player.fn, {
		/**
		 * 创建播放器
		 * @param  {Object} config 配置文件
		 */
		create: function(config) {
			var t = this;
			$.extend(t.config, config);
			xplayer.log("begin create player");
			createRealPlayer(t.config, t).done(function(f, playerClass) { //这个done用来放一些播放器创建的逻辑
				xplayer.log("after create player");
				//instance指向真实的new出来的播放器内核对象
				t.instance = f;
				//instance的instance又是外部的new出来的xplayer.Player对象，也就是说你可以不断的.instance反复得到内核和外壳
				t.instance.instance = t;
				for (var p in t.instance) {
					if (p == "instance") continue; //instance是很重要的对象，不能透传
					if (p.substr(0, 2) == "on" && $.isFunction(t[p]) && t[p] != xplayer.$.noop) continue;
					t[p] = t.instance[p];
				}
				//init完毕会自动调用write，所以这里针对各种播放器统一执行onwrite事件
				//如果提到各个播放器的write函数里分别执行onwrite，可能会导致因为没有执行到上面几行代码
				//引起最外层new出来的player对象没有内部播放器的接口
				f.callCBEvent("onwrite");
				xplayer.Player.instance[t.playerid] = t;
			}).always(function() { //这里专门放置一些执行插件运行的,使用always，不管是否正常显示播放器都执行插件
				runPlugins(t);
			});
		}

	});


	/**
	 * 供外部调用的初始入口方法
	 */
	xplayer.setup = function(id, config) {
		config = config || {};
		if (!id) {
			xplayer.error.fix(0);
			return;
		}
		config.id = id;
		var videoInfo = new VideoInfo();
		if (config.vid) {
			videoInfo.setVid(config.vid);
		} else if (config.file) {
			videoInfo.setFile(config.file);
		} else {
			xplayer.error.fix(6);
			return;
		}

		config.video = videoInfo;

		var player = new xplayer.Player();
		player.create(config);
		return player;
	};

})(xplayer, xplayer.$);

xplayer.Player.instance = {};