/**
*
* @provides fb.anim
* @layer basic
* @requires fb.prelude fb.array fb.dom
* @by 陈静
*/

/**
* 提供基本动画的辅助函数
*
* @class FB.Anim
* @static
* @private
*/
FB.provide('Anim', {
  /**
* 动画可转换元素
* Note: 只有pixel, point, %, 和opactity值可转换
*
* @param dom {DOMElement} 动画元素
* @param props {Object} 包含动画的目标属性的对象
* @param duration {Number} 动画持续的毫秒数
* @param callback {Function} 动画发生后的回调函数
*/
  ate: function(dom, props, duration, callback) {
    duration = !isNaN(parseFloat(duration)) && duration >= 0 ? duration : 750;
    var
      frame_speed = 40,
      from = {},
      to = {},
      begin = null,
      s = dom.style,
      timer = setInterval(FB.bind(function() {
        if (!begin) { begin = new Date().getTime(); }

        var pd = 1;
        if (duration != 0) {
          pd = Math.min((new Date().getTime() - begin) / duration, 1);
        }
        FB.Array.forEach(props, FB.bind(function(value, prop) {
          if (!from[prop]) { 
            var style = FB.Dom.getStyle(dom, prop);

            if (!style) { return; }
            from[prop] = this._parseCSS(style);
          }
          if (!to[prop]) { 
            to[prop] = this._parseCSS(value.toString());
          }
          var next = ''; 
          FB.Array.forEach(from[prop], function(pair, i) {
			/* 通过特殊符号，检查用户覆盖非动画部分，如"？"。 
			 *  当只需添加动画的一部分而不是其他部分时，最好把动画属性分成多个部分，如backgroundPositon。
			 * e.g.
			 * backgroundPosition: '8px 10px' => moves x and y to 8, 10
			 * backgroundPosition: '? 4px' => moves y to 4 and leaves x alone
			 * backgroundPosition: '7px ?' => moves x to 7 and leaves y alone
		  	*/
            if (isNaN(to[prop][i].numPart) && to[prop][i].textPart == '?') {
              next = pair.numPart + pair.textPart;
            /*  检查非动画部分，包括colors(目前)，位置，任何没有#的，等等
			*/
            } else if (isNaN(pair.numPart)) {
              next = pair.textPart;

            } else {
              next +=
                (pair.numPart + 
                 Math.ceil((to[prop][i].numPart - pair.numPart) *
                            Math.sin(Math.PI/2 * pd))) +
                to[prop][i].textPart + ' '; // 文字部分和尾随空格
            }
          });
       
          FB.Dom.setStyle(dom, prop, next);
        }, this));
        if (pd == 1) { // 是否完成？清除定时器，调用回调函数
          clearInterval(timer);
          if (callback) { callback(dom); }
        }
      }, this), frame_speed);
  },

  /*
* 解析成一个CSS语句上的相应部分
*
*/
  _parseCSS: function(css) {
    var ret = [];
    FB.Array.forEach(css.split(' '), function(peice) {
      var num = parseInt(peice, 10);
      ret.push({numPart: num, textPart: peice.replace(num,'')});
    });
    return ret;
  }
});