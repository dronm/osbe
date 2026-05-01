/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2014

 * @requires controls/WindowMessage.js
 * @requires core/ConstantManager.js 

 * @param {object} options
 * @param {string} host
 * @param {string} bsCol
 * @param {string} widthType lg,md,sm
 * @param {object} servVars
 * @param {string} constantXMLString XML data for model
 * @param {string} lang 
 */
function AppWin(options){

	options = options || {};	
	
	this.m_msg = new WindowMessage();
	this.m_tempMsg = new WindowTempMessage();
	
	var self = this;
	window.onerror = function(msg,url,line,col,error){		
		self.onError(msg,url,line,col,error);
	};

	/*if(window.history){
		window.onpopstate = function(e){
			if(e.state){
				window.getApp().showMenuItem(null,e.state.c,e.state.f,e.state.t,e.state.extra,e.state.title);
			}
		}
	}*/
	
	window.getApp = function(){
		return options.app;
	}

	window.getWidthType = function(){
		return options.widthType? options.widthType:"sm";
	}

	window.getBsCol = function(v){
		//+options.widthType+
		return  (options.bsCol?
			(options.bsCol+((v!=undefined)? v.toString():"")) //old syntax
			:
			("col-"+this.getWidthType()+"-"+((v!=undefined)? v.toString():"")) //new syntax
			);
	};

	window.showMsg = function(opts) {
		opts.bsCol = window.getBsCol();
		self.m_msg.show(opts);	
	};

	window.showError = function(msg,callBack,timeout) {
		window.showMsg({
			"type":self.m_msg.TP_ER,
			"text":msg,
			"callBack":callBack,
			"timeout":timeout			
		});				
	};

	window.showWarn = function(msg,callBack,timeout) {
		window.showMsg({
			"type":self.m_msg.TP_WARN,
			"text":msg,
			"callBack":callBack,
			"timeout":timeout			
		});		
	};

	window.showNote = function(msg,callBack,timeout) {
		window.showMsg({
			"type":self.m_msg.TP_NOTE,
			"text":msg,
			"callBack":callBack,
			"timeout":timeout			
		});		
	};
	
	window.showOk = function(msg,callBack,timeout) {
		window.showMsg({
			"type":self.m_msg.TP_OK,
			"text":msg,
			"callBack":callBack,
			"timeout":timeout			
		});
	};

	window.showTempMsg = function(opts) {
		self.m_tempMsg.show(opts);
	};
		
	window.showTempNote = function(msg,callBack,timeout) {
		window.showTempMsg({
			"type":self.m_tempMsg.TP_NOTE,
			"content":msg,
			"callBack":callBack,
			"timeout":timeout		
		});
	};
	window.showTempOk = function(msg,callBack,timeout) {
		window.showTempMsg({
			"type":self.m_tempMsg.TP_OK,
			"content":msg,
			"callBack":callBack,
			"timeout":timeout		
		});
		/*if(window.getApp().getSoundEnabled()){
			var audio = new Audio('sounds/mixkit-long-pop-2358.mp3');
			audio.play();					
		}*/
	};
	
	window.showTempError = function(msg,callBack,timeout) {
		window.showTempMsg({
			"type":self.m_tempMsg.TP_ER,
			"content":msg,
			"callBack":callBack,
			"timeout":timeout		
		});
		/*if(window.getApp().getSoundEnabled()){
			var audio = new Audio('sounds/mixkit-software-interface-start-2574.mp3');
			audio.play();					
		}*/
	};
	window.showTempWarn = function(msg,callBack,timeout) {
		window.showTempMsg({
			"type":self.m_tempMsg.TP_WARN,
			"content":msg,
			"callBack":callBack,
			"timeout":timeout		
		})
	};

	window.resetError = function() {
	};
	
	window.setGlobalWait = function(isWait){
		var n = document.getElementById("waiting");
		if(n)n.style=isWait? "display:block;":"display:none;"
	}
	
}

/* Constants */

/* protected*/


/* public methods */

//GUI only erros, db errors are not passed here, View.setError() is used with window.showError
AppWin.prototype.onError = function(msg,url,line,col,error) {
	let app;
	let d = SERV_VARS["DEBUG"];
	//app = window.getApp();	
	//d = app.getServVar("debug");
	var m_debug = (d=="1" || d===true || d===undefined);
	if (error instanceof FatalException){
		//predefined exception classes
		error.show();
	}
	else{
		//default
		var str = msg;
		//error instanceof ReferenceError
		if(m_debug){
			str = str + "\nurl: " + url + "\nline: " + line;
			if(console){
				console.log(str);
				if (error && error.stack)console.log(error.stack);
				if (console.trace)console.trace();
			}
		}
		else{
			//strip Error:/Uncaught Error
			var er_pref = "Error: ";
			if (str.substr(0,er_pref.length)==er_pref){
				str = str.substr(er_pref.length);
			}
			er_pref = "Uncaught Error";
			if (str.substr(0,er_pref.length)==er_pref){
				str = str.substr(er_pref.length);
			}
			var er_postf = " (SQLSTATE P0001)";
			//sql raise exception			
			if (str.substr(str.length - er_postf.length + 1) == er_postf){
				str = str.substr(0, str.length - er_postf.length + 1);
			}			
		}		
		window.showError(str);
	}
	if(!m_debug && app && app.onGUIError){
		//server notify
		app.onGUIError({"msg": msg, "url": url, "col": col, "error": error});
	}
		
	return false;
}
