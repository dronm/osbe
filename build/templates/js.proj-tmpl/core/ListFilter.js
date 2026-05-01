/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
*/

/* constructor */
function ListFilter(){
	this.m_params = {};
}
ListFilter.prototype.m_params;

ListFilter.prototype.addFilter = function(id,filter){		
	this.m_params[id] = {};
	this.m_params[id]["iniValue"] = (filter.iniValue==undefined)? '':filter.iniValue;
	this.m_params[id]["sign"] = filter.sign;
	this.m_params[id]["l_wcards"] = (filter.l_wcards==undefined)? false:filter.l_wcards;
	this.m_params[id]["r_wcards"] = (filter.r_wcards==undefined)? false:filter.r_wcards;
	
	this.m_params[id]["keyFieldIds"] = filter.keyFieldIds;
	this.m_params[id]["valueFieldId"] = filter.valueFieldId;
	this.m_params[id]["icase"] = (filter.icase==undefined)? false:filter.icase;
	this.m_params[id]["descr"] = filter.descr;
	this.m_params[id]["key"] = filter.key;
}
ListFilter.prototype.setParamValue = function(id,paramId,ParamValue){
	this.m_params[id][paramId] = ParamValue;
}
ListFilter.prototype.getParamValue = function(id,paramId){
	return this.m_params[id][paramId];
}

ListFilter.prototype.getParams = function(struc){		
	struc.field_sep = struc.field_sep||"@";
	for (var ctrl_id in this.m_params){
		var val;
		if (this.m_params[ctrl_id].valueFieldId){
			val = this.m_params[ctrl_id].descr;
			if (val&&val!="undefined"){
				if (this.m_params[ctrl_id].sign=='lk'){
					if (this.m_params[ctrl_id].l_wcards){
						val='%'+val;
					}
					if (this.m_params[ctrl_id].r_wcards){
						val+='%';
					}					
				}
				//field
				struc.fields=(struc.fields==null)? "":struc.fields;
				struc.fields+=(struc.fields=="")? "":struc.field_sep;
				struc.fields+=this.m_params[ctrl_id].valueFieldId;
				//sign
				struc.signs=(struc.signs==null)? "":struc.signs;
				struc.signs+=(struc.signs=="")? "":struc.field_sep;
				struc.signs+=this.m_params[ctrl_id].sign;
				//value
				struc.vals=(struc.vals==null)? "":struc.vals;
				struc.vals+=(struc.vals=="")? "":struc.field_sep;
				struc.vals+=val;
				//icase
				struc.icase=(struc.icase==null)? "":struc.icase;
				struc.icase+=(struc.icase=="")? "":struc.field_sep;
				struc.icase+=(this.m_params[ctrl_id].icase==true)? '1':'0';
			}
		}
		if (this.m_params[ctrl_id].keyFieldIds){
			for (var i=0;i<this.m_params[ctrl_id].keyFieldIds.length;i++){
				var key = this.m_params[ctrl_id].keyFieldIds[i];
				val = this.m_params[ctrl_id].key;
				if (val&&val!="undefined"){
					//field
					struc.fields=(struc.fields==null)? "":struc.fields;
					struc.fields+=(struc.fields=="")? "":struc.field_sep;
					struc.fields+=key;
					//sign
					struc.signs=(struc.signs==null)? "":struc.signs;
					struc.signs+=(struc.signs=="")? "":struc.field_sep;
					struc.signs+=this.m_params[ctrl_id].sign;
					//value
					struc.vals=(struc.vals==null)? "":struc.vals;
					struc.vals+=(struc.vals=="")? "":struc.field_sep;
					struc.vals+=val;
					//icase
					struc.icase=(struc.icase==null)? "":struc.icase;
					struc.icase+=(struc.icase=="")? "":struc.field_sep;
					struc.icase+=(this.m_params[ctrl_id].icase==true)? '1':'0';
				}
			}
		}			
	}
}
ListFilter.prototype.setClickContext = function(){
}
ListFilter.prototype.setOnRefresh = function(){
}
ListFilter.prototype.toDOM = function(){
}
ListFilter.prototype.removeDOM = function(){
}
