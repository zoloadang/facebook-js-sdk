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
 * @provides fb.xfbml.element
 * @layer xfbml
 * @requires fb.type fb.event fb.array
 */

/**
 * Base class for all XFBML elements. To create your own XFBML element, make a
 * class that derives from this, and then call [FB.XFBML.registerTag](FB.XFBML.registerTag).
 *
 * @access private
 * @class FB.XFBML.Element
 */


/**
 * XFBML elements基类
 *
 * 如果要创建自己的XFBML elements,必须继承这个类，然后调用 FB.XFBML.registerTag方法
 */

FB.Class('XFBML.Element',
  /**
   * Create a new Element.
   *
   * @access private
   * @constructor
   * @param dom {DOMElement} the DOMElement for the tag
   */

    /**
     * 创建一个新的元素
     *
     * 私有构造函数
     * @param dom
     */
  function(dom) {
    this.dom = dom;
  },

  FB.copy({
  /**
   * Get the value of an attribute associated with this tag.
   *
   * Note, the transform function is never executed over the default value. It
   * is only used to transform user set attribute values.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   * @param transform {Function} Optional function to transform found value.
   * @return {Object} final value
   */


      /**
       * 获取标签里的属性值
       * @param name 属性名
       * @param defaultValue 默认值
       * @param transform （可选） 可以设置一个转换获取到的值的函数
       */
  getAttribute: function(name, defaultValue, transform) {
    var value = (
      this.dom.getAttribute(name) ||
      this.dom.getAttribute(name.replace(/-/g, '_')) ||
      this.dom.getAttribute(name.replace(/-/g, ''))
    );
    return value ? (transform ? transform(value) : value) : defaultValue;
  },

  /**
   * Helper function to extract boolean attribute value.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   */

      /**
       * 处理bool类型的辅助函数
       *    为了处理获取到的字符串能表示正确的类型
       * @param name
       * @param defaultValue
       */
  _getBoolAttribute: function(name, defaultValue) {
    return this.getAttribute(name, defaultValue, function(s) {
      s = s.toLowerCase();
      return s == 'true' || s == '1' || s == 'yes' || s == 'on';
    });
  },

  /**
   * Get an integer value for size in pixels.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   */

      /**
       * 获取样式中尺寸的整数值
       *    css中height,widht这些值取过来，包含px,auto等，不能直接当数字类型用
       * @param name
       * @param defaultValue
       */
  _getPxAttribute: function(name, defaultValue) {
    return this.getAttribute(name, defaultValue, function(s) {
      var size = parseInt(s.replace('px', ''), 10);
      if (isNaN(size)) {
        return defaultValue;
      } else {
        return size;
      }
    });
  },

  /**
   * Get a value if it is in the allowed list, otherwise return the default
   * value. This function ignores case and expects you to use only lower case
   * allowed values.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value
   * @param allowed {Array} List of allowed values.
   */

      /**
       * 获取属性值，但是如果这个值不在指定的列表中（@param allowed），就返回默认值
       * 此函数忽略大小写
       * @param name
       * @param defaultValue
       * @param allowed
       */
  _getAttributeFromList: function(name, defaultValue, allowed) {
    return this.getAttribute(name, defaultValue, function(s) {
      s = s.toLowerCase();
      if (FB.Array.indexOf(allowed, s) > -1) {
        return s;
      } else {
        return defaultValue;
      }
    });
  },

  /**
   * Check if this node is still valid and in the document.
   *
   * @access private
   * @returns {Boolean} true if element is valid
   */

      /**
       * 检查当前节点是否仍然可用，并且依然在文档中
       */
  isValid: function() {
    for (var dom = this.dom; dom; dom = dom.parentNode) {
      if (dom == document.body) {
        return true;
      }
    }
  },

  /**
   * Clear this element and remove all contained elements.
   *
   * @access private
   */

      /**
       * 清除此当前元素，并且移除所有包含的节点
       *    这注释与功能不符，this.dom.innerHTML = '';不能清除本身，不解
       *
       */
  clear: function() {
    this.dom.innerHTML = '';
  }
}, FB.EventProvider));
