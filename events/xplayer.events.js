/**
 * Event namespace defintion for the x Player
 */
(function($) {
	xplayer.events = {
		// General Events
		COMPLETE : 'COMPLETE',
		ERROR : 'ERROR',

		// API Events
		API_READY : 'PLAYERAPIReady',
		PLAYER_READY : 'PLAYERReady',
		PLAYER_FULLSCREEN : 'PLAYERFullscreen',
		PLAYER_RESIZE : 'PLAYERResize',
		PLAYER_ERROR : 'PLAYERError',
		PLAYER_SETUP_ERROR : 'PLAYERSetupError',
		PLAYER_GETNEXT : 'PLAYERGetnext',

		// Media Events
		PLAYER_MEDIA_BEFOREPLAY : 'PLAYERMediaBeforePlay',
		PLAYER_MEDIA_BEFORECOMPLETE : 'PLAYERMediaBeforeComplete',
		PLAYER_COMPONENT_SHOW : 'PLAYERComponentShow',
		PLAYER_COMPONENT_HIDE : 'PLAYERComponentHide',
		PLAYER_MEDIA_BUFFER : 'PLAYERMediaBuffer',
		PLAYER_MEDIA_TIMEUPDATE : 'PLAYERMediaTimeupdate',
		PLAYER_MEDIA_BUFFER_FULL : 'PLAYERMediaBufferFull',
		PLAYER_MEDIA_ERROR : 'PLAYERMediaError',
		PLAYER_MEDIA_LOADED : 'PLAYERMediaLoaded',
		PLAYER_MEDIA_COMPLETE : 'PLAYERMediaComplete',
		PLAYER_MEDIA_SEEK : 'PLAYERMediaSeek',
		PLAYER_MEDIA_TIME : 'PLAYERMediaTime',
		PLAYER_MEDIA_VOLUME : 'PLAYERMediaVolume',
		PLAYER_MEDIA_META : 'PLAYERMediaMeta',
		PLAYER_MEDIA_MUTE : 'PLAYERMediaMute',
		PLAYER_MEDIA_LEVELS: 'PLAYERMediaLevels',
		PLAYER_MEDIA_LEVEL_CHANGED: 'PLAYERMediaLevelChanged',
		PLAYER_CAPTIONS_CHANGED: 'PLAYERCaptionsChanged',
		PLAYER_CAPTIONS_LIST: 'PLAYERCaptionsList',
        PLAYER_CAPTIONS_LOADED: 'PLAYERCaptionsLoaded',

		// State events
		PLAYER_STATE : 'PLAYERState',
		state : {
			BUFFERING : 'BUFFERING',
			IDLE : 'IDLE',
			PAUSED : 'PAUSED',
			PLAYING : 'PLAYING',
			END:'END',
			ALLEND:'ALLEND'
		},

		// Playlist Events
		PLAYER_PLAYLIST_LOADED : 'PLAYERPlaylistLoaded',
		PLAYER_PLAYLIST_ITEM : 'PLAYERPlaylistItem',
		PLAYER_PLAYLIST_COMPLETE : 'PLAYERPlaylistComplete',

		// Display CLick
		PLAYER_DISPLAY_CLICK : 'PLAYERViewClick',

		// Controls show/hide 
		PLAYER_CONTROLS : 'PLAYERViewControls', 
		PLAYER_USER_ACTION : 'PLAYERUserAction', 

		// Instream events
		PLAYER_INSTREAM_CLICK : 'PLAYERInstreamClicked',
		PLAYER_INSTREAM_DESTROYED : 'PLAYERInstreamDestroyed',

		// Ad events
		PLAYER_AD_TIME: "PLAYERAdTime",
		PLAYER_AD_ERROR: "PLAYERAdError",
		PLAYER_AD_CLICK: "PLAYERAdClicked",
		PLAYER_AD_COMPLETE: "PLAYERAdComplete",
		PLAYER_AD_IMPRESSION: "PLAYERAdImpression",
		PLAYER_AD_COMPANIONS: "PLAYERAdCompanions",
		PLAYER_AD_SKIPPED: "PLAYERAdSkipped",
		PLAYER_AD_PLAY: "PLAYERAdPlay",
		PLAYER_AD_PAUSE: "PLAYERAdPause",
        PLAYER_AD_META: "PLAYERAdMeta",


		// Casting
        PLAYER_CAST_AVAILABLE: 'PLAYERCastAvailable',
        PLAYER_CAST_SESSION: 'PLAYERCastSession',
        PLAYER_CAST_AD_CHANGED: 'PLAYERCastAdChanged'

	};

})(xplayer.$);
