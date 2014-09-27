/**
 * @fileOverview 腾讯视频统一播放器 HTML5播放器 loading广告
 *
 */

;
(function(xplayer, $) {
	var $me,
		/**
		 * 广告数据队列
		 */
		orderList = [],
		/**
		 * 当前广告的序号值
		 */
		curIdx = 0,
		/**
		 * 开通会员的链接地址
		 */
		openVipLink = "http://film.qq.com/promote/openvip.html?ptag=cover.flash.h5skipad",

		/**
		 * 正在播放中时的事件回调
		 * @param {VideoElement}
		 */
		onTimeupdateHandle = $.noop,
		/**
		 * 当前用户在通过aid查询后的身份信息
		 * -1-未知0-非绿钻/非qq会员/非超级会员/非好莱坞会员；1-绿钻/好莱坞会员；2-qq会员；3-超级会员
		 * @type {Number}
		 */
		curUserVipInfo = -1,
		/**
		 * 当前视频对应的订单的广告播放剩余的总时长
		 */
		curOrderRemainDuration = 0,
		/**
		 * 当前是否正在播放广告
		 */
		isPlayingAd = false,
		/**
		 * qq会员可跳过一则广告的时间限制
		 */
		qqvipSkipAdLimitTime = 5,
		/**
		 * 隐藏模块时的样式类
		 */
		hideCls = "xplayer_none",
		/**
		 * 当前用户身份位定义对象
		 *  0 未登录 
		 *	1 登录的普通用户
		 *	2 登录的好莱坞会员
		 *	3 （被其他业务占用）
		 *	4 登录的qq会员
		 *	5 登录的超级会员
		 *	90 登录的普通用户+登录的qq会员+登录的超级会员
		 * @type {Object} 
		 */
		userStatusDef = {
			UNKNOWN : -1,
			NOTLOGIN : 0,
			LOGIN : 1,
			HLWVIP : 2,
			QQVIP : 4,
			QQSVIP : 5
		},
		/**
		 * 上报时的来源参数
		 */
		pf = "H5",
		from = "6",
		/**
		 * 版本号
		 */
		ver = "1.0.0";
	if (!window.txv) {
		window.txv = {};
	}
	/**
	 * 广告插件上报tdw方法
	 * itype 上报类型：1-请求aid，2-请求livemsg，3-播放中暂停，4-点击广告链接（val-1表示点击详情，2-表示点击视频）,5-点击跳过广告，6-QQ会员点击跳过广告,7-开始播放,8-当前一个广告视频播放结束
	 * @param {Object} params 上报参数对象
	 */
	function reportFn(params) {
		var defaultParams = {
			cmd : 3541,
			appId : $me.player.config.appid,
			vid : $me.player.curVideo.getFullVid()
		};
		xplayer.report($.extend(defaultParams, params));
	};

	/**
	 * 出错上报
	 * @param {Number} itype 出错类型：1-请求aid出错，2-请求livemsg出错
	 * @param {Number} msg 出错返回码
	 */
	function errorHandle(itype, msg) {
		reportFn({
			        itype : itype,
			        val : msg
		        });
		endHandle();
	}

	/**
	 * 广告结束处理
	 */
	function endHandle() {
		orderList = [];
		curIdx = 0;
		isPlayingAd = false;
		onTimeupdateHandle = $.noop;
		if ($me.config.$control && $me.config.$moreLink) {
			$me.config.$control.addClass(hideCls);
			$me.config.$moreLink.removeClass(hideCls);
			$me.config.$qqvipSkip.find(".xplayer_ads_num").text("");
			$me.config.$countdownContainer.text("");
		}
		$me.onEnd();
	}

	/**
	 * 获取广告视频地址
	 * @param {Object} json 广告数据
	 * @return Object defer对象
	 */
	function getPlayUrl(itemData) {
		var obj = {
			url : "",
			width : 0,
			height : 0
		},
			defer = $.Deferred();
		if (itemData && itemData.image && itemData.duration > 0) {
			itemData.image = ($.isArray(itemData.image) ? itemData.image[0] : itemData.image) || {};
			if (itemData.image.vid) {
				xplayer.h5Helper.loadVideoUrlByVid({
					        vid : itemData.image.vid,
					        isPay : false,
					        isAd : true,
					        loadingAdCgi : "http://vv.video.qq.com/getmind?callback=?&"
				        }).done(function(url) {
					        defer.resolve({
						                url : url,
						                width : itemData.image.width,
						                height : itemData.image.height
					                });
				        }).fail(function() {
					        defer.resolve();
				        });
			}
			else if (/^http\:\/\//.test(itemData.image.url)) {
				defer.resolve({
					        url : itemData.image.url,
					        width : itemData.image.width,
					        height : itemData.image.height
				        });
			}
			else {
				defer.resolve(obj);
			}
		}
		else {
			defer.resolve(obj);
		}
		return defer;
	}

	/**
	 * 开始播放后处理事件的绑定及数据上报
	 */
	function onPlaying($video, idx) {
		var curOrder = orderList[idx] || {},
			clickEvtName = "click",
			reportObjArr = [],
			tmpTime = 0,
			videoTag = $video.get(0);
		if (curOrder && (curOrder.reportUrl || curOrder.reportUrlOther)) {
			if (curOrder.reportUrl) {
				tmpTime = isNaN(curOrder.ReportTime) ? 0 : Math.ceil(curOrder.ReportTime / 1000);
				reportObjArr.push({
					        time : tmpTime,
					        url : curOrder.reportUrl,
					        isOther : false
				        });
			}
			if (curOrder.reportUrlOther && curOrder.reportUrlOther.reportitem) {
				if (!$.isArray(curOrder.reportUrlOther.reportitem)) {
					curOrder.reportUrlOther.reportitem = [curOrder.reportUrlOther.reportitem];
				}
				$.each(curOrder.reportUrlOther.reportitem, function(idx, item) {
					        if (item && item.url) {
						        tmpTime = isNaN(item.reporttime) ? 0 : Math.ceil(item.reporttime / 1000);
						        reportObjArr.push({
							                time : tmpTime,
							                url : item.url,
							                isOther : true
						                });
					        }
				        });
			}
		}
		setRemainDuration(idx);
		onTimeupdateHandle = function(v) {
			var curTime = Math.floor(v.currentTime), qqvipName,
				totalAdRemainTime = curOrderRemainDuration - curTime,
				userStatus = $me.getUserStatus(),
				// 当前还要播放的广告时长
				qqvipCanSkipAdCountdown = qqvipSkipAdLimitTime - curTime; // qq会员可跳过当前广告的倒计时
			totalAdRemainTime = (isNaN(totalAdRemainTime) || totalAdRemainTime < 0) ? 0 : totalAdRemainTime;
			qqvipCanSkipAdCountdown = isNaN(qqvipCanSkipAdCountdown) ? 0 : qqvipCanSkipAdCountdown;
			$me.config.$countdownContainer.text(totalAdRemainTime);
			if ($me.adFlag != 1 && (userStatus == userStatusDef.QQVIP || userStatus == userStatusDef.QQSVIP)) {// 当前验证的信息表示用户是QQ会员，则展示qq会员跳广告文案
				$me.config.$skipLink.addClass(hideCls);
				$me.config.$qqvipSkip.find("._remain").text(orderList.length - curIdx);
				qqvipName = userStatus == userStatusDef.QQSVIP ? "超级会员" : "QQ会员";
				$me.config.$qqvipSkip.find("._vipname").text(qqvipName);
				if (qqvipCanSkipAdCountdown > 0) {
					$me.config.$qqvipSkip.find(".xplayer_ads_skip_text").addClass("xplayer_disabled");
					$me.config.$qqvipSkip.find(".xplayer_ads_num").text(qqvipCanSkipAdCountdown);
					$me.config.$qqvipSkip.find("._remaintime").show();
				}
				else {
					$me.config.$qqvipSkip.find("._remaintime").hide();
					$me.config.$qqvipSkip.find(".xplayer_ads_skip_text").removeClass("xplayer_disabled");
				}
				$me.config.$qqvipSkip.removeClass(hideCls);
			}
			else {
				$me.config.$qqvipSkip.addClass(hideCls);
				$me.config.$skipLink.removeClass(hideCls);
			}
			$.each(reportObjArr, function(idx, item) {
				        var t = $me.player.getCurTime();
				        if (item && ((t > item.time && t - item.time < 1) || item.time <= t)) {
					        var params = {
						        url : document.URL
					        };
					        if (!item.isOther) {
						        // console.debug("call getReportParams:" +
						        // item.time);
						        params = $.extend(params, getReportParams(curOrder.oIdx, curOrder, item.time));
					        }
					        xplayer.report(appendParamsToUrl(item.url, params));
					        reportObjArr[idx] = undefined;
				        }
			        });
		}
		$me.config.$skipLink.off(clickEvtName).on(clickEvtName, function() {
			        $me.skipAd();
			        reportFn({
				                itype : 5,
				                val : $me.adFlag
			                });
		        });
		$me.config.$qqvipSkip.find(".xplayer_ads_skip_text").off(clickEvtName).on(clickEvtName, function() {
			        $me.skipAd();
			        reportFn({
				                itype : 6,
				                val : $me.adFlag
			                });
		        });
		if (curOrder.link) {
			$me.config.$moreLink.off(clickEvtName).on(clickEvtName, function() {
				        videoTag && videoTag.pause();
				        reportFn({
					                itype : 4,
					                val : 1
				                });
			        }).attr("href", curOrder.link).attr("target", "_blank").show();
			$me.config.$adLink.off(clickEvtName).on(clickEvtName, function() {
				        videoTag && videoTag.pause();
				        reportFn({
					                itype : 4,
					                val : 2
				                });
			        }).attr("data-link", curOrder.link);
		}
		else {
			$me.config.$adLink.attr({
				        "href" : "javascript:;",
				        "data-link" : "",
				        "target" : "self"
			        });
			$me.config.$moreLink.attr({
				        "href" : "javascript:;",
				        "target" : "self"
			        }).hide();
		}
		if (!videoTag.paused && curOrder.link) {
			$me.config.$adLink.attr("href", curOrder.link).attr("target", "_blank");
		}
	}

	/**
	 * 计算当前广告订单的剩余时长
	 * @param {Number} idx 当前播放的广告顺序值
	 */
	function setRemainDuration(idx) {
		var t = 0,
			len = 0;
		if (!isNaN(idx) && $.isArray(orderList) && orderList.length > idx) {
			for (len = orderList.length; idx < len; idx++) {
				if (orderList[idx] && orderList[idx].duration > 0) {
					t += parseInt(orderList[idx].duration, 10);
				}
			}
		}
		curOrderRemainDuration = Math.floor(t / 1000);
	}

	/**
	 * 过滤空订单
	 * @param {Array} cgi返回的订单数组
	 * @return {Array} 过滤后的订单数组
	 */
	function filterOrderList(list) {
		var retArr = [], idx, len, item;
		list = $.isArray(list) ? list : [];
		for (idx = 0, len = list.length; idx < len; idx++) {
			item = list[idx] || {};
			item.oIdx = idx + 1;
			if (item && item.image && item.duration > 0) {
				item.image = ($.isArray(item.image) ? item.image[0] : item.image) || {};
				if (item.image && (item.image.url || item.image.vid)) {// 如果是非空订单则加入到待播放队列
					// no_click值为Y时表示当前广告不可点击，将其链接置为空
					item.link = (item.no_click === "Y") ? "" : appendParamsToUrl(item.link, {
						        url : document.URL,
						        target : $me.aidInfo.aid
					        });
					retArr.push(item);
					continue;
				}
			}
			if (item) {// 空订单直接上报数据
				if (item.reportUrl) {
					xplayer.report(appendParamsToUrl(item.reportUrl, getReportParams(item.oIdx, item)));
				}
				if (item.reportUrlOther && $.type(item.reportUrlOther.reportitem) == "string") {
					xplayer.report(appendParamsToUrl(item.reportUrlOther.reportitem, {
						        url : document.URL
					        }));
				}
				else if (item.reportUrlOther && $.isArray(item.reportUrlOther.reportitem)) {
					$.each(item.reportUrlOther.reportitem, function(idx, it) {
						        if (it && it.url) {
							        xplayer.report(appendParamsToUrl(it.url, {
								                url : document.URL
							                }));
						        }
					        });
				}
			}
		}
		return retArr;
	}

	/**
	 * 一则广告播放完后的回调
	 */
	function onPlayAdEnd() {
		if (isPlayingAd) {
			reportFn({
				        itype : 8,
				        val : ($me && $me.aidInfo) ? $me.aidInfo.oaid : ""
			        });
			onTimeupdateHandle = $.noop;
			$me.next();
		}
	}

	/**
	 * 广告加载步骤上报，只上报第一贴.0-开始加载，1-开始播放
	 */
	function stepReport(step) {
		var params = {
			step : step
		};
		if (curIdx == 0 && $.isArray(orderList) && orderList[curIdx] && orderList[curIdx].reportUrl) {
			params = $.extend(getReportParams(orderList[curIdx].oIdx, orderList[curIdx]), params);
			xplayer.report(appendParamsToUrl(orderList[curIdx].reportUrl, params));
		}
	}

	/**
	 * 给上报的url增加参数
	 * @param {String} url
	 * @param {Object} params
	 * @return {String}
	 */
	function appendParamsToUrl(url, params) {
		if ($.type(url) == "string" && params) {
			url += url.indexOf("?") == -1 ? "?" : "&" + $.param(params);
		}
		return url;
	}

	/**
	 * 获取上报时的公用参数对象
	 * @param {Number} 当前贴的真实排序值
	 * @param {Object} 当前要上报的贴信息对象
	 * @param {Number} 当前要上报的播放时长
	 * @return {Object}
	 */
	function getReportParams(defaultIdx, order, time) {
		var curTime = isNaN(time) ? Math.ceil($me.player.getCurTime()) : time;
		curTime = (order && order.ReportTime < curTime) ? order.ReportTime : curTime;
		// console.debug("here is curTime"+curTime);
		return {
			// 标记平台来源，跟请求aid cgi的同名参数是一个值
			from : from,
			// 平台字符标识
			pf : pf,
			// 统一播放器版本号
			v : xplayer.ver,
			// 当前准备要播放的视频时长
			dura : $me.aidInfo.duration || $me.player.curVideo.getDuration(),
			// 当前的专辑id
			coverid : $me.player.curVideo.getCoverId(),
			// 当前待播放的视频id
			vid : $me.player.curVideo.getFullVid(),
			// 当前页面ptag
			vptag : !$.isUndefined(window.Live) && Live.mypv && $.isFunction(Live.mypv.getPtag) ? Live.mypv.getPtag() : "",
			// 当前页面url
			url : document.URL,
			// 原生的adid
			oadid : $me.aidInfo.oaid,
			// 当前上报的广告顺序值，1开始计数
			lcount : defaultIdx || 1,
			// 当前广告播放的时长,单位ms
			t : curTime * 1000
		};
	}

	/**
	 * H5 loading广告类
	 * 
	 */
	xplayer.Html5LoaingAd = function() {
		this.onStart = this.onEnd = this.onPause = $.noop;
		/**
		 * 当前视频广告标记:1-华纳美剧
		 * @type Number 
		 */
		this.adFlag = -1;
		/**
		 * 当前视频请求aid返回的数据
		 */
		this.aidInfo = {};
		$me = this;
	}
	xplayer.Html5LoaingAd.fn = xplayer.Html5LoaingAd.prototype = {
		/**
		 * 检测是否用户登录
		 */
		isLogin : function() {
			return txv.login && txv.login.isLogin();
		},

		/**
		 * 打开登录框
		 * @param {Function} cb 登录成功的回调
		 */
		openLogin : function(cb) {
			cb = $.isFunction(cb) ? cb : $.noop;
			if (txv.login) {
				txv.login.openLogin({
					        success : cb
				        });
			}
			else {
				cb();
			}
		},

		/**
		 * 返回当前用户是否是会员等信息，
		 *  0 未登录 
		 *	1 登录的普通用户
		 *	2 登录的好莱坞会员
		 *	3 （被其他业务占用）
		 *	4 登录的qq会员
		 *	5 登录的超级会员
		 *	90 登录的普通用户+登录的qq会员+登录的超级会员
		 * @return {Number} 
		 */
		getUserStatus : function() {
			var info = userStatusDef.UNKNOWN;
			if (curUserVipInfo != -1) {// 当aid cgi有返回用户身份信息时使用cgi的数据
				switch (parseInt(curUserVipInfo, 10)) {
					case 1 : {
						info = userStatusDef.HLWVIP;
						break;
					}
					case 2 : {
						info = userStatusDef.QQVIP;
						break;
					}
					case 3 : {
						info = userStatusDef.QQSVIP;
						break;
					}
					case 0 : {
						info = userStatusDef.LOGIN;
						break;
					}
				}
			}
			else if ($.isFunction(window.__tenplay_getuinfo)) {
				info = window.__tenplay_getuinfo();
			}
			return info;
		},

		/**
		 * 根据广告位获取广告数据
		 * @param {Object} aid返回的数据对象
		 * @param {Function} 回调
		 */
		getAdData : function(data, cb) {
			var cgi = "http://livew.l.qq.com/livemsg?", xhr,
				startTime = $.now();
			cb = $.isFunction(cb) ? cb : $.noop;
			if (typeof XMLHttpRequest != 'function' && typeof XMLHttpRequest != 'object') {//不支持xhr，直接返回
				cb();
				return;
			}
			xhr = new XMLHttpRequest();
			if (!("withCredentials" in xhr)) {//不支持跨域xhr，直接返回
				cb();
				return;
			}
			cgi += xplayer.$.param({
				        pf : pf,
				        ad_type : "WL",
				        l : data.aid,
				        url : location.href,
				        ty : "web",
				        l : data.aid,
				        plugin : ver,
				        v : xplayer.ver,
				        dura : $me.aidInfo.duration || $me.player.curVideo.getDuration(),
				        coverid : $me.player.curVideo.getCoverId(),
				        vid : $me.player.curVideo.getFullVid(),
				        oadid : $me.aidInfo.oaid,
				        vptag : !$.isUndefined(window.Live) && Live.mypv && $.isFunction(Live.mypv.getPtag) ? Live.mypv.getPtag() : "",
				        tpid : $me.player.curVideo.getTypeId()
			        });
			// 设置超时时间ms
			xhr.timeout = 5000;
			xhr.ontimeout = function() {
				reportFn({
					        itype : 2,
					        val : 500,
					        val2 : data.aid,
					        speed : $.now() - startTime
				        });
				errorHandle(2, 505);
			};
			xhr.onreadystatechange = function() {
				var json = {};
				if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText) {
					reportFn({
						        itype : 2,
						        val : 0,
						        val2 : data.aid,
						        speed : $.now() - startTime
					        });
					json = $.xml2json(xhr.responseXML || xhr.responseText);
					if (json) {
						cb(json);
					}
					else {
						errorHandle(2, 500);
					}
				}
				else if (xhr.readyState == 4) {
					reportFn({
						        itype : 2,
						        val : 500,
						        val2 : data.aid,
						        speed : $.now() - startTime
					        });
					errorHandle(2, xhr.status || 500);
				}
			};
			xhr.open('GET', cgi, true);
			xhr.withCredentials = true;
			reportFn({
				        itype : 2,
				        val : 0,
				        val2 : data.aid
			        });
			xhr.send();
		},

		/**
		 * 请求aid获取广告位
		 * cgi wiki:http://tapd.oa.com/v3/tvideo/wikis/view/%2525E5%2525B9%2525BF%2525E5%252591%25258A%2525E4%2525BD%25258D%2525E6%25259F%2525A5%2525E8%2525AF%2525A2%2525E6%25258E%2525A5%2525E5%25258F%2525A3%2525E8%2525AF%2525B4%2525E6%252598%25258E
		 */
		getAdId : function() {
			var cgi = "http://aid.video.qq.com/fcgi-bin/aid?otype=json",
				video = $me.player.curVideo,
				startTime = $.now();
			reportFn({
				        itype : 1,
				        val : 0
			        });
			curUserVipInfo = -1;
			$.ajax({
				        url : cgi,
				        dataType : "jsonp",
				        data : {
					        cid : video.getCoverId(),
					        vid : video.getFullVid(),
					        idx : video.getIdx(),
					        adtype : 0,// 广告类型:0-loading，1-暂停，2-角标，3-后贴片，5-大看板，6-插播
					        url : document.URL,
					        from : from, // ipad-h5
					        refer : document.referrer,
					        pu : $me.getUserStatus()
				        }
			        }).done(function(json) {
				        if (json && 'aid' in json) {
					        reportFn({
						                itype : 1,
						                val : 0,
						                val2 : json.aid,
						                speed : $.now() - startTime
					                });
					        curUserVipInfo = json.isvip;
					        $me.adFlag = json.adFlag;
					        $me.aidInfo = json;
					        $me.getAdData(json, function(json) {
						                orderList = [];
						                if (json && json.adList) {
							                if (json.adList.item) {
								                if ($.isArray(json.adList.item)) {
									                orderList = json.adList.item;
								                }
								                else if (json.adList.item.image) {
									                orderList.push(json.adList.item);
								                }
							                }
						                }
						                orderList = filterOrderList(orderList);
						                if (orderList.length > 0) {
							                curIdx = 0;
							                getPlayUrl(orderList[0]).done(function(data) {
								                        $me.play(data);
							                        });
						                }
						                else {
							                endHandle();
						                }
					                });
				        }
				        else {
					        errorHandle(1, 500);
				        }
			        }).fail(function() {
				        errorHandle(1, 404);
			        });
		},

		play : function(data) {
			var $video = $me.player.$video,
				videoTag = $me.player.videoTag;
			if (!data || !data.url || data.width == 0 || data.height == 0) {
				$me.next();
				return;
			}
			if (!($.browser.WeChat) && "setAttribute" in videoTag) {
				videoTag.setAttribute("src", data.url);
			}
			else {
				videoTag.src = data.url;
			}
			stepReport(0);
			$video.off("ended", onPlayAdEnd).one("ended", onPlayAdEnd).one("playing", function() {
				        if (!isPlayingAd) {
					        return;
				        }
				        else {
					        if ($me.player && $me.player.config && $me.player.config.autoplay === false) {// 已经开始播放广告了，强制设置正片自动播放
						        $me.player.$video.one('xplayer:video:src', function() {
							                this.load();
							                this.play();
						                });
						        $me.player.config.autoplay = true;
					        }
				        }
				        if ($me.config.$control && $me.config.$moreLink) {
					        $me.config.$control.removeClass(hideCls);
					        $me.config.$moreLink.removeClass(hideCls);
				        }
				        if ($me.adFlag == 1 && $me.config.$skipLink) {
					        if ($me.getUserStatus() == userStatusDef.HLWVIP) {
						        $me.config.$skipLink.removeClass(hideCls);
					        }
					        else {
						        $me.config.$skipLink.addClass(hideCls);
					        }
				        }
				        stepReport(1);
				        reportFn({
					                itype : 7,
					                val : ($me && $me.aidInfo) ? $me.aidInfo.oaid : ""
				                });
			        });
			$me.onStart();
			videoTag.load();
			videoTag.play();
			isPlayingAd = true;
			onPlaying($video, curIdx);
		},

		/**
		 * 播放下一则广告
		 */
		next : function() {
			curIdx++;
			if ($.isArray(orderList) && orderList[curIdx]) {
				getPlayUrl(orderList[curIdx]).done(function(url) {
					        $me.play(url);
				        });
			}
			else {
				endHandle();
			}
		},

		/**
		 * 开始创建广告播放器
		 */
		create : function(player, config) {
			if (!player || $.isUndefined(txv)) {
				$me.onEnd();
				return;
			}
			var s = {
				$container : null,
				$control : null,
				$countdownContainer : null,
				$skipLink : null,
				$moreLink : null,
				$adLink : null,
				$copyrightTips : null
			};
			this.config = $.extend(s, config);
			this.player = player;
			$me.getAdId();
			$me.config.$adLink.hide();
			if (player.$video) {
				if (this.config.$control && this.config.$moreLink) {
					this.config.$control.addClass(hideCls);
					this.config.$moreLink.addClass(hideCls);
				}
				if (this.config.$copyrightTips) {
					this.config.$copyrightTips.on("touchend", ".xplayer_btn_close,.xplayer_ads_btn", function() {
						        $me.config.$copyrightTips.addClass(hideCls);
						        $me.player.videoTag.play();
						        $me.config.$container.addClass("xplayer_ads_ontop");
					        });
				}
				player.$video.on("timeupdate", function() {
					        if (isPlayingAd && $.isFunction(onTimeupdateHandle)) {
						        onTimeupdateHandle(this);
					        }
				        }).on("pause paused", function() {
					        if (isPlayingAd && $me.config.$adLink && $.isFunction($me.config.$adLink.hide)) {
						        var curLink = $me.config.$adLink.attr("href");
						        $me.config.$adLink.attr("data-link", curLink).attr("href", "javascript:;").attr("target", "self");
						        $me.config.$adLink.hide();
						        reportFn({
							                itype : 3
						                });
					        }
				        }).on("play", function() {
					        setTimeout(function() {
						                if (isPlayingAd && $me.config.$adLink && $.isFunction($me.config.$adLink.show)) {
							                var curLink = $me.config.$adLink.attr("data-link");
							                if (curLink) {
								                $me.config.$adLink.attr("href", curLink).attr("target", "_blank");
								                $me.config.$adLink.show();
							                }
						                }
					                }, 500);
				        });
			}
			if (txv.login) {
				txv.login.addLoginCallback(function() {
					        curUserVipInfo = -1;
				        });
				txv.login.addLogoutCallback(function() {
					        curUserVipInfo = -1;
				        });
			}
		},

		/**
		 * 跳过广告的处理逻辑
		 */
		skipAd : function() {
			var $self = this;
			function loginCb() {
				var curStatus = $self.getUserStatus();
				$self.config.$skipLink.attr({
					        target : "self",
					        href : "javascript:;"
				        });
				switch (parseInt(curStatus, 10)) {
					case userStatusDef.NOTLOGIN : { // 未登录
						$self.openLogin(function() {
							        loginCb();
						        });
						$self.player.videoTag.pause();
						break;
					}
					case userStatusDef.HLWVIP : { // 好莱坞会员
						if ($me.adFlag == 1) {// 华纳美剧不能去广告
							$me.config.$copyrightTips && $me.config.$copyrightTips.removeClass(hideCls);
							$me.config.$container.addClass("xplayer_ads_ontop");
							$self.player.videoTag.pause();
						}
						else {
							endHandle();
						}
						break;
					}
					case userStatusDef.QQVIP : // 普通QQ会员
					case userStatusDef.QQSVIP : {// 超级QQ会员
						if ($me.adFlag == 1) {// 华纳美剧不能去广告
							$me.config.$copyrightTips && $me.config.$copyrightTips.removeClass(hideCls);
							$me.config.$container.addClass("xplayer_ads_ontop");
							$self.player.videoTag.pause();
						}
						else if ($self.player.getCurTime() >= qqvipSkipAdLimitTime) {// QQ会员播放超过5秒可以跳过当前这一则广告
							$self.next();
						}
						else {
							$self.player.videoTag.play();
						}
						break;
					}
					default : {
						$self.player.videoTag.pause();
						$self.config.$skipLink.attr({
							        target : "_blank",
							        href : openVipLink
						        });
						break;
					}
				}
			}
			if (!$self.isLogin()) {
				$self.openLogin(function() {
					        loginCb();
				        });
				$self.player.videoTag.pause();
			}
			else {
				loginCb();
			}
		}
	};
})(xplayer, xplayer.$);