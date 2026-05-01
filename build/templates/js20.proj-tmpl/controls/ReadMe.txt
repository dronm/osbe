Описание работы фильтра таблицы
core/ModelFilter - применение фильтра

controls/GridFilter
Контролы работы с фильтром
Команды Установки, сброса фильтра

GridAjx
Установка фильтров в контроллер

GridFilterInfo
Информация по активному фильтру

GridCmdFilter <- GridCmd
Popup Контрол
Сохранение, восстановление
	GridCmdFilterView

GridCmdFilterView


//**********************
ViewReport <- ControlContainer
	RepCommands
	
RepCommands	
	cmdFilter = new GridCmdFilter()
	
//*****************************************************************************************************
Как добавлять контролы в GridColumn
1) Юзать formatFunction(fields, gridCell). В gridCell можно вставлять узлы, при этом возвращать надо пустую строку!
Простой текст
"formatFunction":function(f, gridCell){
	//Пример возврата простого текста
	var sh = f.shipments_list.getValue();
	if(!sh || !sh.length){
		return "";
	}
	var res = "";
	for(var i = 0; i < sh.length; i++){
		if(!sh[i].descr){
			continue;
		}
		res+= (res=="")? "":", ";
		res+= sh[i].descr;
	}
	return res;
}
А можно так
var pic_ctrl = new Control(gridCell.getId()+":assoc-img","img",{
	"visible":!this.m_proportianal,
	"attrs":{
		"src": src
	}
	,"events": {
		"click": this.m_onClick? (function(cont, f){
			//always first row!!!
			return function(e){
				cont.m_onClick.call(cont, f, e.target);
			}	
		})(this, fields):null,
		"load": this.m_proportianal? function(){
			var n = this.m_node;
			var dim = CommonHelper.calculateImgRatioFit(n.width, n.height, self.m_pictureWidth, self.m_pictureHeight);
			n.width = dim.width;
			n.height = dim.height;
			DOMHelper.show(n);						
		} : null
	}
});
gridCell.addElement(pic_ctrl);


Можно добавлять любые узыл
"formatFunction":function(fields,cell){
	var res = String.fromCharCode(10)+window.getApp().formatCell(fields.clients_ref,cell,self.m_listView.COL_CLIENT_LEN);
	res+= String.fromCharCode(10)+window.getApp().formatCell(fields.destinations_ref,cell,self.m_listView.COL_DEST_LEN);
	res+= String.fromCharCode(10);
	var tel = fields.phone_cel.getValue();
	var tel_m = tel;
	if(tel_m && tel_m.length==10){
		tel_m = "+7"+tel;
	}
	else if(tel_m && tel_m.length==11){
		tel_m = "+7"+tel.substr(1);
	}
	
	var cell_n = cell.getNode();
	var c_tag = document.createElement("SPAN");
	c_tag.textContent = res;
	cell_n.appendChild(c_tag);
	
	if(tel_m && tel_m.length){
		var t_tag = document.createElement("A");
		t_tag.setAttribute("href","tel:"+tel_m);
		t_tag.textContent = CommonHelper.maskFormat(tel,window.getApp().getPhoneEditMask());
		cell_n.appendChild(t_tag);
	}
	return "";
}


2) Заюзать cellOptions(column, row), вернуть  объект со свойством elements, содержащий массив визуальных контролов
или свойство value с текстом
,"cellOptions":function(column, row){
	var res = {}; //returns object with elements:Array[Control] or value:Text
	var m = self.getElement("grid").getModel();
	var sig = m.getFieldValue("digital_sig");
	if(sig && sig.date_time){
		res.value = DateHelper.format(DateHelper.strtotime(sig.date_time), "d/m/y H:i");
		
	}else{
		if(role=="person_lk"){
			var ctrl = new StudyDocumentSetSignBtn(null,{
				"getGrid": function(){
					return self.getElement("grid")
				},
				"row": row
			});
			res.elements = [ctrl];										
		}else{
			res.value = "Не подписан";
		}
	}
	return res;
}								
	
	
	
//*********************** Как открыть произвольную форму **********************************
All forms are extended from WindowFormObject which has a 'keys' property of type object.
(new ShipmentDialog_Form({
	"keys":{"id": k}
})).open();
Or open a modal dialog



//*********************** Сохранить, затем выполнить **********************************
if (!this.m_view.getCmd || this.m_view.getCmd() != "insert"){// && !this.m_view.getModified()
	this.addAttachmentCont(fl, callback);
}
else{	
	var self = this;
	this.m_view.getControlOK().setEnabled(false);
	this.m_view.getControlSave().setEnabled(false);				
	this.m_view.onSave(
		function(){
			self.addAttachmentCont(fl, callback);
		},
		null,
		function(){
			self.m_view.getControlOK().setEnabled(true);
			self.m_view.getControlSave().setEnabled(true);				
		}
	);			
}




