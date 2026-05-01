/**	
 *  Basic date time functions
 *
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 *
 * @namespace
 *
 */
var DateHelper = {	
	DEF_FORMAT:"Y-m-dTH:i:s",
	
	/**
	 * Returns current date object, can be server syncronised
	 * @returns date
	 */
	time : function(){
		return new Date();
	},
	
	/**
	 * Makes Date object from ISO string 2001-01-01T01:01:00.000+00:00
	 * @param {string} dateStr
	 * @returns date
	 */
	strtotime : function(dateStr){
		if(typeof(dateStr)==="object"&&this.isValidDate(dateStr)){
			return dateStr;//already object
		}
		else if (!dateStr || !dateStr.length){
			return;
		}

		var parsed = Date.parse(dateStr);
		if(isNaN(parsed)){
			var parts = dateStr.match(/^(\d{4})[\.|\\/|-](\d{2})[\.|\\/|-](\d{2})[T|\s](\d{2})\:(\d{2})\:?(\d{0,2})\.?(\d{0,6})([+-])(\d{2})\:?(\d{2})?$/);
			
			if(parts){
				//zone exists
				if(parts[5]==undefined||parts[5]=="")parts[5]="00";//hours
				if(parts[6]==undefined||parts[6]=="")parts[6]="00";//minutes
				if(parts[7]==undefined||parts[7]=="")parts[7]="0";//milliseconds
				if(parts[10]==undefined)parts[10]="00";//timezone min
				parsed = Date.parse(parts[1]+"-"+parts[2]+"-"+parts[3]+"T"+parts[4]+":"+parts[5]+":"+parts[6]+"."+parts[7]+parts[8]+parts[9]+":"+parts[10]);
			}
			else{
				var parts = dateStr.split(/\D+/);				
				for(i=0;i<parts.length;i++){
					if(parts[i]==undefined)parts[i]="00";
				}
				if(parts.length<7)parts[6]="0000";
				parsed = Date.parse(parts[0]+"-"+parts[1]+"-"+parts[2]+"T"+parts[3]+":"+parts[4]+":"+parts[5]+"."+parts[6]);
			}
		}
			
		return new Date(parsed);
		/*
		var d;
		var ds = dateStr; 
		var t_offset_p = ds.indexOf("+");
		if (CommonHelper.isIE()){
			var sep_ps;
			var d_part = "";
			var t_part = "";
			if (t_offset_p>=0){
				ds = ds.substr(0,t_offset_p);	
			}
			
			if (ds.indexOf("T")>=0){
				sep_ps = ds.indexOf("T");
				d_part = ds.substr(0,sep_ps);
				t_part = ds.substr(sep_ps+1);
			}
			else if (ds.indexOf(" ")>=0){
				sep_ps = ds.indexOf(" ");
				if (sep_ps>=0){
					d_part = ds.substr(0,sep_ps);
					t_part = ds.substr(sep_ps+1);
				}
			}
			else{
			
			}
			var d_ar = d_part.split("-");
			if (d_ar.length<1)d_ar.push("01");
			if (d_ar.length<2)d_ar.push("01");
			if (d_ar.length<3)d_ar.push("01");
			ds = d_ar[2]+"/"+d_ar[1]+"/"+d_ar[0]+ (t_part? " "+t_part:"");
			d = this.userStrToDate(ds);
		}
		else{	
			if (ds.length>12 && t_offset_p==-1 && ds.substr(ds.length-1,1)!="Z"){
				//no time zone
				ds+= this.getTimeZoneOffsetStr();//"+00:00";
			}
			else if (t_offset_p!=-1){
				//
				var t_offset_ar = ds.substr(t_offset_p+1).split(":");
				for (var i=t_offset_ar.length;i<2;i++){
					t_offset_ar.push("00");
				}
				ds = ds.substr(0,t_offset_p)+"+"+t_offset_ar.join(":");
			}
			d = new Date(ds);
		}
		//console.log("strtotime dateStr="+dateStr+" transformed to "+ds+" date="+d)
		return d;
		*/
	},
	
	getTimeZoneOffsetStr: function(){
		if (!this.m_timeZoneOffsetStr){
			var h_offset = -(new Date()).getTimezoneOffset() / 60;		
			var h_offset_h = Math.floor(h_offset);
			function to_str(a){
				return ((a.toString().length==1)? "0":"")+a.toString();
			}
			this.m_timeZoneOffsetStr = ((h_offset_h<0)? "-":"+") + to_str(Math.abs(h_offset_h)) +":"+ to_str(Math.abs((h_offset - h_offset_h)*60));
		}
		return this.m_timeZoneOffsetStr;
	},
	
	/**
	 * Makes Date object from a user string
	 * Different possible user formats are supported:
	 * 01/01/1999
	 * 01/01/06 = 01/01/2006
	 * 01-01-06 = 01/01/2006
	 * 01-01-2016
	 * 2016-01-01
	 * Time can be attached with space or T or nothing
	 * date 00:00:00
	 * dateT00:00:00
	 * date00:00:00
	 * Time can be separated with : or nothing
	 *
	 * @param {string} dateStr
	 * @returns date
	 */
	userStrToDate : function(dateStr){
		var SHORT_YEAR_LEN=8;
		var FULL_YEAR_LEN=10;
		var time = new Array(0,0,0);
		var date = new Array(0,0,0);
		var time_part='',date_part='';
		var TIME_DELIM = ':';
		var DATE_DELIM = '.';
		var PARTS_DELIM = ' ';
		
		var NEXT_MIL_BOUND = 40;// date with year<=40 and less will be interpreted as 2040, bigger as 1950
		
		var str_replace_delim = function(str,delim_ar,new_delim){
			if (str && str.length){
				for (var i=0;i<delim_ar.length;i++){
					while (str.search(delim_ar[i])>=00){
						str = str.replace(delim_ar[i],new_delim);
					}
				}
			}
			return str;
		};
		
		var date_str_copy = str_replace_delim(dateStr,new Array(/T/),PARTS_DELIM);
		var separ = date_str_copy.indexOf(PARTS_DELIM);
		if (separ>=0){					
			date_part = date_str_copy.slice(0,separ);
			time_part = date_str_copy.substr(separ+1);			
		}
		else{
			//Which part is it?
			if (date_str_copy.indexOf(TIME_DELIM)==-1){
				date_part = date_str_copy;			
			}
			else{
				time_part = date_str_copy;			
			}
		}
		
		date_part = str_replace_delim(date_part,new Array(/\//,/-/,/:/),DATE_DELIM);
		time_part = str_replace_delim(time_part,new Array(/ /,/-/,/\//),TIME_DELIM);
		
		if (date_part.length>0){
			date = date_part.split(DATE_DELIM);
		}
		if (time_part.length>0){
			time = time_part.split(TIME_DELIM);
		}
		
		if (date.length && date[0].length==4){
			//year first swap
			var y = date[0];
			date[0] = date[2];
			date[2] = y;
		}
		else if (date.length>=3 && date[2].length==2){
			date[2] = parseInt(date[2],10);
			date[2] += (date[2]<=NEXT_MIL_BOUND)? 2000:1900;
		}
		if (time[2]==undefined){
			time[2] = 0;
		}
		date[1] = (date[1]==0)? 0:date[1]-1;
		return (new Date(date[2],date[1],date[0],time[0],time[1],time[2]));
	},
	
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
	format:function(dt,fs,localeId){
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
			fs = this.DEF_FORMAT;
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
	},
	
	/**
	 * Converts time string to milliseconds
	 * 07:01:05.0001 -->> 7*60*60*1000+1 + 1*60*1000 + 5*1000
	 * To Do MS Support!!!
	 *
	 * @param {string} timeStr
	 * @returns date
	 */
	timeToMS:function(timeStr){
		if (timeStr==undefined||!timeStr.split){
			return 0;
		}
		var h,m;
		var time_ar = timeStr.split(":");
		var h = 0;
		var m = 0;
		var s = 0;
		var ms = 0;

		if (time_ar.length>=1){
			h = parseInt(time_ar[0][0],10)*10+
				parseInt(time_ar[0][1],10);
			h = ( isNaN(h)? 0:h);
		}		
		
		if (time_ar.length>=2){
			m = parseInt(time_ar[1][0],10)*10+
				parseInt(time_ar[1][1],10);
			m = ( isNaN(m)? 0:m);
		}		
		if (time_ar.length>=3){
			s = parseInt(time_ar[2][0],10)*10+
				parseInt(time_ar[2][1],10);
			s = ( isNaN(s)? 0:s);
		}
		return (h*60*60*1000 + m*60*1000 + s*1000 + ms);
	}
	
	,dateEnd:function(dt){
		if(!dt)dt = this.time();
		return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),23,59,59,999);
	}
	,dateStart:function(dt){
		if(!dt)dt = this.time();
		return new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),0,0,0,0);
	}	

	/**
	 * Calculates weeks's start
	 * @param {date} dt
	 * @returns date
	 */
	,weekStart : function(dt) {
		if(!dt)dt = this.time();
		var dow = dt.getDay();
		var dif = dow - 1;	
		if (dif<0)dif = 6;		
		return (new Date(dt.getTime()-dif*24*60*60*1000));
	},	

	/**
	 * Calculates weeks's end
	 * @param {date} dt
	 * @returns date
	 */	
	weekEnd : function(dt) {
		return new Date(this.weekStart(dt).getTime() + 6*24*60*60*1000);
	},

	/**
	 * Calculates month's start
	 * @param {date} dt
	 * @returns date
	 */		
	monthStart : function(dt) {
		if(!dt)dt = this.time();
		//console.log(dt)
		return (new Date(dt.getFullYear(), dt.getMonth(), 1));
	},
	
	/**
	 * Calculates month's end
	 * @param {Date} dt
	 * @returns date
	 */		

	monthEnd : function(dt) {
		if(!dt)dt = this.time();
		return (new Date(dt.getFullYear(), dt.getMonth()+1, 0));
	},
	
	daysInMonth : function(dt) {
    		return new Date(dt.getFullYear(),dt.getMonth()+1,0).getDate();
        },
        	
	/**
	 * Calculates quarter's start
	 * @param {date} dt
	 * @returns date
	 */			
	quarterStart : function(dt){
		if(!dt)dt = this.time();
		var m = dt.getMonth();
		if (m==1 || m==2){
			m = 0;
		}
		else if (m==4 || m==5){
			m = 3;
		}
		else if (m==7 || m==8){
			m = 6;
		}
		else if (m==10 || m==11){
			m = 9;
		};
		return (new Date(dt.getFullYear(),m,1));
	},
	
	/**
	 * Calculates quarter's end
	 * @param {date} dt
	 * @returns date
	 */		
	quarterEnd : function(dt){
		if(!dt)dt = this.time();
		var m = dt.getMonth();
		if (m==0 || m==1){
			m = 2;
		}
		else if (m==3 || m==4){
			m = 5;
		}
		else if (m==6 || m==7){
			m = 8;
		}
		else if (m==9 || m==10){
			m = 11;
		};
		return this.monthEnd(new Date(dt.getFullYear(),m,1));
	},
	
	/**
	 * Calculates year's start
	 * @param {date} dt
	 * @returns date
	 */		
	yearStart : function(dt) {
		if(!dt)dt = this.time();
		return new Date(dt.getFullYear(), 0, 1);
	},
	
	/**
	 * Calculates year's end
	 * @param {date} dt
	 * @returns date
	 */		
	yearEnd : function(dt) {
		if(!dt)dt = this.time();
		return (new Date(dt.getFullYear(), 12, 0));
	},
	
	/**
	 * Adds number of business days to a date
	 * Source https://github.com/lsmith/addBusinessDays/blob/master/addBusinessDays.js
	 * @param {Date} d
	 * @param {int} n - number of days
	 * @returns date
	 */			
	addBusinessDays : function(d,n) {
		d = new Date(d.getTime());
		var day = d.getDay();
		d.setDate(d.getDate() + n + ( (day === 6)? 2 : (+!day) ) + (Math.floor((n - 1 + (day % 6 || 1)) / 5) * 2));
		return d;
	}
	
	,isValidDate : function (d) {
		//typeof date.getMonth === 'function'
		return d instanceof Date && !isNaN(d);
	}
	
	/**
	 * @param {d Date|Int} date object or integer year 2000
	 * @returns {bool}
	 */
	,isLeapYear: function(d){
		var year = (typeof(d)=="object")? d.getFullYear():d;
		return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
	}
	
	,daysOfAYear : function (d){
		return this.isLeapYear(d) ? 366:365;
	}

	/**
	 * Formats interval
	 * y d h min sec
	 * @param {int} v - interval in milliseconds
	 * @param {string} localeId
	 * @returns date
	 */
	,formatInterval(v){
		//v
	}
}
