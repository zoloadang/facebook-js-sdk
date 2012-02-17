/**
*
* @provides fb.compat.xfbml
* @requires fb.prelude fb.xfbml
* @by 陈静
*/

/**
* 渲染标签[[wiki:XFBML]]的方法
*
* 要渲染标签，只需把标签放在页面的任一位置，然后调用: FB.XFBML.parse();
*
* @class FB.XFBML
* @static
*/
FB.provide('XFBML', {
  /**
* NOTE: 这个方法已经废弃了。
*		替代该方法的是：自己设置innerHTML，然后在该DOM元素上调用FB.XFBML.parse()。
*
* 给一个指定的DOM元素动态设置XFBML标记。如果你想在页面载入完成后设置XFBML，可以使用本方法。
*
* @access private
* @param {DOMElement} dom DOM元素
* @param {String} markup XFBML标记。也可以包含常规的HTML标记。
*/
  set: function(dom, markup, cb) {
    FB.log('FB.XFBML.set() has been deprecated.');
    dom.innerHTML = markup;
    FB.XFBML.parse(dom, cb);
  }
});