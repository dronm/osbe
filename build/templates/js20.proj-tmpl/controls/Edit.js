/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2014
 
 * @class
 * @classdesc Basic visual editable control
 
 * @extends Control
 
 * @requires controls/Control.js
 * @requires controls/ControlContainer.js
 * @requires controls/ButtonOpen.js  
 * @requires controls/ButtonSelect.js    
 * @requires controls/ButtonClear.js  
 * @requires controls/Label.js    
 
 * @param string id 
 * @param {Object} options
 * @param {Validator} options.validator
 * @param {string} [options.className=this.DEF_CLASS]
 * @param {string} options.addclassName
 * @param {string} [options.type=this.DEF_INPUT_TYPE]
 * @param {string} options.editMask
 * @param {string} options.regExpression
 * @param {string} options.regExpressionInvalidMessage 
 * @param {string} options.labelCaption
 * @param {string} options.labelOptions 
 * @param {Label} options.label
 * @param {string} options.labelClassName
 * @param {Button} options.buttonOpen
 * @param {Button} options.buttonSelect
 * @param {Button} options.buttonClear
 * @param {string} options.contClassName
 * @param {string} options.editContClassName
 * @param {string} options.value
 * @param {bool} [options.inputEnabled=true] - direct input only,not buttons
 * @param {Function} options.formatFunction  
 
 * @param {bool} [options.cmdAutoComplete=false] 
 * @param {int} options.acMinLengthForQuery
 * @param {bool} options.acIc
 * @param {bool} options.acMid
 * @param {bool} options.acCount 
 * @param {function} options.acOnBeforeSendQuery
 * @param {function} options.acOnSendQueryResult
 * @param {PublicMethod} options.acPublicMethod
 * @param {ControllerObjServer} options.acController  
 * @param {Model} options.acModel
 
 * @param {bool} [options.inline=false]
 
 * @param {function} options.onSelect
 * @param {function} options.onReset fired when reset() is called  
 */
function Edit(id,options){
	options = options || {};
	options.attrs = options.attrs||{};
	
	if (id && (options.html==undefined && options.template==undefined) ){
		/* if node exists it will be a container!!!*/
		var n = CommonHelper.nd(id,this.getWinObjDocument());
		if (n){
			n.id = n.id + ":cont";
		}		
	}
	else if (!id){
		id = CommonHelper.uniqid();
	}	
	
	/*
	if (options.attrs["class"]!==undefined){
		options.className = options.attrs["class"];
		options.attrs["class"] = undefined;
	}
	*/
	
	if (options.inline===true){
		options.contClassName = "";
		options.editContClassName = "";
		options.className = "";
		options.btnContClassName = "";
		options.contTagName = "SPAN";
		options.editContTagName = "SPAN";	
	}
	
	options.className = (options.className!==undefined)? options.className:this.DEF_CLASS;	
	if(options.addClassName!=undefined){
		options.className+= " "+options.addClassName;
	}
	options.attrs.type = options.attrs.type || options.type || this.DEF_INPUT_TYPE;		
	options.attrs.maxlength = options.attrs.maxlength || options.maxlength || ( (options.editMask)? options.editMask.length:undefined );
	
	this.setValidator(options.validator);
	
	if (options.cmdAutoComplete!=undefined && !options.cmdAutoComplete){
		options.inputEnabled = false;
	}
		
	this.m_formatterOptions = options.formatterOptions;
	this.m_formatterGetRawValue = options.formatterGetRawValue;
		
	Edit.superclass.constructor.call(this, id, options.tagName || this.DEF_TAG_NAME, options);
			
	if (options.editMask){
		this.setEditMask(options.editMask);
	}
	
	this.setRegExpression(options.regExpression);
	this.setRegExpressionInvalidMessage(options.regExpressionInvalidMessage);
	
	if (options.label){
		this.setLabel(options.label);
	}	
	else if (options.labelCaption||options.labelOptions){
		options.labelOptions = options.labelOptions || {"attrs":{"for":id}};
		options.labelOptions.value = options.labelOptions.value || options.labelCaption;
		options.labelOptions.className = options.labelOptions.className || options.labelClassName;
		options.labelOptions.visible = this.getVisible();
		this.setLabel(new Label(id+":label",options.labelOptions));		
	}
	
	this.setErrorControl((options.errorControl!==undefined)? options.errorControl: ((this.m_html)? null:new ErrorControl(id+":error")) );
	this.m_infoControls = options.infoControls || new ControlContainer(this.getId()+":info", "span", {
		"elements": options.infoControlElements || [this.m_errorControl]
	});
	
	this.setButtonOpen(options.buttonOpen);
	this.setButtonSelect(options.buttonSelect);
	this.setButtonClear(options.buttonClear);	
	
	this.setBtnContClassName((options.btnContClassName!=undefined)? options.btnContClassName:this.BTNS_CONTAINER_CLASS);		
	/*
	 * if there is any option starting with button~
	 */
	var btn_opt = "button";
	for (opt in options){
		if (opt.substring(0,btn_opt.length)==btn_opt && opt.length>btn_opt.length){
			this.addButtonContainer();
			break;
		}
	}
		
	this.setFormatFunction(options.formatFunction);
	
	this.setLabelAlign(options.labelAlign || this.DEF_LABEl_ALIGN);

	this.setContClassName( (options.contClassName!==undefined)? options.contClassName:this.DEF_CONT_CLASS );
	this.setContTagName(options.contTagName || this.DEF_CONT_TAG);	
	this.setEditContClassName( (options.editContClassName!==undefined)? options.editContClassName : (this.DEF_EDIT_CONT_CLASS +" "+ window.getBsCol(8)) );
	this.setEditContTagName(options.editContTagName || this.DEF_EDIT_CONT_TAG);
	
	if (options.inputEnabled!=undefined && !options.inputEnabled && this.getEnabled()){
		this.setInputEnabled(false);
	}
	
	if (options.cmdAutoComplete||options.autoComplete){
		if (!options.acPublicMethod && options.acController){
			options.acPublicMethod = options.acController.getPublicMethod("complete");
		}
		var self = this;
		options.autoComplete = options.autoComplete || (new actbAJX({
					"minLengthForQuery":options.acMinLengthForQuery,
					"onSelect":function(fields){
						self.onSelectValue(fields);
					},
					"model":options.acModel,
					"publicMethod":options.acPublicMethod,
					"patternFieldId":options.acPatternFieldId,
					"control":this,
					"keyFields":options.acKeyFields,
					"descrFields":options.acDescrFields,
					"descrFunction":options.acDescrFunction,
					"icase":options.acICase,
					"mid":options.acMid,
					"count":options.acCount,
					"enabled":options.acEnabled,
					"resultFieldIdsToAttr":options.acResultFieldIdsToAttr,
					"onCompleteTextOut":options.acOnCompleteTextOut,
					"onBeforeSendQuery": options.acOnBeforeSendQuery,
					"onSendQueryResult": options.acOnSendQueryResult
					})
				);
		actb(this.m_node,options.winObj,options.autoComplete);
	}
	this.setAutoComplete(options.autoComplete);
		
	this.setOnReset(options.onReset);
	this.setOnSelect(options.onSelect);
}
extend(Edit,Control);

/* constants */

Edit.prototype.DEF_TAG_NAME = "INPUT";
Edit.prototype.DEF_INPUT_TYPE = "text";
Edit.prototype.DEF_CLASS = "form-control";
Edit.prototype.BTNS_CONTAINER_CLASS="input-group-btn";//input-group-btn
Edit.prototype.INCORRECT_VAL_CLASS="error";
Edit.prototype.DEF_CONT_CLASS = "form-group";
Edit.prototype.DEF_EDIT_CONT_CLASS = "input-group";
Edit.prototype.DEF_CONT_TAG = "DIV";//
Edit.prototype.DEF_EDIT_CONT_TAG = "DIV";
Edit.prototype.VAL_INIT_ATTR = "initValue";
Edit.prototype.DEF_LABEl_ALIGN = "left";

/* private methods */
Edit.prototype.m_editMask;
Edit.prototype.m_regExpression;
Edit.prototype.m_buttons;
Edit.prototype.m_value;
Edit.prototype.m_label;
Edit.prototype.m_container;
Edit.prototype.m_editContainer;
Edit.prototype.m_errorControl;
Edit.prototype.m_contTagName;
Edit.prototype.m_contClassName;
Edit.prototype.m_buttonOpen;
Edit.prototype.m_buttonSelect;
Edit.prototype.m_buttonClear;
Edit.prototype.m_formatFunction;
Edit.prototype.m_editContTagName;
Edit.prototype.m_enabled;
Edit.prototype.m_labelAlign;
Edit.prototype.m_btnContClassName;

Edit.prototype.m_autoComplete;

Edit.prototype.addButtonContainer = function(){
	this.m_buttons = new ControlContainer(this.getId()+":btn-cont","SPAN",
		{"className":this.m_btnContClassName,
			"enabled":this.getEnabled()
		}
	);	
	this.addButtonControls();
}

/*derived classes can change contol order*/
Edit.prototype.addButtonControls = function(){
	if (this.m_buttonOpen) this.m_buttons.addElement(this.m_buttonOpen);
	if (this.m_buttonSelect) this.m_buttons.addElement(this.m_buttonSelect);
	if (this.m_buttonClear) this.m_buttons.addElement(this.m_buttonClear);
}


/* public methods */
Edit.prototype.setRegExpression = function(v){
	this.m_regExpression = v
}
Edit.prototype.getRegExpression = function(mask){
	return this.m_regExpression;
}
Edit.prototype.setRegExpressionInvalidMessage = function(v){
	this.m_regExpressionInvalidMessage = v
}
Edit.prototype.getRegExpressionInvalidMessage = function(mask){
	return this.m_regExpressionInvalidMessage;
}

Edit.prototype.setEditMask = function(mask){
	this.m_editMask = mask
}
Edit.prototype.getEditMask = function(mask){
	return this.m_editMask;
}

Edit.prototype.applyMask = function(){
	if(window["Cleave"] && this.m_formatterOptions){
		this.m_cleave = new Cleave(this.m_node, this.m_formatterOptions);
	}
	else if (this.getEditMask()){
		//maske input
		$(this.getNode()).mask(this.getEditMask());
	}
}
Edit.prototype.getFormattedValue = function(){
	var res;
	if (this.getEditMask()){
		res = this.m_node.value;//as is
	}
	else{
		//possible overridden formatting
		res = this.formatOutputValue(this.getValue());
	}
	
	return res;
}

Edit.prototype.formatOutputValue = function(val){
	return val;
}
Edit.prototype.setValue = function(val){
	if (this.m_validator){
		val = this.m_validator.correctValue(val);
	}
	
	if(this.m_cleave){
		this.m_cleave.setRawValue((this.m_formatterOptions.prefix? this.m_formatterOptions.prefix:"")+val);
	}else{
		
		var v = this.formatOutputValue(val);
		this.getNode().value = v;	
		this.applyMask();
	}
		
	if (this.m_eventFuncs && this.m_eventFuncs.change){
		this.m_eventFuncs.change();
	}
	
}

Edit.prototype.getValue = function(){
	if (this.m_node){	
		if(this.m_cleave){
			var v = this.m_formatterGetRawValue?
				(!this.m_formatterOptions.prefix? this.m_cleave.getRawValue() : this.m_cleave.getRawValue().substring(this.m_formatterOptions.prefix.length))
				: this.m_node.value;
			
			if (!v || v.length==0){
				return null;
			}		
			else if (this.m_validator){
				return this.m_validator.correctValue(v);
			}
			else{
				return v;
			}
			
		}else{
			var v = this.getEditMask()? $(this.m_node).mask():this.m_node.value;
			
			if (!v || v.length==0){
				return null;
			}		
			else if (this.m_validator){
				return this.m_validator.correctValue(v);
			}
			else{
				return v;
			}
		}
	}
}

/*MUST Protected function*/
Edit.prototype.setInitValue = function(val){
	this.setValue(val);
	this.setAttr(this.VAL_INIT_ATTR,this.getValue());
}

Edit.prototype.getInitValue = function(){
	return this.getAttr(this.VAL_INIT_ATTR);
}

Edit.prototype.setLabel = function(label){
	if (typeof label=="string"){
		throw Error(this.ER_LABEL_OBJECT);
	}
	this.m_label = label;
}
Edit.prototype.getLabel = function(){
	return this.m_label;
}

Edit.prototype.setValidator = function(v){
	this.m_validator = v;
}
Edit.prototype.getValidator = function(){
	return this.m_validator;
}

Edit.prototype.validate = function(){
	var res = true;
	if(this.m_validator){
		try{
			this.setValid();
			var v = this.getValue();
			this.m_validator.validate(v);
			
			if(this.m_regExpression && this.m_node.value && this.m_node.value.length){
				var reg;
				//debugger
				if(typeof(this.m_regExpression) == "string"){
					reg = new RegExp(this.m_regExpression);
				}else{
					reg = this.m_regExpression;
				}
				if (reg.test && !reg.test(this.m_node.value)){
					throw new Error(this.getRegExpressionInvalidMessage()||this.ER_REGEXP_INVALID);
				}
			}
		}
		catch(e){
			this.setNotValid(e.message);
			res = false;
		}
	}
	return res;
}

Edit.prototype.setButtonOpen = function(v){
	this.m_buttonOpen = v;
	if (this.m_buttonOpen && this.m_buttonOpen.setEditControl){
		this.m_buttonOpen.setEditControl(this);
	}
}
Edit.prototype.getButtonOpen = function(){
	return this.m_buttonOpen;
}

Edit.prototype.setButtonClear = function(v){
	this.m_buttonClear = v;
	if (this.m_buttonClear && this.m_buttonClear.setEditControl){
		this.m_buttonClear.setEditControl(this);
	}	
}
Edit.prototype.getButtonClear = function(){
	return this.m_buttonClear;
}

Edit.prototype.setButtonSelect = function(v){
	this.m_buttonSelect = v;
	if (this.m_buttonSelect && this.m_buttonSelect.setEditControl){
		this.m_buttonSelect.setEditControl(this);
	}		
}
Edit.prototype.getButtonSelect = function(){
	return this.m_buttonSelect;
}

Edit.prototype.getButtons = function(){
	return this.m_buttons;
}

Edit.prototype.setNotValid = function(erStr){
	DOMHelper.addClass(this.m_node,this.INCORRECT_VAL_CLASS);
	if (this.getErrorControl()){
		this.getErrorControl().setValue(erStr);
	}
	else{
		throw new Error(erStr);
	}
}
Edit.prototype.setValid = function(){
	DOMHelper.delClass(this.m_node,this.INCORRECT_VAL_CLASS);
	if (this.getErrorControl())this.getErrorControl().clear();
}

Edit.prototype.toDOM = function(parent){
	var node_parent;
	if (!this.m_html){	
		var id = this.getId();	

		this.m_container = new ControlContainer( (id? id+":cont" : null),this.m_contTagName,{
			"className":this.m_contClassName,
			"visible":this.getVisible()
		});	
	
		if (this.m_label && this.m_labelAlign=="left"){
			this.m_container.addElement(this.m_label);
		}

		this.m_editContainer = new Control( ( id? id+":edit-cont" : null),this.m_editContTagName,{
				"className":this.m_editContClassName
		});	
		this.m_container.addElement(this.m_editContainer);
		this.m_container.toDOM(parent);
		
		node_parent = this.m_editContainer.getNode();
	}
		
	Edit.superclass.toDOM.call(this,node_parent);
	
	//error
	/*
	if (this.m_errorControl){
		//this.m_errorControl.toDOM(node_parent);
	}
	*/
	this.applyMask();
	
	//buttons after control
	if (this.m_buttons && !this.m_buttons.isEmpty()){
		this.m_buttons.toDOMAfter(this.getNode());
	}
	
	//buttons before control
	if (this.m_buttonsBefore && !this.m_buttonsBefore.isEmpty()){
		this.m_buttonsBefore.toDOMBefore(this.getNode());
	}

	if (this.m_label && this.m_labelAlign=="right"){
		this.m_label.toDOMAfter(this.getNode());
	}
	//error
	//if (this.m_errorControl){
	//	this.m_errorControl.toDOM(this.m_container.getNode());
	//}
	this.m_infoControls.toDOM(this.m_container.getNode());
}

Edit.prototype.toDOMBefore = function(node){
	var node_parent;
	if (!this.m_html){	
		var id = this.getId();	
//console.log("Edit.prototype.toDOM ID="+id+" m_labelAlign="+this.m_labelAlign)	
		this.m_container = new ControlContainer( ((id)? id+":cont" : null),this.m_contTagName,{
			"className":this.m_contClassName,
			"visible":this.getVisible()
		});	
	
		if (this.m_label && this.m_labelAlign=="left"){
			this.m_container.addElement(this.m_label);
		}

		this.m_editContainer = new Control( ( (id)? id+":edit-cont" : null),this.m_editContTagName,{
				"className":this.m_editContClassName
		});	
		this.m_container.addElement(this.m_editContainer);
		this.m_container.toDOMBefore(node);
		
		node_parent = this.m_editContainer.getNode();
	}
		
	Edit.superclass.toDOM.call(this,node_parent);
	
	//error
	if (this.m_errorControl){
		this.m_errorControl.toDOM(node_parent);
	}
	
	this.applyMask();
	
	if (this.m_buttons && !this.m_buttons.isEmpty()){
		this.m_buttons.toDOMAfter(this.getNode());
	}
	
	if (this.m_label && this.m_labelAlign=="right"){
		this.m_label.toDOMAfter(this.getNode());
	}
}

Edit.prototype.delDOM = function(){

	if (this.m_autoComplete){
		this.m_autoComplete.delDOM();
	}

	Edit.superclass.delDOM.call(this);
	
	if (this.m_buttons){
		this.m_buttons.delDOM();
	}
	if (this.m_errorControl){
		this.m_errorControl.delDOM();
	}
	
	if (this.m_editContainer){
		this.m_editContainer.delDOM();
	}
	
	if (this.m_container){
		this.m_container.delDOM();
	}
}

Edit.prototype.setVisible = function(v){
	Edit.superclass.setVisible.call(this,v);
//console.log("Edit.prototype.setVisible ID="+this.getId()+" visib="+v)	
	if (this.m_container){
		
		this.m_container.setVisible(v);
	}
	
	if (this.m_label){
		this.m_label.setVisible(v);
	}
	
	if (this.m_buttons){
		this.m_buttons.setVisible(v);
	}
}

Edit.prototype.setEnabled = function(enabled){
	if (this.m_buttons){
		this.m_buttons.setEnabled(enabled);
		if (this.getButtonOpen() && !enabled){
			this.getButtonOpen().setEnabled(true);
		}
	}
	this.setInputEnabled(enabled);
	
	this.m_enabled = enabled;
}
Edit.prototype.getEnabled = function(){
	return this.m_enabled;
}

Edit.prototype.reset = function(){
	this.setValue("");
	this.focus();
	this.valueChanged();
	if(this.m_onReset)this.m_onReset();
}
Edit.prototype.isNull = function(){
	var v = this.getValue();
	return (!v || v.length==0);
}
Edit.prototype.getModified = function(){
	return (this.getValue()!=this.getInitValue());
}

Edit.prototype.getIsRef = function(){
	return false;
}
Edit.prototype.getFormatFunction = function(){
	return this.m_formatFunction;
}
Edit.prototype.setFormatFunction = function(v){
	this.m_formatFunction = v;
}
Edit.prototype.getContTagName = function(){
	return this.m_contTagName;
}
Edit.prototype.setContTagName = function(v){
	this.m_contTagName = v;
}
Edit.prototype.getContClassName = function(){
	return this.m_contClassName;
}
Edit.prototype.setContClassName = function(v){
	this.m_contClassName = v;
}
Edit.prototype.getEditContClassName = function(){
	return this.m_editContClassName;
}
Edit.prototype.setEditContClassName = function(v){
	this.m_editContClassName = v;
}
Edit.prototype.setBtnContClassName = function(v){
	this.m_btnContClassName = v;
}

Edit.prototype.getEditContTagName = function(){
	return this.m_editContTagName;
}
Edit.prototype.setEditContTagName = function(v){
	this.m_editContTagName = v;
}

Edit.prototype.setInputEnabled = function(enabled){
	Edit.superclass.setEnabled.call(this,enabled);
}
Edit.prototype.getInputEnabled = function(){
	return Edit.superclass.getEnabled.call(this);
}

Edit.prototype.setErrorControl = function(v){
	this.m_errorControl = v;
}
Edit.prototype.getErrorControl = function(){
	return this.m_errorControl;
}

Edit.prototype.setLabelAlign = function(v){
	this.m_labelAlign = v;
}
Edit.prototype.getLabelAlign = function(){
	return this.m_labelAlign;
}

Edit.prototype.setAutoComplete = function(v){
	this.m_autoComplete = v;
}
Edit.prototype.getAutoComplete = function(){
	return this.m_autoComplete;
}

Edit.prototype.setOnReset = function(v){
	this.m_onReset = v;
}
Edit.prototype.getOnReset = function(){
	return this.m_onReset;
}

/*
overriden
*/
Edit.prototype.setOnValueChange = function(v){
	Edit.superclass.setOnValueChange.call(this,v);
	
	var self = this;
	this.m_onInputChange = function(){
		self.valueChanged();
	}
	if (v){
		//add onPress event to input
		EventHelper.add(this.getNode(),"keyup",this.m_onInputChange);
	}
	else{
		//remove event if any
		EventHelper.del(this.getNode(),"keyup",this.m_onInputChange);
	}		
}
Edit.prototype.focus = function(){
	if(this.getNode().focus)this.getNode().focus();
}

Edit.prototype.setMaxLength = function(v){
	this.setAttr("maxlength",v);
	if(this.m_validator)this.m_validator.setMaxLength(v);
}

Edit.prototype.setOnSelect = function(v){
	this.m_onSelect = v;
}
Edit.prototype.getOnSelect = function(v){
	return this.m_onSelect;
}

Edit.prototype.onSelectValue = function(v){
	this.valueChanged();
	if(this.m_onSelect)this.m_onSelect(v);
}

Edit.prototype.getInfoControls = function(v){
	return this.m_infoControls;
}


