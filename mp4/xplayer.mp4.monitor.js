(function(tvp, $) {
	$.extend(tvp.MP4Link.fn, {
		buildmonitor: function() {
			if($.isUndefined(tvp.H5Monitor)){
				return;
			}
			var t = this,
				monitor = null;

			this.$mp4linker.on("tvp:mp4:ajaxstart", function(e, vid) {
				monitor = null;
				monitor = new tvp.H5Monitor(vid, t);
				monitor.addStep(1011);
			}).on("tvp:mp4:ajaxsuc", function() {
				monitor.reportStep(1011, {
					val1: 1,
					val2: 0
				});
			}).on("tvp:mp4:src", function() {
				monitor.report(4, 1);
			}).on("click",function(){
				if(monitor && $.isFunction(monitor.report)){
					monitor.report(6, 1);	
				}
			});
		}
	});
})(tvp, tvp.$);