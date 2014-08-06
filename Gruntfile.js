/*global module:false*/
module.exports = function(grunt) {
  grunt.file.defaultEncoding = 'utf8';
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + ' * Copyright (c) <%= grunt.template.today("yyyy") %>\n * Powered by <%= pkg.author.team%>' + ' \n*/\n',
    replace: {
      buildtime: { //每次merge或者build都会让tvp.define.js里的ver变量+1，modifytime自动变化为当前时间
        src: ['./common/tvp.define.js'],
        overwrite: true,
        replacements: [{
          from: /\$V2\.0Build(\d+)\$/,
          to: function(matchedWord, index, fullText, regexMatches) {
            return "$V2.0Build" + (parseInt(regexMatches[0]) + 1) + "$";
          }
        }, {
          from: /(tvp\.lastModify\W=\W)\"([^\"]+)\"/,
          to: function(matchedWord, index, fullText, regexMatches) {
            return regexMatches[0] + "\"<%= grunt.template.today('yyyy-mm-dd HH:MM:ss') %>\"";
          }
        }]
      }
    },
    concat: {
      options: {

      },
      //临时中间文件
      "tmp": {
        files: {
          '<%= pkg.cfg.temp %>tmp/video.js': // 视频对象
          [
            "./video/tvp.videoinfo.js",
            "./html5/tvp.html5-speedlimit.js",
            "./html5/tvp.html5-helper.js"
          ],
          "<%= pkg.cfg.temp %>tmp/report.js": //上报
          [
            "./common/tvp.report.js",
            "./common/tvp.retcode.js"
          ],
          "<%= pkg.cfg.temp %>tmp/core.js": //
          [
            "./common/tvp.define.js",
            "./libs/zepto-deferred.js",
            "./libs/zepto-bridge.js",
            "./common/tvp.$.extend.js",
            "./common/tvp.common.js",
            "./common/tvp.app.js",
            "./common/tvp.defaultconfig.js",
            "./common/tvp.$.tpl.js",
            "./common/tvp.$.getscript.js",
            "<%= pkg.cfg.temp %>tmp/report.js",
            "<%= pkg.cfg.temp %>tmp/video.js",
            "./base/tvp.baseplayer.js"
          ],
          "<%= pkg.cfg.temp %>tmp/zepto_and_core.js": //
          [
            "./libs/zepto.js",
            "./libs/zepto-iefix.js",
            "<%= pkg.cfg.temp %>tmp/core.js"
          ],
          "<%= pkg.cfg.temp %>tmp/core_for_jquery.js": //
          [
            "./common/tvp.define.js",
            "./common/tvp.$.extend.js",
            "./common/tvp.common.js",
            "./common/tvp.app.js",
            "./common/tvp.defaultconfig.js",
            "./common/tvp.$.tpl.js",
            "<%= pkg.cfg.temp %>tmp/report.js",
            "<%= pkg.cfg.temp %>tmp/video.js",
            "./base/tvp.baseplayer.js"
          ],
          "<%= pkg.cfg.temp %>tmp/core_for_zepto.js": //
          [
            "./common/tvp.define.js",
            "./libs/zepto-deferred.js",
            "./common/tvp.$.extend.js",
            "./common/tvp.common.js",
            "./common/tvp.app.js",
            "./common/tvp.defaultconfig.js",
            "./common/tvp.$.tpl.js",
            "./common/tvp.$.getscript.js",
            "<%= pkg.cfg.temp %>tmp/report.js",
            "<%= pkg.cfg.temp %>tmp/video.js",
            "./base/tvp.baseplayer.js"
          ],
          "<%= pkg.cfg.temp %>tmp/html5_baseskin.js": //
          [
            "./html5/tvp.html5-lang.js",
            "./html5/tvp.html5-skin.js"
          ],
          "<%= pkg.cfg.temp %>tmp/html5tiny.js": //
          [
            "./base/tvp.basehtml5.js",
            "./html5/tvp.html5tiny.js",
            "./html5/tvp.html5livetiny.js",
            "./html5/tvp.html5live-frontshow.js",
            "./html5/tvp.html5live-downloader.js",
            "./html5/tvp.h5-api-fullscreen.js",
            "./html5/tvp.h5-api-definiton.js",
            "./common/tvp.monitor.js",
            "./html5/tvp.html5-durationlimit.js",
            "./html5/tvp.h5-monitor.js"
          ],
          "<%= pkg.cfg.temp %>tmp/html5ui.js": //
          [
            "./common/tvp.$.tap.js",
            "./html5/tvp.html5-skin-ui.js",
            "./html5/tvp.h5-ui-main.js",
            "./html5/tvp.h5-ui-overlay.js",
            "./html5/tvp.h5-ui-tips.js",
            "./html5/tvp.h5-ui-title.js",
            "./html5/tvp.h5-ui-meta.js",
            "./html5/tvp.h5-ui-playpause.js",
            "./html5/tvp.h5-ui-timepanel.js",
            "./html5/tvp.h5-ui-progress-touch.js",
            "./html5/tvp.h5-ui-fullscreen.js",
            "./html5/tvp.h5-ui-bigben.js",
            "./html5/tvp.h5-ui-definiton.js",
            "./html5/tvp.h5-ui-poster.js",
            "./html5/tvp.h5-ui-shadow.js",
            "./html5/tvp.h5-ui-promotion.js",
            "./html5/tvp.h5-ui-loading-ad.js"
          ],
          "<%= pkg.cfg.temp %>tmp/html5player_and_ui.js": //
          [
            "<%= pkg.cfg.temp %>tmp/html5_baseskin.js",
            "./html5/tvp.html5player.js",
            "./html5/tvp.html5live.js",
            "<%= pkg.cfg.temp %>tmp/html5ui.js"
          ],
          "<%= pkg.cfg.temp %>tmp/mp4link.js": //
          [
            "./mp4/tvp.mp4link.js",
            "./mp4/tvp.mp4-monitor.js"
          ],
          "<%= pkg.cfg.temp %>tmp/flash.js": //
          [
            "./base/tvp.baseflash.js",
            "./flash/tvp.flashlive.js",
            "./flash/tvp.flashplayer.js"
          ],
          "<%= pkg.cfg.temp %>tmp/ocx_define.js": //
          [
            "./ocx/qqlivesetup.js",
            "./ocx/qqlivedefine.js"
          ],
          "<%= pkg.cfg.temp %>tmp/ocx_player.js": //
          [
            "<%= pkg.cfg.temp %>tmp/ocx_define.js",
            "./ocx/tvp.ocxplayer.js"
          ],
          "<%= pkg.cfg.temp %>tmp/create.js": //
          [
            "./common/tvp.livehub.js",
            "./tvp.player.js"
          ]
        }
      },
      //各种播放器内核模块碎片文件
      "module": {
        files: {
          "<%= pkg.cfg.temp %>concat/module/flashplayer.js": //
          [
            "./base/tvp.baseflash.js",
            "./flash/tvp.flashplayer.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/flashliveplayer.js": //
          [
            "./base/tvp.baseflash.js",
            "./flash/tvp.flashlive.js",
          ],
          "<%= pkg.cfg.temp %>concat/module/html5tiny.js": //
          [
            "<%= pkg.cfg.temp %>tmp/html5_baseskin.js",
            "./base/tvp.basehtml5.js",
            "./html5/tvp.html5tiny.js",
            "./html5/tvp.h5-api-fullscreen.js",
            "./html5/tvp.h5-api-definiton.js",
            "./html5/tvp.html5-durationlimit.js",
            "./common/tvp.monitor.js",
            "./html5/tvp.h5-monitor.js"

          ],
          "<%= pkg.cfg.temp %>concat/module/html5player.js": //
          [
            "<%= pkg.cfg.temp %>concat/module/html5tiny.js",
            "./html5/tvp.html5player.js",
            "<%= pkg.cfg.temp %>tmp/html5ui.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/html5livetiny.js": //
          [
            "./html5/tvp.html5-skin.js",
            "./html5/tvp.html5-lang.js",
            "./base/tvp.basehtml5.js",
            "./html5/tvp.html5livetiny.js",
            "./html5/tvp.html5live-frontshow.js",
            "./html5/tvp.html5live-downloader.js",
            "./html5/tvp.h5-api-fullscreen.js",
            "./common/tvp.monitor.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/html5live.js": //
          [
            "<%= pkg.cfg.temp %>concat/module/html5livetiny.js",
            "./html5/tvp.html5live.js",
            "<%= pkg.cfg.temp %>tmp/html5ui.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/mp4link.js": //
          [
            "./base/tvp.basehtml5.js",
            "<%= pkg.cfg.temp %>tmp/mp4link.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/ocxplayer.js": //
          [
            "<%= pkg.cfg.temp %>tmp/ocx_player.js"
          ],
          //纯洁版控件，只有tvp.OcxPlayer 没有QQLiveSetup之类的东西，因为有些打包的播放器JS已经包含了
          "<%= pkg.cfg.temp %>concat/module/ocxplayerlite.js": //
          [
            "./ocx/tvp.ocxplayer.js"
          ]
        }
      },
      /**
       * 针对各种底层库的JS，这些JS本身没有播放器内核，全靠异步载入
       */
      "playerjs": {
        files: {
          "<%= pkg.cfg.temp %>concat/tvp.player_v2.js": //
          [
            "<%= pkg.cfg.temp %>tmp/zepto_and_core.js",
            "<%= pkg.cfg.temp %>tmp/ocx_define.js",
            "<%= pkg.cfg.temp %>tmp/create.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_jq.js": //
          [
            "./libs/jquery-bridge.js",
            "<%= pkg.cfg.temp %>tmp/core_for_jquery.js",
            "<%= pkg.cfg.temp %>tmp/ocx_define.js",
            "<%= pkg.cfg.temp %>tmp/create.js",
            "./tvp.jq_zepto_fn.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_jqmobi.js": //
          [
            "./libs/jqmobi-bridge.js",
            "<%= pkg.cfg.temp %>tmp/core_for_jquery.js",
            "./libs/zepto-deferred.js",
            "./common/tvp.$.getscript.js",
            "<%= pkg.cfg.temp %>tmp/create.js",
            "./tvp.jq_zepto_fn.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_zepto.js": //
          [
            "<%= pkg.cfg.temp %>tmp/core_for_zepto.js",
            "<%= pkg.cfg.temp %>tmp/create.js",
            "./tvp.jq_zepto_fn.js"
          ],
        }
      },
      /**
       * 针对各个业务打包的专属JS，这些JS包含了需要的一些播放器内核，不需要异步加载
       */
      "businessjs": {
        files: {
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_mobile.js": //
          [
            "<%= pkg.cfg.temp %>tmp/zepto_and_core.js",
            '<%= pkg.cfg.temp %>tmp/html5_baseskin.js',
            "<%= pkg.cfg.temp %>tmp/html5tiny.js",
            "<%= pkg.cfg.temp %>tmp/html5player_and_ui.js",
            "<%= pkg.cfg.temp %>tmp/mp4link.js",
            "<%= pkg.cfg.temp %>tmp/flash.js",
            "<%= pkg.cfg.temp %>tmp/create.js",
            "./plugins/appbanner.js",
            "./plugins/appbanneronpause.js",
            "./plugins/apprecommend.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_html5.js": //
          [
            "<%= pkg.cfg.temp %>tmp/zepto_and_core.js",
            "<%= pkg.cfg.temp %>tmp/html5tiny.js",
            "<%= pkg.cfg.temp %>tmp/html5player_and_ui.js",
            "<%= pkg.cfg.temp %>tmp/mp4link.js",
            "<%= pkg.cfg.temp %>tmp/create.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_live.js": //
          [
            "<%= pkg.cfg.temp %>tmp/zepto_and_core.js",
            "./base/tvp.basehtml5.js",
            "./base/tvp.baseflash.js",
            "./html5/tvp.html5livetiny.js",
            "./html5/tvp.html5live.js",
            "./flash/tvp.flashlive.js",
            "<%= pkg.cfg.temp %>tmp/create.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.ocx_kernal.js": //
          [
            "./common/tvp.define.js",
            "./ocx/qqlivesetup.js",
            "./ocx/qqlivedefine.js",
            "./ocx/qqliveocx.js",
            "./ocx/qqliveplayer.js",
            "./ocx/qqlivectrlbar.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_wechat.js": //
          [
            "<%= pkg.cfg.temp %>tmp/zepto_and_core.js",
            "<%= pkg.cfg.temp %>tmp/html5_baseskin.js",
            "<%= pkg.cfg.temp %>tmp/html5tiny.js",
            "./html5/tvp.html5-skin-ui.js",
            "./html5/tvp.html5player.js",
            "./html5/tvp.html5live.js",
            "./html5/tvp.h5-ui-main.js",
            "./html5/tvp.h5-ui-poster.js",
            "./html5/tvp.h5-ui-overlay.js",
            "<%= pkg.cfg.temp %>tmp/create.js",
            "./plugins/appbanner.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/inews.js": //微信、手Q新闻插件推广专用版
          [
            "./html5/tvp.html5player.js",
            "./common/tvp.$.tap.js",
            "./html5/tvp.html5-skin-ui.js",
            "./html5/tvp.h5-ui-main.js",
            "./html5/tvp.h5-ui-meta.js",
            "./html5/tvp.h5-ui-overlay.js",
            "./html5/tvp.h5-ui-playpause.js",
            "./html5/tvp.h5-ui-timepanel.js",
            "./html5/tvp.h5-ui-progress-touch.js",
            "./html5/tvp.h5-ui-fullscreen.js",
            "./html5/tvp.h5-ui-bigben.js",
            "./html5/tvp.h5-ui-poster.js",
            "./html5/tvp.h5-ui-shadow.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_inews.js": //微信、手Q新闻插件推广专用版
          [
            "<%= pkg.cfg.temp %>tmp/zepto_and_core.js",
            "<%= pkg.cfg.temp %>tmp/html5_baseskin.js",
            "<%= pkg.cfg.temp %>tmp/html5tiny.js",
            "<%= pkg.cfg.temp %>concat/module/inews.js",
            "<%= pkg.cfg.temp %>tmp/create.js",
            "./plugins/appbanner.js",
            "./plugins/appfollow.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_3g.js": //
          [
            "<%= pkg.cfg.temp %>tmp/core_for_zepto.js",
            "<%= pkg.cfg.temp %>tmp/html5tiny.js",
            "<%= pkg.cfg.temp %>tmp/html5player_and_ui.js",
            "<%= pkg.cfg.temp %>tmp/mp4link.js",
            "<%= pkg.cfg.temp %>tmp/create.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_txv_vod.js": //
          [
            "./libs/jquery-bridge.js",
            "<%= pkg.cfg.temp %>tmp/core_for_jquery.js",
            "<%= pkg.cfg.temp %>tmp/flash.js",
            "./ocx/qqlivesetup.js",
            "./tvp.player.js",
            "./common/tvp.$.xml2json.js",
            "./html5/tvp.h5-loading-ad.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_txv_vod_ipad.js": //
          [
            "./libs/jquery-bridge.js",
            "<%= pkg.cfg.temp %>tmp/core_for_jquery.js",
            "<%= pkg.cfg.temp %>concat/module/html5player.js",
            "./tvp.player.js",
            "./common/tvp.$.xml2json.js",
            "./html5/tvp.h5-loading-ad.js"
          ],          
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_film.js": //
          [
            "./libs/jquery-bridge.js",
            "<%= pkg.cfg.temp %>tmp/core_for_jquery.js",
            "<%= pkg.cfg.temp %>tmp/flash.js",
            "<%= pkg.cfg.temp %>tmp/ocx_player.js",
            "./tvp.player.js"
          ],
          "<%= pkg.cfg.temp %>concat/tvp.player_v2_jq_pc_live.js": //
          [
            "./libs/jquery-bridge.js",
            "<%= pkg.cfg.temp %>tmp/core_for_jquery.js",
            "./base/tvp.basehtml5.js",
            "./base/tvp.baseflash.js",
            "./flash/tvp.flashlive.js",
            "<%= pkg.cfg.temp %>tmp/create.js"
          ]
        }
      },
      /**
       * 小挂件，主要针对HTML5播放器
       */
      "widgets": {
        files: {
          "<%= pkg.cfg.temp %>concat/widgets/h5_track.js": //
          [
            "./common/tvp.$.xml2json.js",
            "./html5/tvp.h5-ui-track.js"
          ]
        }
      },
      /**
       * 播放器插件
       */
      "plugins": {
        files: [{
          expand: true,
          cwd: './plugins/',
          src: ['**/*.js'],
          dest: '<%= pkg.cfg.temp %>concat/plugins/'
        }]
      },
      "h5_loadingad" : {
      	files : {
      		"<%= pkg.cfg.temp %>concat/plugins/loadingad.js" : [
      			"./common/tvp.$.xml2json.js",
      			"./html5/tvp.h5-loading-ad.js"
      		] 
      	}
      }
    },

    wrap: {
      player: {
        cwd: '<%= pkg.cfg.temp %>concat/',
        expand: true,
        src: ['**/tvp\.player_v2*.js'],
        dest: '<%= pkg.cfg.temp %>concat/',
        options: {
          seperator: '\n',
          indent: '\t',
          wrapper: function(filepath, options) {
            return [grunt.file.read("./AMD/header.js"), grunt.file.read("./AMD/define.js").replace("${FILENAME}", filepath.substr(filepath.lastIndexOf("/") + 1))];
          }
        }
      }
    },
    txv_valid: {
      "all": ['**/*.js','!common/tvp.$.tpl.js']
    },
    uglify: {
      options: {
        beautify: {
          ascii_only: true
        },
        compress: {
          global_defs: {
            "DEBUG": 0,
            "FILEPATH": "http://imgcache.gtimg.cn/tencentvideo_v1/tvp/js/"
          }
        },
        //report: 'min',
        //report: 'gzip',
        banner: '<%= banner %>'
      },
      iframeJs:{
        files:{
           "./toolpages/iframe/player.min.js":"./toolpages/iframe/player.js"
        }
      },
      release: {
        files: [{
          expand: true,
          cwd: '<%= pkg.cfg.releasePath %>',
          src: ['**/*.js'],
          dest: '<%= pkg.cfg.releasePath %>',
          ext: '$1.js',
          rename: function(pwd, src) {
            return pwd + src.replace(".js", "");
          }
        }]
      }
    },
    watch: {
      development: {                
        files: ['**/*.js', '!<%= pkg.cfg.temp %>tmp/*.js'],
        tasks: ['dev']            
      },
      options: {
        interval: 250,
      },
    },
    copy: {
      source: {
        files: [{
          expand: true,
          cwd: '<%= pkg.cfg.temp %>concat/',
          src: ['**/*.js'],
          dest: '<%= pkg.cfg.debugPath %>',
          filter: 'isFile'
        }, {
          expand: true,
          cwd: '<%= pkg.cfg.temp %>concat/',
          src: ['**/*.js'],
          dest: '<%= pkg.cfg.releasePath %>',
          filter: 'isFile'
        }]
      },
      kuaipan: {
        files: [{
          expand: true,
          cwd: '<%= pkg.cfg.temp %>concat/',
          src: ['**/*.js'],
          dest: 'D:/kuaipan/code/popotang.qq.com/js/',
          filter: 'isFile'
        }]
      },
      ftp233: {
        files: [{
          expand: true,
          cwd: '<%= pkg.cfg.releasePath %>',
          src: ['**/*.js'],
          dest: 'V:/tvp/js/',
          filter: 'isFile'
        }, {
          expand: true,
          cwd: '<%= pkg.cfg.debugPath %>',
          src: ['**/*.js'],
          dest: 'V:/tvp/_debug_/',
          filter: 'isFile'
        }]
      },
      iframe: {
        files: [{
          expand: true,
          cwd: './toolpages/iframe/',
          src: ['**/*.html'],
          dest: 'W:/web/v.qq.com/iframe/',
          filter: 'isFile'
        }]
      }
    },
    clean: {
      tmp: ["<%= pkg.cfg.temp %>"]
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-text-replace');
//  grunt.loadNpmTasks('grunt-txv-valid');
  grunt.loadNpmTasks('grunt-wrap');
//  grunt.loadNpmTasks('grunt-gcc');

  //注册自定义任务，将js文件copy到popotang.qq.com，方便快速调试
  grunt.registerTask('fastdev', 'copy js file to popotang.qq.com for fast dev', function(taskname) {
    var path = "D:/kuaipan/code/popotang.qq.com/js/";
    if (grunt.file.exists(path) && grunt.file.isDir(path)) {
      grunt.log.write(path + " exists,continue to copy file...");
      grunt.task.run("copy:kuaipan");
    }
  });

  grunt.registerTask('default', ['build']);
  grunt.registerTask('dev', ['replace', 'concat', 'wrap', 'copy:source', 'fastdev', 'clean']);
  grunt.registerTask('build', ['replace', 'concat', 'wrap', 'copy:source', 'uglify', 'fastdev', 'clean']);
  grunt.registerTask('toolpages', ['copy:iframe']);
  grunt.registerTask('ftp', ['copy:ftp233']);

};