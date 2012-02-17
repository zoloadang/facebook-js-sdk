/**
*
* @provides fb.type
* @layer basic
* @requires fb.prelude
* @by 陈静
*/

// 提供Class/Type 支持。

/**
*
* @class FB
* @static
*/
FB.provide('', {
  /**
* 绑定一个函数到给定的上下文和参数。
*
* @static
* @access private
* @param fn {Function} 要绑定的函数
* @param context {Object} 作为函数执行上下文的对象
* @param {...} 其他要绑定到函数的参数
* @returns {Function} 绑定后的函数
*/
  bind: function() {
    var
      args = Array.prototype.slice.call(arguments),
      fn = args.shift(),
      context = args.shift();
    return function() {
      return fn.apply(
        context,
        args.concat(Array.prototype.slice.call(arguments))
      );
    };
  },

  /**
* 创建一个新类
*
* @access private
* @param name {string} 类名
* @param constructor {function} 构造器
* @param proto {object} 类的实例方法
*/
  Class: function(name, constructor, proto) {
    if (FB.CLASSES[name]) {
      return FB.CLASSES[name];
    }

    var newClass = constructor || function() {};

    newClass.prototype = proto;
    newClass.prototype.bind = function(fn) {
      return FB.bind(fn, this);
    };

    newClass.prototype.constructor = newClass;
    FB.create(name, newClass);
    FB.CLASSES[name] = newClass;
    return newClass;
  },

  /**
* 创建一个子类
* Note: 要调用基类的构造器，可以使用 this._base(...)
*		如果已经覆盖了基类的一个方法（假设为'foo')，
*		但仍想调用基类的该方法，则使用 this._callBase('foo', ...)
*
* @access private
* @param {string} name 类名
* @param {string} baseName 基类类名
* @param {function} constructor 构造器
* @param {object} proto 类的实例方法
*/
  subclass: function(name, baseName, constructor, proto) {
    if (FB.CLASSES[name]) {
      return FB.CLASSES[name];
    }
    var base = FB.create(baseName);
    FB.copy(proto, base.prototype);
    proto._base = base;
    proto._callBase = function(method) {
      var args = Array.prototype.slice.call(arguments, 1);
      return base.prototype[method].apply(this, args);
    };

    return FB.Class(
      name,
      constructor ? constructor : function() {
        if (base.apply) {
          base.apply(this, arguments);
        }
      },
      proto
    );
  },

  CLASSES: {}
});


  /**
* 判断给定对象是否是指定类型
*
* @class FB.Type
* @static
* @private
*/
FB.provide('Type', {
  isType: function(obj, type) {
    while (obj) {
      if (obj.constructor === type || obj === type) {
        return true;
      } else {
        obj = obj._base;
      }
    }
    return false;
  }
});