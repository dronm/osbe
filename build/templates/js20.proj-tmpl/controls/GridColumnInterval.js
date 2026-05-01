/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends GridColumn
 * @requires controls/GridColumn.js
 * @requires core/AppWin.js 

 * @class
 * @classdesc

 * @param {object} options
 * @param {string} options.dateFormat
 */
function GridColumnInterval(options){
	options = options || {};	
	
	this.m_intervalFormat = options.intervalFormat ||this.DEF_FORMAT;
	
	GridColumnInterval.superclass.constructor.call(this,options);
}
extend(GridColumnInterval,GridColumn);

/* Constants */

GridColumnInterval.prototype.DEF_FORMAT = "H:i";

/* private members */

/* protected*/


/* public methods */
GridColumnInterval.prototype.formatVal = function(v){
	var r = "";
	if(v&&typeof(v)=="string"){
		var parts = v.split(":",2);
		var h=0,m=0,s=0,ms=0;
		if(parts.length>=1){
			h = parseInt(parts[0],10);
		}
		if(parts.length>=2){
			m = parseInt(parts[1],10);
		}
		if(parts.length>=3){
			s = parts[2];
			ms_pos = s.indexOf(".");
			if(ms_pos>=0){
				ms = s.substr(ms_pos+1);
				s = parseInt(s.substr(0,ms_pos-1),10);
			}
			else{
				s = parseInt(s,10);
			}
		}
		for (var i = 0; i < this.m_intervalFormat.length; i++) {
			if(this.m_intervalFormat.charAt(i)=="H"){
				r+=(h<10? "0":"")+h.toString();
			}
			else if(this.m_intervalFormat.charAt(i)=="i"){
				r+=(m<10? "0":"")+m.toString();
			}
			else{
				r+=this.m_intervalFormat.charAt(i);
			}
		}
	}
	return r;
}
