/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2022

 * @extends GridCellHead
 * @requires core/extend.js
 * @requires controls/GridCellHead.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function GridCellHeadMark(id,options){
	options = options || {};	
	
	//options.value = this.COL_LABEL;
	options.title = this.COL_TITLE;
	options.attrs = options.attrs || {};
	options.attrs.style = options.attrs.style || "";
	options.attrs.style+= "cursor:pointer;"
	
	options.columns = [
		new GridColumn({
			"ctrlEdit": false,
			"searchable":false,
			"cellElements": [
				{"elementClass": Control,
				"elementOptions": {											
					"tagName": "INPUT",
					"attrs": {
						"type":"checkbox",
						"class": this.MARK_CLASS
					}
				}
				}
			]
		})
	];
	var self = this;
	options.events = {
		"click": function(){
			self.markAll();
		}
	}
	options.elements = [
		new Control(null, "SPAN", {
			"attrs":{
				"class":"glyphicon glyphicon-check"
			}
		})
	];
	GridCellHeadMark.superclass.constructor.call(this, id, options);
}
//ViewObjectAjx,ViewAjxList
extend(GridCellHeadMark, GridCellHead);//

/* Constants */
GridCellHeadMark.prototype.MARK_CLASS = "selectMark";

/* private members */
GridCellHeadMark.prototype.m_stateChecked;

/* protected*/


/* public methods */
/*GridCellHeadMark.prototype.getSortable = function(){
	return false;
}*/

GridCellHeadMark.prototype.markAll = function(){
	var t = DOMHelper.getParentByTagName(this.getNode(), "TABLE");	
	var marks = DOMHelper.getElementsByAttr(this.MARK_CLASS, t, "class", false, "INPUT");
	this.m_stateChecked = !this.m_stateChecked;
	for(var i =0; i < marks.length; i++){
		marks[i].checked = this.m_stateChecked;
	}
}

GridCellHeadMark.prototype.getSelectedKeys = function(){
	var keys = [];
	var t = DOMHelper.getParentByTagName(this.getNode(), "TABLE");	
	var marks = DOMHelper.getElementsByAttr("selectMark", t, "class", false, "INPUT");
	for(var i =0; i < marks.length; i++){
		if(marks[i].checked){
			var r = DOMHelper.getParentByTagName(marks[i], "TR");
			if(r){				
				keys.push(CommonHelper.unserialize(r.getAttribute("keys")));
			}
		}
	}
	return keys;
}
