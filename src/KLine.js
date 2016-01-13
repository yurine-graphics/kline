import util from './util';

class KLine {
  constructor(dom, data, option) {
    this.dom = util.isString(dom) ? document.querySelector(dom) : dom;
    if(!this.dom || !this.dom.getContext) {
      return;
    }
    this.data = data || {};
    this.option = option || {};
    this.render();
  }

  render() {
    var self = this;
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
    var { fontStyle, fontVariant, fontFamily, fontWeight, fontSize, lineHeight } = util.calFont(font);
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
  reRender(context, padding, width, height, minSize, fontSize, lineHeight) {
    var y0 = padding[0];
    var y1 = (height - y0 - padding[2]) * 0.7;
    var y2 = height - padding[0] - padding[2] - lineHeight;

    var max = this.data[0].max;
    var min = this.data[0].min;
    for(var i = 0, len = this.data.length; i < len; i++) {
      max = Math.max(this.data[i].max, max);
      min = Math.min(this.data[i].min, min);
    }

    var x0 = padding[3];
    var x2 = width - padding[1];
    var x1 = this.renderY(context, x0, x2, y0, y1, fontSize, max, min);
    this.renderX(context, x1, x2, y0, y1, y2, fontSize, max, min);
  }
  renderY(context, x0, x2, y0, y1, fontSize, max, min) {
    var yNum = parseInt(this.option.yNum) || 2;
    yNum = Math.max(yNum, 2);
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

    var stepY = (y1 - y0 - fontSize) / (yNum - 1);
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
      var y = y1 - stepY * i - fontSize;
      var v = vs[i];
      var w = ws[i];
      context.fillText(v, x0 + left - w, y);
    }

    left += 10 + x0;
    context.setLineDash(this.option.yLineDash || [1, 0]);
    for(var i = 0; i < yNum; i++) {
      var y = y1 - stepY * i - (fontSize >> 1);
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(x2, y);
      context.stroke();
      context.closePath();
    }

    return left;
  }
  renderX(context, x1, x2, y0, y1, y2, fontSize, max, min) {
    //去除时分秒，最小单位天数
    var start = new Date(this.option.start);
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    var end = new Date(this.option.end);
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    var xNum = parseInt(this.option.xNum) || 2;
    xNum = Math.max(xNum, 2);
    var stepX = (x2 - x1) / (xNum - 1);
    var stepV = (end - start) / (xNum - 1);

    switch(this.option.type) {
      case 'month':
        break;
      case 'week':
        break;
      default:
        this.renderDay(context, x1, x2, y0, y1, y2, stepX, stepV, xNum, start, fontSize, max, min);
        break;
    }
  }
  renderDay(context, x1, x2, y0, y1, y2, stepX, stepV, xNum, start, fontSize, max, min) {
    for(var i = 0; i < xNum; i++) {
      var x = x1 + stepX * i;
      var v = util.format('YYYY-MM-DD', +start + stepV * i);
      var w = context.measureText(v).width;
      var w2 = w >> 1;
      x = Math.max(x, x1 + w2);
      x = Math.min(x, x2  - w2);
      context.fillText(v, x - w2, y2);
    }

    var width = x2 - x1;
    var length = this.data.length;
    var split = 2;
    var per = width / length - split;
    var step = (y1 - y0 - fontSize) / (max - min);

    context.lineWidth = 1;
    for(var i = 0; i < length; i++) {
      this.renderItem(context, i, per, split, x1, y0, y1, y2, fontSize, min, step);
    }
  }
  renderItem(context, i, per, split, x1, y0, y1, y2, fontSize, min, step) {
    var item = this.data[i];
    var left = x1 + i * (per + split);
    var middle = left + (per >> 1);
    var gap = fontSize >> 1;
    var top = y1 - gap - (item.max - min) * step;
    var yt = y1 - gap - (Math.max(item.close, item.open) - min) * step;
    var yb = y1 - gap - (Math.min(item.close, item.open) - min) * step;
    var bottom = y1 - gap - (item.min - min) * step;

    context.beginPath();
    if(item.close > item.open) {
      context.strokeStyle = '#F33';
      context.rect(left, yb, per - split, yt - yb);
      context.stroke();
    }
    else if(item.close < item.open) {
      context.strokeStyle = '#3F3';
      context.fillStyle = '#3F3';
      context.fillRect(left, yb, per - split, yt - yb);
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
  }
}

export default KLine;
