/**
 * @fileoverview 腾讯视频统一播放器 H5内核 腾讯视频logo
 * 处理逻辑：
 * 1.先从getinfo里找到sfl字段，这里列出当前视频文件的所有语言支持的软字幕
 * 2.选择sfl里某一个id，从getsurl里获取到当前语言字幕的所有url
 * 3.循环给出的url列表，加参数使用jsonp拉取字幕文件，一个不行就获取下一个，直到字幕能正常解析（相当于重试或者备选url）
 * 4.预处理字幕文件
 * 5.响应timeupdate，显示字幕文件。
 */

;
(function(tvp, $) {
	// extends control any feature ...
	$.extend(tvp.Html5UI.fn, {
		buildtrack: function(player, $video, $control, $UILayer) {

			var $elements = {}, curVideo = player.curVideo,
				t = this,
				isTrackClose = false,
				tracks = {}, //字幕对象集合，包含了所有的字幕文件信息
				//记录当前看到字幕文件对白的索引
				currentCaptionIdx = -1,
				//视频video标签对象
				videoObj = $video[0],
				//当前被选中的字幕
				currentTrack = null,
				$element = {};

			$.each(tvp.html5skin.elements.track, function(k, v) {
				$elements[k] = $control.find(v);
			});

			$element.caption = $('<div class="tvp_track"><span></span></div>').appendTo($UILayer),
			$element.desc = $element.caption.find("span");

			function Track(cfg) {
				$.extend(this, $.extend(this, {
					srclang: "zh-cn",
					src: [],
					kind: "subtitles",
					//label: "",
					entries: [],
					slfid: "",
					isLoaded: false
				}), cfg);
			};

			/**
			 * 填充字幕选择列表
			 * @return {[type]} [description]
			 */
			function renderSrtListPannel(defValue) {
				var langList = player.curVideo.getSrtLangList();
				if (langList.length == 0) {
					return;
				}
				if ($.isUndefined(defValue)) {
					defValue = langList[0].id;
				}
				var defName = tvp.html5lang.getSrtName(defValue),
					listKV = {},
					html = "";

				langList.push({
					"id": 0,
					"name": "",
					"desc": "无字幕"
				});
				if (defValue == "0") {
					defName = "无字幕";
				}
				$.each(langList, function(i, v) {
					listKV[v.id] = v.desc;
				});

				var data = {
					"curv": defValue,
					"curn": defName,
					"list": listKV
				};

				var render = tvp.$.tmpl(tvp.html5skin.definitionList);
				html = render({
					"data": data
				});
				$elements.list.html(html);

				$elements.main.show();
				//设置控制栏当前显示的清晰度名称
				if (defName) {
					$elements.button.text(defName);
					if ($elements.button.css("display") == "none") $elements.button.show();
				}
			};

			function initEvent() {
				$elements.button.click(function() {
					$elements.list.fadeToggle(200);
				});

				$control.on("tvp:progress:touchstart", function() {
					if ($elements.list.css("display") != "none") {
						$elements.list.hide();
					}
				});


				$elements.list.undelegate("li", "touchend");
				$elements.list.delegate("li", "touchend", function() {
					var $el = $(this),
						fmt = $el.data("fmt"); //从data-fmt自定义属性里获取
					if (fmt == "0" || fmt == "") {
						isTrackClose = true;
					} else {
						displayTrackBySflId(fmt);
					}
					$elements.list.hide();
					renderSrtListPannel(fmt);
				});
			};

			/**
			 * 根据指定的字幕对象异步加载字幕XML文件并转换成entries数组
			 * @param  {[type]} track [description]
			 * @inner
			 * @ignore
			 */

			function loadSRTXmlByTrack(track) {
				//TODO:使用全局defer防止重复向server请求数据
				var defer = $.Deferred();

				//这里会循环从url列表里读取字幕，一个不行读另外一个，直到所有的轮询完毕都出错才处罚reject

				function loadFromServer(urlIndex) {
					function error() {
						if (urlIndex < track.src.length - 2) {
							loadFromServer(urlIndex + 1);
						} else {
							defer.reject();
						}
					}
					urlIndex = urlIndex || 0;
					$.ajax({
						"url": track.src[urlIndex],
						"dataType": "jsonp",
					}).done(function(json) {
						if ( !! json && json.ts && $.isArray(json.ts.t)) {
							track.isLoaded = true;
							$.each(json.ts.t, function(i, v) {
								json.ts.t[i].st = parseFloat(json.ts.t[i].st, 10);
								json.ts.t[i].et = json.ts.t[i].st + parseFloat(json.ts.t[i].du);
								track.entries = json.ts.t;
							});
							currentTrack = track;
							defer.resolve();
						} else {
							error();
						}
					}).fail(error);
				}

				loadFromServer(0);
				return defer;
			};


			function displayTrackBySflId(sflid) {
				if ($.isUndefined(sflid)) {
					var langList = player.curVideo.getSrtLangList();
					if (langList.length == 0) {
						return;
					}
					sflid = langList[0].id;
				}
				//先从server读取指定语言的软字幕文件url列表
				curVideo.getSrtUrlList(sflid).done(function(urls) {
					tracks[sflid] = new Track({
						src: urls,
						slfid: sflid
					});

					//再通过JSONP拉取到字幕文件内容
					loadSRTXmlByTrack(tracks[sflid]).done(function() {
						displayCaption(tracks[sflid]);
					})

				});
			}

			/**
			 * 显示指定的对白
			 * @param  {[type]} track [description]
			 * @return {[type]}       [description]
			 */
			function displayCaption(track) {
				if (!track) {
					return;
					$element.caption.hide();
				}
				var ct = videoObj.currentTime,
					idx = Math.max(currentCaptionIdx, 0);

				//先跟上次定位的时间点做对比，如果刚好还是落在该区间，则继续使用，不需要再循环判断
				if (ct >= track.entries[idx].st && ct <= track.entries[idx].et) {
					$element.desc.text(track.entries[idx].ct).show();
					return;
				}
				//如果当前时间比上次字幕点的开始时间还要小，说明可能是被往回拖动过进度条导致，需要从0重新定位
				if (ct < track.entries[idx].st) {
					idx = 0;
				}

				for (var i = idx, len = track.entries.length; i < len; i++) {
					if (ct >= track.entries[i].st && ct <= track.entries[i].et) {
						console.log(track.entries[i].ct + "[" + track.entries[i].du + "]");
						$element.desc.text(track.entries[i].ct).show();
						currentCaptionIdx = i;
						return;
					}
					//如果循环到某个字幕时间点比当前时间还要大，那么说明还没到这个字幕语句，后面的自然也不用再循环了
					else if (track.entries[i].st > ct) {
						$element.desc.hide();
						return;
					}
				}
			};

			/**
			 * 初始化字幕处理接口
			 * @return {[type]} [description]
			 */

			function initTrack() {
				$video.on("tvp:video:src", function() {
					renderSrtListPannel();
					initEvent();
					displayTrackBySflId();
				}).on("timeupdate", function() {
					displayCaption(currentTrack);
				})
			};

			initTrack();
		}
	});
})(tvp, tvp.$);