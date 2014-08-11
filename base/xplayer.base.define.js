/**
 * @fileOverview 腾讯视频云播放器 xplayer根节点定义
 */

/**
 * @namespace xplayer
 * @type {object}
 */
var xplayer = {};

/**
 * 最后一次更改时间，grunt自动维护，不需要手动修改
 * @type String
 */
xplayer.lastModify = "2014-08-06 09:45:27";


/**
 * 最后build的版本号，不需要手动修改，每次使用grunt合并或者编译，都会自动+1
 * @type String
 */
xplayer.ver = "$V1.0Build1$";
/**
 * 框架名称
 * @type {String}
 */
xplayer.name = "xplayer播放器";

//借助uglify可以实现条件编译，比如if(DEBUG){console.log("test")}
//如果uglify设置DEBUG为false，那么整个语句都不会出现在最终relase的代码文件中
typeof DEBUG == "undefined" && (DEBUG = 1);
if (typeof FILEPATH == "undefined") {
	FILEPATH = "http://xingyuzhe.github.io/xplayer/js/";
}

xplayer.log = function(msg) {
	if (DEBUG && document.getElementById('xplayer_debug_console') != null) {
		var debugN = document.getElementById('xplayer_debug_console');
		debugN.innerHTML += msg + " | ";
	} else if (window.console) {
		window.console.log("[" + (xplayer.log.debugid++) + "] " + msg);
	}
}
/**
 * 打印调试日志
 *
 * @param {}
 *          msg
 */
xplayer.debug = function(msg) {
	if (!DEBUG && xplayer.log.isDebug === -1) {
		xplayer.log.isDebug = xplayer.$.getUrlParam("debug") == "true" ? 1 : 0;
	}
	if (DEBUG || !!xplayer.log.isDebug) {
		xplayer.log(msg);
	}
}
/**
 * @ignore
 * @type
 * @example
 * -1表示根据URL参数，1表示调试，0表示非调试，建议-1
 */
xplayer.log.isDebug = -1;
/**
 * @ignore
 * @type Number
 */
xplayer.log.debugid = 1;

//设备上报参数
xplayer.DEVICE = {
	aphone: 1,
	iphone: 2,
	ipad: 3,
	other: 0
};
//平台上报参数
xplayer.PLATFORM = {
	wechat: 1,
	mqq: 2,
	qqbrowser: 3,
	other: 0
};

xplayer.PLAYERNAMES = ["FlashPlayer", "FlashLivePlayer", "MP4Link", "Html5Player", "Html5LivePlayer"];