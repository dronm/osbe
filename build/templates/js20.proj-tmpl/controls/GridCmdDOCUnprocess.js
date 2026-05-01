/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc
 
 * @requires core/extend.js  
 * @requires controls/GridCmd.js

 * @param {string} id Object identifier
 * @param {namespace} options
*/
function GridCmdDOCUnprocess(id,options){
	options = options || {};	

	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	options.glyph = "glyphicon-unchecked";
	
	GridCmdDOCUnprocess.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdDOCUnprocess,GridCmd);

/* Constants */


/* private members */

GridCmdDOCUnprocess.prototype.onCommand = function(){
	var self = this;
	WindowQuestion.show({
		"cancel":false,
		"text":this.CONFIRM,
		"callBack":function(r){
			if (r==WindowQuestion.RES_YES){
				self.doDelete();
			}			
		}
	});				
}

GridCmdDOCUnprocess.prototype.doDelete = function(){	
	var contr = this.m_grid.getReadPublicMethod().getController();
	if (contr.publicMethodExists("set_unprocessed")){
		var self = this;
		
		var keys = this.m_grid.getSelectedNodeKeys();
		var pm = contr.getPublicMethod("set_unprocessed");
		pm.setFieldValue("doc_id",keys["id"]);
		pm.run({
			"async":true,
			"ok":function(){
				self.m_grid.onRefresh();
				window.showNote(self.NOTE_DELETED);
			}
		})					
	}
}

/* protected*/


/* public methods */

