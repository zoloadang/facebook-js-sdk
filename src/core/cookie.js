/**
 * FB Cookie
 * 为FB创建新的命名空间Cookie
 * @by 兰七
 */
FB.provide('Cookie', {
  /**
   * 保留base_domain属性去映射Cookie的domain
   * @access private
   * @type String
   * @by 兰七
   */
  _domain: null,

  /**
   * 提示Cookie支持是否开启
   * @access private
   * @type Boolean
   * @by 兰七
   */
  _enabled: false,

  /**
   * 设置Cookie支持的开关
   * @access private
   * @param val {Boolean} true是开启, false是关闭
   * @by 兰七
   */
  setEnabled: function(val) {
    FB.Cookie._enabled = val;
  },

  /**
   * 返回Cookie系统当前的状态
   * @access private
   * @returns {Boolean} 如果Cookie支持开启返回true
   * @by 兰七
   */
  getEnabled: function() {
    return FB.Cookie._enabled;
  },

  /**
   * 从Cookie中尝试加载session
   * @access private
   * @return {Object} Cookie中的session对象
   * @by 兰七
   */
  load: function() {
    var
      // 注意，正则表达式中“没有闭合，因为\b会处理它
      cookie = document.cookie.match('\\bfbs_' + FB._apiKey + '="([^;]*)\\b'),
      session;

    if (cookie) {
      // url转码了session
      session = FB.QS.decode(cookie[1]);
      // 解码成字符串，再转成数字
      session.expires = parseInt(session.expires, 10);
      // 需要可以获得base_domain
      FB.Cookie._domain = session.base_domain;
    }

    return session;
  },

  /**
   * 辅助函数去设置Cookie值
   * @access private
   * @param val    {String} 字符串，已经转码
   * @param ts     {Number} 到期时间戳
   * @param domain {String} Cookie的可选domain
   * @by 兰七
   */
  setRaw: function(val, ts, domain) {
    document.cookie =
      'fbs_' + FB._apiKey + '="' + val + '"' +
      (val && ts == 0 ? '' : '; expires=' + new Date(ts * 1000).toGMTString()) +
      '; path=/' +
      (domain ? '; domain=.' + domain : '');

    // 需要时可以获得domain
    FB.Cookie._domain = domain;
  },

  /**
   * 用所给的session对象来设置Cookie
   * @access private
   * @param session {Object} session对象
   * @by 兰七
   */
  set: function(session) {
    session
      ? FB.Cookie.setRaw(
          FB.QS.encode(session),
          session.expires,
          session.base_domain)
      : FB.Cookie.clear();
  },

  /**
   * 清除Cookie
   * @access private
   * @by 兰七
   */
  clear: function() {
    FB.Cookie.setRaw('', 0, FB.Cookie._domain);
  }
});
