/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends EditRef
 * @requires core/extend.js
 * @requires EditRef.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {Control} detailControl
 * @param {array} options.detailkeyIds
 */
function GridAjxMaster(id,options){
	options = options || {};	
	
	this.setDetailControl(options.detailControl);
	this.setDetailKeyIds(options.detailkeyIds);
	
	GridAjxMaster.superclass.constructor.call(this,id,options);
}
extend(GridAjxMaster,GridAjx);

/* Constants */


/* private members */
GridAjxMaster.prototype.m_detailControl;
GridAjxMaster.prototype.m_detailKeyIds;


/* protected*/

/*Selects newNode and unselects oldNode*/
GridAjxMaster.prototype.selectNode = function(newNode,oldNode){

	GridAjxMaster.superclass.selectNode.call(this,newNode,oldNode);
	
	if (this.m_detailControl){
		//set new keys && refresh
		var keys = this.getSelectedNodeKeys();
		var pm = this.m_detailControl.getReadPublicMethod();	
		if (pm){
		
			var pm_upd,pm_ins;
			
			if (this.m_detailControl.getUpdatePublicMethod){
				pm_upd = this.m_detailControl.getUpdatePublicMethod();
			}
			
			if (this.m_detailControl.getInsertPublicMethod){
				pm_ins = this.m_detailControl.getInsertPublicMethod();
			}
		
			var det_ids = this.getDetailKeyIds();
			var ind = 0;
			var contr = pm.getController();
			/*			
			var fields = "";		
			var signs = "";
			var vals = "";
			var icase = "";
			*/
			for (var kid in keys){
				this.m_detailControl.setFilter({
					"field":det_ids[ind],
					"sign":contr.PARAM_SGN_EQUAL,
					"val":keys[kid],
					"icase":"0"
				});
				/*
				fields+= (fields=="")? "":contr.PARAM_FIELD_SEP;
				fields+= det_ids[ind];
				
				signs+= (signs=="")? "":contr.PARAM_FIELD_SEP;
				signs+= contr.PARAM_SGN_EQUAL;

				vals+= (vals=="")? "":contr.PARAM_FIELD_SEP;
				vals+= keys[kid];

				icase+= (icase=="")? "":contr.PARAM_FIELD_SEP;
				*/
				
				if (pm_upd){
					pm_upd.setFieldValue(det_ids[ind],keys[kid]);
				}
				if (pm_ins){
					pm_ins.setFieldValue(det_ids[ind],keys[kid]);
				}
				
				ind++;
			}
			/*
			pm.setFieldValue(contr.PARAM_COND_FIELDS, fields);
			pm.setFieldValue(contr.PARAM_COND_SGNS, signs);
			pm.setFieldValue(contr.PARAM_COND_VALS, vals);
			pm.setFieldValue(contr.PARAM_COND_ICASE, icase);
			*/
			this.m_detailControl.onRefresh();	
		}		
	}
}


/* public methods */
GridAjxMaster.prototype.getDetailControl = function(){
	return this.m_detailControl;
}

GridAjxMaster.prototype.setDetailControl = function(v){
	this.m_detailControl = v;
}

GridAjxMaster.prototype.getDetailKeyIds = function(){
	return this.m_detailKeyIds;
}

GridAjxMaster.prototype.setDetailKeyIds = function(v){
	this.m_detailKeyIds = v;
}

