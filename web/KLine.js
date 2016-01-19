define(function(require, exports, module){var util=function(){var _0=require('./util');return _0.hasOwnProperty("default")?_0["default"]:_0}();


  function KLine(dom, data, option) {
    this.dom = util.isString(dom) ? document.querySelector(dom) : dom;
    if(!this.dom || !this.dom.getContext) {
      return;
    }
    this.data = data || {};
    this.option = option || {};
    this.render();
  }

  KLine.prototype.render = function() {
    var lineHeight;var fontSize;var fontWeight;var fontFamily;var fontVariant;var fontStyle;var self = this;
    var context = self.dom.getContext('2d');
    var width = self.option.width || 300;
    var height = self.option.height || 150;
    var padding = self.option.padding || [10, 10, 10, 10];
    if(Array.isArray(padding)) {
      switch(padding.length) {
        case 0:
          padding = [10, 10, 10, 10];
          break;
        case 1:
          padding[3] = padding[2] = padding[1] = padding[0];
          break;
        case 2:
          padding[3] = padding[1];
          padding[2] = padding[0];
          break;
        case 3:
          padding[3] = padding[1];
          break;
      }
    }
    else {
      padding = [padding, padding, padding, padding];
    }
    var font = self.option.font || 'normal normal normal 12px/1.5 Arial';
    (function(){var _1= util.calFont(font);fontStyle=_1["fontStyle"];fontVariant=_1["fontVariant"];fontFamily=_1["fontFamily"];fontWeight=_1["fontWeight"];fontSize=_1["fontSize"];lineHeight=_1["lineHeight"]}).call(this);
    context.textBaseline = 'top';
    if(self.option.fontSize) {
      fontSize = parseInt(self.option.fontSize) || 12;
    }
    if(self.option.lineHeight) {
      lineHeight = self.option.lineHeight;
      if(util.isString(lineHeight)) {
        if(/[a-z]$/i.test(lineHeight)) {
          lineHeight = parseInt(lineHeight);
        }
        else {
          lineHeight *= fontSize;
        }
      }
      else {
        lineHeight *= fontSize;
      }
    }
    else {
      lineHeight = fontSize * 1.5;
    }
    lineHeight = Math.max(lineHeight, fontSize);
    font = fontStyle + ' ' + fontVariant + ' ' + fontWeight + ' ' + fontSize + 'px/' + lineHeight + 'px ' + fontFamily;
    context.font = font;
    var offset = self.option.offset || 0;
    offset = Math.max(offset, 0);
    offset = Math.min(offset, self.data.length - 1);
    var number = self.option.number || 1;
    number = Math.max(number, 1);
    number = Math.min(number, self.data.length);
    //去除时分秒，最小单位天数
    var start = new Date(self.option.start);
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    var end = new Date(self.option.end);
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    var xNum = parseInt(self.option.xNum) || 2;
    xNum = Math.max(xNum, 2);
    var step = (end - start) / (xNum - 1);
    var xAxis = this.xAxis = [];
    xAxis.step = step;
    xAxis.start = start;
    xAxis.end = end;
    xAxis.offset = offset;
    xAxis.number = number;
    switch((self.option.type || '').toLowerCase()) {
      case 'month':
        for(var i = 0; i < xNum; i++) {
          var v = util.format('YYYY-MM', +start + step * i);
          xAxis.push({
            v: v,
            w: context.measureText(v).width
          });
        }
        break;
      default:
        for(var i = 0; i < xNum; i++) {
          var v = util.format('YYYY-MM-DD', +start + step * i);
          xAxis.push({
            v: v,
            w: context.measureText(v).width
          });
        }
    }
    var color = self.option.color || '#999';
    if(color.charAt(0) != '#' && color.charAt(0) != 'r') {
      color = '#' + color;
    }
    context.fillStyle = color;
    self.option.color = color;
    self.option.rgb = util.rgb2int(color);
    var gridWidth = parseInt(self.option.gridWidth) || 1;
    gridWidth = Math.max(gridWidth, 1);
    context.lineWidth = gridWidth;
    var gridColor = self.option.gridColor || '#DDD';
    context.strokeStyle = gridColor;

    self.reRender(context, padding, width, height, fontSize, lineHeight, xAxis, xNum);

    var mx0 = 0;
    var mx1 = 0;
    var distance = 0;
    var timeout;
    var num = number;
    var left = 0;
    var os = offset;
    var isMove = false;
    self.dom.addEventListener('touchstart', function(e) {
      e.preventDefault();
      if(e.touches[1]) {
        mx1 = e.touches[1].screenX;
        distance = Math.abs(mx1 - mx0);
      }
      else {
        mx0 = e.touches[0].screenX;
      }
      offset = os;
      number = num;
      isMove = true;
    });
    document.body.addEventListener('touchmove', function(e) {
      if(!isMove) {
        return;
      }
      e.preventDefault();
      if(e.touches[1]) {
        var mx2 = e.touches[0].screenX;
        var mx3 = e.touches[1].screenX;
        var offsetLeft = mx2 - mx0;
        os = offset;
        var offsetDistance = Math.abs(mx2 - mx3);
        num = number;
        if(Math.abs(offsetLeft - left) >= 10) {
          os -= Math.floor((offsetLeft - left) / 10);
          os = Math.max(os, 0);
          os = Math.min(os, self.data.length - 1);
        }
        if(Math.abs(offsetDistance - distance) >= 10) {
          num -= Math.floor((offsetDistance - distance) / 10);
          num = Math.max(num, 1);
          num = Math.min(num, self.data.length - os);
        }
        if(os != offset || num != number) {
          if(timeout) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(function() {
            xAxis.offset = os;
            xAxis.number = num;
            context.fillStyle = color;
            context.lineWidth = gridWidth;
            context.strokeStyle = gridColor;
            context.clearRect(0, 0, width, height);
            self.reRender(context, padding, width, height, fontSize, lineHeight, xAxis, xNum);
          }, 10);
        }
      }
    });
    document.body.addEventListener('touchend', function(e) {
      if(isMove) {
        offset = os;
        number = num;
        if(e.touches.length == 1) {
          isMove = false;
        }
      }
    });
    self.dom.addEventListener('touchcancel', function(e) {
      if(isMove) {
        offset = os;
        number = num;
        if(e.touches.length == 1) {
          isMove = false;
        }
      }
    });
  }
  KLine.prototype.reRender = function(context, padding, width, height, fontSize, lineHeight, xAxis, xNum) {
    var y0 = padding[0];
    var y1 = (height - y0 - padding[2]) * 0.7 + y0;
    var y2 = height - padding[0] - lineHeight;

    var max = this.data[xAxis.offset].max;
    var min = this.data[xAxis.offset].min;
    var maxVolume = this.data[xAxis.offset].volume;
    var minVolume = this.data[xAxis.offset].volume;
    for(var i = xAxis.offset, len = Math.min(this.data.length, xAxis.offset + xAxis.number); i < len; i++) {
      max = Math.max(this.data[i].max || 0, max);
      max = Math.max(this.data[i].ma5 || 0, max);
      max = Math.max(this.data[i].ma10 || 0, max);
      max = Math.max(this.data[i].ma20 || 0, max);
      min = Math.min(this.data[i].min || 0, min);
      min = Math.min(this.data[i].ma5 || 0, min);
      min = Math.min(this.data[i].ma10 || 0, min);
      min = Math.min(this.data[i].ma20 || 0, min);
      maxVolume = Math.max(this.data[i].volume || 0, maxVolume);
      minVolume = Math.min(this.data[i].volume || 0, minVolume);
    }

    var x0 = padding[3];
    var x2 = this.x2 = width - padding[1];
    var x1 = this.x1 = this.renderY(context, x0, x2, y0, y1, fontSize, max, min);
    var stepVol = (y2 - y1 - 11) / (maxVolume - minVolume);
    this.renderX(context, xAxis, x1, x2, y0, y1, y2, xNum, fontSize, lineHeight, max, min, minVolume, stepVol);
  }
  KLine.prototype.renderY = function(context, x0, x2, y0, y1, fontSize, max, min) {
    var yNum = parseInt(this.option.yNum) || 2;
    yNum = Math.max(yNum, 2);

    var stepY = (y1 - y0 - fontSize) / (yNum - 1);
    var stepV = Math.abs(max - min) / (yNum - 1);
    var x1 = 0;
    var vs = [];
    var ws = [];
    for(var i = 0; i < yNum; i++) {
      var v = String((min + i * stepV).toFixed(2));
      if(/\.0*$/.test(v)) {
        v = v.replace(/\.0*/, '');
      }
      else if(/\./.test(v)) {
        v = v.replace(/\.([\d]*?)0$/, '.$1');
      }
      vs.push(v);
      var w = context.measureText(v).width;
      ws.push(w);
      x1 = Math.max(x1, w);
    }

    var gap = fontSize / 2;
    for(var i = 0; i < yNum; i++) {
      var y = y1 - stepY * i - fontSize;
      var v = vs[i];
      var w = ws[i];
      context.fillText(v, x0 + x1 - w, y);
    }

    x1 += 10 + x0;
    context.setLineDash(this.option.yLineDash || [1, 0]);
    for(var i = 0; i < yNum; i++) {
      var y = y1 - stepY * i - gap;
      context.beginPath();
      context.moveTo(x1, y);
      context.lineTo(x2, y);
      context.stroke();
      context.closePath();
    }

    return x1;
  }
  KLine.prototype.renderX = function(context, xAxis, x1, x2, y0, y1, y2, xNum, fontSize, lineHeight, max, min, minVolume, stepVol) {
    var w = x2 - x1;
    var split = w / (4 * xAxis.number - 1);
    var perItem = this.perItem = split * 4;
    var wa = perItem * this.data.length - split;
    var halfItem = this.halfItem = (perItem - split) / 2;
    var perX = wa / xNum;
    var left = perItem * xAxis.offset;
    var right = left + w;

    //2分查找找到第一个需要渲染的
    var i = util.find2(xAxis, 0, xAxis.length - 1, left, perX);
    var last = -1;
    var first = true;
    var rgb = this.option.rgb.join(',');
    for(; i < xAxis.length; i++) {
      var item = xAxis[i];
      var x = perX * i + halfItem;
      var v = item.v;
      var w2 = item.w / 2;
      if(x - w2 >= right) {
        break;
      }
      x += x1 - w2 - left;
      //第一个不能超过最左
      if(i == 0) {
        x = Math.max(x, w2);
      }
      //最后一个不能超过最右
      else if(i == xAxis.length -1) {
        x = Math.min(x, x2 - w2);
      }
      if(x < last) {
        continue;
      }
      last = x + item.w;
      context.fillStyle = this.option.color;
      //最左
      if(first && xAxis.offset != 0) {
        first = false;
        if(x < x1) {
          var gr = context.createLinearGradient(x, 0, x1 + 10, 0);
          gr.addColorStop(0, 'rgba(' + rgb + ',0.1)');
          gr.addColorStop(Math.max(0.1, (x1-x-10)/(x1-x+10)), 'rgba(' + rgb + ',0.3)');
          gr.addColorStop(1, 'rgba(' + rgb + ',1)');
          context.fillStyle = gr;
        }
      }
      //最右
      if(x1 + perX * (i + 1) + halfItem - w2 + item.w >= right + x1) {
        if(last > x2) {
          var gr = context.createLinearGradient(x2 - 10, 0, x + item.w, 0);
          gr.addColorStop(0, 'rgba(' + rgb + ',1)');
          gr.addColorStop(Math.min(0.9, 10/(x + item.w - x2)), 'rgba(' + rgb + ',0.3)');
          gr.addColorStop(1, 'rgba(' + rgb + ',0.1)');
          context.fillStyle = gr;
        }
      }
      context.fillText(v, x, y2 + ((lineHeight - fontSize) / 2));
    }

    var step = (y1 - y0 - fontSize) / (max - min);
    var gap = fontSize / 2;

    context.lineWidth = 1;
    var arr = [];
    for(var i = xAxis.offset, length = Math.min(this.data.length, xAxis.offset + xAxis.number); i < length; i++) {
      arr.push(this.renderItem(context, i, xAxis, perItem, split, x1, y1 - gap, y2, min, step, minVolume, stepVol));
    }
    if(this.option.ma5) {
      this.maLine(context, arr, 'ma5', util.isString(this.option.ma5) ? this.option.ma5 : '#f1b94d');
    }
    if(this.option.ma10) {
      this.maLine(context, arr, 'ma10', util.isString(this.option.ma10) ? this.option.ma10 : '#f1b94d');
    }
    if(this.option.ma20) {
      this.maLine(context, arr, 'ma20', util.isString(this.option.ma20) ? this.option.ma20 : '#f1b94d');
    }
  }
  KLine.prototype.renderItem = function(context, i, xAxis, per, split, x1, y1, y2, min, step, minVolume, stepVol) {
    var item = this.data[i];
    var left = x1 + (i - xAxis.offset) * per;
    var middle = left + ((per - split) >> 1);
    var top = y1 - (item.max - min) * step;
    var yt = y1 - (Math.max(item.close, item.open) - min) * step;
    var yb = y1 - (Math.min(item.close, item.open) - min) * step;
    var bottom = y1 - (item.min - min) * step;
    var volY = (item.volume - minVolume) * stepVol;

    context.beginPath();
    if(item.close > item.open) {
      context.strokeStyle = '#F33';
      context.rect(left, yb, per - split, yt - yb);
      context.stroke();
      context.rect(left, y2 - volY, per - split, volY + 1);
      context.stroke();
    }
    else if(item.close < item.open) {
      context.strokeStyle = '#3A7';
      context.fillStyle = '#3A7';
      context.fillRect(left, yb, per - split, yt - yb);
      context.fillRect(left, y2 - volY, per - split, volY + 1);
    }
    else {
      context.strokeStyle = '#333';
      context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    }
    context.closePath();

    context.beginPath();
    if(item.max > item.close) {
      context.moveTo(middle, top);
      context.lineTo(middle, yt);
      context.stroke();
    }
    if(item.min < item.open) {
      context.moveTo(middle, yb);
      context.lineTo(middle, bottom);
      context.stroke();
    }
    context.closePath();

    var res = {};
    if(this.option.ma5) {
      res.ma5 = {
        x: middle,
        y: y1 - (item.ma5 - min) * step
      };
    }
    if(this.option.ma10) {
      res.ma10 = {
        x: middle,
        y: y1 - (item.ma10 - min) * step
      };
    }
    if(this.option.ma20) {
      res.ma20 = {
        x: middle,
        y: y1 - (item.ma20 - min) * step
      };
    }
    return res;
  }
  KLine.prototype.maLine = function(context, arr, key, color) {
    context.strokeStyle = color;
    context.beginPath();
    arr.forEach(function(item, i) {
      var o = item[key];
      var x = o.x;
      var y = o.y;
      if(i) {
        context.lineTo(x, y);
      }
      else {
        context.moveTo(x, y);
      }
    });
    context.stroke();
    context.closePath();
  }
  KLine.prototype.getCoord = function(x) {
    var xAxis = this.xAxis;
    var x1 = this.x1;
    if(x <= x1) {
      return {
        x: this.halfItem + x1,
        index: xAxis.offset,
        date: util.format((this.option.type || '').toLowerCase() == 'month' ? 'YYYY-MM' : 'YYYY-MM-DD', +xAxis.start + 1000 * 3600 * 24 * xAxis.offset)
      };
    }
    x = Math.min(x, this.x2);
    var diff = x - x1;
    var n = Math.floor(diff / this.perItem);
    return {
      x: this.halfItem + n * this.perItem + x1,
      index: xAxis.offset + n,
      date: util.format((this.option.type || '').toLowerCase() == 'month' ? 'YYYY-MM' : 'YYYY-MM-DD', +xAxis.start + 1000 * 3600 * 24 * (xAxis.offset + n))
    };
  }


exports["default"]=KLine;
});