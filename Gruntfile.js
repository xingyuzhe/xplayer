/*global module:false*/
module.exports = function(grunt) {
  grunt.file.defaultEncoding = 'utf8';
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + ' * Copyright (c) <%= grunt.template.today("yyyy") %>\n * Powered by <%= pkg.author.team%>' + ' \n*/\n',
    replace: {
      buildtime: { //每次merge或者build都会让define.js里的ver变量+1，modifytime自动变化为当前时间
        src: ['./common/xplayer.define.js'],
        overwrite: true,
        replacements: [{
          from: /\$V1\.0Build(\d+)\$/,
          to: function(matchedWord, index, fullText, regexMatches) {
            return "$V1.0Build" + (parseInt(regexMatches[0]) + 1) + "$";
          }
        }, {
          from: /(xplayer\.lastModify\W=\W)\"([^\"]+)\"/,
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
          '<%= pkg.cfg.temp %>tmp/zepto.js': // 视频对象
          [
            "./lib/zepto.js",
            "./lib/ajax.js",
            "./lib/callbacks.js",
            "./lib/touch.js",
            "./lib/deferred.js",
            "./lib/event.js",
            "./lib/ie.js"
          ],          
          "<%= pkg.cfg.temp %>tmp/core.js": //
          [
            "./base/xplayer.define.js",
            "./base/xplayer.config.js",
            "./base/xplayer.videoinfo.js",
            "./base/xplayer.baseplayer.js",
            "./utils/xplayer.utils.js",
            "./utils/xplayer.utils.detect.js",
            "./utils/xplayer.utils.extend.js",
            "./utils/xplayer.utils.tpl.js",
            "./utils/xplayer.utils.selectplayer.js",
            "./html5/xplayer.html5.helper.js"
            
          ],
          "<%= pkg.cfg.temp %>tmp/html5ui.js": //
          [
            "./html5/xplayer.html5.lang.js",
            "./html5/xplayer.html5.skin.js",
            "./html5/xplayer.html5.ui.js",
            "./html5/xplayer.html5.ui.overlay.js",
            "./html5/xplayer.html5.ui.tips.js",
            "./html5/xplayer.html5.ui.title.js",
            "./html5/xplayer.html5.ui.meta.js",
            "./html5/xplayer.html5.ui.playpause.js",
            "./html5/xplayer.html5.ui.timepanel.js",
            "./html5/xplayer.html5.ui.progress.js",
            "./html5/xplayer.html5.ui.fullscreen.js",
            "./html5/xplayer.html5.ui.bigben.js",
            "./html5/xplayer.html5.ui.definiton.js",
            "./html5/xplayer.html5.ui.poster.js",
            "./html5/xplayer.html5.ui.shadow.js",
            "./html5/xplayer.html5.ui.promotion.js",
            "./html5/xplayer.html5.ui.ad.js"
          ],         
          "<%= pkg.cfg.temp %>tmp/create.js": 
          [
            "./xplayer.js"
          ]
        }
      },
      //各种播放器内核模块碎片文件
      "module": {
        files: {
          "<%= pkg.cfg.temp %>concat/module/flashplayer.js": //
          [
            "./flash/xplayer.flash.baseplayer.js",
            "./flash/xplayer.flash.player.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/flashliveplayer.js": //
          [
            "./base/xplayer.flash.baseplayer.js",
            "./flash/xplayer.flash.liveplayer.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/flash.js": //
          [
            "./base/xplayer.flash.baseplayer.js",
            "./flash/xplayer.flash.liveplayer.js",
            "./flash/xplayer.flash.player.js"
          ],          
          "<%= pkg.cfg.temp %>concat/module/mp4link.js": //
          [
            "./html5/xplayer.html5.baseplayer.js",
            "./mp4/xplayer.mp4.js",
            "./mp4/xplayer.mp4.monitor.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/html5player.js": //
          [
            "<%= pkg.cfg.temp %>tmp/html5ui.js",
            "./html5/xplayer.html5.baseplayer.js",
            "./html5/xplayer.html5.player.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/html5live.js": //
          [
            "<%= pkg.cfg.temp %>tmp/html5ui.js",
            "./html5/xplayer.html5.baseplayer.js",
            "./html5/xplayer.html5.liveplayer.js"
          ],
          "<%= pkg.cfg.temp %>concat/module/html5.js": //
          [
            "<%= pkg.cfg.temp %>tmp/html5ui.js",
            "./html5/xplayer.html5.baseplayer.js",
            "./html5/xplayer.html5.liveplayer.js",
            "./html5/xplayer.html5.player.js"
          ]         
        }
      },
      /**
       * 针对各种底层库的JS，这些JS本身没有播放器内核，全靠异步载入
       */
      "playerjs": {
        files: {
          "<%= pkg.cfg.temp %>concat/xplayer.js": //
          [
            "<%= pkg.cfg.temp %>tmp/zepto.js",
            "<%= pkg.cfg.temp %>tmp/core.js",
            "<%= pkg.cfg.temp %>tmp/create.js"
          ],
          "<%= pkg.cfg.temp %>concat/xplayer_full.js": //
          [
            "<%= pkg.cfg.temp %>tmp/zepto.js",
            "<%= pkg.cfg.temp %>tmp/core.js",
            "<%= pkg.cfg.temp %>concat/module/flash.js",
           "<%= pkg.cfg.temp %>concat/module/html5.js",
            "<%= pkg.cfg.temp %>tmp/create.js"
          ],            
          "<%= pkg.cfg.temp %>concat/xplayer_mobile.js": //
          [
            "<%= pkg.cfg.temp %>tmp/zepto.js",
            "<%= pkg.cfg.temp %>tmp/core.js",
            "<%= pkg.cfg.temp %>concat/module/html5.js",
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
            "./utils/xplayer.utils.xml2json.js",
            "./html5/xplayer.html5.ui.track.js"
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
      }
    },

    wrap: {
      player: {
        cwd: '<%= pkg.cfg.temp %>concat/',
        expand: true,
        src: ['**/xplayer*.js'],
        dest: '<%= pkg.cfg.temp %>concat/',
        options: {
          seperator: '\n',
          indent: '\t',
          wrapper: function(filepath, options) {
            return [grunt.file.read("./wrap/begin.js"), grunt.file.read("./wrap/end.js").replace("${FILENAME}", filepath.substr(filepath.lastIndexOf("/") + 1))];
          }
        }
      }
    },
    uglify: {
      options: {
        beautify: {
          ascii_only: true
        },
        // compress: {
        //   global_defs: {
        //     "DEBUG": 0,
        //     "FILEPATH": "http://imgcache.gtimg.cn/tencentvideo_v1/xplayer/js/"
        //   }
        // },
        //report: 'min',
        //report: 'gzip',
        banner: '<%= banner %>'
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
      }
    },
    clean: {
      tmp: ["<%= pkg.cfg.temp %>"]
    }
  });


  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-wrap');


  grunt.registerTask('default', ['build']);
  grunt.registerTask('dev', ['replace', 'concat', 'wrap', 'copy:source', 'fastdev', 'clean']);
  grunt.registerTask('build', ['replace', 'concat', 'wrap', 'copy:source', 'uglify', 'fastdev', 'clean']);
  grunt.registerTask('toolpages', ['copy:iframe']);
  grunt.registerTask('ftp', ['copy:ftp233']);

};