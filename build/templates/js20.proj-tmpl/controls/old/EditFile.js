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
 */
function EditFile(id,options){
	options = options || {};	
	
	options.template = options.template || window.getApp().getTemplate("EditFile");
	
	this.m_fileInfTemplate = options.fileInfTemplate || window.getApp().getTemplate("EditFileInf");
	this.m_fileInfTemplateOptions = options.fileInfTemplateOptions;
	
	this.m_onDownload = options.onDownload;
	this.m_onDeleteFile = options.onDeleteFile;
	this.m_multipleFiles = (options.multipleFiles!=undefined)? options.multipleFiles:false;
	this.m_allowOnlySignedFiles = options.allowOnlySignedFiles;
	this.m_separateSignature = options.separateSignature;
	this.m_onFileAdded = options.onFileAdded;
	this.m_onFileSigAdded = options.onFileSigAdded;
	this.m_onFileDeleted = options.onFileDeleted;
	
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
					var fl_list = self.getElement("file").getNode().files;

					if (!self.m_multipleFiles && !self.m_separateSignature && fl_list.length>1){
						throw new Error(self.ER_MULTIPLE_FILES_NOT_ALLOWED);
					}
					
					if (!self.m_multipleFiles && !self.m_separateSignature){
						self.m_files = [];
					}
										
					var sig_list = []//base file names;
					var ctrls_to_add = {};
					for (var fi=0;fi<fl_list.length;fi++){
						var fl = fl_list[fi];
						
						if (self.m_separateSignature && fl.name.substring(fl.name.length-self.SIGN_MARK.length)==self.SIGN_MARK){
							sig_list.push({
								"base_name":fl.name.substring(0,fl.name.length-self.SIGN_MARK.length),
								"file":fl
							});
						}
						else{
							fl.file_id = CommonHelper.uniqid();
							self.m_files.push(fl);
							ctrls_to_add[fl.name] = {
								"id":fl.file_id,
								"name":fl.name,
								"size":fl.size,
								"file_uploaded":false,
								"file_signed":false
							};
						}
					}
					for (var fi=0;fi<sig_list.length;fi++){
						if(ctrls_to_add[sig_list[fi].base_name]){
							self.m_files.push(sig_list[fi].file);
							ctrls_to_add[sig_list[fi].base_name].file_signed = true;
						}
						else{
							//no data in this batch
							var found = false;
							for (var i=0;i<self.m_files.length;i++){
								if (self.m_files[i].name==sig_list[fi].base_name){
									found = true;
									break;
								}
							}
							if (!found){
								//or in any other
								//ToDo window.showError()
								throw new Error(self.ER_NO_SIG);
							}
							else{
								self.m_files.push(sig_list[fi].file);
								self.addFile({
									"id":CommonHelper.uniqid(),
									"name":sig_list[fi].file.name,
									"size":sig_list[fi].file.size,
									"file_uploaded":false,
									"file_signed":false
								});	
							}
						}
						
					}
					for (var n in ctrls_to_add){
						self.addFile(ctrls_to_add[n]);
					}
					self.getElement("file_cont").toDOM();
					
					self.m_modified = true;
					
					//console.dir(self.m_files)
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
			"title":"Выбрать файл",
			"onClick":function(){
				$(self.getElement("file").getNode()).click();
			}
		}));
		
		if (options.addControls){
			options.addControls.call(this);
		}
	}
	
	EditFile.superclass.constructor.call(this,id,"DIV",options);
	
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
	//console.log("EditFile.prototype.setValue")
	//console.dir(v)
	
	if (v && !CommonHelper.isArray(v) && v.id && v.name && v.size){
		var el = v;
		v = [el];
	}
	
	if (v && CommonHelper.isArray(v)){
		var cont = this.getElement("file_cont");
		cont.clear();
		for (var i=0;i<v.length;i++){
			v[i].uploaded = true;
			this.addFile(v[i]);
		}
		cont.toDOM(this.m_node);
	}
	this.m_modified = false;
}

EditFile.prototype.setInitValue = function(v){	
	this.setValue(v);
}

EditFile.prototype.addFile =  function(fileInf){
//console.dir(fileInf)
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
		"file_size_formatted":CommonHelper.byteFormat(fileInf.size)
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
	var file_ctrl = new Control(fileInf.id,"TEMPLATE",file_opts);
	file_ctrl.isFileControl = true;
	cont.addElement(file_ctrl);
	
	var self = this;
	
	cont.addElement(new Button(fileInf.id+"-href",{
		"attrs":{"class":"","download_href":"true","file_id":fileInf.id,"file_uploaded":fileInf.uploaded},
		"onClick":function(e){
			if (this.getAttr("file_uploaded")=="true"){
				self.m_onDownload(this.getAttr("file_id"));
				e.preventDefault();
			}
		}
	}));
	
	if (this.m_onDeleteFile){		
		cont.addElement(new Button(fileInf.id+"-del",{
			"attrs":{"file_id":fileInf.id,"file_uploaded":fileInf.uploaded},
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
	if (this.m_onFileAdded){
		this.m_onFileAdded();
	}
	
}

EditFile.prototype.deleteFileFromDOM = function(fileId){
	var cont = this.getElement("file_cont");
	//console.log("FileId="+fileId)
	if (this.m_multipleFiles){
		for (var i=0;i<this.m_files.length;i++){
			if (this.m_files[i].file_id && this.m_files[i].file_id==fileId){
				delete this.m_files[i];
				this.m_files[i] = undefined;
				break;
			}
		}
		cont.delElement(fileId);
		cont.delElement(fileId+"-href");
		cont.delElement(fileId+"-del");
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

