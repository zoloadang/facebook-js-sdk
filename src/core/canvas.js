/**
 * FB Canvas
 * 为FB创建新的命名空间Canvas
 * @by 兰七
 */
FB.provide('Canvas', {
  /**
   * 计时器，以便关闭
   * @by 兰七
   */
  _timer: null,

  /**
   * 重定义iframe的尺寸.
   * 最大宽度来自你的app设置，没有最大高度
   * @param {Object} params
   *
   * Property | Type    | Description                      | Argument   | Default
   * -------- | ------- | -------------------------------- | ---------- | -------
   * width    | Integer | 期望宽度，最大是 app宽度. 			   | *Optional* | frame width
   * height   | Integer | 期望高度                  					   | *Optional* | frame height
   *
   * @by 兰七
   */
  setSize: function(params) {
    // 循环调用
    if (typeof params != "object") {
      params = {};
    }
    params = FB.copy(params || {}, FB.Canvas._computeContentSize());

    // 深度比较
    if (FB.Canvas._lastSize &&
        FB.Canvas._lastSize.width == params.width &&
        FB.Canvas._lastSize.height == params.height) {
      return false;
    }
    FB.Canvas._lastSize = params;

    FB.Canvas._sendMessageToFacebook({
      method: 'setSize',
      params: params
    });
    return true;
  },

  /**
   * 启动或停止计时器，每隔几毫秒重置iframe
   * 注意： 如果只有一个参数，是一个数字的话，表明要循环调用
   * @param {Boolean} onOrOff 计时器是否开关. truthy ==
   * on, falsy == off. **default** is true
   * @param {Integer} 循环多久执行 (in ms). **default** is
   * 100ms
   *
   * @by 兰七
   */
  setAutoResize: function(onOrOff, interval) {
    if (interval === undefined && typeof onOrOff == "number") {
      interval = onOrOff;
      onOrOff = true;
    }

    if (onOrOff === undefined || onOrOff) {
      if (FB.Canvas._timer === null) {
        FB.Canvas._timer =
          window.setInterval(FB.Canvas.setSize,
                             interval || 100); // 默认100 ms 
      }
      FB.Canvas.setSize();
    } else {
      if (FB.Canvas._timer !== null) {
        window.clearInterval(FB.Canvas._timer);
        FB.Canvas._timer = null;
      }
    }
  },

  /**
   * 获取iframe实际内容的尺寸
   * 使用jquery 的$(document).height() 也能获取相同的数据，但在一些浏览器会产生一个滚动条，欢迎测试
   * @by 兰七
   */
  _computeContentSize: function() {
    var body = document.body,
        docElement = document.documentElement,
        right = 0,
        bottom = Math.max(
          Math.max(body.offsetHeight, body.scrollHeight) +
            body.offsetTop,
          Math.max(docElement.offsetHeight, docElement.scrollHeight) +
            docElement.offsetTop);

    if (body.offsetWidth < body.scrollWidth) {
      right = body.scrollWidth + body.offsetLeft;
    } else {
      FB.Array.forEach(body.childNodes, function(child) {
        var childRight = child.offsetWidth + child.offsetLeft;
        if (childRight > right) {
          right = childRight;
        }
      });
    }
    if (docElement.clientLeft > 0) {
      right += (docElement.clientLeft * 2);
    }
    if (docElement.clientTop > 0) {
      bottom += (docElement.clientTop * 2);
    }

    return {height: bottom, width: right};
  },

  /**
   * 发送请求到facebook.
   * @by 兰七
   */
  _sendMessageToFacebook: function(message) {
    var url = FB._domain.staticfb + 'connect/canvas_proxy.php#' +
      FB.QS.encode({method: message.method,
                    params: FB.JSON.stringify(message.params)});

     var root = FB.Content.appendHidden('');
     FB.Content.insertIframe({
       url: url,
       root: root,
       width: 1,
       height: 1,
       onload: function() {
         setTimeout(function() {
           root.parentNode.removeChild(root);
         }, 10);
       }
     });
  }
});
