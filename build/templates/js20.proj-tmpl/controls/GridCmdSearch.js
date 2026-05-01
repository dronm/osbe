/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc button with calculator
 
 * @extends GridCmd

 * @requires core/extend.js
 * @requires GridCmd.js     
  
 * @param {string} id - html tag id
 * @param {namespase} options
 */
function GridCmdSearch(id,options){
	options = options || {};	

	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:true;
	
	var btn_class = options.buttonClass || ButtonCmd;
	
	var self = this;
	this.m_setCtrl = new btn_class(id+":set",{
			"glyph":"glyphicon-zoom-in",
			"onClick":function(){
					self.onCommand();
				},
			"attrs":{"title":this.TITLE}
		});
	/*
	this.m_unsetCtrl = new btn_class(id+":unset",{
			"glyph":"glyphicon-zoom-out",
			"onClick":function(){
					self.onUnset();
				},
			"enabled":false,
			"attrs":{"title":this.TITLE_UNSET}
		});
	*/
	
	options.controls = [this.m_setCtrl];//,this.m_unsetCtrl
	
	GridCmdSearch.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdSearch,GridCmd);

/* Constants */


/* private members */

GridCmdSearch.prototype.showDialog = function(str){
	//alert("GridCmdSearch.prototype.onCommand");
	var selected_node = this.m_grid.getSelectedNode();	
	
	//if (!selected_node)return;
	
	//Current field will be current column if there are rows or filtered column if any
	var cur_field_id;
	if(selected_node){
		cur_field_id = selected_node.getAttribute("fieldId");
	}
	else{
		var inf_ctrl = this.m_grid.getSearchInfControl();
		if(inf_ctrl){
			var l = inf_ctrl.getElements();
			for(var id in l){
				if(!l[id]){
					continue;
				}
				cur_field_id = l[id].getAttr("fieldid");
				break;
			}
		}
	}
	
	
	var columns = [];
	var grid_columns = this.m_grid.getHead().getColumns();	
	var grid_model = this.m_grid.getModel();
	for (var i in grid_columns){
		var f = grid_columns[i].getField();
		if (!f || grid_columns[i].getSearchable()===false){
			continue;
		}
		
		var fid = f.getId();
		var col_sopts = grid_columns[i].getSearchOptions()||{};

		if(!col_sopts.field&&grid_columns[i].getCtrlBindFieldId()&&grid_model.fieldExists(grid_columns[i].getCtrlBindFieldId())){
			grid_columns[i].setCtrlBindField(grid_model.getField(grid_columns[i].getCtrlBindFieldId()));
		}
		
		if(!col_sopts.field&&grid_columns[i].getCtrlBindField()){
			col_sopts.field = grid_columns[i].getCtrlBindField();
		}
		
		var ctrl_cl, ctrl_cl_opts;
		if(col_sopts && col_sopts.ctrlClass){
			ctrl_cl = col_sopts.ctrlClass;
			ctrl_cl_opts = col_sopts.ctrlOptions? col_sopts.ctrlOptions : undefined;
		}else{
			ctrl_cl = grid_columns[i].getCtrlClass();
			ctrl_cl_opts = grid_columns[i].getCtrlOptions();
		}
		
		if(
		!col_sopts.field
		&&(f.getDataType()==Field.prototype.DT_JSON||f.getDataType()==Field.prototype.DT_JSONB)
		&&fid.substr(fid.length-5)=="s_ref"
		){				
			var guessed_fid =  fid.substr(0,fid.length-5)+"_id";
			
			if(ctrl_cl&&grid_model.fieldExists(guessed_fid)){
				col_sopts.field = new FieldInt(guessed_fid);
				col_sopts.typeChange = false;
				col_sopts.searchType = "on_match";
			}
			else if(ctrl_cl){
				//search on key
				var ctrl_key_ids;
				try{
					ctrl_key_ids = (new ctrl_cl()).getKeyIds();
				} catch (err) {
					console.log("GridCmdSearch ctrl_cl=",ctrl_cl,"isnot a consructor");
				}
				if(ctrl_key_ids&&ctrl_key_ids.length){
					col_sopts.field = new FieldString(fid+"->keys->"+ctrl_key_ids[0]);
					col_sopts.typeChange = false;
					col_sopts.searchType = "on_match";					
				}
			}
			else{
				//search on descr 
				col_sopts.field = new FieldString(fid+"->descr");
			}
		}
		var sStruc = {
			"id":fid,
			"descr":grid_columns[i].getHeadCell().getValue(),
			"current":( (!cur_field_id&&columns.length==0) || cur_field_id==fid),
			"ctrlClass":ctrl_cl,
			"ctrlOptions": ctrl_cl_opts || {},
			"searchType": col_sopts.searchType || "on_part",
			"typeChange": col_sopts.typeChange,
			"field": col_sopts.field || f,
			"condSign":col_sopts.condSign
		};
		if(sStruc.searchType!="on_match"&&sStruc.searchType!="on_beg"&&sStruc.searchType!="on_part"){
			sStruc.searchType = "on_match";
		}
		if(sStruc.typeChange==undefined)sStruc.typeChange=true;			
		var data_t = sStruc.field.getDataType();//f.getDataType();
		if (data_t==f.DT_DATE){
			if(!sStruc.ctrlClass)sStruc.ctrlClass = EditDate;
			if(!sStruc.searchType)sStruc.searchType = "on_match";
			sStruc.typeChange = false;
		}
		else if (data_t==f.DT_DATETIME||data_t==f.DT_DATETIMETZ){
			if(!sStruc.ctrlClass)sStruc.ctrlClass = EditDateTime;
			if(!sStruc.searchType)sStruc.searchType = "on_match";
			sStruc.typeChange = false;
		}
		else if (data_t==f.DT_TIME){
			if(!sStruc.ctrlClass)sStruc.ctrlClass = EditTime;
			if(!sStruc.searchType)sStruc.searchType = "on_match";
			sStruc.typeChange = false;
		}			
		else if (data_t==f.DT_INT||data_t==f.DT_INT_UNSIGNED){
			if(!sStruc.ctrlClass)sStruc.ctrlClass = EditInt;
		}
		else if (data_t==f.DT_FLOAT_UNSIGNED||data_t==f.DT_FLOAT){
			if(!sStruc.ctrlClass)sStruc.ctrlClass = EditFloat;
		}
		else if (data_t==f.DT_BOOL){
			if(!sStruc.ctrlClass)sStruc.ctrlClass = EditCheckBox;
			sStruc.searchType = "on_match";
			sStruc.typeChange = false;
		}
		else if (data_t==f.DT_EMAIL){
			if(!sStruc.ctrlClass)sStruc.ctrlClass = EditEmail;
		}
		
		else if(!sStruc.ctrlClass){
			sStruc.ctrlClass = EditString;
		}
		if(sStruc.searchType==undefined)sStruc.searchType="on_part";
		columns.push(sStruc);	
	}
	
	/*
	var rows = this.m_grid.getHead().m_elements;
	for (var r_id in rows){
		for (var col_id in rows[r_id].m_elements){
			columns.push({
				"id":col_id,
				"descr":rows[r_id].m_elements[col_id].getValue(),
				"current":(cur_field_id==col_id)
			});
		}		
	}
	*/
	var self = this;
	WindowSearch.show({
		"text":str,
		"columns":columns,
		"callBack":function(res,params){
			self.m_grid.focus();
			if (res==WindowSearch.RES_OK){
				self.doSearch(params);
			}
		}
	});
}

GridCmdSearch.prototype.onCommand = function(){
	this.showDialog("");
}

GridCmdSearch.prototype.onUnset = function(){
	
	//if (this.m_filter){
	//	this.m_grid.unsetFilter(this.m_filter);

		var pag = this.m_grid.getPagination();
		if (pag)pag.reset();
		
		var inf_ctrl = this.m_grid.getSearchInfControl();
		if(inf_ctrl){
			inf_ctrl.clearSearch();
		}
		this.setFiltered(false);
		var self = this;
		this.m_grid.onRefresh(function(){
			//self.m_unsetCtrl.setEnabled(false);
			self.m_grid.focus();
		});
	//}
}

/**
 * @param{object} 
	search_str,
	where
	how,
	descr,
	search_descr
 */
GridCmdSearch.prototype.doSearch = function(params){
//console.log("GridCmdSearch.prototype.doSearch "+params.search_str+" how="+params.how+" where="+params.where);
	if (params.search_str){
//		console.log("GridCmdSearch.prototype.doSearch "+params.search_str+" how="+params.how+" where="+params.where);
		var pm = this.m_grid.getReadPublicMethod();
		var contr = pm.getController();

		var s_pref = (params.how=="on_part")? "%":"";
		var s_pref_descr = (params.how=="on_part")? "*":"";
		var s_posf = (params.how=="on_part"||params.how=="on_beg")? "%":"";
		var s_posf_descr = (params.how=="on_part"||params.how=="on_beg")? "*":"";
		
		var pm = this.m_grid.getReadPublicMethod();
		var contr = pm.getController();
		
		/*previous search cleaning
		if (this.m_filter){
			this.m_grid.unsetFilter(this.m_filter);
		}
		this.m_filter = 
		*/
		
		console.log("applying search params:", params)
		let sgn;
		if(params.how!="on_match"){
			sgn = contr.PARAM_SGN_LIKE;
		}else if (params.condSign){
			sgn = params.condSign;
		}else{
			sgn = contr.PARAM_SGN_EQUAL;
		}

		var filter = {
			"field": params.where,
			"sign": sgn,
			"val": s_pref+params.search_str+s_posf,
			"icase":(params.how!="on_match")? "1":"0"
		};
		this.m_grid.setFilter(filter);
		
		var pag = this.m_grid.getPagination();
		if (pag)pag.reset();
		
		var self = this;
		
		var inf_ctrl = this.m_grid.getSearchInfControl();
		if(inf_ctrl){
			inf_ctrl.addSearch(
				this.m_grid.getFilterKey(filter),
				params.descr,
				s_pref_descr+params.search_descr+s_posf_descr,
				params.where
			);
			inf_ctrl.setOnFilterClear(function(){
				self.setFiltered(false);
			});
		}
		
		window.setGlobalWait(true);
		this.m_grid.onRefresh(function(){
			self.setFiltered(true);
			window.setGlobalWait(false);
			//self.m_unsetCtrl.setEnabled(true);
		});
		
	}
}

/* protected*/


/* public methods */
GridCmdSearch.prototype.setGrid = function(v){
	GridCmdSearch.superclass.setGrid.call(this,v);
	
	var self = this;
	
	v.setOnSearch(function(e){
		var ch = (e && e.char)? e.char:null;
		if (ch){
			self.m_grid.setFocused(false);
			self.showDialog(ch);
			return true;		
		}
	});
	v.setOnSearchDialog(function(){
		self.onCommand();
	});
	v.setOnSearchReset(function(){
		self.onUnset();
	});
	
}

GridCmdSearch.prototype.setFiltered = function(v){
	if(v){
		DOMHelper.swapClasses(this.m_setCtrl.getNode(),"btn-danger","bg-blue-400");		
	}
	else{
		DOMHelper.swapClasses(this.m_setCtrl.getNode(),"bg-blue-400","btn-danger");
	}
}
