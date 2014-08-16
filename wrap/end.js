;

/**
 * 当前JS文件名
 * @type {String}
 */
xplayer.filename = "${FILENAME}"; //在grunt里wrap的时候修改，用于统计每个JS版本的引用次数


//seajs & requirejs 
if (typeof define === 'function') {
	define("xplayer", [], function() {
		return xplayer;
	});
};



global.xplayer = xplayer;

})(this);