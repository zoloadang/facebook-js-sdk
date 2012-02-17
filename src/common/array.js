/**
*
* @provides fb.array
* @layer basic
* @requires fb.prelude
* @by 陈静
*/

/**
* 数组相关的辅助方法。
*
* @class FB.Array
* @private
* @static
*/
FB.provide('Array', {
  /**
* 返回某个数组项在数组内的索引值，如果没找到该项，则返回-1。
*
* @param arr {Array} 被查询的数组
* @param item {Object} 要定位的数组项
* @return {Number} 数组项的索引值
*/
  indexOf: function (arr, item) {
    if (arr.indexOf) {
      return arr.indexOf(item);
    }
    var length = arr.length;
    if (length) {
      for (var index = 0; index < length; index++) {
        if (arr[index] === item) {
          return index;
        }
      }
    }
    return -1;
  },

  /**
* 归并两个数组，并剔除重复，返回归并后的新数组。
*
* @param target {Array} 目标数组
* @param source {Array} 源数组
* @return {Array} 归并后的数组
*/
  merge: function(target, source) {
    for (var i=0; i < source.length; i++) {
      if (FB.Array.indexOf(target, source[i]) < 0) {
        target.push(source[i]);
      }
    }
    return target;
  },

  /**
* 过滤指定数组，并返回过滤后的数组
*
* @param arr {Array} 源数组
* @param fn {Function} 过滤函数
* @return {Array} 过滤后的数组
*/
  filter: function(arr, fn) {
    var b = [];
    for (var i=0; i < arr.length; i++) {
      if (fn(arr[i])) {
        b.push(arr[i]);
      }
    }
    return b;
  },

  /**
* 用指定对象的键创建一个数组
*
* @param obj {Object} 源对象
* @param proto {Boolean} 指定包含继承的属性为true
* @return {Array} 键数组
*/
  keys: function(obj, proto) {
    var arr = [];
    for (var key in obj) {
      if (proto || obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  },

  /**
* 转化源数组，返回转化后的新数组
*
* @param arr {Array} 源数组
* @param transform {Function} 转化函数
* @return {Array} 转化后的数组
*/
  map: function(arr, transform) {
    var ret = [];
    for (var i=0; i < arr.length; i++) {
      ret.push(transform(arr[i]));
    }
    return ret;
  },

  /**
* 用于遍历数组和对象
*
* @param {Object} item 一个数组或对象
* @param {Function} fn 遍历后的回调函数，改函数会传递参数(value, [index/key], item)
* @param {Bool} proto 是否包含原型属性
*
*/
   forEach: function(item, fn, proto) {
    if (!item) {
      return;
    }

    if (Object.prototype.toString.apply(item) === '[object Array]' ||
        (!(item instanceof Function) && typeof item.length == 'number')) {
      if (item.forEach) {
        item.forEach(fn);
      } else {
        for (var i=0, l=item.length; i<l; i++) {
          fn(item[i], i, item);
        }
      }
    } else {
      for (var key in item) {
        if (proto || item.hasOwnProperty(key)) {
          fn(item[key], key, item);
        }
      }
    }
  }
});