/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012,2014,2016,2017,2022
 
 * @class
 * @classdesc Shows search form
 
 */
var WindowSearch = {
	RES_OK:0,
	RES_CANCEL:2,
	
	/**
	 * @param {Object} options
	 * @param {function} options.callBack
  	 * @param {string} options.text
  	 * @param {Control} [options.buttonClass=ButtonCmd]
  	 * @param {Array} options.columns descr/current/ctrlClass/ctrlOptions/searchType/typeChange/field
	*/
	show:function(options){
		options = options || {};
		
		var self = this;
		
		this.m_callBack = options.callBack;
		
		this.m_modalId = "search-modal";
		
		var cur_opts;
		var select_opts = [];
		for (var i=0;i<options.columns.length;i++){
			/*if(options.columns[i].getSearchable()===false){
				continue;
			}*/
			var opt = new EditSelectOption(this.m_modalId+":where:"+i,{
				"value":options.columns[i].id,
				"checked":options.columns[i].current,
				"descr":options.columns[i].descr
			});
			opt.getSearchOptions = (function(opts){
				return function(){
					return opts;
				}
			})(options.columns[i]);
			
			select_opts.push(opt);
			if (options.columns[i].current){
				cur_opts = opt.getSearchOptions();
			}
		}
		//if(!current_class)current_class = EditString;
		this.setSearchCtrl(cur_opts,options.text);
		this.m_modal = new WindowFormModalBS(this.m_modalId,{
			"contentHead":this.HEAD_TITLE,
			"content":new ControlContainer(this.m_modalId+":cont","DIV",{
				"elements":[
					this.m_searchCtrl,
					new EditSelect(this.m_modalId+":where",{
						"labelCaption":this.PAR_WHERE_CAP,
						"elements":select_opts,
						"addNotSelected":false,
						"events":{
							"change":function(){			
								var opts = this.getOption().getSearchOptions();
								var how_ctrl = self.m_modal.m_body.getElement("cont").getElement("how");
								how_ctrl.setVisible(opts.typeChange);
								how_ctrl.setValue(opts.searchType);
								self.setSearchCtrl(opts);
								self.m_searchCtrl.toDOMBefore(self.m_modal.m_body.getElement("cont").getElement("where").m_container.getNode());
							}
						}
					}),
					new EditRadioGroup(this.m_modalId+":how",{
						"labelCaption":this.PAR_HOW_CAP,
						"visible":cur_opts.typeChange,
						"elements":[
							new EditRadio(this.m_modalId+":cont:on_beg",{
								"labelCaption":this.PAR_HOW_ON_BEG,
								"name":"how_opt",
								"value":"on_beg",
								"checked":(cur_opts.searchType=="on_beg")
								}),
							new EditRadio(this.m_modalId+":cont:on_part",{
								"labelCaption":this.PAR_HOW_ON_PART,
								"name":"how_opt",
								"value":"on_part",
								"checked":(cur_opts.searchType=="on_part")
								}),
							new EditRadio(this.m_modalId+":cont:on_match",{
								"labelCaption":this.PAR_HOW_ON_MATCH,
								"name":"how_opt",
								"value":"on_match",
								"checked":(cur_opts.searchType=="on_match")
								})
						]
					})
				]
			}),
			"controlOk": new ButtonCmd(this.m_modalId+":btn-ok",{
				"caption":this.BTN_FIND_CAP,
				"title":this.BTN_FIND_TITLE,
				"onClick":function(){
					self.m_modal.close(self.RES_OK);
				}
			}),
			"cmdCancel":true
		});
		
		this.m_modalOpenFunc = this.m_modal.open;
		this.m_modalCloseFunc = this.m_modal.close;
		
		this.m_modal.open = function(){
			self.addEvents();
			self.m_modalOpenFunc.call(self.m_modal);
			self.m_modal.m_footer.getElement("btn-ok").getNode().focus();
		}
		this.m_modal.close = function(res){			
			var res_struc;
			if (res==self.RES_OK){
				var cont = self.m_modal.m_body.getElement("cont");
				//var ctrl = cont.getElement("search_ctrl");
				var ctrl = self.m_searchCtrl;
			
				//*** search value ***
				var search_descr;
				if (ctrl.getIsRef && ctrl.getIsRef()
				&& !(ctrl.searchField.getDataType()==Field.prototype.DT_JSON || ctrl.searchField.getDataType()==Field.prototype.DT_JSONB)
				){			
					//reference field with keys					
					var keyIds = ctrl.getKeyIds();
					var ctrl_keys = ctrl.getKeys(); 
					if (keyIds.length>=1 &&ctrl_keys&&ctrl_keys[keyIds[0]]){
						ctrl.searchField.setValue(ctrl_keys[keyIds[0]]);
					}
					search_descr = ctrl.getValue().getDescr();
				}
				else{
					//simple field
					var val = ctrl.getValue();
					search_descr = val;
					if (ctrl.setValid)ctrl.setValid();
				
					try{
						if (ctrl.getValidator && ctrl.getValidator())ctrl.getValidator().validate(val);
					
						ctrl.searchField.setValue(val);
					}
					catch(e){
						if (ctrl.setNotValid)ctrl.setNotValid(e.message);
						//throw new Error("Обнаружены ошибки!");
						return;
					}							
				}
				res_struc = {
					"search_str":ctrl.searchField.getValueXHR(),
					"where":ctrl.searchField.getId(),//cont.getElement("where").getValue(),
					"how":cont.elementExists("how")? cont.getElement("how").getValue():"match",
					"descr":cont.getElement("where").getOption().getDescr(),
					"search_descr":search_descr,
					"condSign":ctrl.searchCondSign
				}				
			}			
			self.delEvents();
			self.m_callBack(res,res_struc);
			self.m_modalCloseFunc.call(self.m_modal);
		}
		
		var btn_class = options.buttonClass || ButtonCmd;
		
		this.m_keyEvent = function(e){			
			e = EventHelper.fixKeyEvent(e);
			//console.log("this.m_keyEvent "+e.keyCode)
			if (self.keyPressEvent(e.keyCode,e)){
				e.preventDefault();
				return false;
			}
		};
		
		/*
		this.m_modal.m_footer.addElement(new btn_class(this.m_modalId+":btn-ok",{
			"caption":this.BTN_OK_CAP,
			"focus":true,
			"attrs":{
				"title": this.OK_TITLE,
				"tabindex":0
			},
			"onClick":function(){
				//self.m_callBack(self.RES_OK);
				//self.m_modal.close();
				self.m_modal.close(self.RES_OK);
			}
			})
		);

		this.m_modal.m_footer.addElement(new btn_class(this.m_modalId+":btn-cancel",{
			"caption":this.BTN_CANCEL_CAP,
			"attrs":{
				"data-dismiss":"modal",
				"title":this.CANCEL_TITLE,
				"tabindex":2
			},
			"onClick":function(){
				self.m_modal.close(self.RES_CANCEL);
			}				
		})
		);
		*/
		this.m_modal.open();
				
		return this.RES_NO;
	},
	
	addEvents:function(){
		EventHelper.add(window,'keydown',this.m_keyEvent,false);
	},
	
	delEvents:function(){
		EventHelper.del(window,'keydown',this.m_keyEvent,false);
	},
		
	keyPressEvent:function(keyCode,event){	
		var res=false;
		switch (keyCode){
			case 13: // return
				this.m_modal.close(this.RES_OK);
				res = true;
				break;
			case 27: // ESC
				this.m_modal.close(this.RES_CANCEL);
				res = true;
				break;												
		}		
		return res;
	},
	setSearchCtrl:function(opts,ctrlValue){
		//debugger
		if(!opts){
			return;
		}
		if (this.m_searchCtrl){			
			this.m_searchCtrl.delDOM();
			delete this.m_searchCtrl;			
		}
		var ctrl_opts = {
			"labelCaption":this.STR_CAP,
			"placeholder":this.STR_PLACEHOLDER,
			"title":this.STR_TITLE,
			"maxlength":"500",
			"value":ctrlValue,
			"focus":true
		};
		if(opts.ctrlOptions){
			//CommonHelper.merge(ctrl_opts, opts.ctrlOptions);
			//corrected on 30/11/24, merge ruins option values
			//if they are present in opts.ctrlOptions but with no values!!!
			for(let ctrlOptId in opts.ctrlOptions){
				if(!ctrl_opts[ctrlOptId]){
					//does not exist
					ctrl_opts[ctrlOptId] = opts.ctrlOptions[ctrlOptId];					
				}
			}
		}
		this.m_searchCtrl = new opts.ctrlClass(this.m_modalId+":cont:search_ctrl",ctrl_opts);
		this.m_searchCtrl.searchField = opts.field;
		this.m_searchCtrl.searchCondSign = opts.condSign;
	}
}

