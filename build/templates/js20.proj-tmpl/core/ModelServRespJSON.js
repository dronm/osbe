/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017
 
 * @class
 * @classdesc Server response class with two fields result int(0 or error code) and descr (error description)
 
 * @param {string} data
 */
function ModelServRespJSON(data){
	ModelServRespJSON.superclass.constructor.call(this,	
		window.getApp().SERV_RESPONSE_MODEL_ID,
		{"data":data,
		"fields":{
			"result":new FieldInt("result"),
			"descr":new FieldString("descr"),
			"query_id":new FieldString("query_id"),
			"app_version":new FieldString("app_version")
			}
		}
	);	
}
extend(ModelServRespJSON,ModelObjectJSON);

//fields
ModelServRespJSON.prototype.result;
ModelServRespJSON.prototype.descr;
ModelServRespJSON.prototype.query_id;

ModelServRespJSON.prototype.setData = function(data){
	ModelServRespJSON.superclass.setData.call(this,data);
	
	this.result = this.getFieldValue("result");
	this.descr = this.getFieldValue("descr");
	this.query_id = this.getFieldValue("query_id");
	this.app_version = this.fieldExists("app_version")? this.getFieldValue("app_version") : null;
}
