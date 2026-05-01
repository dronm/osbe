/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc inpage Modal Form
 
 * @extends ControlContainer
 
 * @requires core/extend.js
 * @requires controls/ControlContainer.js     
  
 * @param {string} id - html tag id
 * @param {object} options
 * @param {string} [options.ControlContainer=modal]
 * @param {string} [options.headerClassName=modal-header]
 * @param {Control|string} options.contentHead 
 * @param {Control} options.content
 * @param {Control} options.contentFoot
 * @param {bool} [options.cmdOk=false]
 * @param {Control} options.controlOk
 * @param {string} options.controlOkCaption
 * @param {string} options.controlOkTitle  
 * @param {function} options.onClickOk   
 * @param {bool} [options.cmdCancel=false]
 * @param {Control} options.controlCancel
 * @param {string} options.controlCancelCaption
 * @param {string} options.controlCancelTitle   
 * @param {function} options.onClickCancel
 * @param {bool} options.cmdClose
 * @param {object} options.dialogOptions
 * @param {string} options.dialogWidth  100%,100px
 * @param {bool} [options.closeOnMouseClick=false]
 */
function WindowFormModalBS(id,options){
	if(typeof(id)=="object"){
		options = CommonHelper.clone(id);
		id = options.id? options.id : CommonHelper.uniqid();
	}
	if(typeof(options)=="function"){
		options = options();		
	}	
	options = options || {};	
	
	var self = this;
	
	//options.template = WindowFormModalBS_tmpl;
	options.className = options.className || "modal";//fade
	options.attrs = options.attrs||{};
	options.attrs.role = "dialog";
	
	WindowFormModalBS.superclass.constructor.call(this,id,"DIV",options);	
	
	var dialog_options = options.dialogOptions || {};
	CommonHelper.merge(dialog_options,{"className":"modal-dialog"});
	dialog_options.attrs = dialog_options.attrs || {};
	if(options.dialogWidth && !dialog_options.attrs.style){
		dialog_options.attrs.style = "";
		dialog_options.attrs.style = "width:"+options.dialogWidth+";";
	}
	this.m_dialog = new ControlContainer(id+":dlg","DIV",dialog_options); //used to be _dial
	
	this.m_content = new ControlContainer(id+":cont","DIV",{"className":"modal-content"});
	
	this.m_header = new ControlContainer(id+":head","DIV",{className: (options.headerClassName || "modal-header") });
	//"data-dismiss":"modal"
	/*
	this.m_header.addElement(new Control(id+"_close","button",{
		className:"close",
		"attrs":{"aria-label":"Close"},
		"events":{
			"click":function(){
				self.close();
			}
		}
	}));
	*/
	
	if (options.cmdCancel || options.controlCancel || options.onClickCancel || options.cmdClose){
		this.m_header.addElement(new Control(null,"button",{
			"attrs":{
				"type":"button",
				"class":"close",
				//"data-dismiss":"modal",
				"aria-hidden":"true"
			},
			"value":"×",
			"events":{
				"click":options.onClickCancel || function(){
					self.close();
				}
			}
		}));
	}
	
	if (options.contentHead){
		if (typeof(options.contentHead)=="object"){
			this.m_header.addElement(options.contentHead);
		}
		else{
			this.m_header.addElement(new Control(id+":head:label","h4",{
				"className":"modal-title",
				"value":options.contentHead
			}));
		}
	}
	
	this.m_body = new ControlContainer(id+":body","DIV",{className:"modal-body"});
	if (options.content){
		this.m_userContent = options.content;
		this.m_body.addElement(options.content);
	}
	
	this.m_footer = new ControlContainer(id+":footer","DIV",{className:"modal-footer"});
	if (options.contentFoot){
		this.m_footer.addElement(options.contentFoot);
	}
	
	if (options.cmdOk || options.controlOk || options.onClickOk){
		this.m_footer.addElement(options.controlOk ||
			new ButtonCmd(id+":btn-ok",{
					"caption":options.controlOkCaption || this.BTN_OK_CAP,
					"title":options.controlOkTitle || this.BTN_OK_TITLE,
					"onClick":function(){
						if(options.onClickOk){
							options.onClickOk.call(self);
						}else{
							self.close();
						}
					}
			})
		);
	}

	if (options.cmdCancel || options.controlCancel || options.onClickCancel){
		this.m_footer.addElement(options.controlCancel ||
			new ButtonCmd(id+":btn-cancel",{
					"caption":options.controlCancelCaption || this.BTN_CANCEL_CAP,
					"title":options.controlCancelTitle || this.BTN_CANCEL_TITLE,
					"onClick":function(){
						if(options.onClickCancel){
							options.onClickCancel.call(self);
						}else{
							self.close();
						}
					}
					/*options.onClickCancel || function(){
						self.close();
					}*/
			})
		);
	}
	
	this.m_content.addElement(this.m_header);
	this.m_content.addElement(this.m_body);
	this.m_content.addElement(this.m_footer);
	
	this.m_dialog.addElement(this.m_content);
	
	this.m_closeOnMouseClick = (options.closeOnMouseClick!=undefined)? options.closeOnMouseClick:false;
}
extend(WindowFormModalBS,ControlContainer);

WindowFormModalBS.prototype.m_header;
WindowFormModalBS.prototype.m_body;
WindowFormModalBS.prototype.m_foot;

WindowFormModalBS.prototype.toDOM = function(parent){	
	WindowFormModalBS.superclass.toDOM.call(this,parent);	

	var self = this;
	let n = this.getNode();
	this.m_dialog.toDOM(n);
	$(this.getNode()).on('shown.bs.modal', function () {
		$('[autofocus]', this).focus();
	});
	$(this.getNode()).on('hidden.bs.modal', function () {
		if(self.m_dialog)self.m_dialog.delDOM();
	});
	
	var m_opts = {
		show:true
		,keyboard:true
	}
	if(!this.m_closeOnMouseClick){
		m_opts.backdrop = "static";
	}
	
	$(this.getNode()).modal(m_opts);
}

WindowFormModalBS.prototype.delDOM = function(){	
	$(this.getNode()).modal("hide");
	//this.m_content.delDOM();
	if(this.m_dialog)this.m_dialog.delDOM();
	WindowFormModalBS.superclass.delDOM.call(this);			
}

WindowFormModalBS.prototype.open = function(){	
	this.toDOM(document.body);
}
WindowFormModalBS.prototype.close = function(){	
	this.delDOM();
}
WindowFormModalBS.prototype.getContentParent = function(){
	return this.m_body.getNode();
}

WindowFormModalBS.prototype.getContent = function(){
	return this.m_userContent;
}

WindowFormModalBS.prototype.setCaption = function(caption){}
WindowFormModalBS.prototype.setFocus = function(){}
