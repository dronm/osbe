/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2021

 * @extends EditModalDialog
 * @requires core/extend.js
 * @requires controls/EditModalDialog.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {bool} options.strictValidation default true
 */
function EditModalDialogXML(id,options){
	options = options || {};	
	
	options.strictValidation = (options.strictValidation!=undefined)? options.strictValidation:true;
	
	EditModalDialogXML.superclass.constructor.call(this,id,options);
}
//ViewObjectAjx,ViewAjxList
extend(EditModalDialogXML,EditModalDialog);

/* Constants */


/* private members */

/* protected*/


/* public methods */
EditModalDialogXML.prototype.setValue = function(v){
	//v.cloneNode(true)
	this.setValueXML((typeof v === "string")? DOMHelper.xmlDocFromString(v) : v);
}

EditModalDialogXML.prototype.setValueXML = function(v){
	
	this.m_valueXML = v&&v.cloneNode? v.cloneNode(true) : v;
	
	if(this.m_view){
		this.m_view.setValue(this.m_valueXML);//v
	}
	
	var xml_f;
	//if(this.m_valueXML instanceof XMLDocument && this.m_valueXML.childNodes && this.m_valueXML.childNodes.length && this.m_valueXML.childNodes[0].childNodes){
	if(this.m_valueXML && (this.m_valueXML.constructor.name||CommonHelper.functionName(this.m_valueXML.constructor)) == "XMLDocument"
	&& this.m_valueXML.childNodes && this.m_valueXML.childNodes.length && this.m_valueXML.childNodes[0].childNodes){
		xml_f = this.m_valueXML.childNodes[0];
		
	//}else if(this.m_valueXML instanceof Element && this.m_valueXML.childNodes && this.m_valueXML.childNodes.length){
	}else if(this.m_valueXML && (this.m_valueXML.constructor.name||CommonHelper.functionName(this.m_valueXML.constructor)) == "Element"
	&& this.m_valueXML.childNodes && this.m_valueXML.childNodes.length){
		xml_f = this.m_valueXML;
	}
	var v = this.m_formatValue(xml_f);
	this.getNode().textContent = v;
}

EditModalDialogXML.prototype.getValue = function(){
	return this.getValueXML();
}

EditModalDialogXML.prototype.getValueXML = function(){
	return this.m_valueXML;
}

EditModalDialogXML.prototype.isNull = function(){
	return !(this.m_valueXML && this.m_valueXML.childNodes && this.m_valueXML.childNodes.length);
}

EditModalDialogXML.prototype.getDefViewOptions = function(){
	return {
		"valueXML":this.m_valueXML,
		"template":window.getApp().getTemplate(this.m_viewTemplate)
	};

}

/**
 * @{DOMNode} val
 */
EditModalDialogXML.prototype.formatValue = function(val){
	var res = "";
	if(val && val.childNodes) {
		for (i = 0; i < val.childNodes.length; i++){
			res+= ((res=="")? "":", ") + val.childNodes[i].textContent;
		}
	}
	return res;	
}

/**
 * @param {array} tagList
 *	tagName,sep,showEmpty,notFirst,refVal/ref
 */
EditModalDialogXML.prototype.formatValueOnTags = function(val,tagList){
	var res = "";
	if(val && val.childNodes) {		
		for (i = 0; i < tagList.length; i++){
			var n_list = val.getElementsByTagName(tagList[i].tagName);
			var t_val = "";
			if(n_list&&n_list.length && (tagList[i].refVal||tagList[i].ref) ){
				var sys_n_list = n_list[0].getElementsByTagName("sysValue");
				if(sys_n_list&&sys_n_list.length){
					var ref = CommonHelper.unserialize(sys_n_list[0].textContent);
					t_val = ref? ref.getDescr():"";
				}				
				
			}else if(n_list&&n_list.length){
				t_val = n_list[0].textContent;
			}	
			
			if(t_val.length||tagList[i].showEmpty ){
				res += (res==""&&!tagList[i].notFirst? "":(tagList[i].sep? tagList[i].sep:", ") ) + t_val;
			}
		}
	}
	return res;	
}

