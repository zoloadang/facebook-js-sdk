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
 * @provides fb.event
 * @requires fb.prelude fb.array
 */

// 注意：虽然标志它为FB.Event,但实质内部是FB.EventProvider,用于解决文件系统上的限制；
// 译者注：实现了一个订阅者模式
/**
 * 全局命名事件的事件处理机制。
 *
 * @static
 * @class FB.Event
 */
FB.provide('EventProvider', {
  /**
   * 返回内部用户数组，可以直接做添加/删除的动作。
   *
   * @access private
   * @return {Object}
   */
  subscribers: function() {
    //这个看起来很奇怪的逻辑实质是允许实例生成事件map的。当它在混合风格中使用的时候，如果订阅者
    //是一个对象字面量本身，我们就会发现实例共享订阅者情况下的问题。
    
    if (!this._subscribersMap) {
      this._subscribersMap = {};
    }
    return this._subscribersMap;
  },

  /**
   * 订阅一个给定的事件名，当事件被触发的时候就会调用你的回调函数。
   *
   * 例如，假设你想当session改变的时候能够得到通知：
   *  
   *
   *     FB.Event.subscribe('auth.sessionChange', function(response) {
   *       // do something with response.session
   *     });
   *
   * 全局事件:
   *
   * - auth.login -- 用户登陆的时候触发
   * - auth.logout -- 用户退出的视乎触发
   * - auth.sessionChange -- session改变的时候触发
   * - auth.statusChange -- 状态改变的时候触发
   * - xfbml.render -- FB.XFBML.parse() 调用完成触发
   * - edge.create -- 当用户点击喜欢什么东西的时候触发(fb:like)
   * - comments.add -- 当用户添加留言的时候触发(fb:comments)
   * - fb.log -- fired on log message
   *
   * @access public
   * @param name {String} Name of the event.
   * @param cb {Function} The handler function.
   */
  subscribe: function(name, cb) {
    var subs = this.subscribers();

    if (!subs[name]) {
      subs[name] = [cb];
    } else {
      subs[name].push(cb);
    }
  },

  /**
   * 删除订阅者，跟订阅相对的[FB.Event.subscribe](FB.Event.subscribe)。
   *
   * 删除订阅者跟添加订阅者基本一样。需要传递同样的事件名和函数去把之前添加的订阅者删掉。
   * 用一个类似[FB.Event.subscribe](FB.event.subscribe)的例子，演示：
   * 
   *
   *     var onSessionChange = function(response) {
   *       // do something with response.session
   *     };
   *     FB.Event.subscribe('auth.sessionChange', onSessionChange);
   *
   *     // sometime later in your code you dont want to get notified anymore
   *     FB.Event.unsubscribe('auth.sessionChange', onSessionChange);
   *
   * @access public
   * @param name {String} Name of the event.
   * @param cb {Function} The handler function.
   */
  unsubscribe: function(name, cb) {
    var subs = this.subscribers()[name];

    FB.Array.forEach(subs, function(value, key) {
      if (value == cb) {
        subs[key] = null;
      }
    });
  },

  /**
   * 随着时间的推移，事件被反复监听，当监听器被调用的时候，回调就立刻被调用，然后每次触发
   * 事件，当回调返回true时，订阅被取消。
   *
   * @access private
   * @param {string} name Name of event.
   * @param {function} 
   * 回调函数。任何传递给监听器的多余参数都会传递给回调函数。当回调返回true时，监听器就会停止。
   */
  monitor: function(name, callback) {
    if (!callback()) {
      var
        ctx = this,
        fn = function() {
          if (callback.apply(callback, arguments)) {
            ctx.unsubscribe(name, fn);
          }
        };

      this.subscribe(name, fn);
    }
  },

  /**
   * 删除所有命名事件的订阅者。
   *
   * 你需要传递向FB.Event.subscribe传递的同样的函数名。
   * 当你不想再监听这个事件并且确信多个监听者已经被创建的时候，这个函数就显得非常有用。
   *
   * @access private
   * @param name    {String}   name of the event
   */
  clear: function(name) {
    delete this.subscribers()[name];
  },

  /**
   * 触发一个命名事件。第一个参数是事件名，其余的参数就会传递给订阅者。
   *
   * @access private
   * @param name {String} the event name
   */
  fire: function() {
    var
      args = Array.prototype.slice.call(arguments),
      name = args.shift();

    FB.Array.forEach(this.subscribers()[name], function(sub) {
      // this is because we sometimes null out unsubscribed rather than jiggle
      // the array
      if (sub) {
        sub.apply(this, args);
      }
    });
  }
});

/**
 * 返回内部用户数组，可以直接做添加/删除的动作。
 *
 * @class FB.Event
 * @extends FB.EventProvider
 */
FB.provide('Event', FB.EventProvider);
