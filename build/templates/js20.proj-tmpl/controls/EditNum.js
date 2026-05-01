/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc 
 
 * @extends EditString
  
 * @requires core/DOMHelper.js
 * @requires core/EventHelper.js
 * @requires controls/EditString.js

 * @param {string} id Object identifier
 * @param {object} options  
*/
function EditNum(id,options){
	options = options||{};
	
	options.type = options.type || "text";
	options.events = options.events || {};

	let self = this;
	options.events.paste = function(e){
		self.correctPastedData(e);
	}

	EditNum.superclass.constructor.call(this,id,options);		
	
	this.m_allowedChars = [8,0];//del,arrows
	
}

extend(EditNum,EditString);

/* constants */


EditNum.prototype.m_allowedChars;

EditNum.prototype.handleKeyPress = function(e){
	//console.log("which="+e.which);	
	if (CommonHelper.inArray(e.which,this.m_allowedChars)==-1 && (e.which < 48 || e.which > 57)) {
	     	return false;	
	}
}

/* public methods */

EditNum.prototype.toDOM = function(parent){
	EditNum.superclass.toDOM.call(this,parent);

	var self = this;
	$(this.getNode()).keypress(function (e) {		
		return self.handleKeyPress(e);
        });
}

/**
 * @param {Event} e
 */
EditNum.prototype.correctPastedData = function(e){
	e.stopPropagation();
	e.preventDefault();					

	var pasted_data;
	var cur_val;
	var clipboard_data = e.clipboardData || window.clipboardData;
	if(!clipboard_data){
		cur_val = this.getValue();
		pasted_data = cur_val;
	}
	else{
		pasted_data = clipboard_data.getData("Text").match(/\d+/g).map(Number).join("");//only numbers
		pasted_data = pasted_data.replaceAll(" ", "");
	}
	if(!cur_val){
		cur_val = this.getValue();
	}
	if(cur_val!=pasted_data){
		this.setValue(pasted_data);
	}
}
