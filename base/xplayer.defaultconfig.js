
/**
 * 默认配置
 * @namespace xplayer.defaultConfig
 * @type {Object}
 */
xplayer.defaultConfig = {

	//========================= 公共配置开始 ======================
	/**
	 * 默认的视频镀锡i昂
	 * @type {xplayer.VideoInfo}
	 */
	video: null,
	/**
	 * 默认宽度，单位像素
	 * @type {Number}
	 */
	width: 600,
	/**
	 * 默认高度，单位像素
	 * @type {Number}
	 */
	height: 450,
	/**
	 * 是否自动播放
	 * @type {Boolean}
	 */
	autoplay: false,

	/**
	 * 是否静音
	 * @type {Boolean}
	 */
	mute: false,

	/**
	 * 默认音量
	 * @type {Number}
	 */
	volume: 50,
	/**
	 * 默认的DOM元素ID
	 * @type {String}
	 */
	modId: "mod_player",

	/**
	 * 播放器id，不指定的话系统会自动分配一个，一般不需要配置
	 * @type {String}
	 */
	playerid: "",

	/**
	 * 专辑id
	 * @type {String}
	 */
	coverId: "",

	/**
	 * 分类id
	 * @type {Number}
	 */
	typeId: 0,

	/**
	 * 默认loading图片
	 * @type {String}
	 */
	image: "",

	/**
	 * 播放器类别
	 * @type {Number}
	 */
	type: xplayer.PLAYTYPE.VOD,

	/**
	 * 播放器类别
	 * @type {String}
	 */
	playerType: "auto",

	/**
	 * loading动画的swf地址
	 * @type {String}
	 */
	loadingswf: "",

	/*
	 * 是否是付费模式
	 * @type {Boolean}
	 */
	isPay: false,

	/**
	 * 广告订单id
	 * @type {String}
	 */
	oid: "",

	/**
	 * 是否显示分享
	 * @type {String}
	 */
	share: true,

	//========================= 公共配置结束 ======================
	

	isHtml5UseHLS: "auto",
	/**
	 * 是否显示限播提示
	 * @type {Boolean}
	 */
	isShowDurationLimit:true,
	/**
	 * HTML5播放器是否使用autobuffer属性
	 * @type {Boolean}
	 */
	isHtml5AutoBuffer: false,
	/**
	 * HTML5播放器是否使用Airplay功能，强烈建议开启
	 * @type {Boolean}
	 */
	isHtml5UseAirPlay: true,

	/**
	 * HTML5播放器是否一直显示控制栏
	 * @type {Boolean}
	 */
	isHtml5ControlAlwaysShow: false,

	/**
	 * HTML5播放器preload属性
	 * @type {String}
	 */
	html5Preload: "null",
	/**
	 * HTML5点播播放器UI组件
	 * @type {Array}
	 */
	html5VodUIFeature: [
		'controlbar',
		'tips',
		'title',
		'meta',
		'playpause',
		'progress',
		'timepanel',
		'definition',
		'fullscreen',
		"overlay",
		"bigben",
		"poster",
		"shadow",
		"promotion",
		"thumbs",
		"loadingAd"
	],

	/**
	 * HTML5直播播放器UI组件
	 * @type {Array}
	 */
	html5LiveUIFeature: [
		'controlbar',
		'tips',
		'playpause',
		'fullscreen',
		"overlay",
		"poster",
		"shadow"
	],

	/**
	 * HTML5UI组件功能异步加载JS配置，有些组件由于不是必须，而代码量又很大，所以采用按需加载
	 * 配置是JSON格式，key是组件名，value是异步加载的JS文件路径
	 * @type {Object}
	 */
	html5FeatureExtJS: {
		"track": "/js/widgets/h5_track.js"
	},

	/**
	 * HTML5播放器UI需要关闭的功能，跟上述的配置相反，这里列出的功能就不会展现
	 * @type {Array}
	 */
	html5ForbiddenUIFeature: [],

	/**
	 * HTML5播放器是否使用自设计的控制栏
	 * @type {Boolean}
	 */
	isHtml5UseUI: true,

	/**
	 * HTML5播放器自定义UI的CSS文件地址
	 * @type {[type]}
	 */
	HTML5CSSName: "player.css",

	/**
	 * HTML5播放开始的时候是否显示poster
	 * @type {Boolean}
	 */
	isHtml5ShowPosterOnStart: true,
	/**
	 * HTML5播放器播放完毕是否显示poster
	 * @type {Boolean}
	 */
	isHtml5ShowPosterOnEnd: false,

	/**
	 * HTML5播放器切换视频的时候是否要显示Poster
	 * @type {Boolean}
	 */
	isHtml5ShowPosterOnChange: true,

	/**
	 * iPhone在暂停的时候是否显示Poster层
	 * @type {Boolean}
	 */
	isiPhoneShowPosterOnPause: true,
	
	/**
	 * ios开启小窗播放
	 * @type {Boolean}
	 */
	isiPhoneShowPlayerinline:false,

	/**
	 * 暂停的时候是否显示播放按钮
	 * @type {Boolean}
	 */
	isHtml5ShowPlayBtnOnPause: true,

	/**
	 * 是否强制使用伪全屏
	 * @type {Boolean}
	 */
	isHtml5UseFakeFullScreen: false,

	/**
	 * ios系统播放器是否需要做偏移
	 * @type {Boolean}
	 */
	isIOSVideoOffset: true,

	/**
	 * 是否要在开始播放时展示Loading广告
	 * @type Boolean
	 */
	isHtml5ShowLoadingAdOnStart : false,
	
	/**
	 * 是否要在切换视频播放时展示Loading广告
	 * @type Boolean
	 */
	isHtml5ShowLoadingAdOnChange : true,
	

	//==========================================================================

	/**
	 * flash播放器的wmode
	 * @type {String}
	 */
	flashWmode: "direct",

	/**
	 * flash点播播放器地址
	 * @type {String}
	 */
	vodFlashUrl: "",

	/**
	 * flash点播播放器类型
	 * @type {String}
	 */
	vodFlashType: "TPout",

	/**
	 * flash点播播放器扩展flashvars参数
	 * @type {Object}
	 */
	vodFlashExtVars: {},

	/**
	 * 点播flash播放器listtype参数
	 * @type {Number}
	 */
	vodFlashListType: 2,

	/**
	 * flash点播播放器皮肤地址
	 * @type {String}
	 */
	vodFlashSkin: "",

	/**
	 * flash点播播放器是否出现设置按钮
	 * @type {Boolean}
	 */
	isVodFlashShowCfg: true,

	/**
	 * flash点播播放器播放结束出现结束推荐
	 * @type {Boolean}
	 */
	isVodFlashShowEnd: true,


	/**
	 * flash点播播放器是否出现搜索框
	 * @type {Boolean}
	 */
	isVodFlashShowSearchBar: true,


	/**
	 * flash点播播放器是否出现“下一个视频”按钮
	 * @type {Boolean}
	 */
	isVodFlashShowNextBtn: true,


	/**
	 * 直播播放器swf的url地址
	 * @type {String}
	 */
	liveFlashUrl: "",

	/**
	 * 直播播放器类型
	 * @type {String}
	 */
	liveFlashSwfType: "TencentPlayerLive",

	/**
	 * 直播播放器是否显示设置按钮
	 * @type {Boolean}
	 */
	isLiveFlashShowConfigBtn: true,


	/**
	 * 直播播放器是否显示全屏按钮
	 * @type {Boolean}
	 */
	isLiveflashShowFullBtn: true,


	/**
	 * 直播播放器是否显示配置菜单
	 * @type {Boolean}
	 */
	isLiveFlashShowCfg: true,

	/**
	 * 直播播放器右上角水印图片
	 * @type {String}
	 */
	liveFlashWatermark: "",

	/**
	 * 直播播放器皮肤类型
	 * @type {String}
	 */
	liveFlashAppType: "",

	/**
	 * 直播播放器扩展flashvars
	 * @type {Object}
	 */
	liveFlashExtVars: {},
	
	/**
	 * swf文件日期戳版本号
	 * @type String
	 */
	flashVersionTag : "20140811",	

	//========================插件配置=============================

	/**
	 * 使用插件列表，如果配置在这里那么会在write之后自动调用这里列出的插件
	 * 当然，用户自己写的插件也可以不用列在这里，直接在外部调用player.[pluginname]即可
	 * @type {Array}
	 */
	plugins: {
		/**
		 * 是否显示结束推荐
		 * @type {Boolean}
		 */
		Related: true
	},

	/**
	 * 插件JS存放路径，key是插件名，value是插件的JS路径，跟下面的libpath组合成完成的URL地址
	 * 如果定义了这里的路径，那么会异步加载，否则会探测当前页面是否有对应的build+插件名的函数
	 * @type {Object}
	 */
	pluginUrl: {
		"Related": "js/plugins/related.js?v=20140731",
	},

	/**
	 * css存放根目录
	 * @type {string}
	 */
	cssPath: "http://imgcache.gtimg.cn/tencentvideo_v1/vstyle/mobile/v2/style/",
	/**
	 * 插件css存放路径，key是插件名，value是插件的JS路径，跟上面的cssPath组合成完成的URL地址
	 * 插件的css地址都只从这里找
	 * @type {Object}
	 */
	pluginCssUrl: {
		"Related": "player_plugins_apprecommend.css?v=20140724"
	},
	/**
	 * 统一播放器框架的存放路径
	 * @type {String}
	 */
	libpath: "http://qzs.qq.com/tencentvideo_v1/xplayer/"

};