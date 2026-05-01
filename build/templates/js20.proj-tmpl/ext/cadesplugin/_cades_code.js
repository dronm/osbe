var global_selectbox_container = new Array();
var global_isFromCont = new Array();
var global_selectbox_counter = 0;

function Common_CheckForPlugIn(logLevel) {
	logLevel = logLevel || cadesplugin.LOG_LEVEL_DEBUG; 
	cadesplugin.set_log_level(cadesplugin.LOG_LEVEL_DEBUG);
	var canAsync = !!cadesplugin.CreateObjectAsync;
	if(canAsync){
		return CheckForPlugIn_Async(certListIdPref);
		/*
		include_async_code().then(function(){
			alert("Async model loaded calling CheckForPlugIn_Async")
		    return CheckForPlugIn_Async();
		});
		*/
	}
	else{
		return CheckForPlugIn_NPAPI();
	}
}

function CheckForPlugIn_NPAPI() {

    function VersionCompare_NPAPI(StringVersion, ObjectVersion)
    {
        if(typeof(ObjectVersion) == "string")
            return -1;
        var arr = StringVersion.split('.');

        if(ObjectVersion.MajorVersion == parseInt(arr[0]))
        {
            if(ObjectVersion.MinorVersion == parseInt(arr[1]))
            {
                if(ObjectVersion.BuildVersion == parseInt(arr[2]))
                {
                    return 0;
                }
                else if(ObjectVersion.BuildVersion < parseInt(arr[2]))
                {
                    return -1;
                }
            }else if(ObjectVersion.MinorVersion < parseInt(arr[1]))
            {
                return -1;
            }
        }else if(ObjectVersion.MajorVersion < parseInt(arr[0]))
        {
            return -1;
        }

        return 1;
    }

    function GetCSPVersion_NPAPI() {
        try {
           var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
        } catch (err) {
        	throw new Error('Failed to create CAdESCOM.About: ' + cadesplugin.getLastError(err));
        }
        var ver = oAbout.CSPVersion("", 75);
        return ver.MajorVersion + "." + ver.MinorVersion + "." + ver.BuildVersion;
    }

    function GetCSPName_NPAPI() {
        var sCSPName = "";
        try {
            var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
            sCSPName = oAbout.CSPName(75);

        } catch (err) {
        }
        return sCSPName;
    }

    function ShowCSPVersion_NPAPI(CurrentPluginVersion)
    {
        if(typeof(CurrentPluginVersion) != "string")
        {
            document.getElementById(certListIdPref+':CSPVersionTxt').innerHTML = "Версия криптопровайдера: " + GetCSPVersion_NPAPI();
        }
        var sCSPName = GetCSPName_NPAPI();
        if(sCSPName!="")
        {
            document.getElementById(certListIdPref+':CSPNameTxt').innerHTML = "Криптопровайдер: " + sCSPName;
        }
    }
    function GetLatestVersion_NPAPI(CurrentPluginVersion) {
        var xmlhttp = CommonHelper.createXHR();
        xmlhttp.open("GET", "https://www.cryptopro.ru/sites/default/files/products/cades/latest_2_0.txt", true);
        xmlhttp.onreadystatechange = function() {
            var PluginBaseVersion;
            if (xmlhttp.readyState == 4) {
                if(xmlhttp.status == 200) {
                    PluginBaseVersion = xmlhttp.responseText;
                    if (isPluginWorked) { // плагин работает, объекты создаются
                        if (VersionCompare_NPAPI(PluginBaseVersion, CurrentPluginVersion)<0) {
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

        window.showNote("КриптоПро ЭЦП браузер плагин загружен.");
        document.getElementById(certListIdPref+':PlugInVersionTxt').innerHTML = "Версия плагина: " + MakeVersionString(CurrentPluginVersion);
        ShowCSPVersion_NPAPI(CurrentPluginVersion);
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
    FillCertList_NPAPI(certListIdPref+":certListBox");
} 

function onCertificateSelected(event) {
    var selectedCertID = event.target.selectedIndex;
    var certificate = global_selectbox_container[selectedCertID];
    FillCertInfo_NPAPI(certificate, event.target.boxId, global_isFromCont[selectedCertID]);
}

function FillCertList_NPAPI(lstId) {
    try {
        var lst = document.getElementById(lstId);
        if(!lst)
            return;
    }
    catch (ex) {
        return;
    }

    lst.onchange = onCertificateSelected;
    lst.boxId = lstId;
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
            var cert;
            try {
                cert = oStore.Certificates.Item(i);
            }
            catch (ex) {
            	throw new Error("Ошибка при перечислении сертификатов: " + cadesplugin.getLastError(ex));
            }

            var oOpt = document.createElement("OPTION");
            try {
                    var certObj = new CertificateObj(cert, true);
                    oOpt.text = certObj.GetCertString();
            }
            catch (ex) {
                throw new Error("Ошибка при получении свойства SubjectName: " + cadesplugin.getLastError(ex));
            }
            try {
                oOpt.value = global_selectbox_counter
                global_selectbox_container.push(cert);
                global_isFromCont.push(false);
                global_selectbox_counter++;
            }
            catch (ex) {
            	window.showError("Ошибка при получении свойства Thumbprint: " + cadesplugin.getLastError(ex));
            }

            lst.options.add(oOpt);
        }

        oStore.Close();
    }

    //В версии плагина 2.0.13292+ есть возможность получить сертификаты из 
    //закрытых ключей и не установленных в хранилище
    try {
        oStore.Open(cadesplugin.CADESCOM_CONTAINER_STORE);
        certCnt = oStore.Certificates.Count;
        for (var i = 1; i <= certCnt; i++) {
            var cert = oStore.Certificates.Item(i);
            //Проверяем не добавляли ли мы такой сертификат уже?
            var found = false;
            for (var j = 0; j < global_selectbox_container.length; j++)
            {
                if (global_selectbox_container[j].Thumbprint === cert.Thumbprint)
                {
                    found = true;
                    break;
                }
            }
            if(found)
                continue;
            var certObj = new CertificateObj(cert);
            var oOpt = document.createElement("OPTION");
            oOpt.text = certObj.GetCertString();
            oOpt.value = global_selectbox_counter
            global_selectbox_container.push(cert);
            global_isFromCont.push(true);
            global_selectbox_counter++;
            lst.options.add(oOpt);
        }
        oStore.Close();
    }
    catch (ex) {
    }
    /*
    if(global_selectbox_container.length == 0) {
        document.getElementById("boxdiv").style.display = '';
    }
    */
}
var async_code_included = 0;
var async_Promise;
var async_resolve;

function include_async_code(){
    if(async_code_included){
        return async_Promise;
    }
    
    CommonHelper.include_js("js20/ext/cadesplugin/cades_code_async.js");
    /*
    var fileref = document.createElement('script');
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", "js20/ext/cadesplugin/cades_code_async.js");
    document.getElementsByTagName("head")[0].appendChild(fileref);
    */
    async_Promise = new Promise(function(resolve, reject){
        async_resolve = resolve;
    });
    async_code_included = 1;
    return async_Promise;
}   

function FillCertInfo_NPAPI(certificate, certBoxId, isFromContainer)
{
    var BoxId;
    var field_prefix;
    if(typeof(certBoxId) == 'undefined' || certBoxId == "CertListBox")
    {
        BoxId = 'cert_info';
        field_prefix = '';
    }else if (certBoxId == "CertListBox1") {
        BoxId = 'cert_info1';
        field_prefix = 'cert_info1';
    } else if (certBoxId == "CertListBox2") {
        BoxId = 'cert_info2';
        field_prefix = 'cert_info2';
    } else {
        BoxId = certBoxId;
        field_prefix = certBoxId;
    }

    var ValidToDate = new Date(certificate.ValidToDate);
    var ValidFromDate = new Date(certificate.ValidFromDate);
    var IsValid = false;
    //если попадется сертификат с неизвестным алгоритмом
    //тут будет исключение. В таком сертификате просто пропускаем такое поле
    try {
        IsValid = certificate.IsValid().Result;    
    } catch (e) {
        
    }
    var hasPrivateKey = certificate.HasPrivateKey();
    var Now = new Date();

    var certObj = new CertificateObj(certificate);
    document.getElementById(BoxId).style.display = '';
    document.getElementById(field_prefix + "subject").innerHTML = "Владелец: <b>" + certObj.GetCertName() + "<b>";
    document.getElementById(field_prefix + "issuer").innerHTML = "Издатель: <b>" + certObj.GetIssuer() + "<b>";
    document.getElementById(field_prefix + "from").innerHTML = "Выдан: <b>" + certObj.GetCertFromDate() + "<b>";
    document.getElementById(field_prefix + "till").innerHTML = "Действителен до: <b>" + certObj.GetCertTillDate() + "<b>";
    if (hasPrivateKey) {
        document.getElementById(field_prefix + "provname").innerHTML = "Криптопровайдер: <b>" + certObj.GetPrivateKeyProviderName() + "<b>";
    }
    document.getElementById(field_prefix + "algorithm").innerHTML = "Алгоритм ключа: <b>" + certObj.GetPubKeyAlgorithm() + "<b>";
    if(Now < ValidFromDate) {
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Срок действия не наступил</b></span>";
    } else if( Now > ValidToDate){
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Срок действия истек</b></span>";
    } else if( !hasPrivateKey ){
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Нет привязки к закрытому ключу</b></span>";
    } else if( !IsValid ){
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Ошибка при проверке цепочки сертификатов</b></span>";
    } else {
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <b> Действителен<b>";
    }
    if(isFromContainer)
    {
        document.getElementById(field_prefix + "location").innerHTML = "Установлен в хранилище: <b>Нет</b>";
    } else {
        document.getElementById(field_prefix + "location").innerHTML = "Установлен в хранилище: <b>Да</b>";
    }
}

