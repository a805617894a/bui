/**
 * @fileOverview 布局控件的基类
 * @ignore
 */

define('bui/layout/abstract',['bui/common','bui/layout/baseitem'],function(require){

	var BUI = require('bui/common'),
		Item = require('bui/layout/baseitem');

	/**
	 * @class BUI.Layout.Abstract
	 * 控件布局插件的抽象类
	 * @extends BUI.Base
	 */
	var Abstract = function(config){
		Abstract.superclass.constructor.call(this,config);
	};

	BUI.extend(Abstract,BUI.Base);

	Abstract.ATTRS = {

		/**
		 * 子项对应的构造函数
		 * @type {Function}
		 */
		itemConstructor : {
			value : Item
		},
		/**
		 * 使用此插件的控件
		 * @type {BUI.Component.Controller}
		 */
		control : {

		},
		/**
		 * 控件的的那些事件会引起重新布局
		 * @type {Array}
		 */
		layoutEvents : {
			value : ['afterWidthChange','afterHeightChange']
		},
		/**
		 * 内部选项
		 * @type {String}
		 */
		items : {

		},
		/**
		 * 布局容器上添加的样式
		 * @type {String}
		 */
		elCls : {

		},
		/**
		 * 布局子项的默认得配置项
		 * @type {Object}
		 */
		defaultCfg : {
			value : {}
		},
		/**
		 * 放置控件的容器css
		 * @type {string}
		 */
		wraperCls : {

		},
		/**
		 * 放置布局的容器
		 * @type {jQuery}
		 */
		container : {

		},
		/**
		 * 布局相关的模板,将所有的子控件放置其中
		 * @type {String}
		 */
		tpl : {

		},
		/**
		 * 每一个布局子项的模板
		 * @type {String}
		 */
		itemTpl : {
			value : '<div></div>'
		}
	}

	BUI.augment(Abstract,{

		initializer : function(control){
			var _self = this;
			_self.set('control',control);
		},
		renderUI : function(){
			this._initWraper();
			this.initItems();
		},
		//绑定宽度，高度发生改变的情形
		bindUI : function(){
			var _self = this,
				control = _self.get('control'),
				layoutEvents = _self.get('layoutEvents').join(' ');

			control.on('afterAddChild',function(ev){
				var child = ev.child;
				_self.addItem(child);
				
			});

			control.on('afterRemoveChild',function(ev){
				_self.removeItem(ev.child);
			});
			
			control.on(layoutEvents,function(){
				_self.resetLayout();
			});

			
			_self.appendEvent(control);
		},
		/**
		 * @protected
		 * 附加事件
		 * @param  {Object} control 使用layout的控件
		 */
		appendEvent : function(control){

		},
		//初始化容器
	  _initWraper : function(){
	  	var _self = this,
	  		control = _self.get('control'),
	  		controlEl = control.get('view').get('contentEl'),
	  		node,
	  		elCls = _self.get('elCls'),
	  		tpl = _self.get('tpl');
	  	if(tpl){
	  		node = $(tpl).appendTo(controlEl);
	  	}else{
	  		node = controlEl;
	  	}
	  	if(elCls){
	  		node.addClass(elCls);
	  	}
	  	_self.set('container',node);
	  	_self.afterWraper();
		},
		/**
		 * @protected
		 * 容器初始化完毕开始渲染布局子项
		 */
		afterWraper : function(){

		},
		/**
		 * 通过DOM查找子项
		 * @param  {jQuery} element DOM元素
		 * @return {BUI.Layout.Item} 布局选项
		 */
		getItemByElement : function(element){
			return this.getItemBy(function(item){
				return $.contains(item.get('el')[0],element[0]);
			});
		},
		/**
		 * @protected
		 * 获取布局选项的容器
		 */
		getItemContainer : function(itemAttrs){
			return this.get('container');
		},
		/**
		 * @private
		 * 初始化子项
		 */
		initItems : function(){
			var _self = this,
				control = _self.get('control'),
				items = [],
				controlChildren = control.get('children');

			_self.set('items',items);

			for (var i = 0; i < controlChildren.length; i++) {
				_self.addItem(controlChildren[i]);
			};
			_self.afterInitItems();
			
		},
		/**
		 * 布局选项初始化完毕
		 * @protected
		 */
		afterInitItems : function(){

		},
		/**
		 * 获取下一项选项,如果当前项是最后一条记录，则返回第一条记录
		 * @param  {BUI.Layout.Item} item 选项
		 * @return {BUI.Layout.Item}  下一个选项
		 */
		getNextItem : function(item){
			var _self = this,
				index = _self.getItemIndex(item),
				count = _self.getCount(),
				next = (index + 1) % count;
			return _self.getItemAt(next);
		},
		/**
		 * @protected
		 * 返回子项的配置信息
		 * @param {Object}  controlChild 包装的控件
		 * @return {Object} 配置信息
		 */
		getItemCfg : function(controlChild){
			var _self = this,
				defaultCfg = _self.get('defaultCfg'),
				cfg = BUI.mix({},defaultCfg,{
					control : controlChild,
					tpl : _self.get('itemTpl'),
					layout : _self,
					wraperCls : _self.get('wraperCls'),
					container : _self.getItemContainer(cfg)
				},controlChild.get('layout'));

			return cfg;
		},
		/**
		 * @protected 
		 * 初始化子项
		 */
		initItem : function(controlChild){
			var _self = this,
				c = _self.get('itemConstructor'),
				cfg = _self.getItemCfg(controlChild);

			return new c(cfg);
		},
		/**
		 * 添加布局项
		 * @protected
		 * @param {Object} controlChild 控件
		 */
		addItem : function(control){
			var _self = this,
				items = _self.getItems(),
				item = _self.initItem(control);
			items.push(item);
			return item;
		},
		/**
		 * 移除布局项
		 * @protected
		 * @param  {Object} controlChild 使用布局的控件的子控件
		 */
		removeItem : function(control){
			var _self = this,
			  items = _self.getItems(),
				item = _self.getItem(control);
			if(item){
				item.destroy();
				BUI.Array.remove(items,item);
			}
		},
		/**
		 * 通过匹配函数获取布局选项
		 * @param  {Function} fn 匹配函数
		 * @return {BUI.Layout.Item} 布局选项
		 */
		getItemBy : function(fn){
			var _self = this,
				items = _self.getItems(),
				rst = null;

			BUI.each(items,function(item){
				if(fn(item)){
					rst = item;
					return false;
				}
			});
			return rst;
		},
		/**
		 * 通过匹配函数获取布局选项集合
		 * @param  {Function} fn 匹配函数
		 * @return {Array} 布局选项集合
		 */
		getItemsBy : function(fn){
			var _self = this,
				items = _self.getItems(),
				rst = [];

			BUI.each(items,function(item){
				if(fn(item)){
					rst.push(item);
				}
			});
			return rst;
		},
		/**
		 * 获取布局选项
		 * @param {Object} controlChild 子控件
		 * @return {BUI.Layout.Item} 布局选项
		 */
		getItem : function(control){
			return this.getItemBy(function(item){
				return item.get('control') == control;
			});
		},
		/**
		 * 返回子项的数目
		 * @return {Number} 数目
		 */
		getCount : function(){
			return this.getItems().length;
		},
		/**
		 * 根据索引返回选项
		 * @return {BUI.Layout.Item}} 返回选项
		 */
		getItemAt : function(index){
			return this.getItems()[index];
		},
		/**
		 * 获取索引
		 * @param  {BUI.Layout.Item} item 选项
		 * @return {Number} 索引
		 */
		getItemIndex : function(item){
			var items = this.getItems();
			return BUI.Array.indexOf(item,items);
		},
		/**
		 * 获取内部子项，不等同于children，因为可能有
		 * @return {Array} 返回布局的子项
		 */
		getItems : function(){
			return this.get('items');
		},
		/**
		 * @protected
		 * 重置布局，子类覆盖此类
		 */
		resetLayout : function(){
			var _self = this,
			 	items = _self.getItems();

			BUI.each(items,function(item){
				item.syncItem();
			});
		},
		/**
		 * 清除所有的布局
		 * @protected
		 */
		clearLayout : function(){
			var _self = this,
				items = _self.getItems();
			BUI.each(items,function(item){
				item.destroy();
			});
		},
		/**
		 * 重新布局
		 */
		reset: function(){
			this.resetLayout();
		},
		/**
		 * 析构函数
		 */
		destroy : function(){
			var _self = this;
			_self.clearLayout();
			_self.off();
			_self.clearAttrVals();
		}
	});

	return Abstract;
});