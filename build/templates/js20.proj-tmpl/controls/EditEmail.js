/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2014
 
 * @class
 * @classdesc Email edit control
 
 * @extends EditString
 
 * @requires controls/EditString.js
 * @requires core/ValidatorEmail.js     
 
 * @param string id 
 * @param {Object} options
 */
function EditEmail(id,options){
	options = options || {};
	
	options.validator = options.validator || new ValidatorEmail(options);
	options.events = options.events || {
		"focus":function(){
			this.setValid();
		}
		,"blur": function(){
		
			var v = this.getValue();
			if(v && v.length){
				if(!this.m_reg){
					this.m_reg = new RegExp(/\S+@\S+\.\S+/)
				}
				if(!this.m_reg.test(v)){
					this.setNotValid(this.NOT_VALID_TXT);
				}else{
					this.setValid();
				}
			}else{
				this.setValid();
			}
		}
	};
	
	EditEmail.superclass.constructor.call(this,id,options);
}
extend(EditEmail,EditString);

/* constants */


/* public methods */
