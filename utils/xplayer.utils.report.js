xplayer.report = (function() {
	var isFree = true;
	var reportObj = null;
	var urlList = [], timer;

	/**
	 * 上报后由于返回的不是图片会引起image的error事件，添加事件回调方法上报url队列中剩下的url
	 */
	function errorHandle() {
		if (urlList.length == 0) {
			isFree = true;
			reportObj = null;
			return;
		}
		clearTimeout(timer);
		create(urlList.splice(0, 1));
		isFree = false;
	}

	function create(url) {
		clearTimeout(timer);
		reportObj = document.createElement("img");
		reportObj.onerror = errorHandle;
		reportObj.src = url;
		setTimeout(errorHandle, 1000);
	}

	function reportUrl(url) {
		if (!url || !/^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i.test(url)) { // 过滤非法参数
			return;
		}
		if (reportObj == null) { // 第一次调用上报方法时先做初始化工作才上报
			create(url);
			isFree = false;
			return;
		}
		else if (isFree) { // 如果当前image对象空闲，则直接上报
			create(url);
			isFree = false;
			return;
		}
		else { // 否则进入队列
			urlList.push(url);
		}
	}
	return function(param) {
		if (xplayer.$.isString(param)) {
			reportUrl(param);
			return;
		}

		if (xplayer.$.type(param) == "object") {
			var paramMap = {
				deviceId : "int1",
				platformId : "int2",
				appId : "int3",
				speed : "int4",
				contentId : "str1",
				fileName : "str2"
			},
				defaultParam = {
					cmd : -1, // cmd
					url : window != top ? document.referrer : document.location.href, // 当前页面url
					ver : xplayer.ver.replace(/\$/g, ""), // 当前版本号
					ua : navigator.userAgent, // userAgent
					int1 : xplayer.common.getDeviceId(), // 设备id
					int2 : xplayer.common.getPlatformId(), // 平台id
					int3 : 0, // APP id
					int4 : 0, // 预留给测速时间
					str1 : "", // 预留给内容id
					str2 : xplayer.filename
					// 当前文件名
				}, key,
				url = "http://rcgi.video.qq.com/web_report?";
			// 查询字段映射关系
			for (key in paramMap) {
				if (key in param) {
					param[paramMap[key]] = param[key];
					delete param[key];
				}
			}
			param = xplayer.$.extend(defaultParam, param);
			// for (key in param) {
			// r.push(key + "=" + encodeURIComponent("" + param[key]));
			// }
			url += xplayer.$.param(param);
			reportUrl(url);
		}
	}
})();