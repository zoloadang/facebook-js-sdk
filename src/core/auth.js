/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.auth
 * @requires fb.prelude
 *           fb.qs
 *           fb.event
 *           fb.json
 *           fb.ui
 */

/**
 * Authentication, Authorization & Sessions.
 * 会话认证
 *
 * @class FB
 * @static
 * @access private
 */
FB.provide('', {
  /**
   * Find out the current status from the server, and get a session if the user
   * is connected.
   * 从服务器上找到当前用户状态，如果用户已经连接上，则给予一个session
   *
   * The user's status or the question of *who is the current user* is
   * the first thing you will typically start with. For the answer, we
   * ask facebook.com. Facebook will answer this question in one of
   * two ways:
   * 用户状态，即“当前用户是谁”的问题，是打开页面后首要解决的问题。
   * 为了获得这个信息，我们向facebook.com发请求，facebook将以以下两种信息回答这个问题：
   *
   * 1. Someone you don't know.
   * 2. Someone you know and have interacted with. Here's a session for them.
   * 
   * 1. 你不认识的人
   * 2. 你认识并且与之交互的人。这样的人拥有一个fb派发的session。
   *
   * Here's how you find out:
   * 以下演示你如何找出这个答案：
   *
   *     FB.getLoginStatus(function(response) {
   *       if (response.session) {
   *         // logged in and connected user, someone you know
   *       } else {
   *         // no user session available, someone you dont know
   *       }
   *     });
   *
   * 
   * The example above will result in the callback being invoked **once**
   * on load based on the session from www.facebook.com. JavaScript applications
   * are typically written with heavy use of events, and the SDK **encourages**
   * this by exposing various events. These are fired by the various
   * interactions with authentication flows, such as [FB.login()][login] or
   * [[wiki:fb:login-button]]. Widgets such as [[wiki:fb:comments (XFBML)]]
   * may also trigger authentication.
   * 上面的例子将导致从facebook获得session的页面在加载完毕的时候触发一次回调。
   * js应用常常具备大量事件，而本sdk也暴露了各种事件。
   * 他们被多种需要授权的交互流程触发，比如登录、评论。
   *
   * **Events**
   *
   * #### auth.login
   * This event is fired when your application first notices the user (in other
   * words, gets a session when it didn't already have a valid one).
   * 当你的应用第一次识别出用户的时候触发
   * 
   * #### auth.logout
   * This event is fired when your application notices that there is no longer
   * a valid user (in other words, it had a session but can no longer validate
   * the current user).
   * 当你的应用发现用户未严重的时候触发
   * 
   * #### auth.sessionChange
   * This event is fired for **any** auth related change as they all affect the
   * session: login, logout, session refresh. Sessions are refreshed over time
   * as long as the user is active with your application.
   * 这个事件由任何影响sessiong的认证相关的改变触发：登录，等处，session刷新。
   * 在用户登录你的应用的时间内，session可以被刷新多次。
   * 
   * #### auth.statusChange
   * Typically you will want to use the auth.sessionChange event. But in rare
   * cases, you want to distinguish between these three states:
   * 通常你会希望使用auth.sessionChange事件。
   * 但少数情况下，你会希望区分出一下3种状态：
   *
   * - Connected
   * - Logged into Facebook but not connected with your application
   * - Not logged into Facebook at all.
   * 
   * - 已连接
   * - 登录到fb但未连接你的应用
   * - 完全没有登录facebook
   *
   * The [FB.Event.subscribe][subscribe] and
   * [FB.Event.unsubscribe][unsubscribe] functions are used to subscribe to
   * these events. For example:
   *
   *     FB.Event.subscribe('auth.login', function(response) {
   *       // do something with response
   *     });
   *
   * The response object returned to all these events is the same as the
   * response from [FB.getLoginStatus][getLoginStatus], [FB.login][login] or
   * [FB.logout][logout]. This response object contains:
   * 这些事件的返回对象都一样，该对象包含：
   *
   * status
   * : The status of the User. One of `connected`, `notConnected` or `unknown`.
   * : 用户的状态。可选值：已连接/未链接/不知道。
   * session
   * : The session object.
   * ： session对象
   *
   * perms
   * : The comma separated permissions string. This is specific to a
   *   permissions call. It is not persistent.
   * ： 逗号分隔的许可字符串。它特定于一次许可调用，是非持久的。
   *
   * [subscribe]: /docs/reference/javascript/FB.Event.subscribe
   * [unsubscribe]: /docs/reference/javascript/FB.Event.unsubscribe
   * [getLoginStatus]: /docs/reference/javascript/FB.getLoginStatus
   * [login]: /docs/reference/javascript/FB.login
   * [logout]: /docs/reference/javascript/FB.logout
   *
   * @access public
   * @param cb {Function} The callback function.
   * @param force {Boolean} Force reloading the login status (default `false`).
   */
  getLoginStatus: function(cb, force) {
    if (!FB._apiKey) {
      FB.log('FB.getLoginStatus() called before calling FB.init().');
      return;
    }

    // we either invoke the callback right away if the status has already been
    // loaded, or queue it up for when the load is done.
    if (cb) {
      if (!force && FB.Auth._loadState == 'loaded') {
        cb({ status: FB._userStatus, session: FB._session });
        return;
      } else {
        FB.Event.subscribe('FB.loginStatus', cb);
      }
    }

    // if we're already loading, and this is not a force load, we're done
    if (!force && FB.Auth._loadState == 'loading') {
      return;
    }

    FB.Auth._loadState = 'loading';

    // invoke the queued sessionLoad callbacks
    var lsCb = function(response) {
      // done
      FB.Auth._loadState = 'loaded';

      // invoke callbacks
      FB.Event.fire('FB.loginStatus', response);
      FB.Event.clear('FB.loginStatus');
    };

    // finally make the call to login status
    FB.ui({ method: 'auth.status', display: 'hidden' }, lsCb);
  },

  /**
   * *Synchronous* accessor for the current Session. The **synchronous**
   * nature of this method is what sets it apart from the other login methods.
   * It is similar in nature to [FB.getLoginStatus()][FB.getLoginStatus], but
   * it just **returns** the session. Many parts of your application already
   * *assume* the user is connected with your application. In such cases, you
   * may want to avoid the overhead of making asynchronous calls.
   * 同步获取当前session。
   * 这个方法的同步是指其独立于其他登录方法。
   * 性质上和FB.getLoginStatus相近，但它仅仅返回session。
   * 你的应用通常都假定用户已连接上。
   * 在这种情况下，你可能希望避免使用同步调用。
   *
   * NOTE: You should never use this method at *page load* time. Generally, it
   * is safer to use [FB.getLoginStatus()][FB.getLoginStatus] if you are
   * unsure.
   * 注意：不要在页面加载的时候使用这个方法。
   * 通常，当你不确认的时候，使用FB.getLoginStatus方法会安全的多。
   *
   * [FB.getLoginStatus]: /docs/reference/javascript/FB.getLoginStatus
   *
   * @access public
   * @return {Object} the current Session if available, `null` otherwise
   */
  getSession: function() {
    return FB._session;
  },

  /**
   * Login/Authorize/Permissions.
   *
   * Once you have determined the user's status, you may need to
   * prompt the user to login. It is best to delay this action to
   * reduce user friction when they first arrive at your site. You can
   * then prompt and show them the "Connect with Facebook" button
   * bound to an event handler which does the following:
   * 一旦你确定了用户的状态，你可能需要提示用户登录。
   * 当他们第一次访问你的页面时，你最好延迟这个行为以减少用户冲突。
   * 你可以稍后提示用户，并显示绑定了以下事件处理器的“链接facebook‘按钮。
   * 
   *
   *     FB.login(function(response) {
   *       if (response.session) {
   *         // user successfully logged in
   *       } else {
   *         // user cancelled login
   *       }
   *     });
   *
   * You should **only** call this on a user event as it opens a
   * popup. Most browsers block popups, _unless_ they were initiated
   * from a user event, such as a click on a button or a link.
   * 你应当仅在用户打开了一个弹出层时调用这个方法。
   * 很多浏览器阻止了弹出层，除非这个行为由用户触发，比如点击了一个按钮或者链接。
   *
   *
   * Depending on your application's needs, you may need additional
   * permissions from the user. A large number of calls do not require
   * any additional permissions, so you should first make sure you
   * need a permission. This is a good idea because this step
   * potentially adds friction to the user's process. Another point to
   * remember is that this call can be made even _after_ the user has
   * first connected. So you may want to delay asking for permissions
   * until as late as possible:
   * 根据你的应用的需要，你可能需要用户给你额外的许可。
   * 大多数的调用并不需要额外的许可，所以你首先需要确认你需要额外的许可。
   * 这是一个好注意，应为这个步骤增加了用户进程的潜在冲突。
   * 另外一点需要注意的是当用户第一次连接上之后，这个方法仍然可以调用。
   * 所以你可能希望仅可能晚的向用户申请额外的许可。
   *
   *     FB.login(function(response) {
   *       if (response.session) {
   *         if (response.perms) {
   *           // user is logged in and granted some permissions.
   *           // perms is a comma separated list of granted permissions
   *         } else {
   *           // user is logged in, but did not grant any permissions
   *         }
   *       } else {
   *         // user is not logged in
   *       }
   *     }, {perms:'read_stream,publish_stream,offline_access'});
   *
   * @access public
   * @param cb {Function} The callback function.
   * @param opts {Object} (_optional_) Options to modify login behavior.
   *
   * Name                     | Type    | Description
   * ------------------------ | ------- | --------------------------------------------------------------------------------
   * perms                    | String  | Comma separated list of [Extended permissions](/docs/authentication/permissions)
   * enable_profile_selector  | Boolean | When true, prompt the user to grant permission for one or more Pages.
   * profile_selector_ids     | String  | Comma separated list of IDs to display in the profile selector.
   */
  login: function(cb, opts) {
    opts = FB.copy({ method: 'auth.login', display: 'popup' }, opts || {});
    FB.ui(opts, cb);
  },

  /**
   * Logout the user in the background.
   * 后台登出
   *
   * Just like logging in is tied to facebook.com, so is logging out -- and
   * this call logs the user out of both Facebook and your site. This is a
   * simple call:
   * 就像绑定到facebook的登陆一样，登出也如此。并且调用日志记录用户登出了facebook和你的网站。
   * 下面是一个简单的调用：
   *
   *     FB.logout(function(response) {
   *       // user is now logged out
   *     });
   *
   * NOTE: You can only log out a user that is connected to your site.
   * 注意：你只能记录一个连接了你网站的用户登出。
   *
   * @access public
   * @param cb {Function} The callback function.
   */
  logout: function(cb) {
    FB.ui({ method: 'auth.logout', display: 'hidden' }, cb);
  }
});

/**
 * Internal Authentication implementation.
 * 内部认证实现
 *
 * @class FB.Auth
 * @static
 * @access private
 */
FB.provide('Auth', {
  // pending callbacks for FB.getLoginStatus() calls
  _callbacks: [],

  /**
   * Set a new session value. Invokes all the registered subscribers
   * if needed.
   * 设置一个新的session值。
   * 如果需要的话，可以触发所有的订阅。
   *
   * @access private
   * @param session {Object}  the new Session
   * @param status  {String}  the new status
   * @return       {Object}  the "response" object
   */
  setSession: function(session, status) {
    // detect special changes before changing the internal session
    var
      login         = !FB._session && session,
      logout        = FB._session && !session,
      both          = FB._session && session && FB._session.uid != session.uid,
      sessionChange = login || logout || (FB._session && session &&
                         FB._session.session_key != session.session_key),
      statusChange  = status != FB._userStatus;

    var response = {
      session : session,
      status  : status
    };

    FB._session = session;
    FB._userStatus = status;

    // If cookie support is enabled, set the cookie. Cookie support does not
    // rely on events, because we want the cookie to be set _before_ any of the
    // event handlers are fired. Note, this is a _weak_ dependency on Cookie.
    if (sessionChange && FB.Cookie && FB.Cookie.getEnabled()) {
      FB.Cookie.set(session);
    }

    // events
    if (statusChange) {
      /**
       * Fired when the status changes.
       *
       * @event auth.statusChange
       */
      FB.Event.fire('auth.statusChange', response);
    }
    if (logout || both) {
      /**
       * Fired when a logout action is performed.
       *
       * @event auth.logout
       */
      FB.Event.fire('auth.logout', response);
    }
    if (login || both) {
      /**
       * Fired when a login action is performed.
       *
       * @event auth.login
       */
      FB.Event.fire('auth.login', response);
    }
    if (sessionChange) {
      /**
       * Fired when the session changes. This includes a session being
       * refreshed, or a login or logout action.
       *
       * @event auth.sessionChange
       */
      FB.Event.fire('auth.sessionChange', response);
    }

    // re-setup a timer to refresh the session if needed. we only do this if
    // FB.Auth._loadState exists, indicating that the application relies on the
    // JS to get and refresh session information (vs managing it themselves).
    if (FB.Auth._refreshTimer) {
      window.clearTimeout(FB.Auth._refreshTimer);
      delete FB.Auth._refreshTimer;
    }
    if (FB.Auth._loadState && session && session.expires) {
      // refresh every 20 minutes. we don't rely on the expires time because
      // then we would also need to rely on the local time available in JS
      // which is often incorrect.
      FB.Auth._refreshTimer = window.setTimeout(function() {
        FB.getLoginStatus(null, true); // force refresh
      }, 1200000); // 20 minutes
    }

    return response;
  },

  /**
   * This handles receiving a session from:
   * 这个处理器从以下3处接收session：
   *  - login_status.php
   *  - login.php
   *  - tos.php  
   *
   * It also (optionally) handles the ``xxRESULTTOKENxx`` response from:
   * 它可以处理来自以下页面的``xxRESULTTOKENxx``返回
   *  - prompt_permissions.php
   *
   * And calls the given callback with:
   * 并且以下面的对象为参数调用回调函数：
   *
   *   {
   *     session: session or null,
   *     status: 'unknown' or 'notConnected' or 'connected',
   *     perms: comma separated string of perm names
   *   }
   *
   * @access private
   * @param cb        {Function} the callback function
   * @param frame     {String}   the frame id for the callback is tied to
   * @param target    {String}   parent or opener to indicate window relation
   * @param isDefault {Boolean}  is this the default callback for the frame
   * @param status    {String}   the connect status this handler will trigger
   * @param session   {Object}   backup session, if none is found in response
   * @return         {String}   the xd url bound to the callback
   */
  xdHandler: function(cb, frame, target, isDefault, status, session) {
    return FB.UIServer._xdNextHandler(function(params) {
      try {
        session = FB.JSON.parse(params.session);
      } catch (x) {
        // ignore parse errors
      }
      var response = FB.Auth.setSession(session || null, status);

      // incase we were granted some new permissions
      response.perms = (
        params.result != 'xxRESULTTOKENxx' && params.result || '');

      // user defined callback
      cb && cb(response);
    }, frame, target, isDefault) + '&result=xxRESULTTOKENxx';
  }
});

FB.provide('UIServer.Methods', {
  'auth.login': {
    size      : { width: 627, height: 326 },
    url       : 'login.php',
    transform : function(call) {
      //FIXME
      if (!FB._apiKey) {
        FB.log('FB.login() called before calling FB.init().');
        return;
      }

      // if we already have a session and permissions are not being requested,
      // we just fire the callback
      if (FB._session && !call.params.perms) {
        FB.log('FB.login() called when user is already connected.');
        call.cb && call.cb({ status: FB._userStatus, session: FB._session });
        return;
      }

      var
        xdHandler = FB.Auth.xdHandler,
        cb        = call.cb,
        id        = call.id,
        session   = FB._session,
        cancel    = xdHandler(
          cb,
          id,
          'opener',
          true, // isDefault
          FB._userStatus,
          session),
        next      = xdHandler(
          cb,
          id,
          'opener',
          false, // isDefault
          'connected',
          session);

      FB.copy(call.params, {
        cancel_url              : cancel,
        channel_url             : window.location.toString(),
        next                    : next,
        fbconnect               : FB._inCanvas ? 0 : 1,
        req_perms               : call.params.perms,
        enable_profile_selector : call.params.enable_profile_selector,
        profile_selector_ids    : call.params.profile_selector_ids,
        return_session          : 1,
        session_version         : 3,
        v                       : '1.0'
      });
      delete call.cb;
      delete call.params.perms; //TODO fix name to be the same on server

      return call;
    }
  },

  'auth.logout': {
    url       : 'logout.php',
    transform : function(call) {
      //FIXME make generic
      if (!FB._apiKey) {
        FB.log('FB.logout() called before calling FB.init().');
      } else if (!FB._session) {
        FB.log('FB.logout() called without a session.');
      } else {
        call.params.next = FB.Auth.xdHandler(
          call.cb, call.id, 'parent', false, 'unknown');
        return call;
      }
    }
  },

  'auth.status': {
    url       : 'extern/login_status.php',
    transform : function(call) {
      var
        cb = call.cb,
        id = call.id,
        xdHandler = FB.Auth.xdHandler;
      delete call.cb;
      FB.copy(call.params, {
        no_session : xdHandler(cb, id, 'parent', false, 'notConnected'),
        no_user    : xdHandler(cb, id, 'parent', false, 'unknown'),
        ok_session : xdHandler(cb, id, 'parent', false, 'connected'),
        session_version : 3,
        extern: FB._inCanvas ? 0 : 2
      });
      return call;
    }
  }
});
