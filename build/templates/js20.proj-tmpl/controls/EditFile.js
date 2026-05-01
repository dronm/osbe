/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ControlContainer
 * @requires core/extend.js
 * @requires ControlContainer.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {Object} options
 * @param {string} options.className
 * @param {function} options.onDownload
 * @param {function} options.onDeleteFile
 * @param {bool} [options.multipleFiles=false]
 * @param {bool} options.allowOnlySignedFiles 
 * @param {bool} options.separateSignature
 * @param {DOMDocument} [options.template=EditFile] Container template
 * @param {DOMDocument} [options.fileInfTemplate=EditFileInf] file template
 * @param {object} options.fileInfTemplateOptions
 * @param {String} options.labelCaption
 * @param {String} options.labelClassName
 * @param {Control} options.label       
 * @param {bool} options.multiSignature
 * @param {function} options.onSignFile
 * @param {function} options.onSignClick
 * @param {array} options.allowedFileExtList
 * @param {array} options.allowedFileTypeList
 * @param {bool} [options.showHref=true]
 * @param {bool} [options.showPic=true]
 * @param {int} [options.maxWidth]
 * @param {int} [options.maxHeight] 
 */
function EditFile(id,options){
	options = options || {};	
	
	options.template = options.template || window.getApp().getTemplate("EditFile");
	
	this.m_showHref = (options.showHref!=undefined)? options.showHref:true;
	this.m_showPic = (options.showPic!=undefined)? options.showPic:false;
	
	this.m_fileInfTemplate = options.fileInfTemplate || window.getApp().getTemplate("EditFileInf");
	this.m_fileInfTemplateOptions = options.fileInfTemplateOptions || {};
	this.m_fileInfTemplateOptions.IMG_CLASS = this.m_fileInfTemplateOptions.IMG_CLASS || "attachmentPic";
	this.m_fileInfTemplateOptions.show_pic = this.m_showPic;
	
	this.m_onDownload = options.onDownload;
	this.m_onDeleteFile = options.onDeleteFile;
	this.m_multipleFiles = (options.multipleFiles!=undefined)? options.multipleFiles:false;
	this.m_allowOnlySignedFiles = options.allowOnlySignedFiles;
	this.m_separateSignature = options.separateSignature;
	this.m_onFileAdded = options.onFileAdded;
	this.m_onFileSigAdded = options.onFileSigAdded;
	this.m_onFileDeleted = options.onFileDeleted;
	
	this.m_multiSignature = options.multiSignature;
	this.m_onSignFile = options.onSignFile;
	this.m_onSignClick = options.onSignClick;
	
	this.m_allowedFileExtList = (options.allowedFileExtList!=undefined&&CommonHelper.isArray(options.allowedFileExtList))? options.allowedFileExtList:null;
	this.m_allowedFileTypeList = (options.allowedFileTypeList!=undefined&&CommonHelper.isArray(options.allowedFileTypeList))? options.allowedFileTypeList:null;
		
	this.m_maxWidth = options.maxWidth;
	this.m_maxHeight = options.maxHeight;
	
	this.setContTagName(options.contTagName || this.DEF_CONT_TAG);	
	
	this.m_files = [];
	
	var self = this;

	var init_val;
	if (options.value){
		init_val = options.value;
		options.value = undefined;
	}

	options.addElement = function(){
		this.addElement(new ControlContainer(id+":file_cont",this.getContTagName()));

		if (options.labelCaption){
			this.addElement(new Control(id+":label","LABEL",{
				"value":options.labelCaption,
				"className":options.labelClassName
			}));
		}
			
		var file_ctrl_opts = {
			"events":{
				"change":function(){
					self.fileAdded();
				}
			}
		}
		if (this.m_separateSignature || this.m_multipleFiles){
			file_ctrl_opts.attrs = file_ctrl_opts.attrs || {};
			file_ctrl_opts.attrs.multiple = "multiple";
		}
		
		this.addElement(new Control(id+":file","INPUT",file_ctrl_opts));
		
		this.addElement(new ButtonCtrl(id+":add",{
			"glyph":"glyphicon-plus",
			"attrs":{"class":"btn btn-default fileAddBtn"},
			"title":"Выбрать файл",
			"onClick":function(){
				$(self.getElement("file").getNode()).click();
			}
		}));
		
		if (options.addControls){
			options.addControls.call(this);
		}
	}

	EditFile.superclass.constructor.call(this,id, options.tagName||"DIV",options);
	
	if (init_val){
		this.setInitValue(init_val);
	}
}
extend(EditFile,ControlContainer);

/* Constants */
EditFile.prototype.SIGN_MARK = ".sig";
EditFile.prototype.DEF_CONT_TAG = "TEMPLATE";

/* private members */
EditFile.prototype.m_onDownload;
EditFile.prototype.m_fileName;
EditFile.prototype.m_allowOnlySignedFiles;
EditFile.prototype.m_multipleFiles;

EditFile.prototype.m_files;
/* protected*/


/* public methods */
EditFile.prototype.getValue = function(){
	//return this.m_files.length? ((this.m_separateSignature||this.m_multipleFiles)? this.m_files : this.m_files[0]) : null;
	return this.m_files.length? this.m_files : null;
}

EditFile.prototype.getFiles = function(){
	return this.m_files;
}

EditFile.prototype.getFileControls = function(){
	var list = this.getElement("file_cont").getElements();	
	var file_list = [];
	for (var id in list){
		if (list[id].isFileControl){
			file_list.push(list[id]);
		}
	}
	return file_list;
}

/*
 * @param {json|file|FileList} v
 */
EditFile.prototype.setValue = function(v){	
	this.m_files = [];
	this.getElement("file").getNode().value="";
	
	if (v && !CommonHelper.isArray(v) && ((v.id && v.name && v.size) || v.dataBase64) ){
		var el = v;
		v = [el];
	}
	
	if (v && CommonHelper.isArray(v)){
		var cont = this.getElement("file_cont");
		cont.clear();
		for (var i=0;i<v.length;i++){
			v[i].uploaded = true;
			this.addFile(v[i],true);
		}
		cont.toDOM(this.m_node);
	}
	this.m_modified = false;
}

EditFile.prototype.setInitValue = function(v){
	/*Problem:
		in ViewObjectAJX.onAfterUpsert()
		EditFile.setInitValue(EditFile.getValue()) is called with the same control value
		it has no base64 property!!!
	*/
	if(this.m_showPic && v && CommonHelper.isArray(v) && v.length && !v[0].dataBase64){
		return; //stub
	}
	this.setValue(v);
}

EditFile.prototype.addFile =  function(fileInf){
	var cont = this.getElement("file_cont");
	
	if (!this.m_multipleFiles && !this.m_separateSignature){
		cont.clear();
	}
	else if (this.m_separateSignature && fileInf.name.substring(fileInf.name.length-this.SIGN_MARK.length)==this.SIGN_MARK){
		//signature
		var file_found = false;
		var base_name = fileInf.name.substring(0,fileInf.name.length-this.SIGN_MARK.length);
		var elems = cont.getElements();		
		for (var id in elems){
			if (elems[id] && elems[id].isFileControl && elems[id].getAttr("file_name")==base_name){
				file_found = true;
				break;
			}
		}
		if (!file_found){
			//remove from files
			this.m_files.splice(CommonHelper.inArray(fileInf.name,this.m_files),1);
			throw new Error(this.ER_NO_SIG);
		}
		var n = $("#"+elems[id].getId()+"_sig");
		n.attr("class","icon-file-locked");
		n.attr("title","Файл подписан ЭЦП");
		elems[id].setAttr("file_signed","true");
		
		if (this.m_onFileSigAdded){
			this.m_onFileSigAdded();
		}
		
		if (this.sigCont && !this.sigCont.getSignatureCount()){
			this.sigCont.addSignature({"sign_date_time":DateHelper.time()});
		}
				
		return;
	}
	else if (!this.m_multipleFiles){
		cont.clear();
	}
	
	var file_template_opts = {
		"file_uploaded":fileInf.uploaded,
		"file_not_uploaded":!fileInf.uploaded,
		"file_deletable":(this.m_onDeleteFile)? true:false,
		"separateSignature":this.m_separateSignature,
		"allowOnlySignedFiles":this.m_allowOnlySignedFiles,
		"allowNotOnlySignedFiles":!this.m_allowOnlySignedFiles,
		"name":fileInf.name,
		"file_size_formatted":CommonHelper.byteFormat(fileInf.size),
		"show_href": this.m_showHref
	};
	CommonHelper.merge(file_template_opts,this.m_fileInfTemplateOptions||{});
	var file_opts = {
		"template":this.m_fileInfTemplate,
		"templateOptions":file_template_opts
	};
	/*
		"onClick":this.m_onDownload?
			function(){
				;
			}
			: null
	*/
	if (this.m_separateSignature){
		file_template_opts.file_signed = fileInf.file_signed;
		file_template_opts.file_not_signed = !fileInf.file_signed;
		file_opts.attrs = file_opts.attrs || {};
		file_opts.attrs.file_name = fileInf.name;
		file_opts.attrs.file_signed = fileInf.file_signed;
	}
	//debugger	
	var file_id = fileInf.id||fileInf.file_id;

	var file_ctrl = new Control(file_id, "TEMPLATE", file_opts);
	file_ctrl.isFileControl = true;
	cont.addElement(file_ctrl);
	
	var self = this;
	
	if(this.m_showHref){
		cont.addElement(new Button(file_id+"-href",{
			"attrs":{"class":"","download_href":"true","file_id":fileInf.id,"file_uploaded":fileInf.uploaded},
			"onClick":function(e){
				e.preventDefault();
				if (this.getAttr("file_uploaded")=="true"){
					self.m_onDownload(this.getAttr("file_id"));				
				}
			}
		}));
	}
	
	if(window["FileSigContainer"]){
		this.sigCont = new FileSigContainer(file_id+"-sigList",{
			"fileId":file_id,
			"itemId":null,
			"signatures":CommonHelper.unserialize(fileInf.signatures),//array!
			"multiSignature":this.m_multiSignature,
			"readOnly":false,
			"onSignFile":function(fileId){
				self.m_onSignFile(fileId);
			},
			"onSignClick":function(fileId){
				self.m_onSignClick(fileId);
			},
			"onGetFileUploaded":function(){
				return (self.getAttr("file_uploaded")=="true");
			}
		});
		cont.addElement(this.sigCont);
	}	
	if (this.m_onDeleteFile){		
		cont.addElement(new Button(file_id+"-del",{
			"attrs":{"file_id":file_id,"file_uploaded":fileInf.uploaded},
			"onClick":function(){				
				if (this.getAttr("file_uploaded")=="true"){					
					var file_id = this.getAttr("file_id");
					self.m_onDeleteFile(						
						file_id,
						function(){
							self.m_modified = false;
							self.deleteFileFromDOM(file_id);
						}
					);
					
				}
				else{
					self.deleteFileFromDOM(this.getAttr("file_id"));
				}
			}
		}));
	}
	
	if (this.m_showPic && fileInf.dataBase64){		
		var max_dim_exist = (this.m_maxWidth && this.m_maxHeight);
		var self = this;
		var pic_ctrl = new Control(file_id+"-preview","TEMPLATE",{
			"attrs":{
				"src":"data:image/png;base64, "+fileInf.dataBase64
			},
			"visible":!max_dim_exist,
			"events": (max_dim_exist? {
				"load":function(){
					var n = this.m_node;
					var dim = CommonHelper.calculateImgRatioFit(n.width, n.height, self.m_maxWidth, self.m_maxHeight);
					n.width = dim.width;
					n.height = dim.height;
					DOMHelper.show(n);						
				},
				"click":this.m_showHref? null:function(e){
					e.preventDefault();
					if (e.target.getAttribute("file_uploaded")=="true"){
						self.m_onDownload(e.target.getAttribute("file_id"));				
					}
				}
			} : null)
		});
		if(!this.m_showHref){
			pic_ctrl.setAttr("file_uploaded", fileInf.uploaded);
			pic_ctrl.setAttr("file_id", file_id);
			pic_ctrl.setAttr("style", "cursor:pointer;");
		}
		cont.addElement(pic_ctrl);
		/*if(max_dim_exist){
			var i = new Image();
			i.onload = function(){
				var dim = CommonHelper.calculateImgRatioFit(i.width, i.height, self.m_maxWidth, self.m_maxWidth);
				pic_ctrl.m_node.width = dim.width;
				pic_ctrl.m_node.height = dim.height;
				pic_ctrl.setVisible(true);
			};	
			i.src = "data:image/png;base64, "+fileInf.dataBase64;		
		}*/		
	}	
		
}

EditFile.prototype.deleteFileFromDOM = function(fileId){
	var cont = this.getElement("file_cont");
	//console.log("FileId="+fileId)
	if (this.m_multipleFiles){
		for (var i=0;i<this.m_files.length;i++){
			if (this.m_files[i] && this.m_files[i].file_id && this.m_files[i].file_id==fileId){
				delete this.m_files[i];
				this.m_files[i] = undefined;
				break;
			}
		}
		cont.delElement(fileId);
		cont.delElement(fileId+"-href");
		cont.delElement(fileId+"-del");
		if (this.m_showPic){
			cont.delElement(fileId+"-preview");
		}
	}
	else{
		this.m_files = [];
		cont.clear();
	}
	
	cont.toDOM();
	
	if (this.m_onFileDeleted)this.m_onFileDeleted();
}

EditFile.prototype.getModified = function(){
//console.log("EditFile.prototype.getModified="+this.m_modified)
	return this.m_modified;
}
EditFile.prototype.setValid = function(){
}
EditFile.prototype.reset = function(){
	this.setValue(null);
	var cont = this.getElement("file_cont");
	cont.clear();
	cont.toDOM();
	
}
EditFile.prototype.getContTagName = function(){
	return this.m_contTagName;
}
EditFile.prototype.setContTagName = function(v){
	this.m_contTagName = v;
}


EditFile.prototype.setEnabled = function(v){	
	EditFile.superclass.setEnabled.call(this,v);
	var hrefs = DOMHelper.getElementsByAttr("true", this.m_node, "download_href", false);
	for(var i=0;i<hrefs.length;i++){
		DOMHelper.delAttr(hrefs[i],"disabled");
	}
	/*var cont = this.getElement("file_cont");
	var btn_add = cont.getElement("add");
	if(btn_add){
		btn_add.setEnabled(v);
	}
	*/
	//$(".downloadHref").removeAttr("disabled");
	/*
	for (var elem_id in this.m_elements){
		this.m_elements[elem_id].setEnabled(v);
	}		
	if (v){
		DOMHelper.delAttr(this.getNode(),this.ATTR_DISABLED);
	}
	else{
		DOMHelper.setAttr(this.getNode(),this.ATTR_DISABLED,this.ATTR_DISABLED);
	}
	*/
}
EditFile.prototype.fileAdded = function(){
	//debugger
	var fl_list = this.getElement("file").getNode().files;

	if (!this.m_multipleFiles && !this.m_separateSignature && fl_list.length>1){
		throw new Error(this.ER_MULTIPLE_FILES_NOT_ALLOWED);
	}
	
	if (!this.m_multipleFiles && !this.m_separateSignature){
		this.m_files = [];
	}
	
	if(this.m_allowedFileExtList){
		//extension list
		var ext_ar = fl_list[fl_list.length-1].name.split(".");
		if(!ext_ar.length || ext_ar.length<2){
			throw new Error(this.ER_EXT_NOT_DEFINED);
		}
		if(CommonHelper.inArray(ext_ar[ext_ar.length-1].toLowerCase(),this.m_allowedFileExtList)==-1){
			throw new Error(CommonHelper.format(this.ER_EXT_NOT_ALLOWED,ext_ar[ext_ar.length-1]));
		}
	}
	if(this.m_allowedFileTypeList && fl_list[fl_list.length-1].type){		
		if(CommonHelper.inArray(fl_list[fl_list.length-1].type,this.m_allowedFileTypeList)==-1){
			throw new Error(CommonHelper.format(this.ER_TYPE_NOT_ALLOWED,fl_list[fl_list.length-1].type));
		}
	}
						
	var sig_list = []//base file names;
	var ctrls_to_add = {};
	for (var fi=0;fi<fl_list.length;fi++){
		var fl = fl_list[fi];
		
		if (this.m_separateSignature && fl.name.substring(fl.name.length-this.SIGN_MARK.length)==this.SIGN_MARK){
			//signature
			sig_list.push({
				"base_name":fl.name.substring(0,fl.name.length-this.SIGN_MARK.length),
				"file":fl
			});
		}
		else{
			fl.file_id = CommonHelper.uniqid();
			this.m_files.push(fl);
			ctrls_to_add[fl.name] = {
				"id":fl.file_id,
				"name":fl.name,
				"size":fl.size,
				"file_uploaded":false,
				"file_signed":false,
				"signatures":[]
			};
		}
	}
	for (var fi=0;fi<sig_list.length;fi++){
		if(ctrls_to_add[sig_list[fi].base_name]){
			this.m_files.push(sig_list[fi].file);
			ctrls_to_add[sig_list[fi].base_name].file_signed = true;
			ctrls_to_add[sig_list[fi].base_name].signatures.push(
				{"id":ctrls_to_add[sig_list[fi].base_name].id,
				"sign_date_time":DateHelper.time()
				}
			);
		}
		else{
			//no data in this batch
			var found = false;
			for (var i=0;i<this.m_files.length;i++){
				if (this.m_files[i].name==sig_list[fi].base_name){
					found = true;
					break;
				}
			}
			if (!found){
				//or in any other
				//ToDo window.showError()
				throw new Error(this.ER_NO_SIG);
			}
			else{
				this.m_files.push(sig_list[fi].file);
				this.addFile({
					"id":CommonHelper.uniqid(),
					"name":sig_list[fi].file.name,
					"size":sig_list[fi].file.size,
					"file_uploaded":false,
					"file_signed":false,
					"signatures":[]
				});
				if (this.m_onFileAdded){
					this.m_onFileAdded();
				}					
			}
		}
		
	}
	var cont = this.getElement("file_cont");
	if (!this.m_multipleFiles && !this.m_separateSignature){
		cont.clear();
	}
	
	for (var n in ctrls_to_add){
		this.addFile(ctrls_to_add[n]);
		
		if (this.m_onFileAdded){
			this.m_onFileAdded(ctrls_to_add[n].id);
		}		
	}	
	cont.toDOM(this.m_node);
	this.m_modified = true;
	
	//console.dir(this.m_files)

}
