/**
 * @fileoverview 腾讯视频统一播放器H5内核 语言包
 */


;
(function(tvp, $) {
	/**
	 * 腾讯视频统一播放器H5内核语言包
	 * @type {Object}
	 */
	tvp.html5lang = {
		/**
		 * 错误码定义
		 * @type {Object}
		 * wiki:http://tapd.oa.com/tvideo/prong/stories/view/1010031991056002352 --pantherruan
		 */
		errMsg: {
			"default": "抱歉,暂不支持播放",
			"0": "当前视频文件无法播放", //触发video.onerror事件
			"68":'CGI系统错误,请刷新页面重试', //cgi返回数据不合法
			//以下都是ajax读取CGI从服务器返回的错误
			"-1":'cgi参数错误/cgi向服务器发包错误,请刷新页面重试',
			"-2":'cgi从服务器接包错误,请刷新页面重试',
			"-3":'cgi从服务器解包错误,请刷新页面重试',
			"-4":'cgi连接服务器网络错误,请刷新页面重试',
			"-6":'cgi连接服务超时,请刷新页面重试',
			"-7":'cgi访问服务未知错误,请刷新页面重试',
			"50":'CGI系统错误,请刷新页面重试',
			"52":'访问视频付费信息失败，请刷新页面重试',
			"64":'校验视频付费信息失败，请刷新页面重试',

			"51":'vid个数超出范围',
			"61":'vid不合法',
			"62":'视频状态不合法',
			"63":'清晰度格式不合法',
			"65":'速度格式不合法',
			"67":'视频格式不存在',
			"69":'format列表为空',
			"71":'未找到HLS CDN',
			"73":'生成文件名失败',
			"74":'分片号不合法',
			"76":'获取m3u8文件名失败',
			"77":'生成HLS key失败',
			"80": {
				"0":'因版权限制,请到腾讯视频观看',
				"1":"根据您当前的IP地址，该地区暂不提供播放",
				"2":'因版权限制，暂不支持播放',
				callback:function($content,errcode,data){
					if(parseInt(errcode)== 0 && tvp.app && data && data.vid){
						var tpl = tvp.html5skin.errorDownloader;
						tvp.app.check(data).done(function(rs){
							if(rs.url){
								var $box = $content.find('.tvp_player_error_content');
								var content = $content.find('.text').html();
								content = content.substr(0,content.indexOf('('));
								if(tpl){
									content = tpl.replace('${errorMsg}',content);
									content = content.replace('${url}',rs.url);
								}else{
									content = '<a href="'+rs.url+'">'+content+'</a>';
								}
								$box.length && $box.html(content);
							}
						});
					}
				}
			},
			"81":'referer限制',
			"82":'qzone权限限制',
			//根据cgi返回结果判断
			"83": {
				"main": "视频付费限制",
				"-2": "您可能未登录或登录超时",
				"-1": "视频状态非法"
			},
			"84":'访问IP是黑名单',
			"85":{
				"main":'CGI访问key不正确',
				'-1':'key长度失败',
				'-2':'magicnum校验失败',
				'-3':'时间校验失败',
				'-4':'platform校验失败',
				'-5':'clientVer校验失败',
				'-6':'encryptVer校验失败'
			},
			"86":'CGI访问频率限制',
			//访问cgi进入fail
			"500": {
				"main": "获取服务器数据失败",
				"1": "getinfo failed",
				"2": "getkey failed"
			}
		},
		/**
		 * 根据指定的错误码，返回错误描述
		 * @param  {Number} errCode 指定的错误码
		 * @return {String}         错误描述
		 */
		getErrMsg: function(errCode, errContent) {
			if (isNaN(errCode)) return "";
			if (errCode in tvp.html5lang.errMsg) {
				var val = tvp.html5lang.errMsg[errCode];
				if ($.isString(val)) return val;
				if ($.isPlainObject(val)) {
					var res = [val["main"], val["main"]?",":"", errContent in val ? (val[errContent]) : ""].join("");
					return res || tvp.html5lang.errMsg["default"];
				}
			}
			return tvp.html5lang.errMsg["default"];
		},
		/**
		 * 清晰度文案定义
		 * @type {Object}
		 */
		definition: {
			"mp4": "高清",
			"msd": "流畅"
		},

		/**
		 * 字幕描述
		 * @type {Object}
		 */
		srtLang: {
			"50001": {
				"srclang": "zh-cn",
				"desc": "简体中文"
			},
			"50002": {
				"srclang": "zh-cn",
				"desc": "简体中文"
			},
			"50003": {
				"srclang": "zh-tw",
				"desc": "繁体中文"
			},
			"50004": {
				"srclang": "en",
				"desc": "英文"
			},
			"50005": {
				"srclang": "zh-cn,en",
				"desc": "简体中文&英文"
			},
			"50006": {
				"srclang": "zh-tw,en",
				"desc": "繁体中文&英文"
			}
		},
		/**
		 * 限播
		 */
		durationLimit:{
			msg:'本页面只提供5分钟试看，请安装客户端观看完整影片',
			download:'下载app',
			play:'试看',
			replay:'重新试看',
			open:'去观看完整版'
		},
		/**
		 * 直播下载按钮
		 */
		liveDownloader:{
			downloadText:'下载腾讯视频，观看视频直播',
			openText:'打开腾讯视频，观看视频直播'
		},
		/**
		 * 获取清晰度的名称
		 * @param  {String} key format英文名，对应getinfo的fmt参数
		 * @return {type}    清晰度名称
		 */
		getDefiName: function(key) {
			return key in tvp.html5lang.definition ? tvp.html5lang.definition[key] : "";
		},
		/**
		 * 根据字幕id描述获取字幕描述
		 * @param  {[type]} id [description]
		 * @return {[type]}    [description]
		 */
		getSrtName: function(id) {
			return (id in tvp.html5lang.srtLang) ? tvp.html5lang.srtLang[id].desc : "";
		}
	}

})(tvp, tvp.$);