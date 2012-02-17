/**
*
* @provides fb.string
* @layer basic
* @requires fb.prelude
* @by 陈静
*
*/

/**
* 有关字符串的工具集。
*
* @class FB.String
* @static
* @private
*/
FB.provide('String', {
  /**
* 去除前置和末尾的空格
*
* @param s {String} 需要处理的字符串
* @returns {String} 处理后的字符串
*/
  trim: function(s) {
    return s.replace(/^\s*|\s*$/g, '');
  },

  /**
* 格式化字符串
*
* @static
* @param format {String} 格式规范	
* @param arguments {...} 占位符参数
* @returns {String} 格式化后的字符串
*/
  format: function(format) {
    if (!FB.String.format._formatRE) {
      FB.String.format._formatRE = /(\{[^\}^\{]+\})/g;
    }

    var values = arguments;

    return format.replace(
      FB.String.format._formatRE,
      function(str, m) {
        var
          index = parseInt(m.substr(1), 10),
          value = values[index + 1];
        if (value === null || value === undefined) {
          return '';
        }
        return value.toString();
      }
    );
  },

  /**
* 使得一个函数可以作为一个引用字符串嵌入到另一个字符串中。
*
* @param value {String} 需要引用的字符串
* @return {String} 被引用的字符串
*/
  quote: function(value) {
    var
      quotes = /["\\\x00-\x1f\x7f-\x9f]/g,
      subst = { // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
      };

    return quotes.test(value) ?
      '"' + value.replace(quotes, function (a) {
        var c = subst[a];
        if (c) {
          return c;
        }
        c = a.charCodeAt();
        return '\\u00' + Math.floor(c/16).toString(16) + (c % 16).toString(16);
      }) + '"' :
      '"' + value + '"';
  }
});