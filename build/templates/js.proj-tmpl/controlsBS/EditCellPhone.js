/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
  * @requires common/functions.js
  * @requires core/ValidatorCellPhone.js  
  * @requires controls/Edit.js
  * @requires extra/JSLib/*.js
*/

/* constructor */
function EditCellPhone(id,options){
	options = options || {};
	options.validator = options.validator || new ValidatorCellPhone();
	options.editMask = options.editMask || this.DEF_EDIT_MASK;
	options.attrs = options.attrs||{};
	options.attrs.maxlength=options.attrs.maxlength||this.DEF_MAX_LEN;
	options.attrs.size=options.attrs.size||this.DEF_SIZE;
	options.events = {
		"paste":function(e){			
			e.stopPropagation();
			e.preventDefault();					
		
			var clipboard_data = e.clipboardData || window.clipboardData;
			var pasted_data = clipboard_data.getData("Text").match(/\d+/g).map(Number).join("");//only numbers
			//debugger
			if(pasted_data.length>10 && (pasted_data[0]=="8"||pasted_data[0]=="7")){
				pasted_data = pasted_data.substring(1);
			}
			if(pasted_data.length>10){
				pasted_data = pasted_data.substring(0,10);
			}
			
			if(pasted_data.length==10){
				this.m_node.value = "8-"+pasted_data.substring(0,3)+"-"+pasted_data.substring(3,6)+"-"+pasted_data.substring(6,8)+"-"+pasted_data.substring(8);
				//this.m_node.value = pasted_data;
				//MaskEdit(this.m_node,this.m_editMask);
			}
			else if(pasted_data.length==6){
				this.m_node.value = "8-345-2"+pasted_data.substring(0,2)+"-"+pasted_data.substring(2,4)+"-"+pasted_data.substring(4);
			}
			else{
				//console.log("Val="+this.getValue())
			}
		}
	}
	
	EditCellPhone.superclass.constructor.call(this,id,options);
}
extend(EditCellPhone,EditString);

/* constants */
EditCellPhone.prototype.DEF_EDIT_MASK = "8-9$d$d-$d$d$d-$d$d-$d$d";
EditCellPhone.prototype.DEF_MAX_LEN = 15;
EditCellPhone.prototype.DEF_SIZE = 15;

/* public methods */
