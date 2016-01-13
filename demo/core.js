var $ = (function () {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    // [Opt:C] 增加win变量缓存window
    win = window,
    document = win.document,
    elementDisplay = {}, classCache = {},
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    rootNodeRE = /^(?:body|html)$/i,

    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    //[Opt:B][V1.0+] 由于已经删除prop方法，因此原propMap变量一并删除
    
    //[Opt:C] 去掉isArray旧方法的兼容
    isArray = Array.isArray

  zepto.matches = function (element, selector) {
    // [Opt:C] 将原本在父级作用域的变量转移至局部变量
    var tempParent = document.createElement('div')

    if (!selector || !element || element.nodeType !== 1) return false
    // [Opt:C] 去除对moz o 的支持，一般情况下，是不会遇到以上的浏览器，不针对moz和o做专门的优化
    var matchesSelector = element.webkitMatchesSelector || element.matchesSelector;
    if (matchesSelector) return matchesSelector.call(element, selector);
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  //opt by 完颜
  //Get string type of an object. 
  //Possible types are: 
  //null undefined boolean number string function array date regexp object error.
  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) {
    return type(value) == "function"
  }

  function isWindow(obj) {
    return obj != null && obj == obj.window
  }

  function isDocument(obj) {
    return obj != null && obj.nodeType == obj.DOCUMENT_NODE
  }

  function isObject(obj) {
    return type(obj) == "object"
  }

  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }

  function likeArray(obj) {
    return typeof obj.length == 'number'
  }

  function compact(array) {
    return filter.call(array, function (item) {
      return item != null
    })
  }

  function flatten(array) {
    return array.length > 0 ? $.fn.concat.apply([], array) : array
  }

  //将中划线连接符转化为驼峰字符串
  camelize = function (str) {
    return str.replace(/-+(.)?/g, function (match, chr) {
      return chr ? chr.toUpperCase() : ''
    })
  }

  uniq = function (array) {
    return filter.call(array, function (item, idx) {
      return array.indexOf(item) == idx
    })
  }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function (node) {
        if (node.nodeType == 1) return node
      })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function (html, name) {
    // [Opt:C] 将原本在父级作用域的变量转移至局部变量
    var table = document.createElement('table'),
      tableRow = document.createElement('tr'),
      containers = {
        'tr': document.createElement('tbody'),
        'tbody': table, 'thead': table, 'tfoot': table,
        'td': tableRow, 'th': tableRow,
        '*': document.createElement('div')
      },
      tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
      singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
      // special attributes that should be get/set via method calls
      methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset']

    var dom, nodes, container;

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function () {
        container.removeChild(this)
      })
    }
    
    //[Opt:B-1][V1.0+] 移除 $(htmlString, attributes) 的api方法支持

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function (dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function (object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function (selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function (selector, context) {
    return zepto.init(selector, context)
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function (target) {
    //[Opt:C] 将全局函数编程内部函数
    var extend = function (target, source, deep) {
      for (key in source)
        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
          if (isPlainObject(source[key]) && !isPlainObject(target[key]))
            target[key] = {}
          if (isArray(source[key]) && !isArray(target[key]))
            target[key] = []
          extend(target[key], source[key], deep)
        }
        else if (source[key] !== undefined) target[key] = source[key]
    }

    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function (arg) {
      extend(target, arg, deep)
    })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  // opt by 轩与
  zepto.qsa = function (element, selector) {
    // [Opt:C] 将全局simpleSelectorRE转到局部
    var found, simpleSelectorRE = /^[\w-]*$/,
      maybeID = selector[0] == '#',
      maybeClass = !maybeID && selector[0] == '.',
      nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
      isSimple = /^[\w-]*$/.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
        slice.call(
            isSimple && !maybeID ?
            maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
              element.getElementsByTagName(selector) : // Or a tag
            element.querySelectorAll(selector) // Or it's not simple, and we need to query all
        )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function (parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value) {
    var klass = node.className,
      svg = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
            value == "null" ? null :
            !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
            value )
        : value
    } catch (e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  //[Opt:A] 移除$.isEmptyObject方法，官网无公开，core内无引用
  //$.isEmptyObject

  $.camelCase = camelize
  $.trim = function (str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function (elements, callback) {
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function (elements, callback) {
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  // [Opt:C] 删除不必要的if (win.JSON)
  $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function (fn) {
      return $($.map(this, function (el, i) {
        return fn.call(el, i, el)
      }))
    },
    slice: function () {
      return $(slice.apply(this, arguments))
    },
    ready: function (callback) {
      //[Opt:C]将原本在父级作用域的变量转移至局部变量
      var readyRE = /complete|loaded|interactive/

      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      // [Opt:C] 不做ie的兼容
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function () {
        callback($)
      }, false)
      return this
    },
    get: function (idx) {
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function () {
      return this.get()
    },
    size: function () {
      return this.length
    },
    remove: function () {
      return this.each(function () {
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function (callback) {
      emptyArray.every.call(this, function (el, idx) {
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function (selector) {
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function (element) {
        return zepto.matches(element, selector)
      }))
    },
    add: function (selector, context) {
      return $(uniq(this.concat($(selector, context))))
    },
    is: function (selector) {
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function (selector) {
      var nodes = []
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function (idx) {
          if (!selector.call(this, idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function (el) {
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function (selector) {
      return this.filter(function () {
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function (idx) {
      return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
    },
    first: function () {
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function () {
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function (selector) {
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function () {
          var node = this
          return emptyArray.some.call($this, function (parent) {
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function () {
          return zepto.qsa(this, selector)
        })
      return result
    },
    //[Opt:B][V1.0+] : closest的父级选择，代理parents，去除原有的第二个参数支持
    closest: function (selector) {
      if(zepto.matches(this[0], selector)) return $(this[0])
      else return $(this.parents(selector).get(0))
    },
    parents: function (selector) {
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function (node) {
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function (selector) {
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function (selector) {
      return filtered(this.map(function () {
        return children(this)
      }), selector)
    },
    //[Opt:B][V1.0+] : contents已经转移至plugin
    siblings: function (selector) {
      return filtered(this.map(function (i, el) {
        return filter.call(children(el.parentNode), function (child) {
          return child !== el
        })
      }), selector)
    },
    //[Opt:A] : empty已经转移至plugin
    // `pluck` is borrowed from Prototype.js
    pluck: function (property) {
      return $.map(this, function (el) {
        return el[property]
      })
    },
    show: function () {
      // [Opt:C] 提取函数
      var getDisplay = function (DOM) {
        return getComputedStyle(DOM, '').getPropertyValue("display")
      };
      return this.each(function () {
        this.style.display == "none" && (this.style.display = '')
        if (getDisplay(this) == "none") {
          // [Opt:C] 将defaultDisplay方法局部化
          var defaultDisplay = function (nodeName) {
            var element, display
            if (!elementDisplay[nodeName]) {
              element = document.createElement(nodeName)
              document.body.appendChild(element)
              display = getDisplay(element)
              element.parentNode.removeChild(element)
              display == "none" && (display = "block")
              elementDisplay[nodeName] = display
            }
            return elementDisplay[nodeName]
          }
          this.style.display = defaultDisplay(this.nodeName)
        }
      })
    },
    replaceWith: function (newContent) {
      return this.before(newContent).remove()
    },
    //[Opt:A] : wrap系列方法，已经转移至plugin
    clone: function () {
      return this.map(function () {
        return this.cloneNode(true)
      })
    },
    hide: function () {
      return this.css("display", "none")
    },
    toggle: function (setting) {
      return this.each(function () {
        var el = $(this)
          ;
        (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function (selector) {
      return $(this.pluck('previousElementSibling')).filter(selector || '*')
    },
    next: function (selector) {
      return $(this.pluck('nextElementSibling')).filter(selector || '*')
    },
    html: function (html) {
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function (idx) {
          var originHtml = this.innerHTML
          this.innerHTML = ''
          $(this).append(funcArg(this, html, idx, originHtml))
        })
    },
    text: function (text) {
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function () {
          this.textContent = (text === undefined) ? '' : '' + text
        })
    },
    attr: function (name, value) {
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
            (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
          ) :
        this.each(function (idx) {
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function (name) {
      return this.each(function () {
        this.nodeType === 1 && setAttribute(this, name)
      })
    },
    data: function (name, value) {
      //[Opt:C]将原本在父级作用域的变量转移至局部变量
      var capitalRE = /([A-Z])/g,
        data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function (value) {
      return arguments.length === 0 ?
        (this[0] && (this[0].multiple ?
          $(this[0]).find('option').filter(function () {
            return this.selected
          }).pluck('value') :
          this[0].value)
          ) :
        this.each(function (idx) {
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    //[Opt:B][V1.0+] 去除offset的coordinates参数
    offset: function () {
      if (this.length == 0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + win.pageXOffset,
        top: obj.top + win.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function (property, value) {
      //智能补足：分析css方法中传入的value，如果name是在cssNumber清单外的纯数字，则增加px单位
      //[Opt:C] 将全局函数装到局部函数
      var maybeAddPx = function (name, value) {
        //[Opt:C]将原本在父级作用域的变量转移至局部变量
        var cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 }
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
      }

      //将字符串(驼峰)转换为dasherized(中划线连接符形式命名)字符
      //[Opt:C] 将全局函数装到局部函数
      var dasherize = function (str) {
        return str.replace(/::/g, '/')
          .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
          .replace(/([a-z\d])([A-Z])/g, '$1_$2')
          .replace(/_/g, '-')
          .toLowerCase()
      }

      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if (!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property : [property], function (_, prop) {
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function () {
            this.style.removeProperty(dasherize(property))
          })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function () {
              this.style.removeProperty(dasherize(key))
            })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function () {
        this.style.cssText += ';' + css
      })
    },
    index: function (element) {
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function (name) {
      if (!name) return false
      return emptyArray.some.call(this, function (el) {
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function (name) {
      if (!name) return this
      return this.each(function (idx) {
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function (klass) {
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function (name) {
      return this.each(function (idx) {
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function (name, when) {
      if (!name) return this
      return this.each(function (idx) {
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function (klass) {
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function (value) {
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function () {
          this.scrollTop = value
        } :
        function () {
          this.scrollTo(this.scrollX, value)
        })
    }
    //[Opt:A] : scrollLeft已经转移至plugin
    //[Opt:A] : position已经转移至plugin
    //[Opt:A] : offsetParent已经转移至plugin
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  // todo:高度值bug待修复
  ;
  ['width', 'height'].forEach(function (dimension) {
    var dimensionProperty =
      dimension.replace(/./, function (m) {
        return m[0].toUpperCase()
      })

    $.fn[dimension] = function (value) {
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
          (offset = this.offset()) && offset[dimension]
      else return this.each(function (idx) {
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  // [Opt:C] 将全部变量，改为局部变量
  ;
  [ 'after', 'prepend', 'before', 'append' ].forEach(function (operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function () {
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function (arg) {
          argType = type(arg)
          return argType == "object" || argType == "array" || arg == null ?
            arg : zepto.fragment(arg)
        }),
        parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function (_, target) {
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
            operatorIndex == 1 ? target.firstChild :
            operatorIndex == 2 ? target :
          null

        // [Opt:C] 全部变量局部化
        var traverseNode = function (node, fun) {
          fun(node)
          for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
        }

        nodes.forEach(function (node) {

          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function (el) {
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
              (!el.type || el.type === 'text/javascript') && !el.src)
              win['eval'].call(win, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})();
