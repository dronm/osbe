/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2014
 
 * @class
 * @classdesc Basic visual editable control
 
 * @extends Control
 
 * @requires controls/EditInt.js  
 
 * @param {string} id 
 * @param {object} options
 * @param {Validator} [options.validator=ValidatorFloat]
 * @param {int} [options.precision=DEF_PRECISION] 
 */
function EditFloat(id,options){
	options = options || {};
	options.validator = options.validator || new ValidatorFloat(options);
	
	if(options.cmdSelect==undefined){
		options.cmdSelect = false;
	}
	
	this.m_precision = options.precision || this.DEF_PRECISION;
	
	options.attrs = options.attrs || {};
	options.attrs.step = (options.attrs.step!=undefined)? options.attrs.step : ("1,"+("0000000000").substr(0,this.m_precision));//1/Math.pow(10,this.m_precision);
	
	EditFloat.superclass.constructor.call(this,id,options);
	
	this.m_allowedChars.push(44);//,
	this.m_allowedChars.push(46);//.Browse input type numeric will not allow dots!
}
extend(EditFloat,EditInt);

/* constants */
EditFloat.prototype.DEF_PRECISION = 2;
/*
function setCaretPosition(elem, caretPos) {
    if (elem != null) {
        if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        } else {
            if (elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            } else
                elem.focus();
        }
    }
}
*/
EditFloat.prototype.handleKeyPress = function(e){
	var res = EditFloat.superclass.handleKeyPress.call(this,e);
	
	//console.dir(e)
	//console.log(e.which)
	if (res!==false && e.which==46){
		/*console.dir(this.m_node.selectionStart)
		console.dir(this.m_node.selectionEnd)
		var val = this.m_node.value;
		var start = this.m_node.selectionStart;
	        var end = this.m_node.selectionEnd;
            	this.m_node.value = val.slice(0, start) + "," + val.slice(end);
	        // Move the caret
            	this.m_node.selectionStart = this.m_node.selectionEnd = start + 1;		
            	*/
            
		//console.log("val="+this.m_node.value)
		/*
		var caretPos = this.m_node.selectionStart;
        	var startString = this.m_node.value.slice(0, this.m_node.selectionStart);
	        var endString = this.m_node.value.slice(this.m_node.selectionEnd, this.m_node.value.length);
	        this.m_node.value = startString + "," + endString;
	        setCaretPosition(this.m_node, caretPos+1); // '+1' puts the caret after the input
	        e.preventDefault(true);
	        e.stopPropagation(true);
	        return false;
	        */
		//this.m_node.value = this.m_node.value + ",";
		//insertTextAtCursor(",");
		/*
		var inp = this.m_node;
		setTimeout(function() {
			console.log("new val="+inp.value+",")
		    inp.value = inp.value+",";
		  }, 0);		
		 */
		//res = false;
	}
	
	return res;
}

/* public methods */

EditFloat.prototype.setValue = function(val){
	if (val==undefined){
		this.getNode().value = "";
	}
	else{
		if (this.m_validator){
			val = this.m_validator.correctValue(val);
		}
		//console.log( CommonHelper.numberFormat(val, this.m_precision, CommonHelper.getDecimalSeparator(), "") );
		this.getNode().value = CommonHelper.numberFormat(val, this.m_precision, ".", "");
	}
}

/**
 * @param {Event} e
 */
EditFloat.prototype.correctPastedData = function(e){
	e.stopPropagation();
	e.preventDefault();					

	var pasted_data;
	var cur_val;
	var clipboard_data = e.clipboardData || window.clipboardData;
	if(!clipboard_data){
		cur_val = this.getValue();
		pasted_data = cur_val;
	}
	else{
		pasted_data = clipboard_data.getData("Text").match(/\d+(?:[.,]\d+)?/g).join(""); //only numbers && .,
		pasted_data = parseFloat(pasted_data);
	}
	if(!cur_val){
		cur_val = this.getValue();
	}
	if(cur_val!=pasted_data){
		this.setValue(pasted_data);
	}
}
