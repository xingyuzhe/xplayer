;

/**
 * 当前JS文件名
 * @type {String}
 */
xplayer.filename = "${FILENAME}"; //呵呵，这个为啥是通配符？在grunt里wrap的时候修改的，因为打包的多个JS版本每个JS的值都不一样，用于统计每个JS版本的引用次数


//seajs & requirejs 
if (typeof define === 'function') {
	define("xplayer", [], function() {
		return xplayer;
	});
};



global.xplayer = xplayer;

})(this);