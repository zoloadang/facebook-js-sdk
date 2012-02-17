/**
*
* @provides fb.obj
* @requires fb.type
* fb.json
* fb.event
* @by 陈静
*/

/**
* 支持事件的基本对象类型
*
* @class FB.Obj
* @private
*/
FB.Class('Obj', null,
  FB.copy({
    /**
* 设置object的属性，并且当属性改变时，触发事件的改变
*
* @param {String} 属性名称。属性改变时，一个具有相同名称的事件将会被触发。
* @param {Object} 指定属性的新值
* @private
*/
     setProperty: function(name, value) {
       // 检查属性是否改变
       if (FB.JSON.stringify(value) != FB.JSON.stringify(this[name])) {
         this[name] = value;
         this.fire(name, value);
       }
     }
  }, FB.EventProvider)
);