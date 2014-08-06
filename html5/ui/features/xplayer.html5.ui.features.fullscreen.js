;
(function(tvp, $) {
	var $fullscreen = null,
		scrollTop = 0,
		parentStyle="",
		frameStyle = "",
		fakeStyle = "";
	$.extend(tvp.Html5Player||{}, {
		isFullScreen: false
	});

	$.extend(tvp.Html5UI.fn, {
		buildfullscreen: function(player, $video, $control, $UILayer) {
			var videoTag = $video[0],
				t = this;

			$fullscreen = $control.find(tvp.html5skin.elements.fullscreen);

			//绑定全屏按钮
			$fullscreen.on($.os.hasTouch ? "touchend" : "click", function() {
				//解决android系统全屏后返回暂停出原生皮肤的问题
				if($.os.android && t.player.config.isHtml5UseFakeFullScreen){
					$video.removeClass('tvp_video_with_skin');
				}				
				if (t.checkIsFullScreen()) {
					t.cancelFullScreen();
				} else {
					t.enterFullScreen();
				}
			});

			// webkit内核的特性
			if ("onwebkitfullscreenchange" in $UILayer[0]) {
				document.addEventListener("webkitfullscreenchange", function () {
					if(document.webkitIsFullScreen ){
						t.enterFullScreen();						
					}else{
						t.cancelFullScreen();	
					}
				}, false);
			} else {
				//ios独有的特性,但不会触发上述onwebkitfullscreenchange
				//详见 apple官方参考文档 :
				//http://developer.apple.com/library/safari/#documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/ControllingMediaWithJavaScript/ControllingMediaWithJavaScript.html#//apple_ref/doc/uid/TP40009523-CH3-SW1
				$video.bind("webkitendfullscreen ", function() {
					t.cancelFullScreen();
				});
			}

			//绑定键盘Esc按钮
			$(document).on("keydown", function(e) {
				if (document.webkitIsFullScreen && e.keyCode == 27) {
					t.cancelFullScreen();
				}
			});

			//重写播放器全屏API
			$.extend(tvp.Html5Player.fn, {
				"enterFullScreen": function() {
					t.enterFullScreen();

				},
				"cancelFullScreen": function() {
					t.cancelFullScreen();

				}
			})
		},

		/**
		 * 处理全屏按钮的样式
		 * @return {[type]} [description]
		 */
		fixClassName:function(enter){
			if(enter){
				$fullscreen.removeClass("tvp_fullscreen").addClass("tvp_unfullscreen");
			}
			else {
				$fullscreen.removeClass("tvp_unfullscreen").addClass("tvp_fullscreen");
			}
		},
		/**
		 * 判断当前是否是全屏
		 * @return {[type]} [description]
		 */
		checkIsFullScreen: function() {
			return $fullscreen.hasClass("tvp_unfullscreen")
		},
		/**
		 * 进入全屏
		 * @return {[type]} [description]
		 */
		enterFullScreen: function() {
			if(this.player.videoTag && this.player.videoTag.currentTime == 0 && $.os.ipad){//ipad没开始播放就先不要进入全屏
				return ;
			}
			if (this.player.config.isHtml5UseFakeFullScreen && !$.os.iphone) {
				this.enterFakeFullScreen();
			} else {
				this.enterRealFullScreen();
			}
			this.player.isFullScreen = true;
			this.player.callCBEvent("onfullscreen", true);
		},
		/**
		 * 取消全屏
		 * @return {[type]} [description]
		 */
		cancelFullScreen: function() {
			if (this.player.config.isHtml5UseFakeFullScreen && !$.os.iphone) {
				this.cancelFakeFullScreen();
			} else {
				this.cancelRealFullScreen();
			}
			this.player.isFullScreen = false;
			this.player.callCBEvent("onfullscreen", false);
		},
		/**
		 * 调用全屏API进入真正的全屏
		 * @return {[type]} [description]
		 */
		enterRealFullScreen: function() {
			var t = this,
				$video = t.$video,
				$fullscreen = this.$control.find(tvp.html5skin.elements.fullscreen);

			var videoTag = $video[0];
			if (videoTag.webkitRequestFullScreen) {
				videoTag.webkitRequestFullScreen();
			} else if(videoTag.webkitSupportsFullscreen) {
				//有时候video傻傻不知道已经退出全屏，此时直接调用enterFullscreen无效
				//需先调exit退出，再调enter进入全屏,fix by jarvanxing 2014-07-21
				videoTag.webkitExitFullscreen();
				videoTag.webkitEnterFullscreen();
			}

			//android中某些设备(比如三星s3)在iframe下有bug
			//全屏按钮样式不处理
			if(($.browser.WeChat||$.browser.MQQClient) && $.os.android){

			}
			else {
				this.fixClassName(1);
			}
			
			//$fullscreen.removeClass("tvp_fullscreen").addClass("tvp_unfullscreen");
		},
		/**
		 * 调用全屏API取消全屏
		 * @return {[type]} [description]
		 */
		cancelRealFullScreen: function() {
			var t = this,
				player = t.player,
				$UILayer = player.$UILayer,
				$video = t.$video,
				$fullscreen = this.$control.find(tvp.html5skin.elements.fullscreen);

			this.fixClassName(0);
			//$fullscreen.removeClass("tvp_unfullscreen").addClass("tvp_fullscreen");
			if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		},
		/**
		 * 处理iframe伪全屏的情况
		 * @return {[type]} [description]
		 */		
		allCancelFullScreen:function(){
			var fake = this.player.config.isHtml5UseFakeFullScreen && !$.os.iphone;
			//iframe页面
			if(fake && window!=top && this.player.config.appid == 10000 && $.os.android){
				try {
					frameElement.style.cssText = frameStyle;
				} catch (err) {
					this.player.config.isHtml5UseFakeFullScreen = false;
				}	
				this.cancelFullScreen();			
			}
			else {
				this.cancelFullScreen();
			}
		},
		/**
		 * 处理iframe伪全屏的情况
		 * @return {[type]} [description]
		 */
		allEnterFullScreen:function(){
			var fake = this.player.config.isHtml5UseFakeFullScreen && !$.os.iphone;
			//iframe页面
			if(fake && window!=top && this.player.config.appid == 10000&& $.os.android){
				try {
					frameStyle = frameElement.style.cssText;
					//frameElement.style.cssText = "position:fixed !important;left:0px;top:0px;width:100%;height:100%;z-index:1000";
					$(frameElement).css("position", "fixed !important")
						.css("left", "0px")
						.css("top", "0px")
						.css("width", "100%")
						.css("height", "100%").css("z-index", 1000);			
				} catch (err) {
					this.player.config.isHtml5UseFakeFullScreen = false;
				}	
				this.enterFullScreen();			
			}
			else {
				this.enterFullScreen();
			}			
		},		
		/**
		 * 进入伪全屏
		 */
		enterFakeFullScreen: function() {
			fakeStyle = this.player.$videomod[0].style.cssText;
			this.player.$videomod.css("position", "fixed !important")
				.css("left", "0px")
				.css("top", "0px")
				.css("width", "100%")
				.css("height", "100%").css("z-index", 1000);
			$fullscreen.removeClass('tvp_fullscreen');
			$fullscreen.addClass('tvp_unfullscreen');
		},
		/**
		 * 取消伪全屏API
		 * @return {[type]} [description]
		 */
		cancelFakeFullScreen: function() {
			this.player.$videomod[0].style.cssText = fakeStyle;
			$fullscreen.removeClass('tvp_unfullscreen');
			$fullscreen.addClass('tvp_fullscreen');
		}
	});
})(tvp, tvp.$);