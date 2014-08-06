/**
 * @fileOverview 腾讯视频云播放器 tvp根节点定义
 */

/**
 * @namespace tvp
 * @type {object}
 */
var tvp = {};

/**
 * 最后一次更改时间，grunt自动维护，不需要手动修改
 * @type String
 */
tvp.lastModify = "2014-08-06 09:45:27";


/**
 * 最后build的版本号，不需要手动修改，每次使用grunt合并或者编译，都会自动+1
 * @type String
 */
tvp.ver = "$V2.0Build1403$";
/**
 * 框架名称
 * @type {String}
 */
tvp.name = "腾讯视频统一播放器";

//借助uglify可以实现条件编译，比如if(DEBUG){console.log("test")}
//如果uglify设置DEBUG为false，那么整个语句都不会出现在最终relase的代码文件中
typeof DEBUG == "undefined" && (DEBUG = 1);
if (typeof FILEPATH == "undefined") {
	if (DEBUG) {
		if (document.location.hostname == "popotang.qq.com" || document.location.hostname == "qqlive.oa.com") {
			FILEPATH = "../js/";
		} else {
			FILEPATH = "http://imgcache.gtimg.cn/tencentvideo_v1/tvp/js/";
		}
	}
}

tvp.log = function(msg) {
	if (DEBUG && document.getElementById('tvp_debug_console') != null) {
		var debugN = document.getElementById('tvp_debug_console');
		debugN.innerHTML += msg + " | ";
	} else if (window.console) {
		window.console.log("[" + (tvp.log.debugid++) + "] " + msg);
	}
}
/**
 * 打印调试日志
 *
 * @param {}
 *          msg
 */
tvp.debug = function(msg) {
	if (!DEBUG && tvp.log.isDebug === -1) {
		tvp.log.isDebug = tvp.$.getUrlParam("debug") == "true" ? 1 : 0;
	}
	if (DEBUG || !! tvp.log.isDebug) {
		tvp.log(msg);
	}
}
/**
 * @ignore
 * @type
 * @example
 * -1表示根据URL参数，1表示调试，0表示非调试，建议-1
 */
tvp.log.isDebug = -1;
/**
 * @ignore
 * @type Number
 */
tvp.log.debugid = 1;

//设备上报参数
tvp.DEVICE = {
	aphone: 1,
	iphone: 2,
	ipad: 3,
	other: 0
};
//平台上报参数
tvp.PLATFORM = {
	wechat: 1,
	mqq: 2,
	qqbrowser: 3,
	other: 0
};

//appid 配置
tvp.APPID = {
	wechatPublic:10000,
	news:10001,
	qqmusic:10007
};

/**
 * 统一播放器，自定义事件定义
 * @type Object 
 */
tvp.ACTION = {
	/**
	 * 在create方法中确认了要使用h5点播播放器时触发
	 * @type String
	 */
	onVodH5Init : "tvp:vodhtml5:beforeInit",
	/**
	 * 当flash播放器完成初始化时触发
	 * @type String
	 */
	onFlashPlayerInited : "tvp:flash:inited"
};