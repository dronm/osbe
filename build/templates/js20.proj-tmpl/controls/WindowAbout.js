var WindowAbout = {
	show:function(view){
		var self = this;
		this.m_form = new WindowFormModalBS(CommonHelper.uniqid(),{
			"cmdCancel":true,
			"controlCancelCaption":this.CMD_CLOSE_CAP,
			"controlCancelTitle":this.CMD_CLOSE_TITLE,
			"cmdOk":false,
			"onClickCancel":function(f){
				self.m_form.close();
			},		
			"content":view,
			"contentHead":this.HEAD_TITLE
		});

		this.m_form.open();
	
	}
}
