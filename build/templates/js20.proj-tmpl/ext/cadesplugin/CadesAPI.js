/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @class
 * @classdesc
 
 * @param {object} options
 * @param {bool} [options.debug=false]
 * @param {bool} [options.allowFirefoxAsync=true]
 * @param {bool} [options.noInstMessage=true]
 * @param {int} [options.loadTimeout=60000]
 * @param {string} options.logLevel cadesplugin.LOG_LEVEL_
 * @param {int} [options.includeCertificate=CAPICOM_CERTIFICATE_INCLUDE_CHAIN_EXCEPT_ROOT]
 * @param {int} [options.chunkSize=DEF_CHUNK_SIZE]
 * @param {int} [options.cadesType=CADESCOM_CADES_DEFAULT]
 * @param {int} [options.hashAlgorithm=CADESCOM_HASH_ALGORITHM_CP_GOST_3411]

 */
function CadesAPI(options){
	options = options || {};
	//cades constants
	window.cadesplugin_skip_extension_install = options.noInstMessage || this.DEF_NO_INST_MES;
	window.cadesplugin_load_timeout = options.loadTimeout || this.DEF_LOAD_TIMEOUT;
	window.allow_firefox_cadesplugin_async = options.allowFirefoxAsync || this.DEF_ALLOW_FIREFOX_ASYNC;

	//API initialization
	cadesPluginAPI();
	
	this.m_debug = (options.debug!=undefined)? options.debug:this.DEF_DEBUG;
	this.m_logLevel = (options.logLevel!=undefined)? options.logLevel : (this.m_debug? cadesplugin.LOG_LEVEL_DEBUG : cadesplugin.LOG_LEVEL_ERROR); 
	
	this.m_cryptoproPluginVersion = options.plugin_version;

	var self = this;

	var canPromise = !!window.Promise;
	if (canPromise) {
		if (self.m_debug&&console&&console.log)console.log("canPromise=true");
		cadesplugin.then(
			function() {
				if (self.m_debug&&console&&console.log)console.log("Promise ОК");
				self.m_loaded = true;
				self.m_loadError = false;
			
				if (self.m_onLoadSuccess)self.m_onLoadSuccess();
			
				self.checkForPlugIn(self.m_logLevel);
			},
			function(error) {
				if (self.m_debug&&console&&console.log)console.log("Promise error "+error);
				self.m_loaded = true;
				self.m_loadError = true;
				if(self.m_onLoadError)self.m_onLoadError();
				/*
				if (error.indexOf("время ожидания")!=-1){
					
				}
				*/
				window.showError(error);
			}
		);
	}
	else{
		if (self.m_debug&&console&&console.log)console.log("canPromise=false");
		window.addEventListener(
			"message",
			function(event) {
				if (event.data == "cadesplugin_loaded") {
					if (self.m_debug&&console&&console.log)console.log("event cadesplugin_loaded");
					self.m_loaded = true;
					self.m_loadError = false;
				
					if (self.m_onLoadSuccess)self.m_onLoadSuccess();

					self.checkForPlugIn_NPAPI();
					//CreateSimpleSign_NPAPI();
				}
				else if (event.data == "cadesplugin_load_error") {
					if (self.m_debug&&console&&console.log)console.log("event cadesplugin_load_error");
					self.m_loadError = true;
					self.m_loadError = true;
			
					if (self.m_onLoadError)self.m_onLoadError();
				
					window.showError("КриптоПро ЭЦП браузер плагин не загружен");
				}
			},
			false
		);
		window.postMessage("cadesplugin_echo_request", "*");
	}
	
	this.m_chunkSize = options.chunkSize || this.DEF_CHUNK_SIZE;
	this.m_includeCertificate = (options.includeCertificate!=undefined)? options.includeCertificate : this.CAPICOM_CERTIFICATE_INCLUDE_CHAIN_EXCEPT_ROOT;
	this.m_cadesType = (options.cadesType!=undefined)? options.cadesType : this.CADESCOM_CADES_DEFAULT;
	
	this.m_detached = (options.detached!=undefined)? options.detached : true;
	
	this.m_hashAlgorithm = options.hashAlgorithm || this.CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
}

/* Constants */
CadesAPI.prototype.DEF_LOAD_TIMEOUT = 60000;//120000
CadesAPI.prototype.DEF_NO_INST_MES = true;
CadesAPI.prototype.DEF_DEBUG = false;
CadesAPI.prototype.DEF_ALLOW_FIREFOX_ASYNC = true;
CadesAPI.prototype.PLUGIN_LAST_VERSION_URL = "https://www.cryptopro.ru/sites/default/files/products/cades/latest_2_0.txt";
CadesAPI.prototype.PLUGIN_URL = "https://www.cryptopro.ru/products/cades/plugin/get_2_0";
CadesAPI.prototype.ASYNC_FUNC_SCRIPT = "js20/ext/cadesplugin/CadesAPI_async.js";

CadesAPI.prototype.DEF_CHUNK_SIZE = 1 * 1024 * 1024;// 1MB
CadesAPI.prototype.CADESCOM_BASE64_TO_BINARY = 1;

CadesAPI.prototype.CAPICOM_CERTIFICATE_INCLUDE_CHAIN_EXCEPT_ROOT = 0;
CadesAPI.prototype.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN = 1;
CadesAPI.prototype.CAPICOM_CERTIFICATE_INCLUDE_END_ENTITY_ONLY = 2;

CadesAPI.prototype.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME = 0;
CadesAPI.prototype.CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME = 1;

CadesAPI.prototype.CADESCOM_CADES_BES = 1;
CadesAPI.prototype.CADESCOM_CADES_DEFAULT = 0;
CadesAPI.prototype.CADESCOM_CADES_T = 0x05;
CadesAPI.prototype.CADESCOM_CADES_X_LONG_TYPE_1 = 0x5D;

CadesAPI.prototype.CADESCOM_HASH_ALGORITHM_CP_GOST_3411 = 100;//Алгоритм ГОСТ Р 34.11-94.
CadesAPI.prototype.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256 = 101;//Алгоритм ГОСТ Р 34.10-2012 256 бит
CadesAPI.prototype.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512 = 102;// Алгоритм ГОСТ Р 34.10-2012 512 бит	

CadesAPI.prototype.szOID_CP_GOST_R3410_12_256 = "1.2.643.7.1.1.1.1";// ГОСТ Р 34.10-2012 для ключей длины 256 бит
CadesAPI.prototype.szOID_CP_GOST_R3410_12_512 = "1.2.643.7.1.1.1.2";// ГОСТ Р 34.10-2012 для ключей длины 512 бит
CadesAPI.prototype.zOID_CP_GOST_R3410 = "1.2.643.2.2.20";//ГОСТ Р 34.10-94
CadesAPI.prototype.szOID_CP_GOST_R3410EL = "1.2.643.2.2.19";//ГОСТ Р 34.10-2001

CadesAPI.prototype.MES_LOAD_SUCCESS_TIMEOUT = 7*1000;

/* private members */
CadesAPI.prototype.m_onLoadError;
CadesAPI.prototype.m_onLoadSuccess;
CadesAPI.prototype.m_onCertListFilled;
CadesAPI.prototype.m_loaded;
CadesAPI.prototype.m_loadError;
CadesAPI.prototype.m_cspVersion;
CadesAPI.prototype.m_cspName;
CadesAPI.prototype.m_pluginVersion;
CadesAPI.prototype.m_asyncAPI;
CadesAPI.prototype.m_certListFilled;

CadesAPI.prototype.m_setDisplayData = 1;
CadesAPI.prototype.m_chunkSize;
CadesAPI.prototype.m_includeCertificate;
CadesAPI.prototype.m_cadesType;
CadesAPI.prototype.m_detached;
CadesAPI.prototype.m_signChunks = 0;
CadesAPI.prototype.m_signCurrent = 0;
CadesAPI.prototype.m_signCount = 0;

CadesAPI.prototype.m_newVersion;

/*
 * structure of
 *	{string} descr,
 *	{object} cert,
 *	{bool} isFromCont
 *	{string} thumbprint
 *	{Date} validToDate
 *	{Date} validFromDate 
 *	extended info getCertFullInfo
 *		{bool} isValid
 *		{bool} hasPrivateKey
 *		{string} owner
 *		{string} issuer
 *		{string} validationStr
 *		{string} algorithm
 *		{string} providerName
 *		{string} ownerFirstName
 *		{string} ownerSecondName   
 */
CadesAPI.prototype.m_certContainer;

/* protected*/


/* public methods */

CadesAPI.prototype.setOnLoadError = function(v){
	this.m_onLoadError = v;
}
CadesAPI.prototype.setOnLoadSuccess = function(v){
	this.m_onLoadSuccess = v;
}
CadesAPI.prototype.setOnCertListFilled = function(v){
	this.m_onCertListFilled = v;
}

CadesAPI.prototype.getLoaded = function(){
	return this.m_loaded;
}
CadesAPI.prototype.getLoadError = function(){
	return this.m_loadError;
}

CadesAPI.prototype.browserSupported = function(){
	var br = CommonHelper.getBrowser();
	return !(br["name"]=="IE" && br.version<=8);
}

CadesAPI.prototype.checkForPlugIn = function(logLevel) {	
	cadesplugin.set_log_level(logLevel);
	this.m_asyncAPI = !!cadesplugin.CreateObjectAsync;
	if (this.m_debug&&console&&console.log)console.log("Async API usage="+this.m_asyncAPI);
	if(this.m_asyncAPI){
		//Загрузка асинхронных функций
		if (this.m_debug&&console&&console.log)console.log("Loading async script");
		var self = this;
                var fileref = document.createElement("script");
                fileref.setAttribute("type", "text/javascript");
                fileref.setAttribute("src", this.ASYNC_FUNC_SCRIPT+"?25"+window.getApp().getServVar("scriptId"));
                fileref.onload = function(){
                	if (self.m_debug&&console&&console.log)console.log("Async module loaded");
                	self.checkForPlugIn_Async();
                }
                fileref.onerror = function(){
                	window.showError("Невозможно загрузить асинхронные функции CadesAPI");
                }
                document.getElementsByTagName("head")[0].appendChild(fileref);
	}
	else{
		return this.checkForPlugIn_NPAPI();
	}
}

CadesAPI.prototype.checkForPlugIn_NPAPI = function() {
	var self = this;

	function VersionCompare_NPAPI(StringVersion, ObjectVersion){
		
		if(typeof(ObjectVersion) == "string")
			return -1;
		var arr = StringVersion.split(".");

		if(ObjectVersion.MajorVersion == parseInt(arr[0])){
			if(ObjectVersion.MinorVersion == parseInt(arr[1])){
				if(ObjectVersion.BuildVersion == parseInt(arr[2])){
					return 0;
				}
				else if(ObjectVersion.BuildVersion < parseInt(arr[2])){
					return -1;
				}
			}
			else if(ObjectVersion.MinorVersion < parseInt(arr[1])){
				return -1;
			}
		}
		else if(ObjectVersion.MajorVersion < parseInt(arr[0])){
			return -1;
		}
		
		return 1;
    	}
	
	function GetCSPVersion_NPAPI() {
		try {
			var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
		}
			catch (err) {
			throw new Error("Failed to create CAdESCOM.About: " + cadesplugin.getLastError(err));
		}
		var ver = oAbout.CSPVersion("", 75);
		return ver.MajorVersion + "." + ver.MinorVersion + "." + ver.BuildVersion;
	}

	function GetCSPName_NPAPI() {
		var sCSPName = "";
		try {
			var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
			sCSPName = oAbout.CSPName(75);
		}
		catch (err) {
		}
		return sCSPName;
	}

	function GetLatestVersion_NPAPI(CurrentPluginVersion) {
		var PluginBaseVersion = self.m_cryptoproPluginVersion;
		if (isPluginWorked) { // плагин работает, объекты создаются
			if (VersionCompare_NPAPI(PluginBaseVersion, CurrentPluginVersion)<0) {
				self.m_newVersion = true;
				window.showWarn("Есть более свежая версия КриптоПро ЭЦП браузер плагина.");
			}
		}
		else { // плагин не работает, объекты не создаются
			if (isPluginLoaded) { // плагин загружен
				if (!isPluginEnabled) { // плагин загружен, но отключен
					window.showError("КриптоПро ЭЦП браузер плагин загружен, но отключен в настройках браузера.");
				}
				else { // плагин загружен и включен, но объекты не создаются
					window.showError("КриптоПро ЭЦП браузер плагин загружен, но не удается создать объекты. Проверьте настройки браузера.");
				}
			}
			else { // плагин не загружен
				window.showError("КриптоПро ЭЦП браузер плагин не загружен.");
			}
		}
		
		/*
		var xmlhttp = CommonHelper.createCORS();
		xmlhttp.open("GET", self.PLUGIN_LAST_VERSION_URL, true);
		xmlhttp.withCredentials = true;
		xmlhttp.onreadystatechange = function() {
		    var PluginBaseVersion;
		    if (xmlhttp.readyState == 4) {
		        if(xmlhttp.status == 200) {
		            PluginBaseVersion = xmlhttp.responseText;
		            if (isPluginWorked) { // плагин работает, объекты создаются
		                if (VersionCompare_NPAPI(PluginBaseVersion, CurrentPluginVersion)<0) {
		                	self.m_newVersion = true;
		                	window.showWarn("КриптоПро ЭЦП браузер плагин загружен, но есть более свежая версия.");
		                }
		            }
		            else { // плагин не работает, объекты не создаются
		                if (isPluginLoaded) { // плагин загружен
		                    if (!isPluginEnabled) { // плагин загружен, но отключен
		                    	window.showError("КриптоПро ЭЦП браузер плагин загружен, но отключен в настройках браузера.");
		                    }
		                    else { // плагин загружен и включен, но объекты не создаются
		                    	window.showError("КриптоПро ЭЦП браузер плагин загружен, но не удается создать объекты. Проверьте настройки браузера.");
		                    }
		                }
		                else { // плагин не загружен
		                	window.showError("КриптоПро ЭЦП браузер плагин не загружен.");
		                }
		            }
		        }
		    }
		}
		xmlhttp.send(null);
		*/
	}

    var isPluginLoaded = false;
    var isPluginWorked = false;
    var isActualVersion = false;
    try {
        var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
        isPluginLoaded = true;
        isPluginEnabled = true;
        isPluginWorked = true;

        // Это значение будет проверяться сервером при загрузке демо-страницы
        var CurrentPluginVersion = oAbout.PluginVersion;
        if( typeof(CurrentPluginVersion) == "undefined")
            CurrentPluginVersion = oAbout.Version;

        window.showTempNote("КриптоПро ЭЦП браузер плагин загружен.",null,this.MES_LOAD_SUCCESS_TIMEOUT);
        
        this.m_cspVersion = GetCSPVersion_NPAPI();
        this.m_cspName = GetCSPName_NPAPI();
        this.m_pluginVersion = (typeof(CurrentPluginVersion)=="string")? CurrentPluginVersion : CurrentPluginVersion.MajorVersion + "." + CurrentPluginVersion.MinorVersion + "." + CurrentPluginVersion.BuildVersion;
        
    }
    catch (err) {
        // Объект создать не удалось, проверим, установлен ли
        // вообще плагин. Такая возможность есть не во всех браузерах
        var mimetype = navigator.mimeTypes["application/x-cades"];
        if (mimetype) {
            isPluginLoaded = true;
            var plugin = mimetype.enabledPlugin;
            if (plugin) {
                isPluginEnabled = true;
            }
        }
    }
    
    GetLatestVersion_NPAPI(CurrentPluginVersion);    
    this.fillCertList_NPAPI();    
} 

CadesAPI.prototype.fillCertList_NPAPI = function() {
	this.m_certContainer = [];
	
	var MyStoreExists = true;
	try {
		var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
		oStore.Open();
	}
	catch (ex) {
		MyStoreExists = false;
	}


	var certCnt;
	if(MyStoreExists) {
		certCnt = oStore.Certificates.Count;
		for (var i = 1; i <= certCnt; i++) {
			var cert_inf = {};
			
			try {
				cert_inf.cert = oStore.Certificates.Item(i);
			}
			catch (ex) {
				throw new Error("Ошибка при перечислении сертификатов: " + cadesplugin.getLastError(ex));
			}

			try {
				cert_inf.validToDate = new Date(cert_inf.cert.ValidToDate);
				cert_inf.validFromDate = new Date(cert_inf.cert.ValidFromDate);				
				var adj = new CertificateAdjuster();
				cert_inf.descr = adj.GetCertInfoString(cert_inf.cert.SubjectName, cert_inf.validFromDate, cert_inf.validToDate);
				cert_inf.SNILS = adj.GetSubjectSNILS(cert_inf.cert.SubjectName);
				cert_inf.thumbprint = cert_inf.cert.Thumbprint;
			}
			catch (ex) {
				throw new Error("Ошибка при получении свойства SubjectName: " + cadesplugin.getLastError(ex));
			}
			try {
				cert_inf.isFromCont = false;				
			}
			catch (ex) {
				window.showError("Ошибка при получении свойства Thumbprint: " + cadesplugin.getLastError(ex));
			}
			
			this.m_certContainer.push(cert_inf);
		}

		oStore.Close();
	}

	//В версии плагина 2.0.13292+ есть возможность получить сертификаты из 
	//закрытых ключей и не установленных в хранилище
	try {
		oStore.Open(cadesplugin.CADESCOM_CONTAINER_STORE);
		certCnt = oStore.Certificates.Count;
		for (var i = 1; i <= certCnt; i++) {
			var cert_inf = {};
		
			cert_inf.cert = oStore.Certificates.Item(i);
			//Проверяем не добавляли ли мы такой сертификат уже?
			var found = false;
			for (var j = 0; j < this.m_certContainer.length; j++){
				if (this.m_certContainer[j].cert.Thumbprint === cert_inf.cert.Thumbprint){
					found = true;
					break;
				}
			}
			if(found)
				continue;
				
			cert_inf.validToDate = new Date(cert_inf.cert.ValidToDate);
			cert_inf.validFromDate = new Date(cert_inf.cert.ValidFromDate);				
			var adj = new CertificateAdjuster();
			cert_inf.descr = adj.GetCertInfoString(cert_inf.cert.SubjectName, cert_inf.validFromDate, cert_inf.validToDate);
			cert_inf.SNILS = adj.GetSubjectSNILS(cert_inf.cert.SubjectName);
			cert_inf.isFromCont = true;
			cert_inf.thumbprint = cert_inf.cert.Thumbprint;
			this.m_certContainer.push(cert_inf);
		}
		oStore.Close();
	}
	catch (ex) {
	}
	
	this.m_certListFilled = true;	
	
	if (this.m_onCertListFilled)this.m_onCertListFilled();
}

/*
 * @param {int} ind index of this.m_certContainer
 * @param {function} callback
 */
CadesAPI.prototype.getCertFullInfo = function(certInd,callback) {
	if (certInd>=this.m_certContainer.length){
		throw new Error(this.CERT_OUT_OF_RANGE);
	}

	if (this.m_asyncAPI){
		this.getFullInfoFromCert_Async(this.m_certContainer[certInd],callback);
		/*
		var self = this;
		cadesplugin.async_spawn(function *(args) {
			self.getFullInfoFromCert_Async(self.m_certContainer[args[0]],args[1]);
		}, certInd,callback);//cadesplugin.async_spawn	
		*/
	}
	else{
		this.getFullInfoFromCert_NPAPI(this.m_certContainer[certInd]);
		callback();
	}
}

CadesAPI.prototype.setValidationStr = function(certInf){
	var Now = new Date();
	if(Now < certInf.validFromDate) {
		certInf.validationStr = "Срок действия сертификата не наступил";
	} else if( Now > certInf.validToDate){
		certInf.validationStr = "Срок действия сертификата истек";
	} else if( !certInf.hasPrivateKey ){
		certInf.validationStr = "Сертификата не имеет привязки к закрытому ключу";
	} else if( !certInf.isValid ){
		certInf.validationStr = "Ошибка при проверке цепочки сертификатов";
	} else {
		certInf.validationStr = "Сертификат действителен, алгоритм:"+certInf.algorithm;
	}
}

/*
 * extracts extended cerificate information
 */
CadesAPI.prototype.getFullInfoFromCert_NPAPI = function(certInf){

	if (certInf && certInf.owner)return;
	
        var Adjust = new CertificateAdjuster();

        var Validator;
        certInf.isValid = false;
        //если попадется сертификат с неизвестным алгоритмом
        //тут будет исключение. В таком сертификате просто пропускаем такое поле
        try {
            Validator = certInf.cert.IsValid();
            certInf.isValid = Validator.Result;
        } catch(e) {

        }
        certInf.hasPrivateKey = certInf.cert.HasPrivateKey();

        certInf.owner = Adjust.GetCertName(certInf.cert.SubjectName);
        certInf.ownerFirstName = Adjust.GetSubjectFirstName(certInf.cert.SubjectName);
        certInf.ownerSecondName = Adjust.GetSubjectSecondName(certInf.cert.SubjectName);
        certInf.issuer = Adjust.GetIssuer(certInf.cert.IssuerName);
        
        var pubKey = certInf.cert.PublicKey();
        var algo = pubKey.Algorithm;
        certInf.algorithm = algo.FriendlyName;
        if( certInf.hasPrivateKey ) {
            var oPrivateKey = certInf.cert.PrivateKey;
            certInf.providerName = oPrivateKey.ProviderName;
        }
        
        this.setValidationStr(certInf);
}


CadesAPI.prototype.getPluginVersion = function() {
	return this.m_pluginVersion;
}
CadesAPI.prototype.getCSPName = function() {
	return this.m_cspName;
}
CadesAPI.prototype.getCSPVersion = function() {
	return this.m_cspVersion;
}
CadesAPI.prototype.getCertListFilled = function(){
	return this.m_certListFilled;
}

/**
 * @param {File} fileToSign
 * @param {object} certObject
 * @param {string} documentName
 * @param {bool} verify 
 * @param {function(percent int)} onProgress
 * @param {function(signature string)} onOk       
 * @param {function(error string)} onError        
 */
CadesAPI.prototype.signFile = function(fileToSign,certObject,documentName,verify,onOk,onError,onProgress){
	
	if(this.m_asyncAPI){
		this.signFile_Async(fileToSign, certObject, documentName,verify, onOk,onError,onProgress);
	}
	else{
		this.signFile_NPAPI(fileToSign, certObject, documentName,verify, onOk,onError,onProgress);
	}
}

CadesAPI.prototype.signFile_NPAPI = function(fileToSign, certObject,documentName,verify,onOk,onError,onProgress) {
	//var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
	
	var chunks = Math.ceil(fileToSign.size / this.m_chunkSize);
	var currentChunk = 0;
	this.m_signChunks+= chunks;
	this.m_signCount++;
	
	var oHashedData = cadesplugin.CreateObject("CAdESCOM.HashedData");
        oHashedData.DataEncoding = this.CADESCOM_BASE64_TO_BINARY;	
	var pubKey = certObject.PublicKey();
	var algo = pubKey.Algorithm;
	var algorithm = algo.Value;
	oHashedData.Algorithm = this.getAlgorithmOnPubKeyAlg(algorithm);
        
        var self = this;
        
	var frOnerror = function() {
                onError("File load error.");
        };  
        
	var frOnload = function(e) {
		var header = ";base64,";
		var sFileData = e.target.result;
		var sBase64Data = sFileData.substr(sFileData.indexOf(header) + header.length);

		oHashedData.Hash(sBase64Data);

		//var percentLoaded = Math.round((currentChunk / chunks) * 100);
		var percentLoaded = Math.round((self.m_signCurrent / self.m_signChunks) * 100);
		// Increase the progress bar length.
		if (percentLoaded <= 100 && onProgress) {
			onProgress(percentLoaded);
		}

		currentChunk++;
		self.m_signCurrent++;

		if (currentChunk < chunks) {
			loadNext();
		}
		else {
			//if (onProgress)onProgress(100);
			self.m_signCount--;
			if (self.m_signCount<0)self.m_signCount=0;
			if (!self.m_signCount){
				self.m_signChunks = 0;
				self.m_signCurrent = 0;
				if (onProgress)onProgress(100);
			}
			
			try{
				var ver_res = {
					"sign_date_time":new Date(),
					"check_result":true
				};
				var signed_message = self.signHash_NPAPI(oHashedData,certObject,documentName,ver_res.sign_date_time);
				if (verify){
					self.verifySignatureOnHash_NPAPI(oHashedData,signed_message,ver_res);
				}
				onOk(signed_message,ver_res);
			}
			catch(e){
				onError(e.message);
			}
		}
	};                
	
	function loadNext() {
        	var fileReader = new FileReader();
		fileReader.onload = frOnload;
		fileReader.onerror = frOnerror;

		var start = currentChunk * self.m_chunkSize;
		var end = ((start + self.m_chunkSize) >= fileToSign.size) ? fileToSign.size : start + self.m_chunkSize;
		//Does not work in IE
		//fileReader.readAsDataURL(blobSlice.call(fileToSign, start, end));
		fileReader.readAsDataURL(fileToSign.slice(start, end));
        };  
        
        loadNext();            
}

/**
 * @param {string} hashToSign
 * @param {object} certObject
 * @param {string} documentName 
 * @param {bool} verify
 * @param {function(signature string)} onOk       
 * @param {function(error string)} onError        
 */
CadesAPI.prototype.signHash = function(hashToSign,certObject,documentName,verify,onOk,onError){
	
	if(this.m_asyncAPI){
		var ok_callback;
		if (verify){
			var self = this;
			ok_callback = function(signature,signDate){
				self.verifySignatureOnHash_Async(oHashedData,signature,function(verRes){
					verRes.sign_date_time = signDate;
					onOk(signature,verRes);
				});							
			}
		}
		else{				
			ok_callback = function(signature,signDate){
				onOk(signature,
					{
						"sign_date_time":signDate,
						"check_result":true
					}
				);
			}
		}
	
		this.signHash_Async(hashToSign, certObject, documentName, ok_callback,onError);
	}
	else{
		var signature;
		try{
			var ver_res = {
				"sign_date_time":new Date(),
				"check_result":true
			};
			signature = this.signHash_NPAPI(hashToSign, certObject, documentName,ver_res.sign_date_time);
			if (verify){
				this.verifySignatureOnHash_NPAPI(hashToSign,signature,ver_res);
			}			
			onOk(signature,ver_res);
		}
		catch(e){
			onError(e.message);
		}
		
	}
}

CadesAPI.prototype.signHash_NPAPI = function(oHashedData, certObject,documentName,signDate) {

	var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");	

	//signing attributes
	var oSigningTimeAttr = cadesplugin.CreateObject("CADESCOM.CPAttribute");
	oSigningTimeAttr.Name = this.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME;
	if (signDate==undefined){
		signDate = new Date();
	}
	var oTimeNow = (CommonHelper.isIE())? signDate.getVarDate() : signDate;
	oSigningTimeAttr.Value = oTimeNow;
	var attr = oSigner.AuthenticatedAttributes2;
	attr.Add(oSigningTimeAttr);

	var oDocumentNameAttr = cadesplugin.CreateObject("CADESCOM.CPAttribute");
	oDocumentNameAttr.Name = this.CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME;
	oDocumentNameAttr.Value = documentName;
	attr.Add(oDocumentNameAttr);
	
	oSigner.Certificate = certObject;
	
	var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");
	oSignedData.ContentEncoding = this.CADESCOM_BASE64_TO_BINARY;	
	if (typeof(this.m_setDisplayData) != 'undefined'){
		//Set display data flag flag for devices like Rutoken PinPad
		oSignedData.DisplayData = this.m_setDisplayData;
	}
	
	oSigner.Options = this.getIncludeCertificate();
	try {
		var signature = oSignedData.SignHash(oHashedData, oSigner, this.getCadesType());
	}
	catch (err) {
		throw new Error("Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err));
	}
	return signature;
}

/*
 * @param {object} verificationResult check_result,error_str
 */
CadesAPI.prototype.verifySignatureOnHash_NPAPI = function(oHashedData, sSignedMessage,verificationResult) {	
	// Создаем объект CAdESCOM.CadesSignedData
	var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");

	// Проверяем подпись
	try {
		oSignedData.VerifyHash(oHashedData, sSignedMessage, this.getCadesType());
		verificationResult.check_result = true;
	}
	catch (err) {
		verificationResult.error_str = cadesplugin.getLastError(err);
		verificationResult.check_result = false;
	}
}

CadesAPI.prototype.getFileContentForSign = function(inputFile,callBack){
	var file_content = undefined;
	var reader = new FileReader();
	reader.readAsDataURL(inputFile);
	reader.onload = function () {
		var header = ";base64,";
		var file_data = reader.result;
		file_content = file_data.substr(file_data.indexOf(header) + header.length);
		callBack(file_content);
	};
}

CadesAPI.prototype.makeSigFile = function(signature,name){
	var f;
	try{
		f = new File(['-----BEGIN CMS-----\n'+signature+'\n-----END CMS-----'],name,{"type":"application/pgp-signature"});
		//f = new File([signature],name,{"type":"application/pgp-signature"});
	}
	catch(err){
		//IE hack
		f = new Blob(['-----BEGIN CMS-----\n'+signature+'\n-----END CMS-----'],{"type":"application/pgp-signature"});
		//f = new Blob([signature],{"type":"application/pgp-signature"});
		f.name = name;
		f.lastModifiedDate= new Date();
	}
	return f;
}

CadesAPI.prototype.getCertListCount = function(){
	return this.m_certContainer? this.m_certContainer.length:0;
}

CadesAPI.prototype.setIncludeCertificate = function(v){
	this.m_includeCertificate = v;
}
CadesAPI.prototype.getIncludeCertificate = function(){
	return this.m_includeCertificate;
}

CadesAPI.prototype.setChunkSize = function(v){
	this.m_chunkSize = v;
}
CadesAPI.prototype.getChunkSize = function(){
	return this.m_chunkSize;
}
CadesAPI.prototype.setCadesType = function(v){
	this.m_cadesType = v;
}
CadesAPI.prototype.getCadesType = function(){
	return this.m_cadesType;
}
CadesAPI.prototype.setDetached = function(v){
	this.m_detached = v;
}
CadesAPI.prototype.getDetached = function(){
	return this.m_detached;
}
CadesAPI.prototype.setHashAlgorithm = function(v){
	this.m_hashAlgorithm = v;
}
CadesAPI.prototype.getHashAlgorithm = function(){
	return this.m_hashAlgorithm;
}
CadesAPI.prototype.setLogLevel = function(v) {	
	cadesplugin.set_log_level(v);
	this.m_logLevel = v;
}
CadesAPI.prototype.getNewVersion = function(v) {	
	return this.m_newVersion;
}
CadesAPI.prototype.getAlgorithmOnPubKeyAlg = function(algorithm) {	
	var hash_alg;
	if(algorithm==this.szOID_CP_GOST_R3410_12_256){
		hash_alg = this.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256;
	}
	else if(algorithm==this.szOID_CP_GOST_R3410_12_512){
		hash_alg = this.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512;
	}
	else if(algorithm==this.zOID_CP_GOST_R3410){
		hash_alg = this.CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
	}
	else{
		//default
		hash_alg = this.getHashAlgorithm();
	}
	return hash_alg;
}
