/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @extends ControlContainer
 * @requires core/extend.js
 * @requires controls/ControlContainer.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function GridSearchInf(id,options){
	options = options || {};	
	
	options.hidden = true;
	
	this.m_grid = options.grid;
	
	GridSearchInf.superclass.constructor.call(this,id,"DIV",options);
}
//ViewObjectAjx,ViewAjxList
extend(GridSearchInf, ControlContainer);

/* Constants */


/* private members */
GridSearchInf.prototype.m_grid;
/* protected*/


/* public methods */

GridSearchInf.prototype.addSearch = function(filterId,label,val,fieldId){
//console.log("GridSearchInf.prototype.addSearch")
//console.log("filterId="+filterId)
//console.log("label="+label)
//console.log("val="+val)
	var ctrl_id = this.getId()+":"+filterId;
	if (this.elementExists(filterId)){
		this.delElement(filterId);
	}
	var self = this;
	var tl = CommonHelper.format(this.ITEM_TITLE_PATTERN,[label,val]);
	this.addElement(new ControlContainer(ctrl_id,"SPAN",{
		"attrs":{"fieldid":fieldId},
		"name":filterId,
		"elements":[
			new Control(null,"SPAN",{
				"value":label+":",
				"title":tl
			})
			,new Control(null,"SPAN",{
				"value":val+" ",
				"title":tl
			})
			,new Control(null,"SPAN",{
				"className":"glyphicon glyphicon-remove-circle",
				"attrs":{"style":"cursor:pointer;"},
				"title":this.ITEM_REMOVE,
				"events":{
					"click":(function(contName){
						return function(){
							window.setGlobalWait(true);
							self.m_grid.unsetFilter(contName);
							self.m_grid.onRefresh((function(searchCtrl,contName){
								return function(){
									searchCtrl.delElement(contName);
									searchCtrl.toDOM();
									var el = searchCtrl.getElements();
									var el_empty = true;
									for(var id in el){
										if(el[id]!=undefined){
											el_empty = false;
											break;
										}
									}
									if(el_empty){
										searchCtrl.hide();
										if(searchCtrl.m_onFilterClear)searchCtrl.m_onFilterClear();
									}
									window.setGlobalWait(false);
									self.m_grid.focus();
								}
							})(self,contName));
						}
					})(filterId)
				}
			})
		]
	}));
	this.toDOM();
	this.show();	
}

GridSearchInf.prototype.setOnFilterClear = function(v){
	this.m_onFilterClear = v;
}

GridSearchInf.prototype.clearSearch = function(){
	this.clear();
	this.hide();
	this.toDOM();
}
