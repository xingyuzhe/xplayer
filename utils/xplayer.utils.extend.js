;
(function($) {
	var extFun = {
		/**
		 * 单独根据id获取dom元素
		 */
		getByID: function(id) {
			return document.getElementById(id);
		},
		/**
		 * 空函数
		 *
		 * @lends tvp.$
		 */
		noop: function() {},
		/**
		 * 是否是字符串
		 *
		 * @lends tvp.$
		 */
		isString: function(val) {
			return $.type(val) === "string";
		},
		/**
		 * 是否未定义
		 *
		 * @lends tvp.$
		 */
		isUndefined: function(val) {
			return $.type(val) === "undefined";
		},
		/**
		 * 获取当前毫秒
		 *
		 * @lends tvp.$
		 * @return {Number}
		 */
		now: function() {
			return new Date().getTime();
		},

		/**
		 * 用对象路径取一个JSON对象中的子对象引用
		 * 
		 * @static
		 * @param {object}
		 *          obj 源对象
		 * @param {string}
		 *          path 对象获取路径
		 * @returns {object|string|number|function}
		 * 
		 * @example
		 * route(
		           { "a" : 
				       { "b" :
					       { "c" : "Hello World"
						   }
				       }
				   },
				   "a.b.c"
		       ); //返回值："Hello World"
		 */
		route: function(obj, path) {
			obj = obj || {};
			path = String(path);

			var r = /([\d\w_]+)/g,
				m;

			r.lastIndex = 0;

			while ((m = r.exec(path)) !== null) {
				obj = obj[m[0]];
				if (obj === undefined || obj === null) {
					break;
				}
			}

			return obj;
		},
		/**
		 * 获取标准日期格式的时间
		 */
		getISOTimeFormat: function() {
			var date = new Date(),
				y = date.getFullYear(),
				m = date.getMonth() + 1,
				d = date.getDate(), // 
				h = date.getHours(),
				M = date.getMinutes(),
				s = date.getSeconds();
			return [
				[y, m < 10 ? "0" + m : m, d < 10 ? "0" + d : d].join("-"), [h < 10 ? "0" + h : h, M < 10 ? "0" + M : M, s < 10 ? "0" + s : s].join(":")
			].join(" ");
		},
		/**
		 * 格式化秒
		 */
		formatSeconds: function(seconds) {
			seconds = parseInt(seconds);
			var M = parseInt(seconds / 60),
				h = M >= 60 ? parseInt(M / 60) : 0,
				s = seconds % 60,
				str = "";
			M >= 60 && (M = M % 60);
			if (h > 0) {
				str += h < 10 ? "0" + h : h;
				str += ":";
			}
			str += M < 10 ? "0" + M : M;
			str += ":"
			str += s < 10 ? "0" + s : s;
			return str;
		},
		/**
		 * 把时长转成1小时30分50秒的形式
		 * @param  {[type]} seconds [description]
		 * @return {[type]}         [description]
		 */
		formatSecondsWithText: function(seconds) {
			var str = this.formatSeconds(seconds),
				arr = str.split(':'),
				res = '';
			switch (arr.length) {
				case 1:
					res = arr[0] + '秒';
					break;
				case 2:
					res = arr[0] + "分" + arr[1] + "秒";
					break;
				case 3:
					res = arr[0] + "小时" + arr[1] + "分" + arr[2] + "秒";
					break;
				default:
					res = str;
			}

			return res;
		},

		/**
		 * 把bytes转成23.2M这种
		 * @return {[type]} [description]
		 */
		formatFileSize: function(bytes) {
			bytes = parseInt(bytes, 10);
			bytes = bytes / 1024 / 1024;
			bytes = bytes.toFixed(1);
			return bytes + 'M';
		},
		/**
		 * 获取当前域名真实的host
		 */
		getHost: function() {
			var _host = window.location.hostname || window.location.host,
				_sarray = location.host.split(".");
			if (_sarray.length > 1) {
				_host = _sarray.slice(_sarray.length - 2).join(".");
			}
			return _host;
		},
		/**
		 * 从URL中获取指定的参数值
		 *
		 * @param {String}
		 *          p url参数
		 * @param {String}
		 *          u url 默认为当前url，可为空，如果传入该变量，将从该变量中查找参数p
		 * @return {String} 返回的参数值
		 */
		getUrlParam: function(p, u) {
			u = u || location.href;
			var reg = new RegExp('[\?&#]' + p + '=([^&#]+)', 'gi'),
				matches = u.match(reg),
				strArr;
			if (matches && matches.length > 0) {
				strArr = (matches[matches.length - 1]).split('=');
				if (strArr && strArr.length > 1) {
					return strArr[1];
				}
				return '';
			}
			return '';
		},

		/**
		 * 设置url中指定的参数
		 *
		 * @param {string}
		 *          name [参数名]
		 * @param {string}
		 *          value [参数值]
		 * @param {string}
		 *          url [发生替换的url地址|默认为location.href]
		 * @return {string} [返回处理后的url]
		 */
		setUrlParam: function(name, value, url) {

			url = url || location.href;
			var reg = new RegExp('[\?&#]' + name + '=([^&#]+)', 'gi'),
				matches = url.match(reg),
				strArr, extra,
				key = '{key' + new Date().getTime() + '}';

			if (matches && matches.length > 0) {
				strArr = (matches[matches.length - 1]);

			} else {
				strArr = '';
			}

			extra = name + '=' + value;

			// 当原url中含有要替换的属性:value不为空时，仅对值做替换,为空时，直接把参数删除掉
			if (strArr) {
				var first = strArr.charAt(0);
				url = url.replace(strArr, key);
				url = url.replace(key, value ? first + extra : '');
			}
			// 当原url中不含有要替换的属性且value值不为空时,直接在url后面添加参数字符串
			else if (value) {

				if (url.indexOf('?') > -1) {
					url += '&' + extra;
				} else {
					url += '?' + extra;
				}
			}

			// 其它情况直接返回原url
			return url;
		},

		/**
		 * 从URL中获取所有参数组成的对象，queryhash覆盖querystring同名的值
		 *
		 * @param {String}
		 *          u url 默认为当前url，可为空，如果传入该变量，将从该变量中获取参数
		 * @return {Object} 返回的参数对象
		 */
		getUrlParamObject: function(u) {
			u = u || location.href;
			var uArr = u.split('#'),
				queryHash = uArr[1] || '',
				queryString = (uArr[0].split('?'))[1] || '',
				queryHashArr = queryHash.split("&"),
				queryStringArr = queryString.split("&"),
				queryArr = queryStringArr.concat(queryHashArr),
				kvArr, k, v, i,
				params = {};
			for (i = 0, len = queryArr.length; i < len; i++) {
				kvArr = queryArr[i].split('=');
				k = kvArr[0];
				v = kvArr[1] || '';
				if (k) {
					params[k] = decodeURIComponent(v);
				}
			}
			return params;
		},

		/**
		 * 将参数对象转换成请求参数字符串，如果传入URL则拼成带请求参数的URL返回
		 *
		 * @param {Object}
		 *          paramObject 参数对象
		 * @param {String}
		 *          baseUrl URL
		 * @return {String} 参数字符串或完整请求URL
		 */
		genHttpParamString: function(paramObject, baseUrl) {
			var paramStr = '',
				sep = '';
			baseUrl = baseUrl || '';
			paramStr = $j.param(paramObject);
			if (baseUrl && paramStr) {
				sep = baseUrl.indexOf('?') != -1 ? '&' : '?';
			}
			return baseUrl + sep + paramStr;
		},
		/**
		 * 过滤XSS
		 *
		 * @param {string}
		 *          str
		 * @return {}
		 */
		filterXSS: function(str) {
			if (!$.isString(str)) return str;
			return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&apos;");
		},
		/**
		 * 创建GUID字符串
		 *
		 * @return {}
		 */
		createGUID: function(len) {
			len = len || 32;
			var guid = "";
			for (var i = 1; i <= len; i++) {
				var n = Math.floor(Math.random() * 16.0).toString(16);
				guid += n;
			}
			return guid;
		},
		/**
		 * 格式化尺寸
		 * @param  {type} size [description]
		 * @return {type}      [description]
		 */
		formatSize: function(size) {
			var s = "" + size;
			if (s.indexOf("%") > 0) return s;
			if (s.indexOf("px") > 0) return s;

			if (/^\d+$/.test(s)) return s + "px";
			return s;
		},
		compareVersion: function(n, k) {
			n = String(n).split(".");
			k = String(k).split(".");
			try {
				for (var o = 0, j = Math.max(n.length, k.length); o < j; o++) {
					var m = isFinite(n[o]) && Number(n[o]) || 0,
						p = isFinite(k[o]) && Number(k[o]) || 0;
					if (m < p) {
						return -1
					} else {
						if (m > p) {
							return 1
						}
					}
				}
			} catch (q) {
				return -1
			}
			return 0
		},
		/**
		 * 判断参数是否是true，诸如//1 ,true ,'true'
		 * @param  {[type]}  v [description]
		 * @return {Boolean}   [description]
		 */
		isTrue: function(v) {
			return eval(tvp.$.filterXSS(v)); // 0 ,1 ,true ,false,'true','false'..
		},
		/**
		 * 根据插件name载入插件对应CSS文件
		 * @return {[type]} [description]
		 */
		loadPluginCss: function(name) {
			var url = "",
				urlArray = tvp.defaultConfig.pluginCssUrl;
			if (name in urlArray) {
				url = tvp.defaultConfig.cssPath + urlArray[name];
			}
			return $.loadCss(url);

		},
		/**
		 * [getData 获取本地存储信息]
		 * @param  {[type]} name  [description]
		 * @param  {[type]} value [description]
		 * @return {[type]}       [description]
		 */
		getData: function(name, value) {
			if (window.localStorage) {
				return window.localStorage[name];
			}
		},
		setData: function(name, value) {
			if (window.localStorage) {
				window.localStorage[name] = value;
				return true;
			}
		},
		delData: function(name) {
			if (window.localStorage) {
				window.localStorage.removeItem(name);
				return true;
			}
		},
		formatTpl: function(str, obj) {
			if (!str || $.type(obj) !== 'object') return;
			for (var key in obj) {
				var name = '${' + key + '}';
				while (str.indexOf(name) > -1) {
					str = str.replace(name, obj[key]);
				}
			}
			return str;
		},
		/**
		 * 载入CSS文件
		 * @return {[type]} [description]
		 */
		loadCss: function(url) {
			var defer = $.Deferred();
			var isDone = false;
			if (!!url) {
				//禁止回溯路径
				//例如:http://imgcache.gtimg.cn/tencentvideo_v1/mobile/v2/style/../../../../qzone/css/play.css
				//将指向到http://imgcache.gtimg.cn/qzone/css/play.css
				while (url.indexOf("../") >= 0) {
					url = url.replace("../", "");
				}
				url = $.filterXSS(url);
				var doc = document;
				var head = doc.getElementsByTagName("head")[0] || doc.documentElement;
				var baseElement = head.getElementsByTagName("base")[0];
				var node = doc.createElement("link");
				node.rel = "stylesheet";
				node.href = url;

				node.onload = node.onerror = function() {
					node.onload = node.onerror = null;
					isDone = true;
					defer.resolve();
				}
				// if ($.browser.WeChat || $.browser.MQQClient || ($.os.ios && parseInt($.os.version,10) <= 5)) {
				// 	//onload和onerror不一定触发
				// 	setTimeout(function() {
				// 		if (!isDone) {
				// 			defer.resolve();
				// 		}
				// 	}, 2000);
				// }

				//onload和onerror不一定触发
				setTimeout(function() {
					if (!isDone) {
						defer.resolve();
					}
				}, 2500);

				baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);
			} else {
				defer.reject();
			}
			return defer;
		}
	};

})(xplayer.$)