/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @extends EditSelect
 * @requires core/extend.js
 * @requires controls/EditSelect.js
 * @requires ext/cadesplugin/CadesAPI.js           

 * @class
 * @classdesc Cades Certificate box
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {CadesAPI} options.cades 
 */
function EditCertificateSelect(id,options){
	options = options || {};	
	
	this.m_cades = options.cades;
	
	options.labelCaption = options.labelCaption || "Сертификат ЭЦП:";
	options.addNotSelected = false;
	
	var self = this;
	options.onSelect = function(){
		self.onSelect();
	}
	EditCertificateSelect.superclass.constructor.call(this,id,options);
}

extend(EditCertificateSelect,EditSelect);

/* Constants */
EditCertificateSelect.prototype.STORAGE_ID = "cadesSelectedCert";

/* private members */
EditCertificateSelect.prototype.m_infControl;
EditCertificateSelect.prototype.m_infWaitControl;


/* protected*/


/* public methods */
EditCertificateSelect.prototype.updateCertInf = function(){
	this.m_infContainer.getElement("txt").setVisible(false);
	this.m_infContainer.getElement("wait").setVisible(true);

	var self = this;
	this.m_cades.getCertFullInfo(this.m_node.selectedIndex,function(){
		var cert = self.getSelectedCert();
		var inf = cert.validationStr;
		var ctrl = self.m_infContainer.getElement("txt");
		ctrl.setValue(inf);

		ctrl.setClassName(cert.isValid? " ":"bg-danger");
		self.m_infContainer.getElement("wait").setVisible(false);
		ctrl.setVisible(true);
	});
}

EditCertificateSelect.prototype.onSelect = function(){
	
	window.getApp().storageSet(this.STORAGE_ID,this.getSelectedCert().thumbprint);
	
	this.updateCertInf();
}

EditCertificateSelect.prototype.getSelectedCert = function(){
	return ((this.m_node.selectedIndex>=0)? this.m_cades.m_certContainer[this.m_node.selectedIndex] : null);
}

EditCertificateSelect.prototype.fillOptions = function(){
	this.clear();
	var certs = this.m_cades.m_certContainer;
	var opt_class = this.getOptionClass();
	var id = this.getId();
	var sel_thumbprint = window.getApp().storageGet(this.STORAGE_ID);
	var found = false;
	var dt = DateHelper.time();
	var sel_ind = 0;
	for(var opt_ind=0;opt_ind<certs.length;opt_ind++){
		var checked = (!found && (sel_thumbprint && sel_thumbprint==certs[opt_ind].thumbprint) || (certs[opt_ind].validFromDate>=dt && certs[opt_ind].validToDate<dt) );
		if (checked){
			found = checked;
			sel_ind = opt_ind;
		}
		this.addElement(new opt_class(id+":"+opt_ind,{
			"value":opt_ind,
			"descr":certs[opt_ind].descr,
			"checked":checked
		}));		
	}
	if (!sel_thumbprint && sel_ind){
		window.getApp().storageSet(this.STORAGE_ID,certs[sel_ind].thumbprint);
	}
}

EditCertificateSelect.prototype.toDOM = function(parent){	

	this.fillOptions();

	EditCertificateSelect.superclass.toDOM.call(this,parent);
	
	this.m_infContainer = new ControlContainer(this.getId()+":inf",{
	});
	this.m_infContainer.addElement(new Control( this.getId()+":inf:txt","DIV",{
		"visible":false
	}));	
	this.m_infContainer.addElement(new ControlContainer( this.getId()+":inf:wait","DIV",{
		"visible":false,		
		"elements":[
			new Control( this.getId()+":inf:wait:img","I",{
				"className":"icon-spinner2 spinner position-left"
			}),
			new Control( this.getId()+":inf:wait:txt","SPAN",{
				"value":" Обновление информации по сертификату...",
			})			
		]
	}));
	this.m_infContainer.toDOM(this.m_editContainer.getNode());
	this.updateCertInf();
	
}
