/**
 * FB init
 * 为FB创建新的命名空间
 * @by 兰七
 */
FB.provide('', {
  /**
   * 初始化库
   * 典型的初始化配置所有可选的属性：
   *
   *      <div id="fb-root"></div>
   *      <script src="http://connect.facebook.net/en_US/all.js"></script>
   *      <script>
   *        FB.init({
   *          appId  : 'YOUR APP ID',
   *          status : true, // check login status
   *          cookie : true, // enable cookies to allow the server to access the session
   *          xfbml  : true  // parse XFBML
   *        });
   *      </script>
   *
   * 最好把这段代码插到</body>标签之前
   *
   * ### 异步加载
   *
   * 这个库使用'fbAsyncTnit'钩子，实现无阻塞  加载JS，一旦这个全部函数定义，当库加载完成以后，它将会执行：
   *
   *     <div id="fb-root"></div>
   *     <script>
   *       window.fbAsyncInit = function() {
   *         FB.init({
   *           appId  : 'YOUR APP ID',
   *           status : true, // 检查登陆状态
   *           cookie : true, // 使用cookie允许服务器访问session
   *           xfbml  : true  // 封装 XFBML
   *         });
   *       };
   *
   *       (function() {
   *         var e = document.createElement('script');
   *         e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
   *         e.async = true;
   *         document.getElementById('fb-root').appendChild(e);
   *       }());
   *     </script>
   *
   * 最好把这段代码插到</body>标签之前， 这样允许facebook初始化与页面其他地方的初始化并行
   *
   * ### Internationalization
   *
   * Facebook连接特性在很多区域可用，你可以使用[supported Facebook [Locales][locales].中一个地区替换`en_US`，例如，想要加载的库，触发对话框，弹出框和插件是在印度，你能通过下面的url加载这个库：
   *
   *     http://connect.facebook.net/hi_IN/all.js
   *
   * [locales]: http://wiki.developers.facebook.com/index.php/Facebook_Locales
   *
   * ### SSL
   *
   * Facebook连接特性在SSL上同样可用，当你的页面是在'https:/'上，你的库在运行时会依赖当前页面协议， SSL url也是一样。仅仅是协议改变：
   *
   *     https://connect.facebook.net/en_US/all.js
   *
   * 注意： 一些[UI methods][FB.ui] 例如 stream.publish and stream.share 可以在不注册一个应用或者调用这个方法时候使用
   * 如果你使用一个appid， 所有的方法必须在这个方法以后被调用
   *
   * [FB.ui]: /docs/reference/javascript/FB.ui
   *
   * @access public
   * @param options {Object}
   *
   * Property | Type    | Description                          | Argument   | Default
   * -------- | ------- | ------------------------------------ | ---------- | -------
   * appId    | String  | 你的应用id.                 			   | *Optional* | `null`
   * cookie   | Boolean | true使用cookie支持.     				   | *Optional* | `false`
   * logging  | Boolean | false不使用记录     					       | *Optional* | `true`
   * session  | Object  | 使用特定session对象.        			   | *Optional* | `null`
   * status   | Boolean | true获取最新的状态.        		       | *Optional* | `false`
   * xfbml    | Boolean | true封装成 [[wiki:XFBML]] 标签. 		   | *Optional* | `false`
   */
  init: function(options) {
    // 需要一个list数据
    // 这就是cookie/session/status不在这里的原因.
    options = FB.copy(options || {}, {
      logging: true
    });

    FB._apiKey = options.appId || options.apiKey;

    // 如果关闭记录， 只是url没有token去开启，允许第三方网站即使记录被关闭了，进行简单的打印
    if (!options.logging &&
        window.location.toString().indexOf('fb_debug=1') < 0) {
      FB._logging = false;
    }

    FB.XD.init(options.channelUrl);

    if (FB._apiKey) {
      // 允许cookie支持
      FB.Cookie.setEnabled(options.cookie);

      // 如果一个session对象不存在，尝试读取一个存在的cookie
      // 不自动写，但自动读
      options.session = options.session || FB.Cookie.load();

      // 设置session
      FB.Auth.setSession(options.session,
                         options.session ? 'connected' : 'unknown');

      // 如果需要加载最新的状态
      if (options.status) {
        FB.getLoginStatus();
      }
    }

    // 弱依赖XFBML
    if (options.xfbml) {
      // 在setTimeout里面延迟执行，除非当前的调用队列已经处理完
      window.setTimeout(function() {
        if (FB.XFBML) {
          FB.Dom.ready(FB.XFBML.parse);
        }
      }, 0);
    }
  }
});

// 这个非常有用当库异步加载时
// 我们使用setTimeout等待，除非当前事件队列已经完成
// 允许潜在库的代码被包括在这个代码块下面
window.setTimeout(function() { if (window.fbAsyncInit) { fbAsyncInit(); }}, 0);
