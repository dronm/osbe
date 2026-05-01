/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
  * @requires common/functions.js
  * @requires core/ValidatorString.js  
  * @requires controls/Edit.js
*/

/* constructor */
function EditString(id,options){
	options = options || {};
	options.validator = options.validator || new ValidatorString();
	if (options.buttonClear==undefined &&
	(options.noClear==undefined||options.noClear===false)){
		options.buttonClear = 
			new ButtonClear(id+"_btn_clear",{
				"editControl":this
			});
	}
	
	EditString.superclass.constructor.call(this,id,options);
	
	if (
		(options.lookupController || options.controller)
		&& (options.lookupModelId || options.modelId)
		&& options.lookupValueFieldId
		&& (options.lookupMethodId || options.methodId)
		&& (options.patternParamId||options.lookupValueFieldId)
	){
		this.m_autoComplete = new actbAJX(
		{"controller":options.lookupController || options.controller,
		"modelId":options.lookupModelId || options.modelId,
		"lookupValueFieldId":options.lookupValueFieldId,
		"methodId":options.lookupMethodId || options.methodId,
		"lookupKeyFieldIds":options.lookupKeyFieldIds,
		"keyFieldIds":options.keyFieldIds,
		"minLengthForQuery":options.minLengthForQuery,
		"patternParamId":options.patternParamId||options.lookupValueFieldId,
		"ic":options.ic,
		"mid":options.mid,
		"onSelected":options.onSelected,
		"extraFields":options.extraFields,
		"resultFieldId":options.resultFieldId,
		"fullTextSearch":options.fullTextSearch,
		"resultFieldIdsToAttr":options.resultFieldIdsToAttr,
		"queryDelay":options.queryDelay,
		"updateInputOnCursor":options.acUpdateInputOnCursor,
		"noErrorOnNotSelected":options.acNoErrorOnNotSelected //added 23/06/25
		});
		actb(this.m_node,this.m_winObj,this.m_autoComplete);
	}		
}
extend(EditString,Edit);

/* constants */

/* public methods */
