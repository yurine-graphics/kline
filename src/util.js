var toString = {}.toString;

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

export default {
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
      fontStyle,
      fontVariant,
      fontFamily,
      fontWeight,
      fontSize,
      lineHeight
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
  }
};
