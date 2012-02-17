/**
 * FB Content
 * 为FB创建新的命名空间Content
 * @by 兰七
 */
FB.provide('Content', {
  _root       : null,
  _hiddenRoot : null,
  _callbacks  : {},

  /**
   * 插入内容
   * @access private
   * @param content {String|Node} DOM元素或HTML文本
   * @param root    {Node}        (optional) 自定义根节点
   * @return {Node} 被插入的节点
   * @by 兰七
   */
  append: function(content, root) {
    // 如果需要设置根节点
      if (!FB.Content._root) {
        FB.Content._root = root = FB.$('fb-root');
        if (!root) {
          FB.log('The "fb-root" div has not been created.');
          return;
        } else {
          root.className += ' fb_reset';
        }
      } else {
        root = FB.Content._root;
      }
    }

    if (typeof content == 'string') {
      var div = document.createElement('div');
      root.appendChild(div).innerHTML = content;
      return div;
    } else {
      return root.appendChild(content);
    }
  },

  /**
   * 插入隐藏的内容
   * @access private
   * @param content {String|Node} DOM元素或HTML文本
   * @return {Node} 被插入的节点
   * @by 兰七
   */
  appendHidden: function(content) {
    if (!FB.Content._hiddenRoot) {
      var
        hiddenRoot = document.createElement('div'),
        style      = hiddenRoot.style;
      style.position = 'absolute';
      style.top      = '-10000px';
      style.width    = style.height = 0;
      FB.Content._hiddenRoot = FB.Content.append(hiddenRoot);
    }

    return FB.Content.append(content, FB.Content._hiddenRoot);
  },

  /**
   * 插入一个iframe，注意： 这些iframes no border, overflow hidden , no scrollbars
   * 选项包括：
   *   root       DOMElement  required root node (必须为空)
   *   url        String      required iframe src attribute
   *   className  String      optional class attribute
   *   height     Integer     optional height in px
   *   id         String      optional id attribute
   *   name       String      optional name attribute
   *   onload     Function    optional onload handler
   *   width      Integer     optional width in px
   * @access private
   * @param opts {Object} 上面列出的选项
   */
  insertIframe: function(opts) {
    //
    // 浏览器在进化，进化是混乱的.
    //
    opts.id = opts.id || FB.guid();
    opts.name = opts.name || FB.guid();

    // 亲爱的ie，去你的，只会和魔法咒语一起工作
    // 亲爱的ff，去你的，需要在DOM插入以后加上src.
    // 亲爱的Webkit, 你最棒，无论如何都能实现.
    var
      guid = FB.guid(),

      // 因为iframe在插入DOM以后需要设置src， 
      //一些浏览器会触发两个onload的事件，第一次加载空的iframe，第二次设置src
      // webkit浏览器能正确执行，所以添加一个boolean在正确的onload处理器之前
      
      srcSet = false,
      onloadDone = false;
    FB.Content._callbacks[guid] = function() {
      if (srcSet && !onloadDone) {
        onloadDone = true;
        opts.onload && opts.onload(opts.root.firstChild);
      }
    };
    // IE下执行
    if (document.attachEvent) {
      var html = (
        '<iframe' +
          ' id="' + opts.id + '"' +
          ' name="' + opts.name + '"' +
          (opts.className ? ' class="' + opts.className + '"' : '') +
          ' style="border:none;' +
                  (opts.width ? 'width:' + opts.width + 'px;' : '') +
                  (opts.height ? 'height:' + opts.height + 'px;' : '') +
                  '"' +
          ' src="' + opts.url + '"' +
          ' frameborder="0"' +
          ' scrolling="no"' +
          ' allowtransparency="true"' +
          ' onload="FB.Content._callbacks.' + guid + '()"' +
        '></iframe>'
      );


      // 这里有个IE bug关于iframe缓存的，我们需要加载一个模拟iframe去消耗初始化缓存流
      // setTimeout会设置实际内容到HTML里面，因为它是第二次加载，不需要再忍受缓存
      // 这里必须用javascript:false，而不是about:blank， 另外IE6中https会有问题
      // 因为javascript:false会导致一个iframe包含字符串'false'，我们设置iframe的高度为1px,这样它就不可见了
      
      opts.root.innerHTML = '<iframe src="javascript:false"'+
                            ' frameborder="0"'+
                            ' scrolling="no"'+
                            ' style="height:1px"></iframe>';

      // 现在设置真正的src
      srcSet = true;

      // 使用setTimeout让两个innerHTML分别执行
      window.setTimeout(function() {
        opts.root.innerHTML = html;
      }, 0);
    } else {
      //下面这个代码块在非IE浏览器下运行，其实是特别为FF设计，我们需要在插入iframe以后设置src阻止缓存事件
      var node = document.createElement('iframe');
      node.id = opts.id;
      node.name = opts.name;
      node.onload = FB.Content._callbacks[guid];
      node.style.border = 'none';
      node.style.overflow = 'hidden';
      if (opts.className) {
        node.className = opts.className;
      }
      if (opts.height) {
        node.style.height = opts.height + 'px';
      }
      if (opts.width) {
        node.style.width = opts.width + 'px';
      }
      opts.root.appendChild(node);

      // 设置真正的src
      srcSet = true;

      node.src = opts.url;
    }
  },

  /**
   * 动态创建表单，并post提交到所给目标
   * opts 必须包括:
   *   url     String  表单操作URL
   *   target  String  目标
   *   params  Object  使用input框提交的参数对象
   *
   * @access protected
   * @param opts {Object} the options
   * @by 兰七
   */
  postTarget: function(opts) {
    var form = document.createElement('form');
    form.action = opts.url;
    form.target = opts.target;
    form.method = 'POST';
    FB.Content.appendHidden(form);

    FB.Array.forEach(opts.params, function(val, key) {
      if (val !== null && val !== undefined) {
        var input = document.createElement('input');
        input.name = key;
        input.value = val;
        form.appendChild(input);
      }
    });

    form.submit();
    form.parentNode.removeChild(form);
  }
});
