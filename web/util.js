define(function(require, exports, module){var toString = {}.toString;

function isType(type) {
  return function(obj) {
    return toString.call(obj) == '[object ' + type + ']';
  }
}

function find(context, s, maxWidth, i1, i2, w) {
  if(i1 == i2 - 1) {
    return i1;
  }
  w = w || context.measureText(s).width;
  if(w == maxWidth) {
    return i2;
  }
  else if(w > maxWidth) {
    var i = i2 - (Math.floor((i2 - i1) / 2));
    var s2 = s.slice(0, i);
    var w2 = context.measureText(s2).width;
    if(w2 > maxWidth) {
      return find(context, s2, maxWidth, 0, i, w2);
    }
    else {
      return find(context, s, maxWidth, i, i2,  w);
    }
  }
  else {
    var i = i1 + (Math.ceil((i2 - i1) / 2));
    return find(context, s.slice(0, i), maxWidth, i, i2);
  }
}

function find2(xAxis, i, j, left, per) {
  if(i == j) {
    return i;
  }
  else if(i == j - 1) {
    var o = xAxis[i];
    if(per * i + o.w / 2 > left) {
      return i;
    }
    return j;
  }
  var m = (i + j) >> 1;
  var o = xAxis[m];
  if(per * m + o.w / 2 > left) {
    return find2(xAxis, i, m, left, per);
  }
  else {
    return find2(xAxis, m, j, left, per);
  }
}

exports["default"]={
  isString: isType('String'),
  calHeight: function(context, s, maxWidth) {
    var arr = [];
    var len = s.length;
    var i = find(context, s, maxWidth, 0, len);
    arr.push(s.slice(0, i));
    while(i < len - 1) {
      s = s.slice(i);
      len = s.length;
      i = find(context, s, maxWidth, 0, len);
      arr.push(s.slice(0, i));
    }
    return arr;
  },
  calFont: function(s) {
    var fontStyle = 'normal';
    var fontVariant = 'normal';
    var fontFamily = 'Arial';
    var fontWeight = 'normal';
    var fontSize = 12;
    var lineHeight = '1.5';
    if(/^[a-z]/i.test(s)) {
      fontStyle = /^[a-z]+/.exec(s)[0];
      s = s.replace(/^[a-z]+\s+/i, '');
    }
    if(/^[a-z]/i.test(s)) {
      fontVariant = /^[a-z]+/.exec(s)[0];
      s = s.replace(/^[a-z]+\s+/i, '');
    }
    if(/^[a-z]/i.test(s)) {
      fontWeight = /^[a-z]+/.exec(s)[0];
      s = s.replace(/^[a-z]+\s+/i, '');
    }
    if(/^\d/.test(s)) {
      fontSize = parseInt(s);
      s = s.replace(/^[\d.a-z]+/i, '');
    }
    if(/^\//.test(s)) {
      s = s.slice(1);
      lineHeight = /^[\d.a-z]+/i.exec(s)[0];
      s = s.replace(/^[\d.a-z]+\s+/i, '');
      if(/[a-z]$/i.test(lineHeight)) {
        lineHeight = parseInt(lineHeight);
      }
      else {
        lineHeight *= fontSize;
      }
    }
    fontFamily = s;
    return {
      fontStyle:fontStyle,
      fontVariant:fontVariant,
      fontFamily:fontFamily,
      fontWeight:fontWeight,
      fontSize:fontSize,
      lineHeight:lineHeight
    };
  },
  format: function(format, date) {
    date = new Date(date);
    var o = {
      'Y+': date.getFullYear(),
      'M+': date.getMonth()+1, //month
      'D+': date.getDate(), //day
      'h+': date.getHours(), //hour
      'm+': date.getMinutes(), //minute
      's+': date.getSeconds(), //second
    };
    Object.keys(o).forEach(function(k) {
      if(new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, RegExp.length == 1 ? o[k] : ('00' + o[k]).slice(-RegExp.$1.length));
      }
    });
    return format;
  },
  rgb2int: function(color) {
    color = color.replace(/^#/, '');
    var r = 0;
    var g = 0;
    var b = 0;
    if(color.indexOf('rgb') == 0) {
      var arr = /(\d+)[^\d]+(\d+)[^\d]+(\d+)/.exec(color);
      return arr.slice(1).map(function(item) {
        return parseInt(item);
      });
    }
    else {
      switch(color.length) {
        case 3:
          r = parseInt(color.charAt(0) + color.charAt(0), 16);
          g = parseInt(color.charAt(1) + color.charAt(1), 16);
          b = parseInt(color.charAt(2) + color.charAt(2), 16);
          break;
        case 6:
          r = parseInt(color.slice(0, 2), 16);
          g = parseInt(color.slice(2, 4), 16);
          b = parseInt(color.slice(4, 6), 16);
          break;
      }
    }
    return [r, g, b];
  },
  find2: function(xAxis, i, j, left, per) {
    return find2(xAxis, i, j, left, per);
  }
};
});