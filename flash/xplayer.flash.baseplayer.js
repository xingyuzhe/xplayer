;
(function(xplayer, $) {

	/**
	 * Flash播放器基类
	 *
	 * @class xplayer.BaseFlash
	 * @extends xplayer.BasePlayer
	 */
	xplayer.flash.BasePlayer = function() {
		var $me = this;

		this.swfPathRoot = "";

		/**
		 * flash对象
		 * @type {Object}
		 */
		this.flashobj = null;

		this.flashVarsKeyMapToCfg = {};
	}

	if (typeof xplayer.BaseFlash.maxId != "number") {
		xplayer.BaseFlash.maxId = 0;
	}
	xplayer.flash.BasePlayer.prototype = new xplayer.BasePlayer();

	$.extend(xplayer.flash.BasePlayer.prototype, {
		getFlashVar: function() {
			return "";
		},
		/**
		 * 从全局配置项中获取对应的参数值
		 * @param  {Object} config 指定配置项
		 * @return {Object} 获得的参数k-v键值对对象
		 */
		getFlashVarVal: function() {
			var val = {}, config = this.config;
			$.each(this.flashVarsKeyMapToCfg, function(k, v) {
				var cfgKey = v;
				if (cfgKey in config) {
					var valType = $.type(config[cfgKey]);
					if (valType == "boolean") {
						val[k] = config[cfgKey] ? 1 : 0;
					} else if (valType == "number" || valType === "string") {
						val[k] = config[cfgKey];
					}
				} else {
					val[k] = "";
				}
			});
			return val;
		},
		getFlashSwfUrl: function() {
			var swfurl = "";
			//直播
			if (this.config.type == xplayer.PLAYER_DEFINE.LIVE) {
				// TODO:这里需要加入验证传入的swf是否是qq.com，paipai.com,soso.com,gtimg.cn
				if ($.isString(this.config.liveFlashUrl) && this.config.liveFlashUrl.length > 0) {
					swfurl = this.config.liveFlashUrl;
				} else {
					// 文件名前缀过滤掉特殊的字符，只允许英文和数字
					swfurl = this.swfPathRoot + this.config.liveFlashSwfType.replace(/[^\w+]/ig, "") + ".swf";
					swfurl += "?max_age=86400&v=" + this.config.flashVersionTag || '20140615';
				}
			} else {
				// TODO:这里需要加入验证传入的swf是否是qq.com，paipai.com,soso.com,gtimg.cn
				if ($.isString(this.config.vodFlashUrl) && this.config.vodFlashUrl.length > 0) {
					swfurl = this.config.vodFlashUrl;
				} else {
					// 文件名前缀过滤掉特殊的字符，只允许英文和数字
					swfurl = this.swfPathRoot + this.config.vodFlashType.replace(/[^\w+]/ig, "") + ".swf";
					swfurl += "?max_age=86400&v="  + this.config.flashVersionTag || '20140615';
				}
				var ua = navigator.userAgent;
				if (ua.indexOf("Maxthon") > 0 && ua.indexOf("Chrome") > 0) { //遨游云浏览器，缓存了flash导致事件注册不上去
					swfurl += (swfurl.indexOf("?") > 0 ? "&" : "?") + "_=" + xplayer.$.now();
				}
			}
			swfurl = $.filterXSS(swfurl);
			return swfurl;
		},
		getFlashHTML: function() {

			var flashvar = this.getFlashVar(),
				swfurl = this.getFlashSwfUrl(),
				width = $.formatSize(this.config.width),
				height = $.formatSize(this.config.height);

			if (!this.config.playerid) {
				this.playerid = "tenvideo_flash_player_" + new Date().getTime();
			} else {
				this.playerid = this.config.playerid;
			}

			var propStr = [
				'<param name="allowScriptAccess" value="always" />',
				'<param name="movie" value="' + swfurl + '" />',
				'<param name="quality" value="high" />',
				'<param name="allowFullScreen" value="true"/>',
				'<param name="play" value="true" />',
				'<param name="wmode" value="' + $.filterXSS(this.config.flashWmode) + '" />',
				'<param name="flashvars" value="' + flashvar + '"/>',
				'<param name="type" value="application/x-shockwave-flash" />',
				'<param name="pluginspage" value="http://get.adobe.com/cn/flashplayer/" />'
			].join("\n");
			var str = "";
			if ( !! $.browser.ie) {
				if($.browser.version == 11){
					str += '<object data="' + swfurl + '" type="application/x-shockwave-flash" width="' + width + '" height="' + height + '" id="' + this.playerid + '" codebase="http://fpdownload.adobe.com/pub/shockwave/cabs/flash/swflash.cab#version=10,2,0,0">\n';
				}else{
					str += '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="' + width + '" height="' + height + '" id="' + this.playerid + '" codebase="http://fpdownload.adobe.com/pub/shockwave/cabs/flash/swflash.cab#version=10,2,0,0">\n';
				}
				
				str += propStr;
				str += '	<div id="xplayer_flash_install" style="line-height:' + height + ';background:#000000;text-align:center"><a href="http://www.adobe.com/go/getflashplayer" target="_blank" style="color:#ffffff;font-size:14px;padding:10px;">点击此处安装播放视频需要的flash插件</a></div>\n';
				str += '</object>';
			}
			// else if ( !! $.os.android) {
			// 	str += '<object type="application/x-shockwave-flash" data="' + swfurl + '" width="' + this.config.width + '" height="' + this.config.height + '" id="' + this.playerid + '" align="middle">\n';
			// 	str += propStr;
			// 	str += '	<div class="xplayer_player_noswf">未检测到flash插件或者您的设备暂时不支持flash播放</div>';
			// 	str += '</object>'
			// } 
			else {
				str += '<embed wmode="' + $.filterXSS(this.config.flashWmode) + '" flashvars="' + flashvar + '" src="' + swfurl + '" quality="high" name="' + this.playerid + '" id="' + this.playerid + '" bgcolor="#000000" width="' + width + '" height="' + height + '" align="middle" allowScriptAccess="always" allowFullScreen="true"  type="application/x-shockwave-flash" pluginspage="http://get.adobe.com/cn/flashplayer/"></embed>';
			}
			
			return str;


		},
		write: function(modId) {
			var el = null;
			if ($.type(modId) == "object" && modId.nodeType == 1) {
				el = modId;
				this.$mod = $("#" + modId.id);
				this.modId = this.$mod.attr("id") || "";
			} else {
				el = xplayer.$.getByID(modId);
				this.modId = modId, this.$mod = $(el);
			}
			if (!el) return;
			var str = this.getFlashHTML(),
				swfUrl = this.getFlashSwfUrl(),
				$me = this,
				videoModId = "mod_" + this.playerid;
			el.innerHTML = '<div id="' + videoModId + '">' + str + '</div>';
			this.flashobj = $.browser.ie ? document.getElementById(this.playerid) : document.embeds[this.playerid];
			this.videomod = $.getByID(videoModId);

			var h = this.config.height+"",fl = $.getByID("xplayer_flash_install");
			if(h.indexOf("%")>0 && fl){
				fl.style.lineHeight = el.offsetHeight;
			}

		},
		/**
		 * 返回真实的播放器
		 */
		getPlayer: function() {
			return this.flashobj;
		}
	})


})(xplayer, xplayer.$);