/**
*
* @provides fb.compat.ui
* @requires fb.prelude	fb.qs	fb.ui	fb.json
* @by 陈静
*/

/**
* NOTE：应该使用FB.ui()代替。
*
* UI 调用
*
* @class FB
* @static
* @access private
*/
FB.provide('', {
  /**
* NOTE：应该使用FB.ui()代替。
 *
* 共享是发布内容的轻量级的方法。
* 和[FB.publish][publish]调用中明确给出的结构化的数据相反，只需提供URL。
*
* FB.share('http://github.com/facebook/connect-js');
*
* 无参调用[FB.share][share]会共享当前页面
*
* 这个调用不需要用户登录
*
* [publish]: /docs/?u=facebook.jslib-alpha.FB.publish
* [share]: /docs/?u=facebook.jslib-alpha.FB.share
*
* @access private
* @param u {String} url(默认为当前URL)
*/
  share: function(u) {
    FB.log('FB.share() has been deprecated. Please use FB.ui() instead.');
    FB.ui({
      display : 'popup',
      method : 'stream.share',
      u : u
    });
  },

  /**
* NOTE：应该使用FB.ui()代替。
*
* 公开一个端口给stream。
*
* A post 可能包含以下属性:
*
* Property | Type | Description
* ------------------- | ------ | --------------------------------------
* message | String | This allows prepopulating the message.
* attachment | Object | An [[wiki:Attachment (Streams)]] object.
* action_links | Array | An array of [[wiki:Action Links]].
* actor_id | String | A actor profile/page id.
* target_id | String | A target profile id.
* user_message_prompt | String | Custom prompt message.
*
* 所有的参数都是可选的，视情况使用。
*
* @access private
* @param post {Object} post对象
* @param cb {Function} 根据action的结果调用的方法
*/
  publish: function(post, cb) {
    FB.log('FB.publish() has been deprecated. Please use FB.ui() instead.');
    post = post || {};
    FB.ui(FB.copy({
      display : 'popup',
      method : 'stream.publish',
      preview : 1
    }, post || {}), cb);
  },

  /**
* NOTE：应该使用FB.ui()代替。
*
* 添加给定id为friend。
*
* @access private
* @param id {String} 目标用户的id
* @param cb {Function} 根据action的结果调用的方法
*/
  addFriend: function(id, cb) {
    FB.log('FB.addFriend() has been deprecated. Please use FB.ui() instead.');
    FB.ui({
      display : 'popup',
      id : id,
      method : 'friend.add'
    }, cb);
  }
});