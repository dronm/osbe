/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @requires controls/Control.js     

 * @class
 * @classdesc
 
 * @param {object} options
 */
function TabManager(id,options){
	options = options || {};	
	
	options.addElement = function(){
		this.addElement(new Control(id+":tabHeadCont",{}));
		this.addElement(new Control(id+":tabCont",{}));
	}
	
	TabManager.superclass.constructor.call(this,"DIV",options);	
	
	this.m_pages = {};
	
}
extend(TabManager,ControlContainer);

/* Constants */
TabManager.prototype.ID = "windowData";

/* private members */
TabManager.prototype.m_tabs;

/* protected*/


/* public methods */
TabManager.prototype.activate = function(id){
	if(this.m_tabs[id]){
		$(document.getElementById(this.getId()+":h_"+id+":a")).tab("show");
		//$('#documentTabs a[href="#'+id+'"]').tab("show");
	}
}

TabManager.prototype.open = function(url,descr){
	//this.m_pages
	var id = md5(url);
	if(!this.m_tabs[id]){
		this.m_tabs[id] = {
			"head":new Control(this.getId()+":h_"+id,"TEMPLATE",{
				"template":window.getApp().getTemplate("TabHead"),
				"templateOptions":{
					"tabId":id,
					"tabDescr":descr
				}
				)},
			"content":new Control(id,"TEMPLATE",{
					"tabId":id
				})
		}
		this.getElement("tabHeadCont").addElement(this.m_tabs[id].head);
		this.getElement("tabCont").addElement(this.m_tabs[id].content);
		this.m_tabs[id].head.toDOM();
		this.m_tabs[id].content.toDOM();
	}
	this.activate(this.m_tabs[id]);
}

TabManager.prototype.close = function(id){
	//this.m_pages
}

