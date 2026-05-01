/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc
 
 * @requires core/extend.js  
 * @requires controls/GridCmd.js
 * @requires controls/ButtonPrintList.js 

 * @param {string} id Object identifier
 * @param {namespace} options
 * @param {namespace} options.printObjList
 * @param {namespace} options.printObjListKeyIds
*/
function GridCmdPrintObj(id,options){
	options = options || {};	

	options.showCmdControlInPopup = (options.showCmdControlInPopup!=undefined)? options.showCmdControlInPopup:false;

	var self = this;
	options.controls = [
		new ButtonPrintList(id,{
			"printList":options.printList,
			"keyIds":options.keyIds,
			"app":options.app
		})
	];
	
	GridCmdPrintObj.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdPrintObj,GridCmd);

/* Constants */


/* private members */

/* protected*/
GridCmdPrintObj.prototype.controlsToPopUp = function(popUp){	
	if (this.m_controls.length){
		var self = this;
		popUp.addButton(new ButtonCtrl(null,{
			"caption":"Печатные формы",
			"attrs":{"objInd":0},
			"onClick":function(){
				//self.m_printObjList[this.getAttr("objInd")].onClick();
			}
		}));
	}
}

/* public methods */
GridCmdPrintObj.prototype.setGrid = function(v){
	GridCmdPrintObj.superclass.setGrid.call(this,v);
	
	if (this.m_controls.length){
		this.m_controls[0].setGrid(v);
	}
}

GridCmdPrintObj.prototype.setPrintList = function(v){
	this.m_controls[0].setPrintList(v);
}
