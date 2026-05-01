
/*
function addEvent(obj,event_name,func_name){
	if (obj.attachEvent){
		obj.attachEvent("on"+event_name, func_name);
	}else if(obj.addEventListener){
		obj.addEventListener(event_name,func_name,true);
	}else{
		obj["on"+event_name] = func_name;
	}
}

function removeEvent(obj,event_name,func_name){
	if (obj.detachEvent){
		obj.detachEvent("on"+event_name,func_name);
	}else if(obj.removeEventListener){
		obj.removeEventListener(event_name,func_name,true);
	}else{
		obj["on"+event_name] = null;
	}
}
*/
function stopEvent(evt){
	evt || window.event;
	if (evt.stopPropagation){
		evt.stopPropagation();
		evt.preventDefault();
	}else if(typeof evt.cancelBubble != "undefined"){
		evt.cancelBubble = true;
		evt.returnValue = false;
	}
	return false;
}
function getElement(evt){
	if (window.event){
		return window.event.srcElement;
	}else{
		return evt.currentTarget;
	}
}
function getTargetElement(evt){
	if (window.event){
		return window.event.srcElement;
	}else{
		return evt.target;
	}
}
function stopSelect(obj){
	if (typeof obj.onselectstart != 'undefined'){
		EventHandler.addEvent(obj,"selectstart",function(){ return false;});
	}
}
function getCaretEnd(obj,winDocum){
	if(typeof obj.selectionEnd != "undefined"){
		return obj.selectionEnd;
	}else if(winDocum.selection&&winDocum.selection.createRange){
		var M=winDocum.selection.createRange();
		try{
			var Lp = M.duplicate();
			Lp.moveToElementText(obj);
		}catch(e){
			var Lp=obj.createTextRange();
		}
		Lp.setEndPoint("EndToEnd",M);
		var rb=Lp.text.length;
		if(rb>obj.value.length){
			return -1;
		}
		return rb;
	}
}
function getCaretStart(obj,winDocum){
	if(typeof obj.selectionStart != "undefined"){
		return obj.selectionStart;
	}else if(winDocum.selection&&winDocum.selection.createRange){
		var M=winDocum.selection.createRange();
		try{
			var Lp = M.duplicate();
			Lp.moveToElementText(obj);
		}catch(e){
			var Lp=obj.createTextRange();
		}
		Lp.setEndPoint("EndToStart",M);
		var rb=Lp.text.length;
		if(rb>obj.value.length){
			return -1;
		}
		return rb;
	}
}
function setCaret(obj,l){
	obj.focus();
	if (obj.setSelectionRange){
		obj.setSelectionRange(l,l);
	}else if(obj.createTextRange){
		m = obj.createTextRange();		
		m.moveStart('character',l);
		m.collapse();
		m.select();
	}
}
function setSelection(obj,s,e){
	obj.focus();
	if (obj.setSelectionRange){
		obj.setSelectionRange(s,e);
	}else if(obj.createTextRange){
		m = obj.createTextRange();		
		m.moveStart('character',s);
		m.moveEnd('character',e);
		m.select();
	}
}
String.prototype.addslashes = function(){
	return this.replace(/(["\\\.\|\[\]\^\*\+\?\$\(\)])/g, '\\$1');
}
String.prototype.trim = function () {
    return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};
function curTop(obj){
	toreturn = 0;
	while(obj){
		toreturn += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return toreturn;
}
function curLeft(obj){
	toreturn = 0;
	while(obj){
		toreturn += obj.offsetLeft;
		obj = obj.offsetParent;
	}
	return toreturn;
}
function isNumber(a) {
    return typeof a == 'number' && isFinite(a);
}
function replaceHTML(obj,text,winDocum){
	while(el = obj.childNodes[0]){
		obj.removeChild(el);
	};
	obj.appendChild(winDocum.createTextNode(text));
}

/*
*/
function actbAJX(options){
	options = options || {};
	if (options.controller){
		this.m_controller = options.controller;
	}
	
	this.m_methodId = options.methodId || this.DEF_METHOD;
	if (options.modelId){
		this.m_modelId = options.modelId;
	}	
	this.m_patternParamId = options.patternParamId || this.DEF_PATTERN_PARAM;
	if (options.lookupValueFieldId){
		this.m_acValueFieldId = options.lookupValueFieldId;
	}
	
	if (options.resultFieldId){
		this.m_acResFieldId = options.resultFieldId;
	}
	
	this.m_keyFieldIds = options.keyFieldIds||[];
	this.m_acKeyFieldIds = options.lookupKeyFieldIds||[];
	
	this.m_extraFields = options.extraFields||[];
	
	this.m_ic = (options.ic==undefined)? '1':(options.ic)? '1':'0';
	this.m_mid = (options.mid==undefined)? '0':(options.mid)? '1':'0';
	
	this.m_isObject = (this.m_keyFieldIds.length>0);
	this.m_minLengthForQuery = 
		options.minLengthForQuery || this.MIN_LEN_FOR_QUERY;
		
	this.m_onSelected = options.onSelected;
	
	this.m_queryDelay = options.queryDelay || this.SERV_Q_DELAY;
	
	this.m_resultFieldIdsToAttr = options.resultFieldIdsToAttr;
	this.m_fullTextSearch = options.fullTextSearch;
	
	this.m_updateInputOnCursor = options.updateInputOnCursor;
	this.m_noErrorOnNotSelected = (options.noErrorOnNotSelected===true);
}
actbAJX.prototype.DEF_PATTERN_PARAM = 'pattern';
actbAJX.prototype.DEF_METHOD = 'complete';
actbAJX.prototype.MIN_LEN_FOR_QUERY=4;
actbAJX.prototype.SERV_Q_DELAY = 0;

actbAJX.prototype.m_controller;
actbAJX.prototype.m_patternParamId;
actbAJX.prototype.m_minLengthForQuery;
actbAJX.prototype.m_acValueFieldId;
actbAJX.prototype.m_keyFieldIds;
actbAJX.prototype.m_extraFields;
actbAJX.prototype.m_resultClasses;
actbAJX.prototype.m_acKeyFieldIds;
actbAJX.prototype.m_isObject;
actbAJX.prototype.m_respModel;
actbAJX.prototype.m_ic;
actbAJX.prototype.m_mid;
actbAJX.prototype.m_updateInputOnCursor;
actbAJX.prototype.m_noErrorOnNotSelected;

actbAJX.prototype.m_queryDelay;
actbAJX.prototype.resultFieldIdsToAttr;
actbAJX.prototype.resultFieldsToAttr;//[{attr,val}]



actbAJX.prototype.getMinLengthForQuery = function(){
	return this.m_minLengthForQuery;
}
actbAJX.prototype.getIsObject = function(){
	return this.m_isObject;
}
actbAJX.prototype.getQueryDelay = function(){
	return this.m_queryDelay;
}
actbAJX.prototype.fillArrayOnPattern = function(inputNode){
	var currValue = inputNode.value;
	//clear ids
	for (var i=0;i<this.m_acKeyFieldIds.length;i++){
		if(this.m_keyFieldIds[i] == undefined){
			continue;
		}	
		DOMHandler.setAttr(inputNode,"fkey_"+this.m_keyFieldIds[i],'');
	}

	this.m_array=[];
	
	if (this.m_resultFieldIdsToAttr)this.m_resultFieldsToAttr = [];
	
	if (this.m_acResFieldId){
		this.m_resArray=[];
	}
	
	if (currValue.length<this.getMinLengthForQuery()){
		this.onFillArrayEnd();
		//console.log("Min length not reached!");
		return;
	}
	var self = this;
	var params = {};
	var pm = this.m_controller.getPublicMethodById(this.m_methodId);
	params[this.m_patternParamId] = currValue;
	
	if (pm.paramExists("ic")){
		params["ic"] = this.m_ic;
	}
	if (pm.paramExists("mid")){
		params["mid"] = this.m_mid;
	}
		
	//console.log("Quering for data...");
	// debugger;
	self.m_controller.runPublicMethod(self.m_methodId,
		params,true,
		function(resp){
			self.m_respModel = resp.getModelById(self.m_modelId);
			self.m_respModel.setActive(true);	
			var descr_field_val;
			while (self.m_respModel.getNextRow()){
				descr_field_val = self.m_respModel.getFieldById(self.m_acValueFieldId).getValue();
				
				if ($.inArray(descr_field_val,self.m_array)==-1){
					self.m_array.push(descr_field_val);
				
					if (self.m_acResFieldId){
						self.m_resArray.push(self.m_respModel.getFieldById(self.m_acResFieldId).getValue());
					}
					
					if (self.m_resultFieldIdsToAttr){
						for (var rfi=0;rfi<self.m_resultFieldIdsToAttr.length;rfi++){
							
							self.m_resultFieldsToAttr.push({
								"attr":self.m_resultFieldIdsToAttr[rfi],
								"val":self.m_respModel.getFieldById(self.m_resultFieldIdsToAttr[rfi]).getValue()
							});
						}						
					}
				}
			}
			self.onFillArrayEnd();
		}
	);
}
actbAJX.prototype.setObjectId = function(inputNode,closeDisp){
	this.m_respModel.setRowBOF();
	var id_found = false;
	var val = inputNode.value.replace(/\s+$/g, '');
	while (!id_found && this.m_respModel.getNextRow()){
		var fid = (this.m_acResFieldId)? this.m_acResFieldId:this.m_acValueFieldId;
		var f_val = this.m_respModel.getFieldById(fid).getValue().replace(/\s+$/g, '');
		
		//console.log("field val="+f_val+"*");
		//console.log("inputNode="+val+"*");
		id_found = (f_val==val);
		if (id_found){
			for (var i=0;i<this.m_acKeyFieldIds.length;i++){
				if(this.m_keyFieldIds[i] == undefined){
					continue;
				}
				DOMHandler.setAttr(
					inputNode,"fkey_"+this.m_keyFieldIds[i],
					this.m_respModel.getFieldValue(this.m_acKeyFieldIds[i])
				);
				DOMHandler.setAttr(
					inputNode,"last_fkey_"+this.m_keyFieldIds[i],
					this.m_respModel.getFieldValue(this.m_acKeyFieldIds[i])
				);				
			}
			for (var i=0;i<this.m_extraFields.length;i++){
				DOMHandler.setAttr(
					inputNode,this.m_extraFields[i],
					this.m_respModel.getFieldValue(this.m_extraFields[i])
				);
			}
			if(!this.m_noErrorOnNotSelected){
				DOMHandler.removeClass(inputNode,"error");
			}			
		}
	}
	if (closeDisp && !id_found){
		/*WindowMessage.show({
			text:"Значение не выбрано",
			callBack:function(){
				inputNode.value='';
			}
		});
		*/		
	}else if (closeDisp && this.m_onSelected){
		this.m_onSelected.call(this,inputNode);
		//console.log("this.m_onSelected.call focus")
	}
}

actbAJX.prototype.unsetObjectId = function(inputNode){
	for (var i=0;i<this.m_acKeyFieldIds.length;i++){
		if(this.m_keyFieldIds[i] == undefined){
			continue;
		}	
		DOMHandler.setAttr(inputNode,"fkey_"+this.m_keyFieldIds[i],"");
	}
	for (var i=0;i<this.m_extraFields.length;i++){
		DOMHandler.setAttr(inputNode,this.m_extraFields[i],"");
	}	
}
actbAJX.prototype.isObjectIdSet = function(inputNode){
	var res=true;
	for (var i=0;i<this.m_acKeyFieldIds.length;i++){
		if(this.m_keyFieldIds[i] == undefined){
			continue;
		}	
		if (DOMHandler.getAttr(inputNode,"fkey_"+this.m_keyFieldIds[i])==""){
			res=false;
			break;
		}
	}
	return res;
}
actbAJX.prototype.setOnSelected = function(onSelected){
	this.m_onSelected = onSelected;
}
/*
*/
function actb(obj,winObj,servConnect){
	var winDocum = (winObj==undefined)? window.document:(winObj.getWindowForm==undefined)? window.document:winObj.getWindowForm().document;
	var obj = typeof(obj) == "string" ? nd(obj,winDocum) : obj;
	if( obj == null ){
	      alert( "Error:ctrl {" + obj + "} does not exist!" );
	      return false;    
	}	
	
	var ajxCon = servConnect;
	var slef = this;
	ajxCon.onFillArrayEnd = function(){
		//console.log("DOMHandler.addClass error to "+actb_curr.id)
		if(!ajxCon.m_noErrorOnNotSelected){
			DOMHandler.addClass(actb_curr,"error");
		}			
		
		_actb_tocomplete();
		if (!actb_display){
			actb_generate();
			actb_display=true;
		}		
	}
	
	/* ---- Public Variables ---- */
	this.actb_timeOut = -1; // Autocomplete Timeout in ms (-1: autocomplete never time out)
	this.actb_lim = 4;    // Number of elements autocomplete can show (-1: no limit)
	this.actb_firstText = false; // should the auto complete be limited to the beginning of keyword?
	this.actb_mouse = true; // Enable Mouse Support
	this.actb_delimiter = new Array(';',',');  // Delimiter for multiple autocomplete. Set it to empty array for single autocomplete
	this.actb_startcheck = 1; // Show widget only after this number of characters is typed in.
	/* ---- Public Variables ---- */

	/* --- Styles --- */
	this.actb_bgColor = '#888888';
	this.actb_textColor = '#FFFFFF';
	this.actb_hColor = '#000000';
	this.actb_fFamily = 'Verdana';
	this.actb_fSize = '11px';
	this.actb_hStyle = 'text-decoration:underline;font-weight="bold"';
	/* --- Styles --- */

	/* ---- Private Variables ---- */
	var actb_delimwords = new Array();
	var actb_cdelimword = 0;
	var actb_delimchar = new Array();
	var actb_display = false;
	var actb_pos = 0;
	var actb_total = 0;
	var actb_curr = null;
	var actb_rangeu = 0;
	var actb_ranged = 0;
	var actb_bool = new Array();
	var actb_pre = 0;
	var actb_toid;
	var actb_tomake = false;
	var actb_getpre = "";
	var actb_mouse_on_list = 1;
	var actb_kwcount = 0;
	var actb_caretmove = false;
	this.actb_keywords = new Array();
	/* ---- Private Variables---- */
	
	this.actb_keywords = [];
	var actb_self = this;
	
	var timeoutId;
	
	actb_curr = obj;
	
	actb_curr.setAttribute( "autocomplete",  "off");
	EventHandler.addEvent(actb_curr,"focus",
			function(){
				//console.log("addEvent for ")
				EventHandler.addEvent(winDocum,"keydown",actb_checkkey,false);
				EventHandler.addEvent(winDocum,"keypress",actb_keypress,false);				
			},
			false
		);
		
	EventHandler.addEvent(actb_curr,"blur",
			function(){
				console.log("blur")
				removeWinEvents();
				actb_removedisp();
			},
			false
		);		
	
	function removeWinEvents(){
		//console.log("removeWinEvents")
		EventHandler.removeEvent(winDocum,"keydown",actb_checkkey,false);
		EventHandler.removeEvent(winDocum,"keypress",actb_keypress,false);	
	}
		
	function actb_clear(evt){
		if (!evt) evt = event;
		//console.log("actb_curr blur remove events");
		/*
		if (ajxCon&&ajxCon.getIsObject()){
			if (!ajxCon.isObjectIdSet()){
				actb_curr.focus();
				return;
			}
		}
		*/
		removeWinEvents();
		actb_removedisp();
	}
	
	function actb_parse(n){
		if (actb_self.actb_delimiter.length > 0){
			var t = actb_delimwords[actb_cdelimword].trim().addslashes();
			var plen = actb_delimwords[actb_cdelimword].trim().length;
		}else{
			var t = actb_curr.value.addslashes();
			var plen = actb_curr.value.length;
		}
		var tobuild = '';
		var i;

		if (actb_self.actb_firstText){
			var re = new RegExp("^" + t, "i");
		}else{
			var re = new RegExp(t, "i");
		}
		var p = n.search(re);
				
		for (i=0;i<p;i++){
			tobuild += n.substr(i,1);
		}
		tobuild += "<font style='"+(actb_self.actb_hStyle)+"'>"
		for (i=p;i<plen+p;i++){
			tobuild += n.substr(i,1);
		}
		tobuild += "</font>";
			for (i=plen+p;i<n.length;i++){
			tobuild += n.substr(i,1);
		}
		return tobuild;
	}
	function unfocus_cur_table(){
		var tables = winDocum.getElementsByTagName("table");
		if (tables&&tables.length){
			for (var i=0;i<tables.length;i++){
				if (DOMHandler.hasClass(tables[i],"focused")){
					DOMHandler.removeClass(tables[i],"focused");
					break;
				}
			}
		}	
	}
	function actb_generate(){
		var node = nd('tat_table',winDocum);
		if (node){
			actb_display = false;
			node.parentNode.removeChild(node);
		} 
		if (actb_kwcount == 0){
			actb_display = false;
			return;
		}
		
		unfocus_cur_table();
		
		var a_cont = winDocum.createElement("div");
		a_cont.id = 'tat_table';
		a_cont.className = "popover";
		a_cont.setAttribute("role","tooltip");
		a_cont.style.position="absolute";
		a_cont.style.top = eval(curTop(actb_curr) + actb_curr.offsetHeight) + "px";
		a_cont.style.left = curLeft(actb_curr) + "px";
		a_cont.style.display = "block";
		
		a_cont_t = document.createElement("div");
		a_cont_t.className = "tooltip-arrow";
		a_cont_c = document.createElement('div');
		a_cont_c.className = "popover-content";
		
		a = winDocum.createElement("table");
		a.className = "table table-hover act";
		//a.cellSpacing='1px';
		//a.cellPadding='2px';
		//a.style.position='absolute';
		//a.style.top = eval(curTop(actb_curr) + actb_curr.offsetHeight) + "px";
		//a.style.left = curLeft(actb_curr) + "px";
		//a.style.backgroundColor=actb_self.actb_bgColor;
		//a.style.zIndex="9999";
		//a.id = 'tat_table';
		
		a_cont_c.appendChild(a);
		a_cont.appendChild(a_cont_t);
		a_cont.appendChild(a_cont_c);		
		winDocum.body.appendChild(a_cont);
		
		var i;
		var first = true;
		var j = 1;
		if (actb_self.actb_mouse){
			a.onmouseout = actb_table_unfocus;
			a.onmouseover = actb_table_focus;
		}
		var counter = 0;
		for (i=0;i<actb_self.actb_keywords.length;i++){
			if (actb_bool[i]){
				counter++;
				r = a.insertRow(-1);
				
				//class
				if (ajxCon && ajxCon.m_resultFieldsToAttr){
					r.setAttribute(ajxCon.m_resultFieldsToAttr[i].attr,ajxCon.m_resultFieldsToAttr[i].val);
				}
				
				var ref_cl = null;
				if (first && !actb_tomake){
					//r.style.backgroundColor = actb_self.actb_hColor;
					first = false;
					actb_pos = counter;
					ref_cl = "acCurrent";
				}else if(actb_pre == i){
					//r.style.backgroundColor = actb_self.actb_hColor;
					first = false;
					actb_pos = counter;
				}else{
					//r.style.backgroundColor = actb_self.actb_bgColor;
				}
				r.id = 'tat_tr'+(j);
				c = r.insertCell(-1);
				if (ref_cl){
					c.setAttribute("class",ref_cl);
				}
				
				//c.style.color = actb_self.actb_textColor;
				//c.style.fontFamily = actb_self.actb_fFamily;
				//c.style.fontSize = actb_self.actb_fSize;				
				
				if (ajxCon && ajxCon.m_fullTextSearch){
					c.innerHTML = actb_self.actb_keywords[i];
				}
				else{
					c.innerHTML = actb_parse(actb_self.actb_keywords[i]);
				}
				
				c.id = 'tat_td'+(j);
				c.setAttribute('pos',j);
				if (actb_self.actb_mouse){
					c.style.cursor = 'pointer';
					c.onclick=actb_mouseclick;
					c.onmouseover = actb_table_highlight;
				}
				j++;
			}
			if (j - 1 == actb_self.actb_lim && j < actb_total){
				r = a.insertRow(-1);
				//r.style.backgroundColor = actb_self.actb_bgColor;
				c = r.insertCell(-1);
				//c.style.color = actb_self.actb_textColor;
				//c.style.fontFamily = 'arial narrow';
				//c.style.fontSize = actb_self.actb_fSize;
				c.align='center';
				replaceHTML(c,'\\/',winDocum);
				if (actb_self.actb_mouse){
					c.style.cursor = 'pointer';
					c.onclick = actb_mouse_down;
				}
				break;
			}
		}
		actb_rangeu = 1;
		actb_ranged = j-1;
		actb_display = true;
		if (actb_pos <= 0) actb_pos = 1;
	}
	function actb_remake(){
		actb_generate();
		return;
		/*
		winDocum.body.removeChild(nd("tat_table",winDocum));
		a = winDocum.createElement("table");
		a.className = "table table-hover act";
		//a.cellSpacing='1px';
		//a.cellPadding='2px';
		a.style.position='absolute';
		a.style.top = eval(curTop(actb_curr) + actb_curr.offsetHeight) + "px";
		a.style.left = curLeft(actb_curr) + "px";
		//a.style.backgroundColor=actb_self.actb_bgColor;
		a.id = 'tat_table';
		if (actb_self.actb_mouse){
			a.onmouseout= actb_table_unfocus;
			a.onmouseover=actb_table_focus;
		}
		winDocum.body.appendChild(a);
		
		var i;
		var first = true;
		var j = 1;
		if (actb_rangeu > 1){
			r = a.insertRow(-1);
			//r.style.backgroundColor = actb_self.actb_bgColor;
			c = r.insertCell(-1);
			//c.style.color = actb_self.actb_textColor;
			//c.style.fontFamily = 'arial narrow';
			//c.style.fontSize = actb_self.actb_fSize;
			c.align='center';
			replaceHTML(c,'/\\',winDocum);
			if (actb_self.actb_mouse){
				c.style.cursor = 'pointer';
				c.onclick = actb_mouse_up;
			}
		}
		for (i=0;i<actb_self.actb_keywords.length;i++){
			if (actb_bool[i]){
				if (j >= actb_rangeu && j <= actb_ranged){
					r = a.insertRow(-1);
					//r.style.backgroundColor = actb_self.actb_bgColor;
					r.id = 'tat_tr'+(j);
					c = r.insertCell(-1);
					//c.style.color = actb_self.actb_textColor;
					//c.style.fontFamily = actb_self.actb_fFamily;
					//c.style.fontSize = actb_self.actb_fSize;
					c.innerHTML = actb_parse(actb_self.actb_keywords[i]);
					c.id = 'tat_td'+(j);
					c.setAttribute('pos',j);
					if (actb_self.actb_mouse){
						c.style.cursor = 'pointer';
						c.onclick=actb_mouseclick;
						c.onmouseover = actb_table_highlight;
					}
					j++;
				}else{
					j++;
				}
			}
			if (j > actb_ranged) break;
		}
		if (j-1 < actb_total){
			r = a.insertRow(-1);
			//r.style.backgroundColor = actb_self.actb_bgColor;
			c = r.insertCell(-1);
			//c.style.color = actb_self.actb_textColor;
			//c.style.fontFamily = 'arial narrow';
			//c.style.fontSize = actb_self.actb_fSize;
			c.align='center';
			replaceHTML(c,'\\/',winDocum);
			if (actb_self.actb_mouse){
				c.style.cursor = 'pointer';
				c.onclick = actb_mouse_down;
			}
		}
		*/
	}
	function actb_goup(){
		if (!actb_display) return;
		if (actb_pos == 1) return;
		DOMHandler.removeClass(winDocum.getElementById("tat_td"+actb_pos),"acCurrent");
		actb_pos--;
		if (actb_pos < actb_rangeu) actb_moveup();
		DOMHandler.addClass(winDocum.getElementById("tat_td"+actb_pos),"acCurrent");
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);		
		if(ajxCon&&ajxCon.m_updateInputOnCursor){
			actb_caretmove = 1;
			actb_penter(null,false);		
		}		
	}
	function actb_godown(){
		if (!actb_display) return;
		if (actb_pos == actb_total) return;
		var nd=winDocum.getElementById("tat_td"+actb_pos);
		//console.dir(nd)
		DOMHandler.removeClass(nd,"acCurrent");
		actb_pos++;
		if (actb_pos > actb_ranged) actb_movedown();
		DOMHandler.addClass(winDocum.getElementById("tat_td"+actb_pos),"acCurrent");
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);
		
		if(ajxCon&&ajxCon.m_updateInputOnCursor){
			actb_caretmove = 1;
			actb_penter(null,false);		
		}
	}
	function actb_movedown(){
		actb_rangeu++;
		actb_ranged++;
		actb_remake();
	}
	function actb_moveup(){
		actb_rangeu--;
		actb_ranged--;
		actb_remake();
	}

	/* Mouse */
	function actb_mouse_down(){
		//winDocum.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
		actb_pos++;
		actb_movedown();
		//winDocum.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
		actb_curr.focus();
		actb_mouse_on_list = 0;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);
	}
	function actb_mouse_up(evt){
		if (!evt) evt = event;
		if (evt.stopPropagation){
			evt.stopPropagation();
		}else{
			evt.cancelBubble = true;
		}
		//winDocum.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
		actb_pos--;
		actb_moveup();
		//winDocum.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
		actb_curr.focus();
		actb_mouse_on_list = 0;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);
	}
	function actb_mouseclick(evt){
		if (!evt) evt = event;
		if (!actb_display) return;
		actb_mouse_on_list = 0;
		actb_pos = this.getAttribute('pos');
		actb_penter(null,true);
	}
	function actb_table_focus(){
		actb_mouse_on_list = 1;
		if(ajxCon&&ajxCon.m_updateInputOnCursor){
			actb_penter(null,false);
		}
	}
	function actb_table_unfocus(){
		actb_mouse_on_list = 0;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list = 0;actb_removedisp();},actb_self.actb_timeOut);
	}
	function actb_table_highlight(){
		actb_mouse_on_list = 1;
		//winDocum.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
		actb_pos = this.getAttribute('pos');
		while (actb_pos < actb_rangeu) actb_moveup();
		while (actb_pos > actb_ranged) actb_movedown();
		//winDocum.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list = 0;actb_removedisp();},actb_self.actb_timeOut);
	}
	/* ---- */

	function actb_insertword(a,closeDisp){
		if (ajxCon){
			actb_curr.value = a;
			actb_curr.focus();
		}
		else{
			if (actb_self.actb_delimiter.length > 0){
				str = '';
				l=0;
				for (i=0;i<actb_delimwords.length;i++){
					if (actb_cdelimword == i){
						prespace = postspace = '';
						gotbreak = false;
						for (j=0;j<actb_delimwords[i].length;++j){
							if (actb_delimwords[i].charAt(j) != ' '){
								gotbreak = true;
								break;
							}
							prespace += ' ';
						}
						for (j=actb_delimwords[i].length-1;j>=0;--j){
							if (actb_delimwords[i].charAt(j) != ' ') break;
							postspace += ' ';
						}
						str += prespace;
						str += a;
						l = str.length;
						if (gotbreak) str += postspace;
					}else{
						str += actb_delimwords[i];
					}
					if (i != actb_delimwords.length - 1){
						str += actb_delimchar[i];
					}
				}
				actb_curr.value = str;
				setCaret(actb_curr,l);
			}else{
				actb_curr.value = a;
			}
		}
		//added for AJAX support
		if (ajxCon!=undefined && ajxCon.getIsObject()){
			ajxCon.setObjectId(actb_curr,closeDisp);
			removeWinEvents();//added 03/03/23
		}
		else if(!ajxCon.m_noErrorOnNotSelected){
			DOMHandler.removeClass(actb_curr,"error");
		}
		if (closeDisp){
			actb_mouse_on_list = 0;
			actb_removedisp();
		}
	}
	function actb_penter(evt,closeDisp){
		if (!actb_display) return;
		if (closeDisp)
			actb_display = false;
		var word = '';
		var c = 0;
		for (var i=0;i<=actb_self.actb_keywords.length;i++){
			if (actb_bool[i]) c++;
			if (c == actb_pos){
				if (ajxCon && ajxCon.m_resArray && ajxCon.m_resArray.length){
					word = ajxCon.m_resArray[i];
				}
				else{
					word = actb_self.actb_keywords[i];
				}
				break;
			}
		}
		actb_insertword(word,closeDisp);
		l = getCaretStart(actb_curr,winDocum);
	}
	function actb_removedisp(){
		if (actb_mouse_on_list==0){
			actb_display = 0;
			if (winDocum.getElementById('tat_table')){ winDocum.body.removeChild(winDocum.getElementById('tat_table')); }
			if (actb_toid) clearTimeout(actb_toid);
		}
	}
	function actb_keypress(e){
		if (actb_caretmove) stopEvent(e);
		if (timeoutId){
			window.clearTimeout(timeoutId);
		}
		return !actb_caretmove;
	}
	//
	function actb_checkkey(evt){
		if (!evt) evt = event;
		a = evt.keyCode;
		caret_pos_start = getCaretStart(actb_curr,winDocum);
		actb_caretmove = 0;
		//console.log("Key event "+a);
		switch (a){
			case 38:
				actb_goup();
				actb_caretmove = 1;
				return false;
				break;
			case 40:
				actb_godown();
				actb_caretmove = 1;
				return false;
				break;
			case 13: case 9:
				if (actb_display){
					actb_caretmove = 1;
					actb_penter(evt,true);
					//evt.stopPropagation();
					return false;
				}else{
					return true;
				}
				break;
			case 8: case 46:
				if (ajxCon!=undefined && actb_curr.value!=""){			
					ajxCon.fillArrayOnPattern(actb_curr);
				}			
				return true;
			case 27:
				return false;
			default:
				setTimeout(function(){actb_tocomplete(a)},50);
				break;
		}
	}
	function actb_tocomplete(kc){
		/*
		if (kc == 38 || kc == 40 || kc == 13) return;
		
		if(timeoutId){
			window.clearTimeout(timeoutId);
		}
		
		if (ajxCon!=undefined && actb_curr.value!=""){			
			if (ajxCon.getQueryDelay()){
				timeoutId = window.setTimeout(function(){
					ajxCon.unsetObjectId(actb_curr);
					ajxCon.fillArrayOnPattern(actb_curr);
					_actb_tocomplete();
					window.clearTimeout(timeoutId);
				},ajxCon.getQueryDelay());
			}
			else{
				ajxCon.unsetObjectId(actb_curr);
				ajxCon.fillArrayOnPattern(actb_curr);
				_actb_tocomplete();			
			}
		}
		*/
		//if (kc<46) return;
		//added for AJAX support
		if (ajxCon!=undefined && actb_curr.value!=""){	
			ajxCon.unsetObjectId(actb_curr);		
			ajxCon.fillArrayOnPattern(actb_curr);
		}
		//added for AJAX support		
		_actb_tocomplete();		
	}
	function _actb_tocomplete(){		
		if (ajxCon!=undefined && actb_curr.value!=""){			
			actb_keywords = ajxCon.m_array;
		}
		var i;
		if (actb_display){ 
			var word = 0;
			var c = 0;
			for (var i=0;i<=actb_self.actb_keywords.length;i++){
				if (actb_bool[i]) c++;
				if (c == actb_pos){
					word = i;
					break;
				}
			}
			actb_pre = word;
		}else{ actb_pre = -1};
		
		if (actb_curr.value == ''){
			actb_mouse_on_list = 0;
			actb_removedisp();
			return;
		}
		
		
		if (actb_self.actb_delimiter.length > 0){
			caret_pos_start = getCaretStart(actb_curr,winDocum);
			caret_pos_end = getCaretEnd(actb_curr,winDocum);
			
			delim_split = '';
			for (i=0;i<actb_self.actb_delimiter.length;i++){
				delim_split += actb_self.actb_delimiter[i];
			}
			delim_split = delim_split.addslashes();
			delim_split_rx = new RegExp("(["+delim_split+"])");
			c = 0;
			actb_delimwords = new Array();
			actb_delimwords[0] = '';
			for (i=0,j=actb_curr.value.length;i<actb_curr.value.length;i++,j--){
				if (actb_curr.value.substr(i,j).search(delim_split_rx) == 0){
					ma = actb_curr.value.substr(i,j).match(delim_split_rx);
					actb_delimchar[c] = ma[1];
					c++;
					actb_delimwords[c] = '';
				}else{
					actb_delimwords[c] += actb_curr.value.charAt(i);
				}
			}

			var l = 0;
			actb_cdelimword = -1;
			for (i=0;i<actb_delimwords.length;i++){
				if (caret_pos_end >= l && caret_pos_end <= l + actb_delimwords[i].length){
					actb_cdelimword = i;
				}
				l+=actb_delimwords[i].length + 1;
			}
			var ot = actb_delimwords[actb_cdelimword].trim(); 
			var t = actb_delimwords[actb_cdelimword].addslashes().trim();
		}else{
			var ot = actb_curr.value;
			var t = actb_curr.value.addslashes();
		}
		if (ot.length == 0){
			actb_mouse_on_list = 0;
			actb_removedisp();
		}
		if (ot.length < actb_self.actb_startcheck) return this;
		if (actb_self.actb_firstText){
			var re = new RegExp("^" + t, "i");
		}else{
			var re = new RegExp(t, "i");
		}
		

		actb_total = 0;
		actb_tomake = false;
		actb_kwcount = 0;
		for (i=0;i<actb_self.actb_keywords.length;i++){
			actb_bool[i] = false;
			//if (re.test(actb_self.actb_keywords[i])){
				actb_total++;
				actb_bool[i] = true;
				actb_kwcount++;
				if (actb_pre == i) actb_tomake = true;
			//}
		}

		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list = 0;actb_removedisp();},actb_self.actb_timeOut);
		actb_generate();
	}
	return this;
}
