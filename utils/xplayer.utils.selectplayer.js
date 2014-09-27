;(function($){

	function useWhichHtml5(type){
		if(type==xplayer.PLAYTYPE.LIVE){
			return "Html5Live";	
		}
		else{
			return "Html5Player";
		}		
	}
	function useDefaultVodPlayer(){
		if (xplayer.common.isEnforceMP4()) { // 有些浏览器强制走MP4
			return "MP4Link";
		}

		if (xplayer.common.isUseHtml5()) { // 能用HTML5的就用HTML5
			return useWhichHtml5();
		}
		// android 不支持的话直接走mp4了
		else if (xplayer.$.os.android) { 
			return "MP4Link";
		} else {
			return "FlashPlayer";
		}		
	}
	function selectVodPlayer(){
		cfg = cfg || {};
		var playerClass;
		switch (cfg.playerType) {
			case "flash":
				{
					playerClass = "FlashPlayer";
					break;
				}
			case "html5":
				{
					playerClass = useWhichHtml5();
					break;
				}
			case "mp4":
				{
					playerClass = "MP4Link";
					break;
				}
			default:
				{
					playerClass = this.useDefaultVodPlayer();
					break;
				}
		}
		return playerClass;
	}
	function useDefaultLivePlayer(){
		var playerClass;
		if (xplayer.common.isUseHtml5()) {
			playerClass = useWhichHtml5(xplayer.PLAYTYPE.LIVE);
		} 
		else if ( !!$.os.windows) {
			playerClass = "FlashLivePlayer";
		}
		else if ( !! xplayer.$.os.android) {
			playerClass = "FlashLivePlayer";
		}

		return playerClass;		
	}
	function selectLivePlayer(cfg){
		var playerClass;
		switch (cfg.playerType) {
			case "flash":
				{
					playerClass = "FlashLivePlayer";
					break;
				}
			case "html5":
				{
					playerClass = useWhichHtml5(xplayer.PLAYTYPE.LIVE);
					break;
				}
			default:
				{
					playerClass = useDefaultLivePlayer();
					break;
				}			
		}

		return playerClass;		
	}

	xplayer.utils.selectPlayer = function(cfg){
		cfg = cfg || {};
		var defer = $.Deferred(),
			playerClass;
		if(cfg.type==xplayer.PLAYTYPE.LIVE){
			playerClass = selectLivePlayer(cfg);
		}
		else {
			playerClass = selectVodPlayer(cfg);
		}

		defer.resolve(playerClass);
		return defer;
	}	

})(xplayer.$);
		