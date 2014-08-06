;
(function(tvp, $) {
	//扩展基础插件
	$.extend(tvp.Html5Tiny.fn, {
		/**
		 * 创建播放质量监控
		 */
		buildmonitor: function() {
			var t = this,
				monitor = null,
				waitingTimes = 0,
				isUseHls = false;

			this.$video.on("tvp:video:ajaxstart", function(e, vid, hls) {
				isUseHls = hls;
				monitor = null;
				monitor = new tvp.H5Monitor(vid, t);
				monitor.addStep(isUseHls ? 1009 : 1011);
			}).on("tvp:video:ajaxsuc", function() {
				monitor.report(3, 1);
				monitor.reportStep(isUseHls ? 1009 : 1011, {
					val1: 1,
					val2: 0
				});
			}).on("tvp:video:src", function() {
				waitingTimes = 0;
				monitor.report(4, 1,{
					val2 : 1
				});
				monitor.addStep(6);
				monitor.addStep(30);

				t.$video.one("canplay", function() {
					monitor.reportStep(30, {
						"val1": 0,
						"val2": 2
					});
				}).one("error", function() {
					monitor.reportStep(30, {
						"val1": 1,
						"val2": 2
					});
					monitor.report(5, 0, {
						"val1": 3
					});
				}).one("playing", function() {
					monitor.reportStep(6, {
						"val1": 1
					});
					monitor.addStep(5);
					reportToBoss({
						itype : 1
					});
					t.$video.one("tvp:player:ended", function() {
						monitor.reportStep(5, {
							"val1": 1
						});
						reportToBoss({
							itype : 2
						});
					}).one("tvp:player:videochange", function() {
						monitor.reportStep(5, {
							"val1": 2
						});
						reportToBoss({
							itype : 3
						});
					});
				});
			}).on("waiting", function() {
				if (++waitingTimes == 1) return;
				if ( !! t.isDefinitionSwitching || !! t.isTouching) return;
				monitor.addStep(31);
				t.$video.one("timeupdate", report31)
			}).one("tvp:h5ui:playbtn:click",function(){
				reportToBoss({
					itype : 4
				});
			});

			var report31 = function() {
				var sp = monitor.reportTimer[monitor.getStepName(31)],
					tl = 0;
				if (!sp) {
					t.$video.off("timeupdate", report31);
					return;
				}
				tl = sp.getTimelong();
				monitor.report(31, Math.min(10000, tl), {
					"val1": tl > 10000 ? 1 : 0,
					"val2": 2,
					"ptime ": t.videoTag.currentTime
				});
				t.$video.off("timeupdate", report31);
			};
			
			/**
			 * 上报到boss和tdw
			 */
			var reportToBoss = function(_params){
				_params = _params || {};
				var params = {
					cmd : 3533,
					appId : t.config.appid || 0,
					contentId : t.config.contentId || "",
					vid : t.curVideo.getFullVid()
				}
				params = $.extend(params,_params);
				tvp.report(params);
			}
		}
	});
})(tvp, tvp.$);