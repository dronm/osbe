/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @class
 * @classdesc
 
 */
function CertificateAdjuster(){
}

/* Constants */


/* private members */

CertificateAdjuster.prototype.extract = function(from, what){
	certName = "";

	var begin = from.indexOf(what);

	if(begin>=0){
		begin+= what.length;
		var end = from.indexOf(", ", begin);
		certName = (end<0) ? from.substr(begin) : from.substr(begin, end - begin);
	}

	return certName;
}

CertificateAdjuster.prototype.Print2Digit = function(digit){
    return (digit<10) ? "0"+digit : digit;
}

CertificateAdjuster.prototype.GetCertDate = function(paramDate){
    var certDate = new Date(paramDate);
    return this.Print2Digit(certDate.getUTCDate())+"."+this.Print2Digit(certDate.getMonth()+1)+"."+certDate.getFullYear() + " " +
             this.Print2Digit(certDate.getUTCHours()) + ":" + this.Print2Digit(certDate.getUTCMinutes()) + ":" + this.Print2Digit(certDate.getUTCSeconds());
}

/* protected*/


/* public methods */

CertificateAdjuster.prototype.GetCertName = function(certSubjectName){
    return this.extract(certSubjectName, "CN=");
}

CertificateAdjuster.prototype.GetSubjectFirstName = function(certSubjectName){
    return this.extract(certSubjectName, "SN=");
}

CertificateAdjuster.prototype.GetSubjectSecondName = function(certSubjectName){
    return this.extract(certSubjectName, "G=");
}

CertificateAdjuster.prototype.GetSubjectSNILS = function(certSubjectName){
    return this.extract(certSubjectName, "SNILS=");
}

CertificateAdjuster.prototype.GetIssuer = function(certIssuerName){
    return this.extract(certIssuerName, "CN=");
}

CertificateAdjuster.prototype.GetCertInfoString = function(certSubjectName, certFromDate, certToDate){
	var f_name = this.GetSubjectFirstName(certSubjectName);
	var s_name = this.GetSubjectSecondName(certSubjectName);
	return this.GetCertName(certSubjectName) + ", "+(f_name? f_name+" ":"")+(s_name? s_name:"")+ ", до "+this.GetCertDate(certToDate);
}

