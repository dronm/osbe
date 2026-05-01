/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Server response class with two fields result int(0 or error code) and descr (error description)
 
 * @param {string} data Model data as a string
 */

function ModelServRespXML(data){
	ModelServRespXML.superclass.constructor.call(this,	
		window.getApp().SERV_RESPONSE_MODEL_ID,
		{"data":data,
		"fields":{
			"result":new FieldInt("result"),
			"descr":new FieldString("descr"),
			"app_version":new FieldString("app_version"),
			"query_id":new FieldString("query_id")
			}
		}
	);	
}
extend(ModelServRespXML,ModelObjectXML);

ModelServRespXML.prototype.result;
ModelServRespXML.prototype.descr;

ModelServRespXML.prototype.setData = function(data){
	ModelServRespXML.superclass.setData.call(this,data);
	
	this.result = this.getFieldValue("result");
	this.descr = this.getFieldValue("descr");
	this.app_version = this.fieldExists("app_version")? this.getFieldValue("app_version") : null;
	this.query_id = this.fieldExists("query_id")? this.getFieldValue("query_id") : null;
}
