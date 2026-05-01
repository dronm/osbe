function CheckForPlugIn_Async(certListIdPref) {
    function VersionCompare_Async(StringVersion, ObjectVersion){
        if(typeof(ObjectVersion) == "string")
            return -1;
        var arr = StringVersion.split('.');
        var isActualVersion = true;

        cadesplugin.async_spawn(function *() {
            if((yield ObjectVersion.MajorVersion) == parseInt(arr[0]))
            {
                if((yield ObjectVersion.MinorVersion) == parseInt(arr[1]))
                {
                    if((yield ObjectVersion.BuildVersion) == parseInt(arr[2]))
                    {
                        isActualVersion = true;
                    }
                    else if((yield ObjectVersion.BuildVersion) < parseInt(arr[2]))
                    {
                        isActualVersion = false;
                    }
                }else if((yield ObjectVersion.MinorVersion) < parseInt(arr[1]))
                {
                    isActualVersion = false;
                }
            }else if((yield ObjectVersion.MajorVersion) < parseInt(arr[0]))
            {
                isActualVersion = false;
            }

            if(!isActualVersion)
            {
            	window.showWarn("КриптоПро ЭЦП браузер плагин загружен, но есть более свежая версия.");
            }
            document.getElementById(certListIdPref+':PlugInVersionTxt').innerHTML = "Версия плагина: " + (yield CurrentPluginVersion.toString());
            var oAbout = yield cadesplugin.CreateObjectAsync("CAdESCOM.About");
            var ver = yield oAbout.CSPVersion("", 75);
            var ret = (yield ver.MajorVersion) + "." + (yield ver.MinorVersion) + "." + (yield ver.BuildVersion);
            document.getElementById(certListIdPref+':CSPVersionTxt').innerHTML = "Версия криптопровайдера: " + ret;

            try
            {
                var sCSPName = yield oAbout.CSPName(75);
                document.getElementById(certListIdPref+':CSPNameTxt').innerHTML = "Криптопровайдер: " + sCSPName;
            }
            catch(err){}
            return;
        });
    }

    function GetLatestVersion_Async(CurrentPluginVersion) {
        var xmlhttp = CommonHelper.createXHR();
        xmlhttp.open("GET", "https://www.cryptopro.ru/sites/default/files/products/cades/latest_2_0.txt", true);
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
    }

    window.showNote("КриптоПро ЭЦП браузер плагин загружен.");
    
    var CurrentPluginVersion;
    cadesplugin.async_spawn(function *() {
        var oAbout = yield cadesplugin.CreateObjectAsync("CAdESCOM.About");
        CurrentPluginVersion = yield oAbout.PluginVersion;
        GetLatestVersion_Async(CurrentPluginVersion);
        FillCertList_Async(certListIdPref+":certListBox");
        // var txtDataToSign = "Hello World";
        // document.getElementById("DataToSignTxtBox").innerHTML = txtDataToSign;
        // document.getElementById("SignatureTxtBox").innerHTML = "";
    }); //cadesplugin.async_spawn
}

function onCertificateSelected(event) {
    cadesplugin.async_spawn(function *(args) {
        var selectedCertID = args[0].selectedIndex;
        var certificate = global_selectbox_container[selectedCertID];
        FillCertInfo_Async(certificate, event.target.boxId, global_isFromCont[selectedCertID]);
    }, event.target);//cadesplugin.async_spawn
}

function FillCertList_Async(lstId) {
    cadesplugin.async_spawn(function *() {
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

        var lst = document.getElementById(lstId);
        if(!lst)
        {
            return;
        }
        lst.onchange = onCertificateSelected;
        lst.boxId = lstId;

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
                var cert;
                try {
                    cert = yield certs.Item(i);
                }
                catch (ex) {
                	throw new Error("Ошибка при перечислении сертификатов: " + cadesplugin.getLastError(ex));
                }

                var oOpt = document.createElement("OPTION");
                var dateObj = new Date();
                try {
                    var ValidFromDate = new Date((yield cert.ValidFromDate));
                    oOpt.text = new CertificateAdjuster().GetCertInfoString(yield cert.SubjectName, ValidFromDate);
                }
                catch (ex) {
                    window.showError("Ошибка при получении свойства SubjectName: " + cadesplugin.getLastError(ex));
                }
                try {
                    //oOpt.value = yield cert.Thumbprint;
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

            yield oStore.Close();
        }

        //В версии плагина 2.0.13292+ есть возможность получить сертификаты из 
        //закрытых ключей и не установленных в хранилище
        try {
            yield oStore.Open(cadesplugin.CADESCOM_CONTAINER_STORE);
            certs = yield oStore.Certificates;
            certCnt = yield certs.Count;
            for (var i = 1; i <= certCnt; i++) {
                var cert = yield certs.Item(i);
                //Проверяем не добавляли ли мы такой сертификат уже?
                var found = false;
                for (var j = 0; j < global_selectbox_container.length; j++)
                {
                    if ((yield global_selectbox_container[j].Thumbprint) === (yield cert.Thumbprint))
                    {
                        found = true;
                        break;
                    }
                }
                if(found)
                    continue;
                var oOpt = document.createElement("OPTION");
                var ValidFromDate = new Date((yield cert.ValidFromDate));
                var ValidToDate = new Date((yield cert.ValidToDate));
                oOpt.text = new CertificateAdjuster().GetCertInfoString(yield cert.SubjectName, ValidFromDate,ValidToDate);
                oOpt.value = global_selectbox_counter;
                global_selectbox_container.push(cert);
                global_isFromCont.push(true);
                global_selectbox_counter++;
                lst.options.add(oOpt);
            }
            yield oStore.Close();

        }
        catch (ex) {
        }
        /*
        if(global_selectbox_container.length == 0) {
            document.getElementById("boxdiv").style.display = '';
        }
        */
    });//cadesplugin.async_spawn
}

function FillCertInfo_Async(certificate, certBoxId, isFromContainer)
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
    cadesplugin.async_spawn (function*(args) {
        var Adjust = new CertificateAdjuster();

        var ValidToDate = new Date((yield args[0].ValidToDate));
        var ValidFromDate = new Date((yield args[0].ValidFromDate));
        var Validator;
        var IsValid = false;
        //если попадется сертификат с неизвестным алгоритмом
        //тут будет исключение. В таком сертификате просто пропускаем такое поле
        try {
            Validator = yield args[0].IsValid();
            IsValid = yield Validator.Result;
        } catch(e) {

        }
        var hasPrivateKey = yield args[0].HasPrivateKey();
        var Now = new Date();

        document.getElementById(args[1]).style.display = '';
        document.getElementById(args[2] + "subject").innerHTML = "Владелец: <b>" + Adjust.GetCertName(yield args[0].SubjectName) + "<b>";
        document.getElementById(args[2] + "issuer").innerHTML = "Издатель: <b>" + Adjust.GetIssuer(yield args[0].IssuerName) + "<b>";
        document.getElementById(args[2] + "from").innerHTML = "Выдан: <b>" + Adjust.GetCertDate(ValidFromDate) + "<b>";
        document.getElementById(args[2] + "till").innerHTML = "Действителен до: <b>" + Adjust.GetCertDate(ValidToDate) + "<b>";
        var pubKey = yield args[0].PublicKey();
        var algo = yield pubKey.Algorithm;
        var fAlgoName = yield algo.FriendlyName;
        document.getElementById(args[2] + "algorithm").innerHTML = "Алгоритм ключа: <b>" + fAlgoName + "<b>";
        if( hasPrivateKey ) {
            var oPrivateKey = yield args[0].PrivateKey;
            var sProviderName = yield oPrivateKey.ProviderName;
            document.getElementById(args[2] + "provname").innerHTML = "Криптопровайдер: <b>" + sProviderName + "<b>";
        }
        if(Now < ValidFromDate) {
            document.getElementById(args[2] + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Срок действия не наступил</b></span>";
        } else if( Now > ValidToDate){
            document.getElementById(args[2] + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Срок действия истек</b></span>";
        } else if( !hasPrivateKey ){
            document.getElementById(args[2] + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Нет привязки к закрытому ключу</b></span>";
        } else if( !IsValid ){
            document.getElementById(args[2] + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Ошибка при проверке цепочки сертификатов</b></span>";         
        } else {
            document.getElementById(args[2] + "status").innerHTML = "Статус: <b> Действителен<b>";
        }

        if(args[3])
        {
            document.getElementById(field_prefix + "location").innerHTML = "Установлен в хранилище: <b>Нет</b>";            
        } else {
            document.getElementById(field_prefix + "location").innerHTML = "Установлен в хранилище: <b>Да</b>";
        }

    }, certificate, BoxId, field_prefix, isFromContainer);//cadesplugin.async_spawn
}

function CertificateAdjuster()
{
}

CertificateAdjuster.prototype.extract = function(from, what)
{
    certName = "";

    var begin = from.indexOf(what);

    if(begin>=0)
    {
        var end = from.indexOf(', ', begin);
        certName = (end<0) ? from.substr(begin) : from.substr(begin, end - begin);
    }

    return certName;
}

CertificateAdjuster.prototype.Print2Digit = function(digit)
{
    return (digit<10) ? "0"+digit : digit;
}

CertificateAdjuster.prototype.GetCertDate = function(paramDate)
{
    var certDate = new Date(paramDate);
    return this.Print2Digit(certDate.getUTCDate())+"."+this.Print2Digit(certDate.getMonth()+1)+"."+certDate.getFullYear() + " " +
             this.Print2Digit(certDate.getUTCHours()) + ":" + this.Print2Digit(certDate.getUTCMinutes()) + ":" + this.Print2Digit(certDate.getUTCSeconds());
}

CertificateAdjuster.prototype.GetCertName = function(certSubjectName)
{
    return this.extract(certSubjectName, 'CN=');
}

CertificateAdjuster.prototype.GetIssuer = function(certIssuerName)
{
    return this.extract(certIssuerName, 'CN=');
}

CertificateAdjuster.prototype.GetCertInfoString = function(certSubjectName, certFromDate, certToDate)
{
    return this.extract(certSubjectName,'CN=') + ", до "+this.GetCertDate(certToDate);
}

