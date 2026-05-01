/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
  * @requires common/functions.js
  * @requires common/EventHandler.js
  * @requires controls/ButtonSelect.js
*/

/* constructor */
function ButtonSelectObject(id,options){
	var self = this;
	options = options || {};
	options.attrs = options.attrs||{};
	options.attrs.title = options.attrs.title||"выбрать из списка";	
	
	this.m_methParams = options.methParams;
	this.m_controller = options.controller;
	
	this.m_multySelect = (options.multySelect==undefined)? false:options.multySelect;
	options.onClick = options.onClick ||	
		function(event){
			//event = EventHandler.fixMouseEvent(event);
			//var node = event.target.parentNode.parentNode.previousSibling;
			var node = nd(options.controlId);
			//
			self.m_form = new WIN_CLASS(self.getId()+"_form",{"title":"Выбор"});
			self.m_form.open();			
			if (options.onBeforeViewCreate){
				options.onBeforeViewCreate.call(self);
			}
			
			var editViewObj = 
			new options.listView(
				self.getId()+"EditView",
				{"onClose":function(res){
						self.m_form.close();
						node.focus();
					},
				"onSelect":function(keys,descrs,extraFields){					
					if (!self.m_multySelect&&self.m_form){
						self.m_form.close();
						delete self.m_form;
					}
					if (options.lookupKeyFieldIds&&options.keyFieldIds){
						var ind;
						for (var key_id in keys){						
							ind = options.lookupKeyFieldIds.indexOf(key_id);
							if (ind>=0){
								DOMHandler.setAttr(node,
									"fkey_"+options.keyFieldIds[ind],
									keys[key_id]
								);
								DOMHandler.setAttr(node,
									"last_fkey_"+options.keyFieldIds[ind],
									keys[key_id]
								);
							}
						}
						var val="";;
						for (var key_id in descrs){
							val+=(val=="")? "":" ";
							val+=descrs[key_id];
						}
						node.value = val;
						//optional fields
						if (extraFields){
							for (var f in extraFields){
								DOMHandler.addAttr(node,f,extraFields[f]);
							}
						}
						
						node.focus();
					}
					if (options.onSelected){
						if (options.onSelectContext){
							options.onSelected.call(options.onSelectContext,keys,descrs,extraFields);
						}
						else{
							options.onSelected(keys,descrs,extraFields);
						}
					}					
				},
				//"onSelectContext":self,
				"readController":options.controller,
				"readModelId":options.modelId,
				"readMethodId":options.methodId,
				"connect":new ServConnector(HOST_NAME),
				//options.controller.getServConnector(),
				"winObj":self.m_form,
				"methParams":self.m_methParams,
				"extraFields":options.extraFields
				}			
			);
			if (options.onBeforeSelect){
				options.onBeforeSelect.call(self,editViewObj);
			}
			self.m_form.setCaption(editViewObj.getTitle());
			//console.log("w="+editViewObj.getFormWidth());
			//self.m_form.setWidth(editViewObj.getFormWidth());
			//self.m_form.setHeight(editViewObj.getFormHeight());			
			self.m_form.setSize(editViewObj.getFormWidth(),editViewObj.getFormHeight());
			editViewObj.toDOM(self.m_form.getContentParent());			
			self.m_form.setFocus();
	};
	
	ButtonSelectObject.superclass.constructor.call(
		this,id,options);
}
extend(ButtonSelectObject,ButtonSelect);

ButtonSelectObject.prototype.m_form;

