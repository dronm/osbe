/* Copyright (c) 2014 
	Andrey Mikhalevich, Katren ltd.
*/
//ф
/** Requirements
*/

/* constructor */
var WindowMessage = {
	TP_ER:0,
	TP_WARN:1,
	TP_NOTE:2,
	TP_MESSAGE:3,
	show:function(options){
		options = options || {};
		this.m_modalId = uuid();
		this.m_modal = new WindowFormModalBS(this.m_modalId,{
			content:new Control(uuid(),"div",{value:options.text})
		});
		var self = this;
		this.m_modal.m_footer.addElement(new ButtonCmd(uuid(),{
			"caption":"ОК",
			"onClick":function(){
				if (options.callBack) {
					options.callBack();
				}
				self.m_modal.close();
			}
			})
		);
		this.m_modal.open();
	}
}