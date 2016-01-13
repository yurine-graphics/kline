var util=function(){var _0=require('./util');return _0.hasOwnProperty("default")?_0["default"]:_0}();


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
    var paddingX = padding[1] + padding[3];
    var paddingY = padding[0] + padding[2];
    var minSize = Math.min(width - paddingX, height - paddingY);

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

    this.reRender(context, padding, width, height, minSize, fontSize, lineHeight);
  }
  KLine.prototype.reRender = function(context, padding, width, height, minSize, fontSize, lineHeight) {
    var y0 = padding[0];
    var y1 = (height - y0 - padding[2]) * 0.7;
    var y2 = height - padding[0] - padding[2] - lineHeight;
    var yNum = parseInt(this.option.yNum) || 2;
    yNum = Math.max(yNum, 2);
    var xNum = parseInt(this.option.xNum) || 2;
    xNum = Math.max(xNum, 2);

    var max = this.data[0].max;
    var min = this.data[0].min;
    for(var i = 0, len = this.data.length; i < len; i++) {
      max = Math.max(this.data[i].max, max);
      min = Math.min(this.data[i].min, min);
    }

    var x0 = padding[3];
    var x2 = width - padding[1];
    var x1 = this.renderY(context, x0, x2, y0, y1, yNum, fontSize, max, min);
    this.renderX(context, x1, x2, y1, y2, xNum);
  }
  KLine.prototype.renderY = function(context, x0, x2, y0, y1, yNum, fontSize, max, min) {
    var color = this.option.color || '#999';
    if(color.charAt(0) != '#' && color.charAt(0) != 'r') {
      color = '#' + color;
    }
    context.fillStyle = color;
    var gridWidth = parseInt(this.option.gridWidth) || 1;
    gridWidth = Math.max(gridWidth, 1);
    context.lineWidth = gridWidth;
    var gridColor = this.option.gridColor || '#DDD';
    context.strokeStyle = gridColor;

    var stepY = (y1 - y0) / (yNum - 1);
    var stepV = Math.abs(max - min) / (yNum - 1);
    var left = 0;
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
      left = Math.max(left, w);
    }

    for(var i = 0; i < yNum; i++) {
      var y = y1 - stepY * i - (fontSize >> 1);
      var v = vs[i];
      var w = ws[i];
      context.fillText(v, x0 + left - w, y);
    }

    left += 10 + x0;
    context.setLineDash(this.option.yLineDash || [1, 0]);
    for(var i = 0; i < yNum; i++) {
      var y = y1 - stepY * i;
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(x2, y);
      context.stroke();
    }

    return left;
  }
  KLine.prototype.renderX = function(context, x1, x2, y1, y2, xNum) {
    //去除时分秒，最小单位天数
    var start = new Date(this.option.start);
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    var end = new Date(this.option.end);
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    var stepX = (x2 - x1) / (xNum - 1);
    var stepV = (end - start) / (xNum - 1);

    switch(this.option.type) {
      case 'month':
        break;
      case 'week':
        break;
      default:
        this.renderDay(context, x1, x2, y1, y2, stepX, stepV, xNum, start, end);
        break;
    }
  }
  KLine.prototype.renderDay = function(context, x1, x2, y1, y2, stepX, stepV, xNum, start, end) {
    for(var i = 0; i < xNum; i++) {
      var x = x1 + stepX * i;
      var v = util.format('YYYY-MM-DD', +start + stepV * i);
      var w = context.measureText(v).width;
      x = Math.max(x, x1 + w/ 2);
      x = Math.min(x, x2  - w/ 2);
      context.fillText(v, x - w / 2, y2);
    }
  }


exports["default"]=KLine;
