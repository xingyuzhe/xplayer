;
(function($) {
	$.extend(tvp.html5skin, {
		html: (function() {
			return [
				'<div class="tvp_container tvp_controls_hide">',
				'	<% if(!!feature.title) {%>',
				// 标题 开始 
				'		<div class="tvp_titles">',
				'			<strong class="tvp_title"><span></span></strong>',
				//'			<div class="tvp_button tvp_button_back">',
				//'				<button type="button" title="返回"><span class="tvp_btn_value">返回</span></button>',
				//'			</div>',
				'		</div>',
				// 标题 结束 
				'	<% } %>',
				'	<div class="tvp_video">', '$VIDEO$', '</div>',
				// '	<% if(!!feature.logo) {%>',
				// // logo 开始 
				// '	<div class="tvp_logo">',
				// '			<a class="tvp_logo_btn"></a>',
				// '	</div>',
				// // logo 结束 
				// '	<% } %>',
				// 控制栏开始 
				'	<% if(!!feature.controlbar) {%>',
				'	<div class="tvp_controls">',

				// 进度条开始 
				'		<% if(!!feature.progress) {%>',
				'		<div class="tvp_time_rail">',
				'			<% if(!!feature.timepanel) {%>',
				'			<span class="tvp_time_panel_current">00:00</span>',
				'			<% } %>',
				'			<span class="tvp_time_total" >',
				'				<span class="tvp_time_loaded" ></span>',
				'				<span class="tvp_time_current"><span class="tvp_time_handle"></span></span>',
				'			</span>',
				'			<% if(!!feature.timepanel) {%>',
				'			<span class="tvp_time_panel_total">00:00</span>',
				'			<% } %>',
				'		</div>',
				'		<% } %>',
				// 进度条结束 
				// 提示信息 
				'		<span class="tvp_time_handel_hint" style="display:none"></span>',
				// 播放暂停开始 
				'		<% if(!!feature.playpause) {%>',
				'		<div class="tvp_button tvp_playpause_button tvp_play">',
				'			<button type="button" title="播放/暂停"><span class="tvp_btn_value">播放</span></button>',
				'		</div>',
				'		<% } %>',
				// 播放暂停结束 
				// 下载App文字提示开始
				'		<% if(!!feature.promotion) {%>',
				'		<div class="tvp_promotion" style="display:none;">',
				'			<a href="https://itunes.apple.com/cn/app/id407925512?mt=8" target="_blank">安装腾讯视频iPad客户端 &gt;&gt;</a>',
				'		</div>',
				'		<% } %>',
				// 下载App文字提示结束
				'		<% if(!!feature.fullscreen) {%>',
				'		<div class="tvp_button tvp_fullscreen_button tvp_fullscreen">',
				'			<button type="button" title="切换全屏"><span class="tvp_btn_value">全屏</span></button>',
				'		</div>',
				'		<% } %>',
				// 清晰度选择 开始 
				'		<% if(!!feature.definition) {%>',
				'		<div class="tvp_button tvp_definition _tvp_definition_" style="display:none">',
				'			<div class="tvp_definition_button"><span>清晰度</span></div>',
				'			<div class="tvp_definition_list"></div>',
				'		</div>',
				'		<% } %>',
				// 清晰度选择 结束 
				// 字幕选择 开始 
				'		<% if(!!feature.track) {%>',
				// '		<div class="tvp_button tvp_definition _tvp_track_" style="display:none">',
				// '			<div class="tvp_definition_button"><span>字幕</span></div>',
				// '			<div class="tvp_definition_list"></div>',
				// '		</div>',
				'		<% } %>',
				// 清晰度选择 结束 
				'	</div>',
				'	<% } %>',
				// 控制栏结束

				'	<% if(!!feature.overlay) {%>',
				// loading图标 开始 
				'	<div class="tvp_overlay_loading tvp_none" style="z-index:5">',
				'		<span class="tvp_icon_loading"></span>',
				'	</div>',
				// loading图标 结束 

				// 播放大按钮 开始   
				'	<div class="tvp_overlay_play">',
				'		<span class="tvp_button_play"></span>',
				'	</div>',
				// 播放大按钮 结束   
				'	<% } %>',

				'	<% if(!!feature.meta) {%>',
				// meta 开始 
				'	<div class="tvp_meta_info">',
				'		<span class="tvp_meta_duration"></span>',
				'		<span class="tvp_meta_length"></span>',
				'	</div>',
				// meta 结束 
				'	<% } %>',				

				'	<% if(!!feature.bigben) {%>',
				'	<div class="tvp_overlay_bigben">',
				'		<div class="tvp_overlay_content">',
				'			<i class="tvp_ico_ff_rw tvp_ico_ff"></i><span class="tvp_text tvp_overlay_bigben_text">0:03:12</span>',
				'			<span class="tvp_time_total_small"><span class="tvp_time_current_small"></span></span>',
				'		</div>',
				'	</div>',
				'	<% } %>',

				'	<% if(!!feature.posterlayer) {%>',
				'	<div class="tvp_overlay_poster" style="display:none;">',
				'		<img class="tvp_poster_img"/>',
				'	</div>',
				'	<% } %>',

				// 功能性提示 开始 
				'	<% if(!!feature.tips) {%>',
				'	<div class="tvp_overlay_tips tvp_none">',
				'		<div class="tvp_overlay_content">',
				'			<span class="tvp_text"></span> ',
				'		</div>',
				'	</div>',
				'	<% } %>',
				// 功能性提示 结束
				
				//loading广告开始
				'	<% if(!!feature.loadingAd) {%>',
				'	<div class="tvp_shadow"></div>',
				'	<div class="tvp_ads" style="display:none;">',
				'		<div class="tvp_ads_inner" style="width:100%;height:100%;">',
				'			<div class="tvp_ads_content"><a href="javascript:;" class="tvp_ads_link"></a></div>',
				'			<div class="tvp_ads_control tvp_none">',
				'				<a href="javascript:;" class="tvp_ads_skip tvp_none">',
				'					<span class="tvp_ads_countdown"></span>',
				'					<span class="tvp_ads_skip_text">跳过广告</span>',
				'				</a>',
				'				<div class="tvp_ads_qqvip_skip tvp_none">',
				'					<span class="tvp_ads_remain">【剩余 <span class="_remain"></span> 则广告】</span>',
				'					<span class="tvp_ads_desc">',
				'						您是尊贵的<span class="_vipname">QQ会员</span> <span class="_remaintime"><em class="tvp_ads_num"></em>秒后</span>可',
				'						<a href="javascript:;" class="tvp_ads_skip_text">跳过此广告</a>',
				'					</span>',
				'				</div>',
				'			</div>',
				'			<a href="javascript:;" class="tvp_btn_ads_more tvp_none">',
				'				详情点击 <i class="tvp_icon_arrow"></i>',
				'			</a>',
				'			<div class="tvp_ads_copyright tvp_none">',
				'				<div class="tvp_ads_text">应版权方的要求，好莱坞会员无法免除该部电视剧的广告，请您谅解！</div>',
				'				<div class="tvp_ads_btn">我知道了！</div>',
				'				<span class="tvp_btn_close">✕</span>',
				'			</div>',
				'		</div>',
				'	</div>',
				'	<% } %>',
			   //loading广告结束
				'</div>'].join("");
		})(),
		definitionList: (function() {
			return [
				'<ul>',
				'	<% for(var p in data.list) { %><% if(data.curv!=p){ %>',
				'	<li data-fmt="<%=p%>">',
				'		<span><%=data.list[p]%></span>',
				'	</li>',
				'	<% } }%>',
				'</ul>'].join("");
		})(),
		/**
		 * 不支持svg时需要添加的classname
		 * @type {String}
		 */
		noSVGClassName: "tvp_no_svg",

		/**
		 * DOM元素集合
		 * @type {Object}
		 */
		elements: {
			title: {
				main: ".tvp_titles",
				text: ".tvp_title span"
			},
			// logo: {
			// 	main: ".tvp_logo",
			// 	btn: ".tvp_logo_btn"
			// },
			/**
			 * 默认初始显示的时长及文件大小信息
			 */
			meta :{
				main:".tvp_meta_info",
				duration:".tvp_meta_duration",
				filesize:".tvp_meta_length"
			},		
			/**
			 * 播放器UI最外层容器
			 * @type {String}
			 */
			layer: ".tvp_container",
			/**
			 * 播放器控制栏
			 * @type {String}
			 */
			control: ".tvp_controls",
			/**
			 * 播放暂停按钮
			 * @type {String}
			 */
			play: ".tvp_playpause_button",
			/**
			 * 遮罩层
			 * @type {Object}
			 */
			overlay: {
				/**
				 * 播放按钮
				 * @type {String}
				 */
				play: ".tvp_overlay_play",
				/**
				 * 加载中按钮
				 * @type {String}
				 */
				loading: ".tvp_overlay_loading"
			},
			/**
			 * 进度条
			 * @type {Object}
			 */
			progress: {
				main: ".tvp_time_rail",
				cur: ".tvp_time_current",
				loaded: ".tvp_time_loaded",
				total: ".tvp_time_total",
				handle: ".tvp_time_handle",
				tips: ".tvp_time_float"
			},
			fullscreen: ".tvp_fullscreen_button",
			timePanel: {
				cur: ".tvp_time_panel_current",
				total: ".tvp_time_panel_total"
			},
			bigben: {
				main: ".tvp_overlay_bigben",
				desc: ".tvp_overlay_bigben_text",
				ffrw: ".tvp_ico_ff_rw",
				bar: ".tvp_time_current_small"
			},
			/**
			 * 清晰度
			 * @type {Object}
			 */
			definition: {
				/**
				 * 主面板
				 * @type {String}
				 */
				main: "._tvp_definition_",
				/**
				 * 控制栏上展示清晰度的按钮
				 * @type {String}
				 */
				button: "._tvp_definition_ .tvp_definition_button > span",
				/**
				 * 选择清晰度的列表
				 * @type {String}
				 */
				list: "._tvp_definition_ .tvp_definition_list"
			},
			track: {
				/**
				 * 主面板
				 * @type {String}
				 */
				main: "._tvp_track_",
				/**
				 * 控制栏上展示清晰度的按钮
				 * @type {String}
				 */
				button: "._tvp_track_ .tvp_definition_button > span",
				/**
				 * 选择清晰度的列表
				 * @type {String}
				 */
				list: "._tvp_track_ .tvp_definition_list"
			},
			/**
			 * 封面图图层
			 * @type {Object}
			 */
			posterlayer: {
				/**
				 * 主面板
				 * @type {String}
				 */
				main: ".tvp_overlay_poster",
				/**
				 * 图片img元素
				 * @type {String}
				 */
				img: ".tvp_poster_img"
			},
			/**
			 * 功能性tips
			 * @type {Object}
			 */
			tips: {
				/**
				 * 面板div
				 * @type {String}
				 */
				main: ".tvp_overlay_tips",
				/**
				 * 文案显示区域
				 * @type {String}
				 */
				desc: " .tvp_overlay_tips .tvp_text"
			},
			/**
			 * 下载App文字提示
			 * @type {Object}
			 */
			promotion: {
				/**
				 * 主面板div
				 * @type {String}
				 */
				main: ".tvp_promotion",
				/**
				 * 链接
				 * @type {String}
				 */
				link: ".tvp_promotion >a"
			},
			/**
			 * loading广告
			 * @type {Object}
			 */
			loadingAd : {
				/**
				 * 主面板div
				 * @type {String}
				 */
				main : ".tvp_ads",
				/**
				 * 控制跳过广告和倒计时容器
				 * @type {String}
				 */
				control : ".tvp_ads_control",
				/**
				 * 倒计时容器
				 * @type {String}
				 */
				countdown : ".tvp_ads_countdown",
				/**
				 * 跳过广告按钮
				 * @type {String}
				 */
				skip : ".tvp_ads_skip",
				/**
				 * QQ会员去广告模块
				 */
				qqVipSkip : ".tvp_ads_qqvip_skip",
				/**
				 * 广告详情链接
				 * @type {String}
				 */
				more : ".tvp_btn_ads_more",
				/**
				 * 广告遮罩链接
				 * @type {String}
				 */
				adLink : ".tvp_ads_link",
				/**
				 * 版权方要求不能去广告提示
				 * @type {String}
				 */
				copyrightTips : ".tvp_ads_copyright"
			}
		},
		/**
		 * 获取播放器HTML字符串
		 * @param  {object} cfg 配置项
		 * @return {String}     返回得到的播放器HTML字符串
		 */
		getHtml: function(cfg) {
			var render = tvp.$.tmpl(tvp.html5skin.html),
				featureData = {};
			tvp.$.each(cfg.type == tvp.PLAYER_DEFINE.LIVE ? cfg.html5LiveUIFeature : cfg.html5VodUIFeature, function(i, v) {
				featureData[v] = true;
			});
			tvp.$.each(cfg.html5ForbiddenUIFeature, function(i, v) {
				featureData[v] = false;
			});
			return render({
				"feature": featureData
			});
		}
	})
})(tvp.$);