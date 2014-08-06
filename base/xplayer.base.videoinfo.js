/**
 * @fileOverview 腾讯视频云播放器 tvp.VideoInfo 视频对象
 */

/*
 * 这个类是定义视频信息的数据对象，该数据对象包含了点播和直播的数据接口
 */
/*
 * @include "./tvp.define.js"
 */


;
(function(tvp, $) {

	var defaultPrivData = {
		poster: "", //默认封面图
		prefix: 0, // 片头
		tail: 0, // 片尾
		tagStart: 0, // 看点开头
		tagEnd: 0, // 看点结尾
		duration: "",
		historyStart: 0, // 历史观看开始时间，这个参数设置了播放器会有提示“您上次观看到....“
		pay: 0, // 是否是付费
		coverId: "", // 专辑id（可选）
		title: "", // 标题
		isLookBack: 0, // 当前直播频道是否支持回看
		tstart: 0, // 历史观看时间，跟historyStart差不多，只是播放器不会有提示，一般用于回链播放
		CDNType: 0, // CDNType
		vFormat: "",
		LiveReTime: "",
		typeId: 0, //视频所属大分类Id
		format: $.os.ipad || $.os.MIPAD ? "mp4" : "auto", //默认的视频文件格式
		channelExtParam: {},
		pid: "", //pid，每播放一次换一次
		rid: "", //请求server的rid，每次请求server换一次
		bulletId : "", //指定当前视频的一条弹幕id
		bullet : false //当前视频是否有开启弹幕
	};

	/**
	 * 视频对象
	 *
	 * @class tvp.VideoInfo
	 */
	tvp.VideoInfo = function() {
		var _vid = "",
			_vidlist = "",
			_vidCnt = 0,
			_idx = 0,
			_origvid = "",
			_channelId = "",
			$me = this,
			privData = {},
			curPlayer = null,
			loadServerDefer = {},
			getFormatListDefer = null;
		$.extend(privData, defaultPrivData);

		//服务器的数据
		this.data = {};
		this.url = "";
		this.lastQueryVid = "";
		
		/**
		 * 首次执行获取mp4地址的方法的defer
		 */
		this.callGetMp4UrlDefer = $.Deferred();

		/**
		 * @private 获取第一个视频vid
		 */

		function getFirstVid(vid) {
			if (vid.indexOf("|") < 0) return vid;
			return vid.substring(0, vid.indexOf("|"));
		};

		/**
		 * @private 获取真实的视频vid，如果是看点，则只返回看点所在视频vid
		 */

		function getRealVid(vid) {
			if (vid.indexOf("_") < 0) return vid;
			return vid.split("_")[0];
		};

		/**
		 * @private 获取看点的idx索引，如果是真实的视频，则返回0
		 * @return {Number} 看点的索引
		 */

		function getIdx(vid) {
			if (vid.indexOf("_") < 0) return 0;
			return parseInt(vid.split("_")[1]);
		};

		/**
		 * @private 获取真实的视频vid的列表，多个视频用|符号隔开
		 * @return {string} 视频列表
		 */

		function getRealVidList(vidlist) {
			var arr = [];
			var origarr = vidlist.split("|");
			for (var i = 0; i < origarr.length; i++) {
				arr.push(getRealVid(origarr[i]));
			}
			return arr.join("|");
		};
		
		/**
		 * 绑定统一播放器的自定义事件
		 */
		function bindPlayerEvent(){
			if(curPlayer && curPlayer instanceof tvp.Player){
				//在h5播放器开始初始化前的事件，先发起异步请求获取mp4地址
				curPlayer.on(tvp.ACTION.onVodH5Init,function(){
					var defer;
					if((curPlayer.config.isHtml5UseHLS === "auto" && tvp.common.isUseHLS()) || curPlayer.config.isHtml5UseHLS){
						return ;
					}
					defer = $me.getMP4Url();
					$me.callGetMp4UrlDefer.resolve(defer);
				});
			}
		}

		$.each(privData, function(k, v) {
			new function() {
				var p = k.charAt(0).toUpperCase() + k.substr(1);
				$me["set" + p] = function(v) {
					privData[k] = v;
					return this;
				}
				$me["get" + p] = function() {
					return privData[k];
				}
			}
		});
		
		this.setCurPlayer = function(player){
			curPlayer = player;
			bindPlayerEvent();
		}

		/**
		 * 设置视频Vid
		 *
		 * @public tvp.VideoInfo
		 */
		this.setVid = function(vid) {
			if (!tvp.$.isString(vid)) {
				return;
			}
			this.clear();
			_origvid = vid;
			if (vid.indexOf("|") < 0) {
				var id = getRealVid(vid)
				_vid = id;
				_idx = getIdx(vid);
				_vidlist = id;
			} else {
				var arr = vid.split("|");
				_vid = getRealVid(arr[0]);
				_idx = getIdx(arr[0]);
				_vidlist = getRealVidList(vid);
			}
			_vid = $.filterXSS(_vid);
			_vidlist = $.filterXSS(_vidlist);
			return this;
		};

		/**
		 * 获取视频主vid
		 *
		 * @public
		 */
		this.getVid = function() {
			return _vid;
		};

		/**
		 * 获取视频列表
		 *
		 * @public
		 */
		this.getVidList = function() {
			return _vidlist;
		}

		/**
		 * 获取视频列表数组
		 * @return {Array} [description]
		 */
		this.getVidArray = function() {
			return _vidlist.split("|");
		}

		/**
		 * 获取视频看点的idx索引
		 *
		 * @public
		 */
		this.getIdx = function() {
			return _idx;
		}

		/**
		 * 获取总播放时长
		 *
		 * @public
		 * @return {number} 返回的总时长
		 */
		this.getDuration = function() {
			if (!privData.duration) {
				if ( !! this.data && !! this.data.vl && $.isArray(this.data.vl.vi) && this.data.vl.vi.length > 0 && this.data.vl.vi[0].td != 0) {
					return this.data.vl.vi[0].td;
				}
				return 0;
			}

			var arrDur = privData.duration.split("|");
			var sec = 0;
			for (var i = 0, len = arrDur.length; i < len; i++) {
				sec += parseInt(arrDur[i]);
			}
			return sec;
		};

		/**
		 * 获取文件大小
		 * @return {number} 文件大小bytes
		 */
		this.getFileSize = function() {
			if (!!this.data && !!this.data.vl && !!this.data.vl.vi && !!this.data.vl.vi[0] && !!this.data.vl.vi[0].fs) {
				return parseInt(this.data.vl.vi[0].fs,10);
			}
			return 0;
		}

		this.getTimelong = function() {
			return this.getDuration();
		}

		/**
		 * 获取视频结束点跟视频文件最后一帧的绝对值时间
		 */
		this.getEndOffset = function() {
			return this.getDuration() - this.getTail();
		}

		/**
		 * 设置直播频道id
		 */
		this.setChannelId = function(cnlid) {
			if (!tvp.$.isString(cnlid)) {
				return;
			}
			// this.clear();
			_channelId = cnlid;
			return this;
		}

		/**
		 * 获取直播频道id
		 */
		this.getChannelId = function(cnlid) {
			return _channelId;
		}

		this.getFullVid = function() {
			if (this.getIdx() == 0) {
				return getRealVid(this.getVid());
			}
			return (getRealVid(this.getVid()) + "_" + this.getIdx());
		};

		this.getTitle = function() {
			if (privData.title === "") {
				if (this.data) {
					if (this.data.playtype == "mp4" && this.data.vl && $.isArray(this.data.vl.vi) && this.data.vl.vi.length > 0) {
						privData.title = this.data.vl.vi[0].ti || "";
					} else if (this.data.playtype == "hls" && $.isArray(this.data.vi) && this.data.vi.length > 0) {
						privData.title = this.data.vi[0].title || "";
					}
				}
			}
			return privData.title;
		}

		/**
		 * 清除数据 还原状态
		 *
		 * @public
		 */
		this.clear = function() {
			_vid = "", _vidlist = "", _vidCnt = 0, _idx = 0, _channelId = "",
			getFormatListDefer = null, loadServerDefer = {};
			$.extend(privData, defaultPrivData);
			this.data = {};
			this.url = "";
		};

		/**
		 * 克隆，复制对象
		 */
		this.clone = function(obj) {
			obj.setVid(_origvid);
			obj.setChannelId(_channelId);
			for (var k in privData) {
				var n = k.charAt(0).toUpperCase() + k.substr(1);
				obj["set" + n](this["get" + n]());
			}
			$.extend(obj.data, this.data);
		}

		/**
		 * 获取缩略图地址
		 */
		this.getVideoSnap = function() {
			var img = [];
			img[0] = tvp.common.getVideoSnap(_vid, _idx);
			img[1] = img[0].replace("_160_90_3", "_1");
			img[2] = img[1].replace("_1.jpg", ".png");
			return img;
		};

		/**
		 * 获取MP4文件地址
		 */
		this.getMP4Url = function(v) {
			var vid = "",
				vidArr = this.getVidArray(),
				fullvid = "";

			if ($.isString(v)) {
				vid = v;
				if ($.inArray(v, vidArr) < 0) {
					var d = $.Deferred();
					d.reject();
					return d;
				}
			} else if (!isNaN(v)) {
				fullvid = vid = this.getVidArray()[v >= vidArr.length ? 0 : v];
			} else {
				vid = this.getVid();
				fullvid = this.getFullVid();
			}

			this.lastQueryVid = fullvid || vid;
			this.setRid($.createGUID());

			var defKey = vid + "_mp4_" + this.getFormat();
			if ($.type(loadServerDefer[defKey]) == "object" && $.isFunction(loadServerDefer[defKey].done) && loadServerDefer[defKey].state() == "resolved") {
				return loadServerDefer[defKey];
			}
			loadServerDefer[defKey] = $.Deferred();
			var t = this;
			tvp.h5Helper.loadVideoUrlByVid({
				vid: vid,
				isPay: this.getPay(),
				fmt: this.getFormat(),
				appId : curPlayer instanceof tvp.Player ? curPlayer.config.appid : 0,
				contentId : curPlayer instanceof tvp.Player ? curPlayer.config.contentId : ""
			}).done(function(videourl, sd) {
				t.url = videourl;
				t.data = sd;
				t.data.playtype = "mp4";
				if ( !! loadServerDefer[defKey]) loadServerDefer[defKey].resolve(videourl);
			}).fail(function(errcode, errcontent) {
				if ( !! loadServerDefer[defKey]) loadServerDefer[defKey].reject(errcode, $.isUndefined(errcontent) ? 0 : errcontent);
			});
			return loadServerDefer[defKey];
		};

		this.getHLS = function(v) {
			var vid = "",
				vidArr = this.getVidArray(),
				fullvid = "";

			if ($.isString(v)) {
				vid = v;
				if ($.inArray(v, vidArr) < 0) {
					var d = $.Deferred();
					d.reject();
					return d;
				}
			} else if (!isNaN(v)) {
				fullvid = vid = this.getVidArray()[v >= vidArr.length ? 0 : v];
			} else {
				vid = this.getVid();
				fullvid = this.getFullVid();
			}

			this.lastQueryVid = fullvid || vid;
			this.setRid($.createGUID());

			var defKey = vid + "_hls_" + this.getFormat();
			if ($.type(loadServerDefer[defKey]) == "object" && $.isFunction(loadServerDefer[defKey].done) && loadServerDefer[defKey].state() == "resolved") {
				return loadServerDefer[defKey];
			}
			loadServerDefer[defKey] = $.Deferred();
			var t = this;
			tvp.h5Helper.loadHLSUrlByVid({
				vid: vid,
				isPay: this.getPay(),
				fmt: this.getFormat(),
				appId : curPlayer instanceof tvp.Player ? curPlayer.config.appid : 0,
				contentId : curPlayer instanceof tvp.Player ? curPlayer.config.contentId : ""
			}).done(function(videourl, sd) {
				t.url = videourl;
				t.data = sd;
				t.data.playtype = "hls";
				if ( !! loadServerDefer[defKey]) loadServerDefer[defKey].resolve(videourl);
			}).fail(function(errcode, errcontent) {
				if ( !! loadServerDefer[defKey]) loadServerDefer[defKey].reject(errcode, $.isUndefined(errcontent) ? 0 : errcontent);
			});
			return loadServerDefer[defKey];
		};

		/**
		 * 获取正在播放的清晰度
		 * @return {[type]} [description]
		 */
		this.getPlayFormat = function() {
			if (!$.isPlainObject(this.data)) return this.getFormat();
			if ($.type(this.data.fl) == "object" && $.isArray(this.data.fl.fi)) {
				var fi = this.data.fl.fi;
				for (var i = 0; i < fi.length; i++) {
					if (fi[i].sl == 1) return fi[i].name;
				}
			}
			return this.getFormat();
		};

		/**
		 * 获取当前视频软字幕语言列表
		 * @return {[type]} [description]
		 */
		this.getSrtLangList = function() {
			if ($.type(this.data.sfl) == "object" && $.isArray(this.data.sfl.fi)) {
				$.each(this.data.sfl.fi, function(i, obj) {
					obj.desc = tvp.html5lang.getSrtName(obj.id);
				});
				return this.data.sfl.fi;
			}
			return [];
		};

		/**
		 * 获取指定软字幕的URL列表
		 * @param  {[type]} sflobj [description]
		 * @return {[type]}        [description]
		 */
		this.getSrtUrlList = function(sflobj) {
			if ($.isUndefined(sflobj)) {
				var arr = this.getSrtLangList();
				if (arr.length > 0) {
					sflobj = arr[0];
				} else {
					return $.Deferred().reject(-1);
				}
			}

			if ($.type(sflobj) != "object" && !isNaN(sflobj)) {
				for (var i = 0, len = this.data.sfl.fi.length; i < len; i++) {
					if (this.data.sfl.fi[i].id == sflobj) {
						sflobj = this.data.sfl.fi[i];
						break;
					}
				}
				if ($.type(sflobj) != "object") {
					return $.Deferred().reject(-2);
				}
			}

			var vid = this.getVid(),
				defKey = vid + "_srt_" + sflobj.id;

			if ($.type(loadServerDefer[defKey]) == "object" && $.isFunction(loadServerDefer[defKey].done) && loadServerDefer[defKey].state() == "resolved") {
				return loadServerDefer[defKey];
			}

			loadServerDefer[defKey] = $.Deferred();

			var t = this;
			tvp.h5Helper.loadSRT({
				"vid": vid,
				"sflid": sflobj.id,
				"pid": t.getPid()
			}).done(function(json) {
				var urls = [];
				if ($.type(json.ul) == "object" && $.isArray(json.ul.ui)) {
					$.each(json.ul.ui, function(i, v) {
						urls.push([v.url, "lang=" + sflobj.name].join("?"));
					});
				}
				loadServerDefer[defKey].resolve(urls);
			}).fail(function(errcode) {
				loadServerDefer[defKey].reject(errcode);
			});

			return loadServerDefer[defKey];
		}

		/**
		 * 获取当前视频支持的格式
		 * @return {Array} 当前视频支持的格式
		 */
		this.getFormatList = function() {

			// 这里的defer不像loadServerDefer作为一个对象容器，每个视频vid对应一个defer，原因是用|拼出来的多个视频列表连播，往往清晰度一致的
			if ($.type(getFormatListDefer) == "object" && $.isFunction(getFormatListDefer.done)) {
				return getFormatListDefer;
			}
			getFormatListDefer = $.Deferred();
			var t = this,
				canplaylist = ["mp4", "msd"],
				getFn = function() {
					var filist = [];
					if (!$.isPlainObject(t.data.fl) || !$.isArray(t.data.fl.fi)) return [];
					$.each(t.data.fl.fi, function(k, v) {
						if ($.inArray(v.name, canplaylist) != -1) {
							filist.push(v.name);
						}
					});
					return filist;
				};

			this.getMP4Url().done(function() {
				getFormatListDefer.resolve({
					"list": getFn()
				})
			}).fail(function() {
				getFormatListDefer.reject({
					"list": []
				});
			});
			return getFormatListDefer;
		};


		/**
		 * 当前视频文件是否是有硬字幕
		 * @return {Boolean} [description]
		 */
		this.hasHardSubtitle = function() {
			var format = video.getFormat();
			for (var i = 0, len = this.data.fl.fi.length; i < len; i++) {
				var fi = this.data.fl.fi[i];
				if (fi.name == format) {
					return !!fi.sb;
				}
			}
			return false;
		};

		/**
		 * 当前视频文件是否包含软字幕
		 * @return {Boolean} [description]
		 */
		this.hasSoftSubtitle = function() {
			return ($.type(this.data.sfl) == "object" && $.isArray(this.data.sfl.fi) && this.data.sfl.fi.length > 0);
		}
	};


	/**
	 * 定义视频播放类型——直播或者点播
	 *
	 * @namespace tvp.PLAYTYPE
	 * @type {Object}
	 */
	tvp.PLAYTYPE = {
		/**
		 * 直播
		 *
		 * @default 1
		 * @type String
		 */
		LIVE: "1",
		/**
		 * 点播
		 *
		 * @default 2
		 * @type String
		 */
		VOD: "2"
	}

})(tvp, tvp.$);