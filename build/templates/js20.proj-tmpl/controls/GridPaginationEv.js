/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2020

 * @class
 * @classdesc grid object
  
 * @requires core/extend.js
 * @requires controls/Control.js
 
 * @param {string} id Object identifier
 * @param {Object} options
 * @param {Button} [options.ctrlGoFirst=Button]
 * @param {boolean} [options.cmdGoFirst=true] 
 * @param {Button} [options.ctrlGoPrev=Button]
 * @param {boolean} [options.cmdGoPrev=true] 
 * @param {Button} [options.ctrlGoNext=Button]
 * @param {boolean} [options.cmdGoNext=true]
 * @param {String} [options.ctrlClassName=DEF_CTRL_CLASS_NAME]
 * @param {String} [options.ctrlGoFirstGlyph=DEF_CTRL_GO_FIRST_GLYPH]
 * @param {String} [options.ctrlGoNextGlyph=DEF_CTRL_GO_NEXT_GLYPH]
 * @param {String} [options.ctrlGoPrevGlyph=DEF_CTRL_GO_PREV_GLYPH]                           
 * @param {String} [options.ctrlGoMastGlyph=DEF_CTRL_GO_LAST_GLYPH]                            

 * @param {String} [options.pagesTagName=DEF_PAGES_TAG_NAME]
 * @param {String} [options.pagesClassName=DEF_PAGES_CLASS_NAME]   

 * @param {String} [options.pageClassName=DEF_PAGE_CLASS_NAME]
 * @param {String} [options.pageCurClassName=DEF_PAGE_CUR_CLASS_NAME]
 * @param {String} [options.pageTagName=DEF_PAGE_TAG_NAME]                                                            
 * @param {String} [options.ctrlGoFirstCaption=""]
 * @param {String} [options.ctrlGoNextCaption=""]
 * @param {String} [options.ctrlGoPrevCaption=""]
 
 */
function GridPaginationEv(id,options){
	options = options || {};

	this.setPageClassName(options.pageClassName || this.DEF_PAGE_CLASS_NAME);
	this.setPageCurClassName(options.pageCurClassName || this.DEF_PAGE_CUR_CLASS_NAME);
	this.setPageTagName(options.pageTagName || this.DEF_PAGE_TAG_NAME);
	
	//buttons
	this.m_buttonContainer = options.buttonContainer || new ControlContainer(id+":bns_cont","SPAN",{"className":"pagination-pages"});
	
	GridPaginationEv.superclass.constructor.call(this, id, (options.tagName || this.DEF_TAG_NAME), options);
	

	var ctrl_class = options.ctrlClassName || this.DEF_CTRL_CLASS_NAME;
	
	if (options.ctrlGoFirst || options.cmdGoFirst==undefined || options.cmdGoFirst==true){
		this.m_ctrlGoFirst = options.ctrlGoFirst || new Button(id+":go_first",
			{"glyph":(options.ctrlGoFirstCaption!=undefined)? null:options.ctrlGoFirstGlyph||this.DEF_CTRL_GO_FIRST_GLYPH,
			"caption":options.ctrlGoFirstCaption || "",
			"className":ctrl_class,
			"onClick":function(){
				self.goFirst();
			},
			"attrs":{"title":this.CONTR_GO_FIRST_TITLE}
		});
		this.m_buttonContainer.addElement(this.m_ctrlGoFirst);
	}
	
	if (options.ctrlGoPrev || options.cmdGoPrev==undefined || options.cmdGoPrev==true){	
		this.m_ctrlGoPrev = new Button(id+":go_prev",
			{"glyph":(options.ctrlGoPrevCaption!=undefined)? null:options.ctrlGoPrevGlyph||this.DEF_CTRL_GO_PREV_GLYPH,
			"caption":options.ctrlGoPrevCaption || "",
			"className":ctrl_class,
			"onClick":function(){
				self.goPrev();
			},
			"attrs":{"title":this.CONTR_GO_PREV_TITLE}
			});
		this.m_buttonContainer.addElement(this.m_ctrlGoPrev);
	}	
	
	if (options.ctrlGoNext || options.cmdGoNext==undefined || options.cmdGoNext==true){	
		this.m_ctrlGoNext = new Button(id+":go_next",{
			"glyph":(options.ctrlGoNextCaption!=undefined)? null:options.ctrlGoNextGlyph||this.DEF_CTRL_GO_NEXT_GLYPH,
			"caption":options.ctrlGoNextCaption || "",
			"className":ctrl_class,
			"onClick":function(){
				self.goNext();
			},
			"attrs":{"title":this.CONTR_GO_NEXT_TITLE}
		});	
		this.m_buttonContainer.addElement(this.m_ctrlGoNext);
	}
	
	if(isNaN(options.from))options.from=0;
	this.setFrom(options.from);
	
	if (options.countPerPage){
		this.setCountPerPage(options.countPerPage);
	}	
	
}
extend(GridPaginationEv,Control);

GridPaginationEv.prototype.DEF_TAG_NAME = "DIV";
GridPaginationEv.prototype.DEF_CTRL_CLASS_NAME = "btn btn-xs";
GridPaginatiGridPaginationEvon.prototype.DEF_CTRL_GO_FIRST_GLYPH = "glyphicon-fast-backward";
GridPaginatiGridPaginationEvon.prototype.DEF_CTRL_GO_PREV_GLYPH = "glyphicon-step-backward";
GridPaginationEv.prototype.DEF_CTRL_GO_NEXT_GLYPH = "glyphicon-step-forward";
GridPaginationEv.prototype.DEF_PAGE_CLASS_NAME = "pagination-page";
GridPaginationEv.prototype.DEF_PAGE_CUR_CLASS_NAME = "pagination-page badge pagination-page-cur";
GridPaginationEv.prototype.DEF_PAGE_TAG_NAME = "SPAN";
GridPaginationEv.prototype.DEF_PAGES_TAG_NAME = "SPAN";
GridPaginationEv.prototype.DEF_PAGES_CLASS_NAME = "pagination-pages";

GridPaginationEv.prototype.m_countPerPage;
GridPaginationEv.prototype.m_from;
GridPaginationEv.prototype.m_inf;
GridPaginationEv.prototype.m_grid;

GridPaginationEv.prototype.m_pageClassName;
GridPaginationEv.prototype.m_pageCurClassName;
GridPaginationEv.prototype.m_pageTagName;

GridPaginationEv.prototype.getFrom = function(){
	return this.m_from;
}
GridPaginationEv.prototype.getCountPerPage = function(){
	return this.m_countPerPage;
}

GridPaginationEv.prototype.setCountPerPage = function(countPerPage){
	this.m_countPerPage = parseInt(countPerPage);	
}
GridPaginationEv.prototype.setFrom = function(from){
	this.m_from = parseInt(from);
	this.setInf();
}
GridPaginationEv.prototype.reset = function(){
	this.m_from = undefined;
}

GridPaginationEv.prototype.setGrid = function(v){
	this.m_grid = v;
}

GridPaginationEv.prototype.refreshGrid = function(){
	window.setGlobalWait(true);
	var self = this;
	this.m_grid.onRefresh(function(){
		window.setGlobalWait(false);
		self.m_grid.focus();
	});	
}

GridPaginationEv.prototype.goFirst = function(){
	this.setFrom(0);
	this.m_page = 1;
	this.refreshGrid();
}
GridPaginationEv.prototype.goPrev = function(){
	//this.setFrom(Math.max(0,this.m_from - this.m_countPerPage));
	this.m_page--;
	this.setInf();
	this.refreshGrid();
}

GridPaginationEv.prototype.goNext = function(){
	//var from = this.m_from + this.m_countPerPage;
	//from = (from>=this.m_countTotal)? this.m_from:from;
	//this.setFrom(from);
	
	this.m_page++;
	this.refreshGrid();
}

GridPaginationEv.prototype.setInf = function(){
	if(isNaN(this.m_page))this.m_page = 1;
	
	if(this.m_ctrlGoFirst)this.m_ctrlGoFirst.setEnabled((this.m_page>1));
	if(this.m_ctrlGoPrev)this.m_ctrlGoPrev.setEnabled((this.m_page>1));
	//ToDo set ctrlGoNext enabled/disabled
	
}

GridPaginationEv.prototype.toDOM = function(parent){

	GridPaginationEv.superclass.toDOM.call(this,parent);

	this.m_inf.toDOM(this.m_node);

	this.m_buttonContainer.toDOM(this.m_node);
	
	this.setInf();	
}

GridPaginationEv.prototype.delDOM = function(){
	if (this.m_showPageCount){
		this.m_pages.delDOM();
	}

	this.m_inf.delDOM();
	
	this.m_buttonContainer.delDOM();

	GridPaginationEv.superclass.delDOM.call(this);		
}

GridPaginationEv.prototype.setPageClassName = function(v){
	this.m_pageClassName = v;
}
GridPaginationEv.prototype.getPageClassName = function(){
	return this.m_pageClassName;
}
GridPaginationEv.prototype.setPageCurClassName = function(v){
	this.m_pageCurClassName = v;
}
GridPaginationEv.prototype.getPageCurClassName = function(){
	return this.m_pageCurClassName;
}
GridPaginationEv.prototype.setPageTagName = function(v){
	this.m_pageTagName = v;
}
GridPaginationEv.prototype.getPageTagName = function(){
	return this.m_pageTagName;
}
