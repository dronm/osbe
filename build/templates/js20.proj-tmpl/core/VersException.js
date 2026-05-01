/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @requires core/App.js
 * @requires core/AppWin.js
 * @requires core/CommonHelper.js   

 * @class
 * @classdesc Fatal exception. Modal window on screen center. Authorization is needed
 
 */
function VersException(){
	options =  {};
	options.cmdOk = false;
	options.cmdCancel = false;
	
	var self = this;
	options.viewAddElement = function(){
		var delay = window.getApp().getUpdateInstPostponeDelay();
		this.addElement(new ButtonCmd("versException:postpone",{
			"caption":CommonHelper.format(self.CAP_POSTPONE,[delay/1000/60])+" ",
			"onClick":function(){
				var app = window.getApp();
				app.setUpdateInstPostponed(true,delay);
				if(app.m_dbExceptionForm){
					app.m_dbExceptionForm.close();
				}				
				window.showTempNote(self.NOTE,null,self.NOTE_DISAPPEAR);
			},
			"glyph":"glyphicon-time",
			"title":CommonHelper.format(self.TITLE_POSTPONE,[delay/1000/60])
		}));
		this.addElement(new ButtonCmd("versException:reload",{
			"caption":self.CAP_RELOAD+" ",
			"onClick":function(){
				document.location.reload(true);
			},
			"glyph":"glyphicon-ok",
			"title":self.TITLE_RELOAD
		}))
		
	}
	
	VersException.superclass.constructor.call(this,options);
}
extend(VersException,FatalException);

VersException.prototype.TEMPLATE_ID = "VersException";
VersException.prototype.NOTE_DISAPPEAR = 4000;
