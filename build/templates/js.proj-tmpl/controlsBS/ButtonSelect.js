/* Copyright (c) 2012 	Andrey Mikhalevich, Katren ltd.*//*		Description*///ф/** Requirements  * @requires common/functions.js  * @requires common/EventHandler.js  * @requires controls/Button.js*//* constructor */function ButtonSelect(id,options){	options = options || {};		options.glyph = options.glyph||"glyphicon-menu-hamburger";		options.attrs = options.attrs || {};	options.attrs.title = options.attrs.title||options.attrs.hint||		this.DEF_HINT;			ButtonSelect.superclass.constructor.call(		this,id,options);}extend(ButtonSelect,ButtonCtrl);ButtonSelect.prototype.DEF_HINT = "выбрать";ButtonSelect.prototype.DEF_ALT = "выбр.";