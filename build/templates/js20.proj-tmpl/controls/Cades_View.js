/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function Cades_View(id,options){
	
	this.m_id = id;
	if(!options.readOnly){
		options.templateOptions = options.templateOptions || {};
		this.initCades(options.templateOptions);
	}
}

/* Constants */


/* private members */

/* protected*/
Cades_View.prototype.m_certBoxControl;
Cades_View.prototype.m_id;

/* public methods */
Cades_View.prototype.getId = function(){
	return this.m_id;
}

Cades_View.prototype.initCades = function(templateOptions){
	var app = window.getApp();
	templateOptions.loadCadesPlugin = (!app.getDoNotLoadCadesPlugin() && !app.getCloudKeyExists());

	if (templateOptions.loadCadesPlugin){
		var cades = window.getApp().getCadesAPI();		
		if (cades){
			templateOptions.pluginSupBrowser = cades.browserSupported();
			templateOptions.pluginUnsupBrowser = !templateOptions.pluginSupBrowser;
		
			if (templateOptions.pluginSupBrowser){
				var br = CommonHelper.getBrowser();				
				templateOptions.isFirefox = (br["name"]=="Firefox");
				templateOptions.isOpera = (br["name"]=="Opera" || br["name"]=="Yandex");
				templateOptions.isChrome = (br["name"]=="Chrome");
			}
			
		}
		
		$(".doNotCadesLoadPlugin").click(function(){
			var checked = $("#doNotCadesLoadPlugin").is(":checked");
			window.getApp().setDoNotLoadCadesPlugin(checked);
		});
		var self = this;
		if (cades && !cades.getLoaded()){
			cades.setOnCertListFilled(function(){
				self.cadesOnCertListFilled();
			});
			cades.setOnLoadSuccess(this.cadesOnLoadSuccess);
			cades.setOnLoadError(this.cadesOnLoadError);
		}
		else if (cades){
			this.m_cadesLoaded = true;
			//already loaded
			//console.log("Cades loaded")
			/*
			if (cades.getLoadError()){
				this.cadesOnLoadError();
			}
			else{
				this.cadesOnLoadSuccess();
				if (cades.getCertListFilled()){
					this.cadesOnCertListFilled();
				}
			}
			*/
		}		
	}

}

Cades_View.prototype.afterViewConstructed = function(){
	if (this.m_cadesLoaded){
		var cades = window.getApp().getCadesAPI();		
		if (cades.getLoadError()){
			this.cadesOnLoadError();
		}
		else{
			this.cadesOnLoadSuccess();
			if (cades.getCertListFilled()){
				this.cadesOnCertListFilled();
			}
		}	
	}
	else if(window.getApp().getCloudKeyExists()){
		this.setSigningEnabled();
	}
}

Cades_View.prototype.setSigningEnabled = function(){
	$(".fileSignNoSig").removeClass("hidden");
	$(".signAllBtn").removeClass("hidden");
}

Cades_View.prototype.cadesOnCertListFilled = function(){
	var id = this.getId();
	//общая информация
	var cades = window.getApp().getCadesAPI();
	var n = document.getElementById(id+":cspName");
	if(n)n.innerHTML = "Криптопровайдер: " + cades.getCSPName();
	n = document.getElementById(id+":cspVersion");
	if(n)n.innerHTML = "версия: " + cades.getCSPVersion();
	n = document.getElementById(id+":plugInVersion");
	if(n)n.innerHTML = "Версия плагина: " + cades.getPluginVersion();
	
	//заполнение списка сертификатов
	this.m_certBoxControl = new EditCertificateSelect(id+":certListBox",{
		"cades":cades
	});
	this.m_certBoxControl.toDOM();
	
	$(".certFilling").addClass("hidden");
	$(".certReady").removeClass("hidden");
	this.setSigningEnabled();
	
	if (cades.getNewVersion()){
		$(".pluginUpdate").removeClass("hidden");
	}
}

Cades_View.prototype.cadesOnLoadSuccess = function(){
	$(".cadesChecking").remove();		
	$(".cadesInstalled").removeClass("hidden");				
		
}
Cades_View.prototype.cadesOnLoadError = function(){
	$(".cadesChecking").remove();		
	$(".cadesNotInstalled").removeClass("hidden");			
}
Cades_View.prototype.getCertBoxControl = function(){
	return this.m_certBoxControl;
}

