/**
*
* @provides fb.dom
* @layer basic
* @requires fb.prelude fb.event fb.string fb.array
* @by 陈静
*/

/**
* DOM相关的辅助方法。
*
* @class FB.Dom
* @static
* @private
*/
FB.provide('Dom', {
  /**
* 检查指定元素是否包含指定class
*
* @param dom {DOMElement} 指定元素
* @param className {String} 指定class
* @return {Boolean}
*/
  containsCss: function(dom, className) {
    var cssClassWithSpace = ' ' + dom.className + ' ';
    return cssClassWithSpace.indexOf(' ' + className + ' ') >= 0;
  },

  /**
* 给符合元素添加指定class
*
* @param dom {DOMElement} 指定元素
* @param className {String} 指定class
*/
  addCss: function(dom, className) {
    if (!FB.Dom.containsCss(dom, className)) {
      dom.className = dom.className + ' ' + className;
    }
  },

  /**
* 给符合元素移除指定class
*
* @param dom {DOMElement} 指定元素
* @param className {String} 指定class
*/
  removeCss: function(dom, className) {
    if (FB.Dom.containsCss(dom, className)) {
      dom.className = dom.className.replace(className, '');
      FB.Dom.removeCss(dom, className); // 为了防止重复添加
    }
  },

  /**
* 返回指定元素计算后的样式
*
* NOTE: 需要传递具体浏览器的名称给某些特殊样式
*
* @param dom {DOMElement} 指定元素
* @param styleProp {String} 样式名称
*/
  getStyle: function (dom, styleProp) {
    var y = false, s = dom.style;
    if (styleProp == 'opacity') {
      if (s.opacity) { return s.opacity * 100; }
      if (s.MozOpacity) { return s.MozOpacity * 100; }
      if (s.KhtmlOpacity) { return s.KhtmlOpacity * 100; }
      if (s.filters) { return s.filters.alpha.opacity; }
      return 0; 
    } else {
      if (dom.currentStyle) {
        FB.Array.forEach(styleProp.match(/\-([a-z])/g), function(match) {
          styleProp = styleProp.replace(match, match.substr(1,1).toUpperCase());
        });
        y = dom.currentStyle[styleProp];
      } else { 
        FB.Array.forEach(styleProp.match(/[A-Z]/g), function(match) {
          styleProp = styleProp.replace(match, '-'+ match.toLowerCase());
        });
        if (window.getComputedStyle) {
          y = document.defaultView
           .getComputedStyle(dom,null).getPropertyValue(styleProp);
          // 对IE的特殊处理。
		  // 由于某些原因，没有默认返回'0%'，所以需要把'top'和'left'转换成'0px'
          if (styleProp == 'background-position-y' ||
              styleProp == 'background-position-x') {
            if (y == 'top' || y == 'left') { y = '0px'; }
          }
        }
      }
    }
    return y;
  },

  /**
* 设置指定元素指定样式的值
*
* NOTE: 需要传递具体浏览器的名称给某些特殊样式
*
* @param dom {DOMElement} 指定元素
* @param styleProp {String} 样式名称
* @param value {String} 指定样式要设置的CSS值
*/
  setStyle: function(dom, styleProp, value) {
    var s = dom.style;
    if (styleProp == 'opacity') {
      if (value >= 100) { value = 99.999; } // 修复 Mozilla < 1.5b2
      if (value < 0) { value = 0; }
      s.opacity = value/100;
      s.MozOpacity = value/100;
      s.KhtmlOpacity = value/100;
      if (s.filters) { s.filters.alpha.opacity = value; }
    } else { s[styleProp] = value; }
  },

  /**
* 动态添加script标记
*
* @param src {String} script脚本url
*/
  addScript: function(src) {
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = src;
    return document.getElementsByTagName('HEAD')[0].appendChild(script);
  },

  /**
* 通过<style>标记添加CSS规则
*
* @param styles {String} 样式
* @param names {Array} 样式代表的组件名称
*/
  addCssRules: function(styles, names) {
    if (!FB.Dom._cssRules) {
      FB.Dom._cssRules = {};
    }
	
	// Note: 在某个样式和之前没有引用过的样式一起被引用时，可能重新引用该CSS
    var allIncluded = true;
    FB.Array.forEach(names, function(id) {
      if (!(id in FB.Dom._cssRules)) {
        allIncluded = false;
        FB.Dom._cssRules[id] = true;
      }
    });

    if (allIncluded) {
      return;
    }

//#JSCOVERAGE_IF
    if (FB.Dom.getBrowserType() != 'ie') {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.textContent = styles;
      document.getElementsByTagName('HEAD')[0].appendChild(style);
    } else {
      try {
        document.createStyleSheet().cssText = styles;
      } catch (exc) {
		// IE上的主要问题: 这个方法最多只能创建31个stylesheet对象。
		// 需要把样式加到一个已经存在的stylesheet里

        if (document.styleSheets[0]) {
          document.styleSheets[0].cssText += styles;
        }
      }
    }
  },

  /**
* 返回浏览器型号
*
* @return string 'ie' | 'mozilla' |'safari' | 'other'
*/
  getBrowserType: function() {
    if (!FB.Dom._browserType) {
      var
        userAgent = window.navigator.userAgent.toLowerCase(),
        // 已知浏览器的列表。NOTE：顺序很重要
        keys = ['msie', 'firefox', 'safari', 'gecko'],
        names = ['ie', 'mozilla', 'safari', 'mozilla'];
      for (var i = 0; i < keys.length; i++) {
        if (userAgent.indexOf(keys[i]) >= 0) {
          FB.Dom._browserType = names[i];
          break;
        }
      }
    }
    return FB.Dom._browserType;
  },

  /**
* 返回视区信息。包括视区大小和滑动条偏移量
*
* @returns {Object} 宽度和高度
*/
  getViewportInfo: function() {
    // W3C 标准, 或者回退为body
    var root = (document.documentElement && document.compatMode == 'CSS1Compat')
      ? document.documentElement
      : document.body;
    return {
      scrollTop : root.scrollTop,
      scrollLeft : root.scrollLeft,
      width : self.innerWidth ? self.innerWidth : root.clientWidth,
      height : self.innerHeight ? self.innerHeight : root.clientHeight
    };
  },

  /**
* 绑定一个执行函数，该函数会在DOM就绪后立即执行。
*
* @param {Function} 就绪后要调用的函数
*/
  ready: function(fn) {
    if (FB.Dom._isReady) {
      fn();
    } else {
      FB.Event.subscribe('dom.ready', fn);
    }
  }
});

// NOTE: 此代码是自动执行的。这是必要的，以正确判断就绪状态。
(function() {
  // DOM就绪时处理
  function domReady() {
    FB.Dom._isReady = true;
    FB.Event.fire('dom.ready');
    FB.Event.clear('dom.ready');
  }

  // 假设DOM已经就绪
  if (FB.Dom._isReady || document.readyState == 'complete') {
    return domReady();
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', domReady, false);

  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', domReady);
  }

  if (FB.Dom.getBrowserType() == 'ie' && window === top) {
    (function() {
      try {
        document.documentElement.doScroll('left');
      } catch(error) {
        setTimeout(arguments.callee, 0);
        return;
      }

      domReady();
    })();
  }

  // 最终回退
  var oldonload = window.onload;
  window.onload = function() {
    domReady();
    if (oldonload) {
      if (typeof oldonload == 'string') {
        eval(oldonload);
      } else {
        oldonload();
      }
    }
  };
})();