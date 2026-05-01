/*
 * Дополняет класс CadesAPI асинхронными функциями
 * модуль грузится динамически из CadesAPI
 */
CadesAPI.prototype.checkForPlugIn_Async = function() {

	var self = this;
	
	function VersionCompare_Async(StringVersion, ObjectVersion){
		if(typeof(ObjectVersion) == "string")
			return -1;
		var arr = StringVersion.split(".");
		var isActualVersion = true;

		cadesplugin.async_spawn(function *() {
			var v1 = yield ObjectVersion.MajorVersion;
			var v2 = yield ObjectVersion.MinorVersion;
			var v3 = yield ObjectVersion.BuildVersion;

			if((yield ObjectVersion.MajorVersion) == parseInt(arr[0])){
				if((yield ObjectVersion.MinorVersion) == parseInt(arr[1])){
					if((yield ObjectVersion.BuildVersion) == parseInt(arr[2])){
						isActualVersion = true;
					}
					else if((yield ObjectVersion.BuildVersion) < parseInt(arr[2])){
						isActualVersion = false;
					}
				}
				else if((yield ObjectVersion.MinorVersion) < parseInt(arr[1])){
					isActualVersion = false;
				}
			}
			else if((yield ObjectVersion.MajorVersion) < parseInt(arr[0])){
				isActualVersion = false;
			}

			if(!isActualVersion){
				self.m_newVersion = true;
				window.showWarn('Есть более свежая версия КриптоПро ЭЦП браузер плагина.');
			}
		});
	}

	function GetLatestVersion_Async(CurrentPluginVersion) {
		VersionCompare_Async(self.m_cryptoproPluginVersion, CurrentPluginVersion);
		/*
		var xmlhttp = CommonHelper.createCORS();
		xmlhttp.open("GET", self.PLUGIN_LAST_VERSION_URL, true);
		xmlhttp.withCredentials = true;
		xmlhttp.onreadystatechange = function() {
			var PluginBaseVersion;
			if (xmlhttp.readyState == 4) {
				if(xmlhttp.status == 200) {
					PluginBaseVersion = xmlhttp.responseText;
					VersionCompare_Async(PluginBaseVersion, CurrentPluginVersion)
				}
			}
		}
		xmlhttp.send(null);
		*/
	}

	window.showTempNote("КриптоПро ЭЦП браузер плагин загружен.",null,this.MES_LOAD_SUCCESS_TIMEOUT);
    
	cadesplugin.async_spawn(function *() {
		var oAbout = yield cadesplugin.CreateObjectAsync("CAdESCOM.About");
		var current_version = yield oAbout.PluginVersion;
		self.m_pluginVersion = (yield current_version.toString());
		self.m_cspName = yield oAbout.CSPName(75);
		var ver = yield oAbout.CSPVersion("", 75);
		self.m_cspVersion = (yield ver.MajorVersion) + "." + (yield ver.MinorVersion) + "." + (yield ver.BuildVersion);
		GetLatestVersion_Async(current_version);
		self.fillCertList_Async();		
	}); //cadesplugin.async_spawn
}

CadesAPI.prototype.getFullInfoFromCert_Async = function(certInf,callBack){
	var self = this;
	cadesplugin.async_spawn(function *(args) {
		if (args[0].owner)return;
	
		var Adjust = new CertificateAdjuster();

		args[0].validToDate = new Date((yield args[0].cert.ValidToDate));
		args[0].validFromDate = new Date((yield args[0].cert.ValidFromDate));
		var Validator;
		args[0].isValid = false;
		//если попадется сертификат с неизвестным алгоритмом
		//тут будет исключение. В таком сертификате просто пропускаем такое поле
		try {
		    Validator = yield args[0].cert.IsValid();
		    args[0].isValid = yield Validator.Result;
		} catch(e) {

		}
		args[0].hasPrivateKey = yield args[0].cert.HasPrivateKey();

		args[0].owner = Adjust.GetCertName(yield args[0].cert.SubjectName);
		args[0].ownerFirstName = Adjust.GetSubjectFirstName(yield args[0].cert.SubjectName);
		args[0].ownerSecondName = Adjust.GetSubjectSecondName(yield args[0].cert.SubjectName);
		args[0].issuer = Adjust.GetIssuer(yield args[0].cert.IssuerName);
		
		var pubKey = yield args[0].cert.PublicKey();
		var algo = yield pubKey.Algorithm;
		args[0].algorithm = yield algo.FriendlyName;
		/*nn = yield algo.Name;
		ll = yield pubKey.Length;
		console.log("*** AlgorName="+nn+" Length="+ll+" friendlyName="+args[0].algorithm)
		*/
		if( args[0].hasPrivateKey ) {
		    var oPrivateKey = yield args[0].cert.PrivateKey;
		    args[0].providerName = yield oPrivateKey.ProviderName;
		}
		
		self.setValidationStr(args[0]);
		//callback
		args[1]();
		
	}, certInf,callBack);//cadesplugin.async_spawn		
}

CadesAPI.prototype.fillCertList_Async = function() {
	var self = this;
	
	cadesplugin.async_spawn(function *() {
	
		self.m_certContainer = [];
	
		var MyStoreExists = true;
		try {
			var oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
			if (!oStore) {
			throw new Error("Create store failed");
			}

			yield oStore.Open();
		}
		catch (ex) {
			MyStoreExists = false;
		}

		var certCnt;
		var certs;
		if (MyStoreExists) {
			try {
				certs = yield oStore.Certificates;
				certCnt = yield certs.Count;
			}
			catch (ex) {
				throw new Error("Ошибка при получении Certificates или Count: " + cadesplugin.getLastError(ex));
			}
			for (var i = 1; i <= certCnt; i++) {
				var cert_inf = {};
				try {
					cert_inf.cert = yield certs.Item(i);
				}
				catch (ex) {
					throw new Error("Ошибка при перечислении сертификатов: " + cadesplugin.getLastError(ex));
				}

				try {
					cert_inf.validFromDate = new Date((yield cert_inf.cert.ValidFromDate));
					cert_inf.validToDate = new Date((yield cert_inf.cert.ValidToDate));
					var adj = new CertificateAdjuster();
					cert_inf.descr = adj.GetCertInfoString(yield cert_inf.cert.SubjectName, cert_inf.validFromDate, cert_inf.validToDate);
					cert_inf.SNILS = adj.GetSubjectSNILS(yield cert_inf.cert.SubjectName);
					cert_inf.thumbprint = (yield cert_inf.cert.Thumbprint);
				}
				catch (ex) {
					window.showError("Ошибка при получении свойства SubjectName: " + cadesplugin.getLastError(ex));
				}
				try {
					cert_inf.isFromCont = false;					
				}
				catch (ex) {
					window.showError("Ошибка при получении свойства Thumbprint: " + cadesplugin.getLastError(ex));
				}
				self.m_certContainer.push(cert_inf)
			}

			yield oStore.Close();
		}

		//В версии плагина 2.0.13292+ есть возможность получить сертификаты из 
		//закрытых ключей и не установленных в хранилище
		try {
		    yield oStore.Open(cadesplugin.CADESCOM_CONTAINER_STORE);
		    certs = yield oStore.Certificates;
		    certCnt = yield certs.Count;
		    for (var i = 1; i <= certCnt; i++) {
			var cert_inf = {
				"cert":yield certs.Item(i)
			};
			//Проверяем не добавляли ли мы такой сертификат уже?
			var found = false;
			for (var j = 0; j < self.m_certContainer.length; j++)
			{
			    if ((yield self.m_certContainer[j].cert.Thumbprint) === (yield cert_inf.cert.Thumbprint))
			    {
			        found = true;
			        break;
			    }
			}
			if(found)
			    continue;
			    
			cert_inf.validFromDate = new Date((yield cert_inf.cert.ValidFromDate));
			cert_inf.validToDate = new Date((yield cert_inf.cert.ValidToDate));
			var adj = new CertificateAdjuster();
			cert_inf.descr = adj.GetCertInfoString(yield cert_inf.cert.SubjectName, cert_inf.validFromDate,cert_inf.validToDate);
			cert_inf.SNILS = adj.GetSubjectSNILS(yield cert_inf.cert.SubjectName);
			cert_inf.thumbprint = (yield cert_inf.cert.Thumbprint);
			self.m_certContainer.push(cert_inf);
			
		    }
		    yield oStore.Close();

		}
		catch (ex) {
		}
		
		self.m_certListFilled = true;
		if (self.m_onCertListFilled)self.m_onCertListFilled();
		
    });//cadesplugin.async_spawn
}

CadesAPI.prototype.signFile_Async = function(fileToSign, certObject,documentName,verify,onOk,onError,onProgress) {
	var self = this;
	cadesplugin.async_spawn(function*(arg) {
		var fileToSign = arg[0];
		var certificate = arg[1];
		var documentName = arg[2];
		var verify = arg[3];
		var onOk = arg[4];
		var onError = arg[5];
		var onProgress = arg[6];
		
		var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
	
		var chunks = Math.ceil(fileToSign.size / self.m_chunkSize);
		self.m_signChunks+= chunks;
		self.m_signCount++;
		
		var currentChunk = 0;
	
		var oHashedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.HashedData");
		yield oHashedData.propset_DataEncoding(self.CADESCOM_BASE64_TO_BINARY);
		var pubKey = yield certObject.PublicKey();
		var algo = yield pubKey.Algorithm;
		var algorithm = yield algo.Value;
		var hash_alg = self.getAlgorithmOnPubKeyAlg(algorithm);
		yield oHashedData.propset_Algorithm(hash_alg);		
		
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
			
				var ok_callback;
				if (verify){
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
				self.signHash_Async(oHashedData,certObject,documentName,ok_callback,onError);
			}
		}; 
		
		function loadNext() {
			var fileReader = new FileReader();
			fileReader.onload = frOnload;
			fileReader.onerror = frOnerror;

			var start = currentChunk * self.m_chunkSize;			
			var end = ((start + self.m_chunkSize) >= fileToSign.size) ? fileToSign.size : start + self.m_chunkSize;
			
			fileReader.readAsDataURL(blobSlice.call(fileToSign, start, end));
		};  
		
		loadNext();
		               
	}, fileToSign, certObject,documentName,verify,onOk,onError,onProgress); //cadesplugin.async_spawn
}

CadesAPI.prototype.signHash_Async = function(oHashedData,certObject,documentName,onOk,onError) {
	var self = this;
	cadesplugin.async_spawn(function*(arg) {
		var oHashedData = arg[0];
		var certificate = arg[1];
		var documentName = arg[2];
		var onOk = arg[3];
		var onError = arg[4];

		var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
		//signing attrs
		var oSigningTimeAttr = yield cadesplugin.CreateObjectAsync("CADESCOM.CPAttribute");
		yield oSigningTimeAttr.propset_Name(self.CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME);
		var signDate = new Date();
		oTimeNow = signDate;
		if (CommonHelper.isIE()){
			oTimeNow = oTimeNow.getVarDate();
		}
		yield oSigningTimeAttr.propset_Value(oTimeNow);
		var attr = yield oSigner.AuthenticatedAttributes2;
		yield attr.Add(oSigningTimeAttr);

		var oDocumentNameAttr = yield cadesplugin.CreateObjectAsync("CADESCOM.CPAttribute");
		yield oDocumentNameAttr.propset_Name(self.CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME);
		yield oDocumentNameAttr.propset_Value(documentName);
		yield attr.Add(oDocumentNameAttr);
		
		yield oSigner.propset_Certificate(certificate);

		var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
		yield oSignedData.propset_ContentEncoding(self.CADESCOM_BASE64_TO_BINARY);
		if (typeof(self.m_setDisplayData) != 'undefined'){
			//Set display data flag flag for devices like Rutoken PinPad
			yield oSignedData.propset_DisplayData(self.m_setDisplayData);
		}
		
		yield oSigner.propset_Options(self.getIncludeCertificate());
		
		try {
			//throw new Error("Имитация ошибки при подписании!")
			var signature = yield oSignedData.SignHash(oHashedData,oSigner, self.getCadesType());
			onOk(signature,signDate);			
		}
		catch (err) {
			onError("Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err));
		}

	}, oHashedData,certObject,documentName,onOk,onError); //cadesplugin.async_spawn		
}

/*
 * @param {object} check_result,error_str
 */
CadesAPI.prototype.verifySignatureOnHash_Async = function(oHashedData, sSignedMessage,callBack) {	
	var self = this;
	cadesplugin.async_spawn(function*(arg) {
		var oHashedData = arg[0];
		var sSignedMessage = arg[1];
		var callBack = arg[2];
		
		var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");

		var res = {
			"check_result":true
		};
		// Проверяем подпись
		try {
			yield oSignedData.VerifyHash(oHashedData, sSignedMessage, self.getCadesType());
		}
		catch (err) {
			res.error_str = cadesplugin.getLastError(err);
			res.check_result = false;
		}

		callBack(res);
		
	}, oHashedData,sSignedMessage,callBack); //cadesplugin.async_spawn				
}

