/** Copyright (c) 2019
 * 	Andrey Mikhalevich, Katren ltd.
 */
function LoginList_View(id,options){	

	LoginList_View.superclass.constructor.call(this,id,options);
	
	var model = (options.models&&options.models.LoginList)? options.models.LoginList_Model:new LoginList_Model();
	var contr = new Login_Controller();
	
	var constants = {"doc_per_page_count":null,"grid_refresh_interval":null};
	window.getApp().getConstantManager().get(constants);
	
	var popup_menu = new PopUpMenu();
	var pagClass = window.getApp().getPaginationClass();
	this.addElement(new GridAjx(id+":grid",{
		"model":model,
		"controller":contr,
		"editInline":null,
		"editWinClass":null,
		"commands":new GridCmdContainerAjx(id+":grid:cmd",{
			"cmdInsert":false,
			"cmdEdit":false
		}),
		"popUpMenu":popup_menu,
		"head":new GridHead(id+"-grid:head",{
			"elements":[
				new GridRow(id+":grid:head:row0",{
					"elements":[
						,new GridCellHead(id+":grid:head:users_ref",{
							"value":this.GRID_USER_COL_CAP,
							"columns":[
								new GridColumnRef({
									"field":model.getField("users_ref"),
									"form":User_Form,
									"ctrlClass":UserEditRef,
									"searchOptions":{
										"field":new FieldInt("user_id"),
										"searchType":"on_match",
										"typeChange":false
									}									
								})
							],
							"sortable":true
						})
					
						,new GridCellHead(id+":grid:head:date_time_in",{
							"value":this.GRID_DATE_TIME_IN_COL_CAP,
							"columns":[
								new GridColumnDate({
									"field":model.getField("date_time_in"),
									"dateFormat":"d/m/y H:i"
								})
							],
							"sortable":true,
							"sort":"asc"							
						})
						,new GridCellHead(id+":grid:head:date_time_out",{
							"value":this.GRID_DATE_TIME_OUT_COL_CAP,
							"columns":[
								new GridColumnDate({
									"field":model.getField("date_time_out"),
									"dateFormat":"d/m/y H:i"
								})
							],
							"sortable":true
						})
						,new GridCellHead(id+":grid:head:session_set_time",{
							"value":this.GRID_SET_DATE_TIME_COL_CAP,
							"columns":[
								new GridColumnDate({
									"field":model.getField("session_set_time"),
									"dateFormat":"d/m/y H:i"
								})
							],
							"sortable":true
						})
						,new GridCellHead(id+":grid:head:ip",{
							"value":this.GRID_IP_COL_CAP,
							"columns":[
								new GridColumn({
									"field":model.getField("ip")
								})
							]
						})
						,new GridCellHead(id+":grid:head:headers",{
							"value":"Заголовки",
							"columns":[
								new GridColumn({
									"field":model.getField("headers")
								})
							]
						})
						
					]
				})
			]
		}),
		"pagination":new pagClass(id+"_page",
			{"countPerPage":!options.detail? constants.doc_per_page_count.getValue():this.REC_COUNT_IN_DLG_MODE}),		
		
		"autoRefresh":false,
		"refreshInterval":constants.grid_refresh_interval.getValue()*1000,
		"rowSelect":false,
		"focus":true
	}));	
	


}
extend(LoginList_View,ViewAjxList);

LoginList_View.prototype.REC_COUNT_IN_DLG_MODE = 10;



