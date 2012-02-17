/**
 * FB dialog
 * 为FB创建新的命名空间Dialog
 * @by 兰七
 */
FB.provide('Dialog', {
  /**
   * 加载元素
   * @access private
   * @type DOMElement
   * @by 兰七
   */
  _loaderEl: null,

  /**
   * 活动状态dialog组成的队列.
   * @access private
   * @by 兰七
   */
  _stack: [],

  /**
   * 当前激活的dialog
   * @access private
   * @by 兰七
   */
  _active: null,

  /**
   * 通过其子节点找到dialog的根节点，如果存在会检测其是否有fb_dialog类名，有就返回
   * @access private
   * @param node {DOMElement} dialog的子节点
   * @return {DOMElement} 返回找到的dialog的根节点
   * @by 兰七
   */
  _findRoot: function(node) {
    while (node) {
      if (FB.Dom.containsCss(node, 'fb_dialog')) {
        return node;
      }
      node = node.parentNode;
    }
  },

  /**
   * 显示“loading”的dialog，这是一个特殊的框，如果回调函数存在，关闭按钮会显示，点击后会关闭dialog
   * @access private
   * @param cb {Function} 可选的 ， 关闭动作的回调函数
   * @by 兰七
   */
  _showLoader: function(cb) {
    if (!FB.Dialog._loaderEl) {
      FB.Dialog._loaderEl = FB.Dialog._findRoot(FB.Dialog.create({
        content: (
          '<div class="fb_dialog_loader">' +
            FB.Intl.tx('sh:loading') +
            '<a id="fb_dialog_loader_close"></a>' +
          '</div>'
        )
      }));
    }

    // 可以显示加载框，为一个已经激活尚未加载完成的dialog
    var loaderClose = FB.$('fb_dialog_loader_close');
    if (cb) {
      FB.Dom.removeCss(loaderClose, 'fb_hidden');
      loaderClose.onclick = function() {
        FB.Dialog._hideLoader();
        cb();
      };
    } else {
      FB.Dom.addCss(loaderClose, 'fb_hidden');
      loaderClose.onclick = null;
    }
	
    FB.Dialog._makeActive(FB.Dialog._loaderEl);
  },

  /**
   * 如果加载dialog可见，将其隐藏
   * @access private
   * @by 兰七
   */
  _hideLoader: function() {
    if (FB.Dialog._loaderEl && FB.Dialog._loaderEl == FB.Dialog._active) {
      FB.Dialog._loaderEl.style.top = '-10000px';
    }
  },

  /**
   * 降低激活状态的dialog层级，设置新的dialog为激活对象，并使其居中
   * @access private
   * @param el {DOMElement} 需要激活的dialog
   * @by 兰七
   */
  _makeActive: function(el) {
    FB.Dialog._lowerActive();
    var
      dialog = {
        width  : parseInt(el.offsetWidth, 10),
        height : parseInt(el.offsetHeight, 10)
      },
      view   = FB.Dom.getViewportInfo(),
      left   = (view.scrollLeft + (view.width - dialog.width) / 2),
      top    = (view.scrollTop + (view.height - dialog.height) / 2.5);
    el.style.left = (left > 0 ? left : 0) + 'px';
    el.style.top = (top > 0 ? top : 0) + 'px';
    FB.Dialog._active = el;
  },

  /**
   * 如果当前有激活dialog，降低其层级
   * @access private
   * @param node {DOMElement} dialog节点
   * @by 兰七
   */
  _lowerActive: function() {
    if (!FB.Dialog._active) {
      return;
    }
    FB.Dialog._active.style.top = '-10000px';
    FB.Dialog._active = null;
  },

  /**
   * 将dialog从活动队列中移除
   * @access private
   * @param node {DOMElement} dialog节点
   * @by 兰七
   */
  _removeStacked: function(dialog) {
    FB.Dialog._stack = FB.Array.filter(FB.Dialog._stack, function(node) {
      return node != dialog;
    });
  },

  /**
   * 创建一个新的dialog，可以传DOM元素或者HTML文本作为其内容，默认隐藏
   * @access protected
   * @param opts {Object} Options:
   * Property  | Type              | Description                       	| Default
   * --------- | ----------------- | --------------------------------- 	| -------
   * content   | String|DOMElement | HTML文本或者DOM元素         					|
   * loader    | Boolean           | `true` 显示加载dialog  				| `false`
   * onClose   | Boolean           | 如果关闭有回调函数               					|
   * closeIcon | Boolean           | `true` 显示关闭图标				| `false`
   * visible   | Boolean           | `true` 使其可见						| `false`
   *
   * @return {DOMElement} dialog文本节点
   * @by 兰七
   */
  create: function(opts) {
    opts = opts || {};
    if (opts.loader) {
      FB.Dialog._showLoader(opts.onClose);
    }

    var
      dialog      = document.createElement('div'),
      contentRoot = document.createElement('div'),
      className   = 'fb_dialog';

    // 可选的关闭图标
    if (opts.closeIcon && opts.onClose) {
      var closeIcon = document.createElement('a');
      closeIcon.className = 'fb_dialog_close_icon';
      closeIcon.onclick = opts.onClose;
      dialog.appendChild(closeIcon);
    }

    // IE下样式补充
    if (FB.Dom.getBrowserType() == 'ie') {
      className += ' fb_dialog_legacy';
      FB.Array.forEach(
        [
          'vert_left',
          'vert_right',
          'horiz_top',
          'horiz_bottom',
          'top_left',
          'top_right',
          'bottom_left',
          'bottom_right'
        ],
        function(name) {
          var span = document.createElement('span');
          span.className = 'fb_dialog_' + name;
          dialog.appendChild(span);
        }
      );
    } else {
      className += ' fb_dialog_advanced';
    }

    if (opts.content) {
      FB.Content.append(opts.content, contentRoot);
    }

    dialog.className = className;
    contentRoot.className = 'fb_dialog_content';

    dialog.appendChild(contentRoot);
    FB.Content.append(dialog);

    if (opts.visible) {
      FB.Dialog.show(dialog);
    }

    return contentRoot;
  },

  /**
   * 增加所给的dialog，将dialog从队列删除，隐藏其加载提示，然后激活它，放在队列的最前面的
   * @access protected
   * @param dialog {DOMElement} dialog的子节点
   * @by 兰七
   */
  show: function(dialog) {
    dialog = FB.Dialog._findRoot(dialog);
    if (dialog) {
      FB.Dialog._removeStacked(dialog);
      FB.Dialog._hideLoader();
      FB.Dialog._makeActive(dialog);
      FB.Dialog._stack.push(dialog);
    }
  },

  /**
   * 删除给出dialog， 如果是激活dialog，显示活动队列中位置其次的dialog
   * @access protected
   * @param dialog {DOMElement} a child element of the dialog
   * @by 兰七
   */
  remove: function(dialog) {
    dialog = FB.Dialog._findRoot(dialog);
    if (dialog) {
      var is_active = FB.Dialog._active == dialog;
      FB.Dialog._removeStacked(dialog);
      if (is_active) {
        if (FB.Dialog._stack.length > 0) {
          FB.Dialog.show(FB.Dialog._stack.pop());
        } else {
          FB.Dialog._lowerActive();
        }
      }

      // 如果不延迟删除，在ie中，会得到一个无法捕获的错误，3秒的延迟并不是问题，因为DIV已经隐藏了，只是还未从ＤＯＭ中删除
      window.setTimeout(function() {
        dialog.parentNode.removeChild(dialog);
      }, 3000);
    }
  }
});
