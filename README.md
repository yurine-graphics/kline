# yurine-kline

k线图kline，`yurine`取名自`鴉-KARAS-`中的城市精灵百合音。

[![NPM version](https://badge.fury.io/js/yurine-kline.png)](https://npmjs.org/package/yurine-kline)

# INSTALL
```
npm install yurine-kline
```

[![preview](https://raw.githubusercontent.com/yurine-graphics/kline/master/preview.png)](https://github.com/yurine-graphics/kline)

# API
 * Line(selector:DOM/String, data:\<\<String>, \<int>>, option:Object):Class
   * selector:String 渲染的canvas对象或选择器
   * data:Array\<Object\> 渲染数据
     - max:Number 最高价
     - min:Number 最低价
     - open:Number 开盘价
     - close:Number 收盘价
     - volume:Number 成交手
     - ma5:Number 5日均价
     - ma10:Number 5日均价
     - ma20:Number 5日均价
   * option:Object 选项
     - font:String 文字字体css缩写
     - fontFamily:String 文字字体，会覆盖font
     - fontWeight:String 文字粗细，会覆盖font
     - fontVariant:String 文字异体，会覆盖font
     - fontStyle:String 文字样式，会覆盖font
     - fontSize:int 文字大小，单位px，会覆盖font
     - lineHeight:String/int 行高，单位px，会覆盖font
     - padding:int/Array 边距，上右下左，单位px
     - width:int 宽度，单位px
     - height:int 高度，单位px
     - lineWidth:int 绘线粗细，单位px，∈\[1, 可视半径]，默认1
     - gridWidth:int 背景网格线粗细，单位px，∈\[1, 可视半径]，默认1
     - gridColor:String 背景网格颜色
     - ma5:String ma5线色，不填不绘
     - ma10:String ma5线色，不填不绘
     - ma20:String ma5线色，不填不绘
 * getCoord(x:Number):Object 获取当前坐标的数据，注意高清屏乘除2倍
   - x:Number 当前数据条的中点坐标
   - index:int 索引
   - date:String 当前数据条的日期

# License
[MIT License]
