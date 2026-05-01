/**	
 * Basic functions
 * 
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016 
 *
 * @namespace
 *
 */
var CommonHelper = {
	/**
	 * Formats a string
	 * @public
	 * @param {string} str String to  be formatted
	 * @param {array} params Array of parameters
	 * @returns string
	 */
	format: function(str,params){
		if (!str)return "";
		var r = str;
		if (typeof(params) == "string"){
			params = [params];
		}
		for (var i=0;i<params.length;i++){
			r= r.replace("%",params[i]);
		}
		return r;
	}
	
	/**
	 * Formats a number with grouped thousands
	 * original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
	 * improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	 * bugfix by: Michael White (http://crestidg.com)
	 *
	 * @public
	 * @param {number} number Number to  be formatted
	 * @param {int} decimals Number of decimal digits
	 * @param {char} [dec_point=","] Decimal point character
	 * @param {char} [thousands_sep="."] Thousand separator character
	 * @returns string
	 */
	,numberFormat: function( number, decimals, dec_point, thousands_sep ) {

		var i, j, kw, kd, km;

		// input sanitation & defaults
		if( isNaN(decimals = Math.abs(decimals)) ){
			decimals = 2;
		}
		if( dec_point == undefined ){
			dec_point = ",";
		}
		if( thousands_sep == undefined ){
			thousands_sep = ".";
		}

		i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

		if( (j = i.length) > 3 ){
			j = j % 3;
		} else{
			j = 0;
		}

		km = (j ? i.substr(0, j) + thousands_sep : "");
		kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
		//kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
		kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");

		
		if(number<0&&km==""&&kw=="0"&&kd.length){
			km= "-"+km;
		}
		
		//console.log("km="+km+" kw="+kw+" kd="+kd)
		return km + kw + kd;
	}
	
	/**
	 * Backward compatibility
	 * DO NOT USE
	*/	
	,byteForamt:function(size,precision){
		return this.byteFormat(size,precision);
	}
	
	/**
	 * Formats byte
	 * @public
	 * @param {number} size Bytes to be formatted
	 * @param {int} precision Number of decimal digits
	 * @returns string
	 */	
	,byteFormat:function(size,precision,rightPad){
		precision = (precision==undefined)? 2:precision;
		var i = Math.floor( Math.log(size) / Math.log(1024) );
		return ( size / Math.pow(1024, i) ).toFixed(precision) * 1 + (rightPad? " ":"") + ['B', 'kB', 'MB', 'GB', 'TB'][i];
	}
	
	/**
	 * Formats date, using the folowing parameters:
	 * 	d - two digits date 01
	 *	j - date 1 digit
	 *	F - string representation of the month in supplied locale
	 *	FF - string representation of the month in supplied locale
	 *	m - two digits months 02
	 *	n - month 1
	 *	Y - four digits year 2000
	 *	y - two digits year 00
	 *	H - two digits hour
	 *	i - two digits minute
	 *	s - two digits second
	 *	u - two digits millisecond
	 *	l - day of week string descriptin
	 *	
	 * @param {date} dt - date object for formatting (or string for strtotime???)
	 * @param {string} [fs=DEF_FORMAT] - Format string
	 * @param {string} localeId
	 * @returns date
	 */
	,dateFormat:function(dt,fs,localeId){
		var add_zero = function(arg){
			var s = arg.toString();
			return ((s.length<2)? "0":"")+s;
		};
		/*if(typeof(dt) == "string"){
			dt = this.strtotime(dt);
		}*/
		if (!dt || !dt.getDate){
			//throw Error("DateHelper.format Invalid date "+dt);
			return "";
		}
		
		if (!fs){
			fs = "Y-m-dTH:i:s";
		}
		var s;
		
		//for days
		s = fs.replace(/d/,add_zero(dt.getDate()));
		s = s.replace(/j/,dt.getDate());
		
		//for month
		s = s.replace(/FF/,DateHelper.MON_LIST[dt.getMonth()]);
		s = s.replace(/F/,DateHelper.MON_DATE_LIST[dt.getMonth()]);		
		s = s.replace(/l/,DateHelper.WEEK_LIST[dt.getDay()]);
		s = s.replace(/m/,add_zero(dt.getMonth()+1));
		s = s.replace(/n/,dt.getMonth()+1);
		
		//for year
		s = s.replace(/Y/,dt.getFullYear());
		s = s.replace(/y/,dt.getFullYear()-2000);
		
		//hour
		s = s.replace(/H/,add_zero(dt.getHours()));					
		//minutes
		s = s.replace(/i/,add_zero(dt.getMinutes()));
		//sec
		s = s.replace(/s/,add_zero(dt.getSeconds()));
		//msec
		s = s.replace(/u/,add_zero(dt.getMilliseconds()));
		//console.log("DateHelper.format dt="+dt+" fs="+fs+" res="+s)
		return s;
	}
	
	,maskFormat:function(val,mask){
		var input = new Control(null,"INPUT",{"attrs":{"value":val},"visible":false});
		$(input.getNode()).mask(mask);
		return input.m_node.value;
	}
	
	/**
	 * Backward compatibility
	 * DO NOT USE
	 * @public
	 * @param {string} x
	 * @param {document} docum
	 * @returns Node
	 */		
	,nd: function(x,docum){
		if (docum==undefined){
			docum = window.document;
		}	
		return (x)? docum.getElementById(x):null;
	}
	
	/**
	 * Returns true if it is Internet Explorer
	 * @public
	 * @returns bool	 
	 */		
	,isIE: function(){
		//return (navigator.appName=="Microsoft Internet Explorer");
		var browserSpecs = this.getBrowser();
		return (browserSpecs.name == 'IE' || browserSpecs.name == 'MSIE');
	}
	
	/**
	 * Returns Internet Explorer version
	 * @public
	 * @returns string	 
	 */			
	,getIEVersion: function () {
		var browserSpecs = this.getBrowser();
		return browserSpecs.version;
		//return parseInt(navigator.userAgent.toLowerCase().split('msie')[1]);
	}

	/**
	 * Returns Browser type
	 * @public
	 * @returns {name,version}	 
	 */			
	,getBrowser: function (){ 
		var ua= navigator.userAgent, tem, M= ua.match(/(opera|chrome|safari|firefox|msie|yabrowser|trident(?=\/))\/?\s*(\d+)/i) || [];
		if(/trident/i.test(M[1])){
		    tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
		    return {name:'IE',version:(tem[1] || '')};
		}
		if(M[1]=== 'Chrome'){
		    tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
		    if(tem!= null) return {name:tem[1].replace('OPR', 'Opera'),version:tem[2]};
		}
		M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
		if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
		return {name:M[0],version:M[1]};
	}
	
	/**
	 * Returns XHR object 
	 * @public
	 * @returns object	 
	 */			
	,createXHR: function(){
		var xhr;
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		}
		else{
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		return xhr;
	}
	
	/**
	 * Returns CORS object for local queries
	 * @public
	 * @returns object	 
	 */			
	,createCORS: function(){
		var xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) {
		    // Check if the XMLHttpRequest object has a "withCredentials" property.
		    // "withCredentials" only exists on XMLHTTPRequest2 objects.
		}
		else if (typeof XDomainRequest != "undefined") {
		    // Otherwise, check if XDomainRequest.
		    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
		    xhr = new XDomainRequest();
		}
		else {
			// Otherwise, CORS is not supported by the browser.
			xhr = null;
			throw new Error("CORS is not supported by the browser");

		}
		return xhr;
	}
			
	/**
	 * Returns true if given object is empty
	 * @public
	 * @param {object} x
	 * @returns bool	 
	 */			
	,isEmpty:function(x,p){
		for(p in x)return!1;return!0;
	}
	
	/**
	 * Returns true if argument is an array
	 * @public
	 * @param {object} o
	 * @returns bool	 
	 */			
	,isArray: function (o){ 
		if (Array.isArray){
			return Array.isArray(o);
		}
		else{
			return (Object.prototype.toString.call(o) === '[object Array]' );
		}
	}
	
	/**
	 * Returns a copy of object
	 * @public
	 * @param {object} o
	 * @returns object	 
	 */			
	,clone: function (obj) {
		var F = function () {};
	        F.prototype = obj;
        	return new F();		
	}

	/**
	 * Returns unique identifier
	 * @public
	 * @returns string	 
	 */			
	,uniqid: function (){
	   var chars = '0123456789abcdef'.split('');

	   var uuid = [], rnd = Math.random, r;
	   uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	   uuid[14] = '4'; // version 4

	   for (var i = 0; i < 36; i++){
		  if (!uuid[i]){
			 r = 0 | rnd()*16;

			 uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
		  }
	   }
	   return uuid.join('');
	}
	
	/**
	 * Deprecated, use serialize
	 */
	,array2json: function (arr) {
		return JSON.stringify(arr);
	}

	/**
	 * Deprecated, use unserialize
	 */
	,json2obj: function (json_string) {
		return (json_string)? JSON.parse(json_string):json_string;
		//return eval("(" + json_string + ")");
	}
	
	/**
	 * Object serialization
	 * @public
	 * @param {object} o
	 * @returns string
	 */
	,serialize:function(o){
		if(typeof(o)==="string"){
			return o;
		}
		else if(typeof(o)==="number"||typeof(o)==="boolean"){
			return o.toString();
		}
		else if(typeof(o)==="object" && DateHelper.isValidDate(o)){
			if(window["FieldDateTimeTZ"]){
				return (FieldDateTimeTZ({"value":o})).getValueXHR();
				
			}
			else{
				return o;
			}
		}
		else{
			return JSON.stringify(o);
		}
	}
	
	/**
	 * Object deserialization
	 * RefType can be returned if object has descr&&keys properties
	 * @public
	 * @param {string} json_string
	 * @returns string
	 */
	,unserialize:function(json_string){
	//console.log(json_string)
		return (json_string&&typeof(json_string)=="string"&&json_string.length&&(json_string.substring(0,1)=="{"||json_string.substring(0,1)=="["))? JSON.parse(json_string,function(key,val){
			if (val && typeof val=="object" && "descr" in val && "keys" in val){
				if("dataType" in val && window[val.dataType]){
					val = new window[val.dataType](val);
				}
				else{
					val = new RefType(val);
				}
			}						
			return val;
		}):json_string;
	}
	
	/**
	 * @public
	 * @param {object} obj
	 * @returns int
	 */
	,findPosX: function (obj) {
	    var curleft = 0;
	    if (obj.offsetParent) {
		while (1) {
		    curleft+=obj.offsetLeft;
		    if (!obj.offsetParent) {
		        break;
		    }
		    obj=obj.offsetParent;
		}
	    } else if (obj.x) {
		curleft+=obj.x;
	    }
	    return curleft;
	}

	/**
	 * @public
	 * @param {object} obj
	 * @returns int
	 */
	,findPosY: function(obj) {
	    var curtop = 0;
	    if (obj.offsetParent) {
		while (1) {
		    curtop+=obj.offsetTop;
		    if (!obj.offsetParent) {
		        break;
		    }
		    obj=obj.offsetParent;
		}
	    } else if (obj.y) {
		curtop+=obj.y;
	    }
	    return curtop;
	}
	
	/**
	 * returns default locale decimal separator
	 * @public
	 * @returns char
	 */
	,getDecimalSeparator: function() {
	    var n = 1.1;
	    n = n.toLocaleString().substring(1, 2);
	    return n;
	}
	
	/**
	 * returns string with double quotes escaped
	 * https://gist.github.com/getify/3667624
	 * @public
	 * @param {string} str
	 * @returns string
	 */	 
	,escapeDoubleQuotes:function(str) {
		return str.replace(/\\([\s\S])|(")/g,"\\$1$2"); // thanks @slevithan!
	}
	
	/**
	 * returns default locale decimal separator
	 * @author Author: Maverick Chan
	 * @public
	 * @returns string
	 */
	//usage:longString(function () {/* very long multyline string */})
	,longString:function(funcWrapper) {
		var funcString = funcWrapper.toString();
		var funcDefinitionRe
		    = /^function\s*[a-zA-Z0-9_$]*\s*\(\s*\)\s*{\s*\/\*([\s\S]*)\*\/\s*}\s*$/g;

		var wantedString = funcString.replace(funcDefinitionRe, "$1").trim();
		return wantedString;
	}
	
	/**
	 * Merges two structures
	 * @public
	 * @param {object} o1 This object will be modified
	 * @param {object} o2
	 */	 
	,merge:function(o1,o2){
		for (var id in o2){
			o1[id] = o2[id];
		}
	}

	/**
	 * Deprecated, use in DOMHelper
	 */	 
	,getClassName:function(o){
	        return Object.prototype.toString.call(o).match(/^\[object\s(.*)\]$/)[1];
	}
	
	/**
	 * Returns md5 hash of a string
	 * @public
	 * @param {string} s
	 * @returns string
	 */	 
	,md5:function(s){
		return hex_md5(s);
	}
	
	/**
	 * Returns true if date exists in array
	 * @public
	 * @param {string} s
	 * @returns int position or -1	 
	 */
	,dateInArray: function(needle, haystack) {
		for (var i = 0; i < haystack.length; i++) {
			if (needle.getTime() === haystack[i].getTime()) {
				return i;
			}
		}
		return -1;
	}	
	/**	
	 * Returns all DOM nodes on attribute value
	 * @public
	 * @returns {array} - array of DOMNodes
	 
	 * @param {string} classStr - list of attribute values separated by space
	 * @param {DOMNode} node - node for searching
	 * @param {string} attrName - atrib name for searching
	 * @param {bool} uniq - if true, only first value will be retrieved
	 * @param {string} tag - constrains search to a specific tag name
	 */						
	,getElementsByAttr:function(classStr, node, attrName, uniq,tag) {
		if(typeof(node)=="string"){
			node = document.getElementById(node);
		}		
		tag = tag || "*";
		var node = node || document;
		var list = node.getElementsByTagName(tag);
		var length = list.length;
		var classArray = classStr.split(/\s+/);
		var classes = classArray.length;
		var result = new Array();
		for(var i = 0; i < length; i++) {
			if (uniq && result.length>0)break;
			for(var j = 0;j<classes;j++)  {
				if (
					((attrName=='class')&&(list[i].className!=undefined
					&& typeof list[i].className=='string')
						&&(list[i].className.search('\\b' + classArray[j] + '\\b') != -1))
					||
					((list[i].attributes!=undefined)
				&&(list[i].getAttribute(attrName)!=undefined)
				&&(list[i].getAttribute(attrName).search('\\b' + classArray[j] + '\\b') != -1)) 
				){
					result.push(list[i]);
					break;			
				}
			}
		}
		return result;
	}

	/**
	 * Returns true if value exists in array. Value can be a date then dateInArray is called
	 * @public
	 * @param {any} v
	 * @param {array} ar
	 * @returns int position or -1
	 */	 
	,inArray:function(v,ar){
		var res;
		if(typeof(v)=="object" && DateHelper.isValidDate(v)){
			//assuming it is a date array
			res = this.dateInArray(v,ar);
		}
		else{
			res = $.inArray(v,ar);
		}
		return res;
	}
	
	/**
	 * Exports all properties of object like console.dir
	 * @public
	 * @param {object} o
	 * @returns string
	 */	 
	,var_export:function(o){
		var output = "";
		if (typeof(o)=="object"){			
			for (var property in o) {
			  output += property + ": " + o[property]+"; ";
			}	
		}
		else{
			output = (o)? o.toString():"<undefined>";
		}
		return output;	
	}
	
	/**
	 * Wtites string to a log (console)
	 * @public
	 * @param {string} msg
	 */	 
	,log:function (msg) {
	    if (console && console.log) {
		console.log(CommonHelper.var_export(msg));
	    }
	}
	
	,include_js: function(fl){
		var h = document.getElementsByTagName("head")[0];
		if (DOMHelper.getElementsByAttr(fl, h, "src", true,"script").length)
			return;
		var fileref = document.createElement("script");
		fileref.setAttribute("type", "text/javascript");
		fileref.setAttribute("src", fl);
		alert("appending "+fl)
		h.appendChild(fileref);
		console.dir(fileref)
	}
	
	,functionName: function(func) {
		// Match:
		// - ^          the beginning of the string
		// - function   the word 'function'
		// - \s+        at least some white space
		// - ([\w\$]+)  capture one or more valid JavaScript identifier characters
		// - \s*        optionally followed by white space (in theory there won't be any here,
		//              so if performance is an issue this can be omitted[1]
		// - \(         followed by an opening brace
		//
		var result = /^function\s+([\w\$]+)\s*\(/.exec( func.toString() );

		return  result  ?  result[ 1 ]  :  undefined; // for an anonymous function there won't be a match	
	}
		
	,hash: function(str) {
		var hash = 0, i, chr;
		if (str.length === 0) return hash;
		for (i = 0; i < str.length; i++) {
			chr   = str.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}	
	
	/**
	 * https://gist.github.com/gordonbrander/2230317
	 */
	,ID: function () {
		// Math.random should be unique because of its seeding algorithm.
		// Convert it to base 36 (numbers + letters), and grab the first 9 characters
		// after the decimal.
		return '_' + Math.random().toString(36).substr(2, 9);
	}	
	
	/*, initCRCTable: function(){
		var a_table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
		this.b_table = a_table.split(' ').map(function(s){ return parseInt(s,16) });
	}
	
	,crc32: function(arg, crc, end) {
		if(!this.b_table){
			this.initCRCTable();
		}
		if(crc==undefined){
			crc = -1;
		}
		for(var i=0, iTop=arg.length; i<iTop; i++) {
			var b;
			if(typeof(arg) == "string"){
				b = arg.charCodeAt(i);
			}else{
				b = arg[i]
			}
			crc = ( crc >>> 8 ) ^ this.b_table[( crc ^  b) & 0xFF];
		}
		return end? (crc ^ (-1)) >>> 0 : crc;
	}*/	
	
	,getCookie: function(c_name) {
	    var c_value = " " + document.cookie;
	    var c_start = c_value.indexOf(" " + c_name + "=");
	    if (c_start == -1) {
		c_value = null;
	    }
	    else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) {
		    c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	    }
	    return c_value;
	}
	
	/**	
	 * Deletes DOM node
	 * @public
	 * @param {DOMNode} node
	 */			
	,delNode:function(node){
		if(typeof(node)=="string"){
			node = document.getElementById(node);
		}		
		if (node && node.parentNode)
			node.parentNode.removeChild(node);
	}	
		
}
