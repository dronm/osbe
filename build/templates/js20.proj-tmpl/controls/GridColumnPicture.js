/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2020

 * @extends GridColumn
 * @requires controls/GridColumn.js
 * @requires core/AppWin.js 

 * @class
 * @classdesc
 
 * @param {Object} options
 * @param {string} [options.pictureFieldId=this.PICTURE_FIELD_ID]
 * @param {String} [options.pictureWidth=this.PICTURE_WIDTH] 
 * @param {String} [options.pictureHeight=this.PICTURE_HEIGHT]
 * @param {bool} [options.proportianal=true]
 * @param {function} options.onClick custom function
 */
function GridColumnPicture(options){
	options = options || {};	
	
	options.ctrlEdit = false;
	this.m_pictureFieldId = options.pictureFieldId || this.PICTURE_FIELD_ID;
	this.m_pictureWidth = options.pictureWidth || this.PICTURE_WIDTH;
	this.m_pictureHeight = options.pictureHeight || this.PICTURE_HEIGHT;
	this.m_proportianal = (options.proportianal!=undefined)? options.proportianal : true;
	this.m_onClick = options.onClick;
	
	var self = this;
	this.m_origFormatFunction = options.formatFunction;
	options.formatFunction = function(fields,gridCell){
		var res;		
		if (self.m_origFormatFunction){
			res = self.m_origFormatFunction(fields,gridCell);
		}
		else{
			res = self.getCellValue(fields,gridCell);
		}
		return res;
	}
	
	GridColumnPicture.superclass.constructor.call(this,options);
}
extend(GridColumnPicture,GridColumn);

/* Constants */
GridColumnPicture.prototype.PICTURE_FIELD_ID = "dataBase64";
GridColumnPicture.prototype.PICTURE_WIDTH = "50";
GridColumnPicture.prototype.PICTURE_HEIGHT = "50";

/* private members */
GridColumnPicture.prototype.m_pictureWidth;
GridColumnPicture.prototype.m_pictureHeight;
GridColumnPicture.prototype.m_onClick; //function

/* protected*/


/* public methods */
GridColumnPicture.prototype.getCellValue = function(fields,gridCell){
	var f = fields[this.getField().getId()];
	var res = "";
	if (f){
		var v = f.getValue();
		var v_data;
		if (typeof v =="string"){
			v_data = v;//CommonHelper.unserialize(
		
		}else if(CommonHelper.isArray(v) && v.length && v[0][this.m_pictureFieldId]){
			v_data = v[0][this.m_pictureFieldId]
			
		}else if (typeof v =="object" && v[this.m_pictureFieldId]){
			v_data = v[this.m_pictureFieldId]
		}
		if(v_data){
			var self = this;
			var src = "data:image/png;base64, "+v_data;
			//console.log("ctrlImageID="+gridCell.getId()+":assoc-img")
			//console.log("getCellValue="+fields.id.getValue())
			var pic_ctrl = new Control(gridCell.getId()+":assoc-img","img",{
				"visible":!this.m_proportianal,
				"attrs":{
					"src": src
				}
				,"events": {
					"click": this.m_onClick? (function(cont, f){
						//always first row!!!
						return function(e){
							cont.m_onClick.call(cont, f, e.target);
						}	
					})(this, fields):null,
					"load": this.m_proportianal? function(){
						var n = this.m_node;
						var dim = CommonHelper.calculateImgRatioFit(n.width, n.height, self.m_pictureWidth, self.m_pictureHeight);
						n.width = dim.width;
						n.height = dim.height;
						DOMHelper.show(n);						
					} : null
				}
			});
			gridCell.addElement(pic_ctrl);
		}
	}
	return res;
}

