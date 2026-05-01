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

function stopSelect(obj){
	if (typeof obj.onselectstart != 'undefined'){
		EventHelper.add(obj,"selectstart",function(){ return false;});
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

function replaceHTML(obj,text,winDocum){
	while(el = obj.childNodes[0]){
		obj.removeChild(el);
	};
	obj.appendChild(winDocum.createTextNode(text));
}

/**
 * @param {object} options
 * @param {int} [options.minLengthForQuery=MIN_LEN_FOR_QUERY]
 * @param {function} options.onSelect
 * @param {string} [options.patternFieldId=DEF_PATTERN_FIELD] 
 * @param {PublicMethod} options.publicMethod
 * @param {Model} options.model
 * @param {Edit} options.control
 * @param {array} options.keyFields
 * @param {array} options.descrFields
 * @param {function} options.descrFunction
 * @param {int} [options.icase=DEF_IC]
 * @param {int} [options.mid=DEF_MID]
 * @param {int} options.count if defined and result has less rows, button will appear for fetching more rows
 * @param {int} [options.servQueryTimeout=DEF_SERV_QUERY_TIMEOUT]
 * @param {array} resultFieldIdsToAttr
 * @param {function} onBeforeSendQuery fired before fetch query is sent. Should return bool. If false is returned query will not be send.
 */
function actbAJX(options){
	options = options || {};

	this.setMinLengthForQuery((options.minLengthForQuery != undefined) ? options.minLengthForQuery : this.MIN_LEN_FOR_QUERY);
	this.setOnSelect(options.onSelect);
	this.setPatternFieldId(options.patternFieldId || this.DEF_PATTERN_FIELD);
	this.setPublicMethod(options.publicMethod);
	this.setModel(options.model);
	this.setControl(options.control);
	this.setKeyFields(options.keyFields);
	this.setDescrFields(options.descrFields);
	this.setDescrFunction(options.descrFunction);
	this.setIc(options.icase || this.DEF_IC);
	this.setMid(options.mid || this.DEF_MID);
	this.setCount(options.count);

	this.m_onBeforeSendQuery = options.onBeforeSendQuery;
	this.m_onSendQueryResult = options.onSendQueryResult;

	this.m_resultFieldIdsToAttr = options.resultFieldIdsToAttr;
	this.m_onCompleteTextOut = options.onCompleteTextOut;

	this.m_servQueryTimeout = options.servQueryTimeout || this.DEF_SERV_QUERY_TIMEOUT;

	this.setQueryDebounce((options.queryDebounce != undefined) ? options.queryDebounce : this.DEF_QUERY_DEBOUNCE);

	this.m_queryTimer = null;
	this.m_querySeq = 0;
	this.m_activeRequests = 0;
	this.m_lastRequestHandle = null;
	this.m_queryActive = false;
	this.m_queryActiveTime = 0;

	this.setEnabled((options.enabled != undefined) ? options.enabled : true);
}

actbAJX.prototype.DEF_PATTERN_FIELD = "pattern";
actbAJX.prototype.MIN_LEN_FOR_QUERY = 4;
actbAJX.prototype.DEF_SERV_QUERY_TIMEOUT = 2000;
actbAJX.prototype.DEF_IC = "1";
actbAJX.prototype.DEF_MID = "0";

actbAJX.prototype.m_minLengthForQuery;
actbAJX.prototype.m_ic;
actbAJX.prototype.m_mid;

actbAJX.prototype.m_count;
actbAJX.prototype.m_countSend;//bool, if true count parameter will be send

actbAJX.prototype.m_patternFieldId;
actbAJX.prototype.m_publicMethod;
actbAJX.prototype.m_model;
actbAJX.prototype.m_control;

actbAJX.prototype.m_queryActive;
actbAJX.prototype.m_servQueryTimeout;

actbAJX.prototype.m_keyFields;
actbAJX.prototype.m_descrFields;
actbAJX.prototype.m_descrFunction;

actbAJX.prototype.m_onBeforeSendQuery;
actbAJX.prototype.m_onSendQueryResult;

//debounce mechenism
actbAJX.prototype.DEF_QUERY_DEBOUNCE = 300;

actbAJX.prototype.m_queryDebounce;
actbAJX.prototype.m_queryTimer;
actbAJX.prototype.m_querySeq;
actbAJX.prototype.m_activeRequests;
actbAJX.prototype.m_lastRequestHandle;

actbAJX.prototype.getQueryDebounce = function(){
	return this.m_queryDebounce;
};

actbAJX.prototype.setQueryDebounce = function(v){
	this.m_queryDebounce = (v == undefined || v < 0) ? 0 : v;
};

actbAJX.prototype.clearResultArrays = function(){
	this.m_keywords = [];
	this.m_keywordKeys = [];

	if (this.m_resultFieldIdsToAttr){
		this.m_resultFieldsToAttr = [];
	}
};

actbAJX.prototype.abortActiveRequest = function(){
	if (this.m_lastRequestHandle && typeof this.m_lastRequestHandle.abort == "function"){
		try{
			this.m_lastRequestHandle.abort();
		}
		catch(e){
		}
	}

	this.m_lastRequestHandle = null;
};

actbAJX.prototype.fillArrayOnPattern = function(inputNode){
	if (!this.getEnabled()){
		return;
	}

	var self = this;
	var currValue = inputNode.value;

	// invalidate all older scheduled / in-flight responses
	var requestSeq = ++this.m_querySeq;

	// clear selected keys immediately when user changes text
	if (this.m_control.resetKeys){
		this.m_control.resetKeys();
	}

	if (this.m_queryTimer){
		clearTimeout(this.m_queryTimer);
		this.m_queryTimer = null;
	}

	if (currValue.length < this.getMinLengthForQuery()){
		this.abortActiveRequest();
		this.clearResultArrays();
		this.m_queryActive = false;
		this.onFillArrayEnd();
		return;
	}

	if (this.m_onBeforeSendQuery && !this.m_onBeforeSendQuery()){
		return;
	}

	this.m_queryTimer = setTimeout(
		function(){
			self.m_queryTimer = null;
			self.runQueryOnPattern(inputNode, currValue, requestSeq);
		},
		this.getQueryDebounce()
	);
};

actbAJX.prototype.runQueryOnPattern = function(inputNode, patternValue, requestSeq){
	if (!this.getEnabled()){
		return;
	}

	// a newer keystroke already happened
	if (requestSeq !== this.m_querySeq){
		return;
	}

	var pm = this.getPublicMethod();
	var contr = pm.getController();

	pm.setFieldValue(this.getPatternFieldId(), patternValue);
	pm.setFieldValue(contr.PARAM_IC, this.getIc());
	pm.setFieldValue(contr.PARAM_MID, this.getMid());

	var cnt = this.getCount();
	if (cnt){
		if (this.m_countSend){
			pm.setFieldValue(contr.PARAM_COUNT, cnt);
		}
		else{
			pm.unsetFieldValue(contr.PARAM_COUNT);
		}
	}

	// optional abort if pm.run() returns an abortable handle
	this.abortActiveRequest();

	this.m_queryActive = true;
	this.m_queryActiveTime = (new Date()).getTime();
	this.m_activeRequests++;

	var self = this;
	var requestHandle = pm.run({
		"async":"true",
		"ok":function(resp){
			// ignore stale response
			if (requestSeq !== self.m_querySeq){
				return;
			}

			if (self.m_onSendQueryResult){
				self.m_onSendQueryResult(resp);
			}

			self.onGetData(resp);
		},
		"fail":function(resp, errCode, errStr){
			// ignore stale failure too
			if (requestSeq !== self.m_querySeq){
				return;
			}

			window.showError(window.getApp().formatError(errCode, errStr));
		},
		"all":function(){
			self.m_activeRequests--;
			if (self.m_activeRequests < 0){
				self.m_activeRequests = 0;
			}
			self.m_queryActive = (self.m_activeRequests > 0);

			if (self.m_lastRequestHandle === requestHandle){
				self.m_lastRequestHandle = null;
			}
		}
	});

	this.m_lastRequestHandle = requestHandle || null;
};

actbAJX.prototype.onGetData = function(resp){
	if (resp.modelExists(this.m_model.getId())){
		this.m_model.setData(resp.getModelData(this.m_model.getId()));
	}
	else{
		throw new Error(CommonHelper.format(this.ER_NO_MODEL, Array(this.m_model.getId())));
	}

	this.clearResultArrays();

	var ctrl_key_ids;
	if (this.m_control.getKeyIds){
		ctrl_key_ids = this.m_control.getKeyIds();
	}

	while (this.m_model.getNextRow()){
		var res_val = "";
		var key_attrs;

		if (this.m_resultFieldIdsToAttr){
			key_attrs = [];
		}

		if (this.m_descrFunction){
			res_val = this.m_descrFunction.call(this, this.m_model.getFields());
		}
		else{
			for (var fid in this.m_descrFields){
				res_val += (res_val) ? " " : "";

				var f_val = this.m_descrFields[fid].getValue();

				if (typeof f_val == "object" && f_val.getDescr){
					res_val += f_val.getDescr();
				}
				else if (!this.m_descrFields[fid].isNull() && this.m_descrFields[fid].isSet()){
					res_val += f_val;
				}
			}
		}

		var keys = {};
		for (var fn = 0; fn < this.m_keyFields.length; fn++){
			if (ctrl_key_ids){
				keys[ctrl_key_ids[fn]] = this.m_keyFields[fn].getValue();
			}
		}

		if (this.m_resultFieldIdsToAttr){
			for (var rfi = 0; rfi < this.m_resultFieldIdsToAttr.length; rfi++){
				key_attrs.push({
					"attr": this.m_resultFieldIdsToAttr[rfi],
					"val": this.m_model.getFieldValue(this.m_resultFieldIdsToAttr[rfi])
				});
			}
		}

		this.m_keywordKeys.push(keys);
		this.m_keywords.push(res_val);

		if (this.m_resultFieldIdsToAttr){
			this.m_resultFieldsToAttr.push(key_attrs);
		}
	}

	this.onFillArrayEnd();
};

/**
 * Setting object keys
 */
actbAJX.prototype.onSelected = function(wordPos, node){
	if(this.m_control&&this.m_control.getIsRef())
		//always null-ref
		//DOMHelper.delClass(node, "null-ref");		
		this.m_control.setKeys(this.m_keywordKeys[wordPos]);
	
	if (this.m_onSelect){
		this.m_model.getRow(wordPos);
		//this.m_onSelect.call(this.m_control,this.m_model.getFields());
		this.m_control.onSelectValue(this.m_model.getFields());
	}
	
}
/*
actbAJX.prototype.isObjectIdSet = function(inputNode){
	var res=true;
	for (var i=0;i<this.m_acKeyFieldIds.length;i++){
		if (DOMHelper.getAttr(inputNode,"fkey_"+this.m_keyFieldIds[i])==""){
			res=false;
			break;
		}
	}
	return res;
}
*/
/* public */
actbAJX.prototype.getMinLengthForQuery = function(){
	return this.m_minLengthForQuery;
}
actbAJX.prototype.setMinLengthForQuery = function(v){
	this.m_minLengthForQuery = v;
}

actbAJX.prototype.getIc = function(){
	return this.m_ic;
}
actbAJX.prototype.setIc = function(v){
	this.m_ic = v;
}

actbAJX.prototype.getMid = function(){
	return this.m_mid;
}
actbAJX.prototype.setMid = function(v){
	this.m_mid = v;
}
actbAJX.prototype.getCount = function(){
	return this.m_count;
}
actbAJX.prototype.setCount = function(v){
	this.m_count = v;
	this.m_countSend = (v? true:false);
}

actbAJX.prototype.getEnabled = function(){
	return this.m_enabled;
}
actbAJX.prototype.setEnabled = function(v){
	this.m_enabled = v;
}

actbAJX.prototype.setOnSelect = function(v){
	this.m_onSelect = v;
}

actbAJX.prototype.getOnSelect = function(){
	return this.m_onSelect;
}

actbAJX.prototype.setPublicMethod = function(v){
	this.m_publicMethod = v;
}

actbAJX.prototype.getPublicMethod = function(){
	return this.m_publicMethod;
}

actbAJX.prototype.setPatternFieldId = function(v){
	this.m_patternFieldId = v;
}

actbAJX.prototype.getPatternFieldId = function(){
	return this.m_patternFieldId;
}

actbAJX.prototype.setModel = function(v){
	this.m_model = v;
}

actbAJX.prototype.getModel = function(){
	return this.m_model;
}

actbAJX.prototype.setControl = function(v){
	this.m_control = v;
}

actbAJX.prototype.getControl = function(){
	return this.m_control;
}

actbAJX.prototype.setDescrFields = function(v){
	this.m_descrFields = v;
}

actbAJX.prototype.getDescrFields = function(){
	return this.m_descrFields;
}
actbAJX.prototype.setDescrFunction = function(v){
	this.m_descrFunction = v;
}

actbAJX.prototype.getDescrFunction = function(){
	return this.m_descrFunction;
}

actbAJX.prototype.setKeyFields = function(v){
	this.m_keyFields = v;
}

actbAJX.prototype.getKeyFields = function(){
	return this.m_keyFields;
}

//****************************************************************************************
/*
*/
function actb(obj,winObj,servConnect){
	var winDocum = (winObj==undefined)? window.document:(winObj.getWindowForm==undefined)? window.document:winObj.getWindowForm().document;
	var obj = typeof(obj) == "string" ? CommonHelper.nd(obj,winDocum) : obj;
	if( obj == null ){
	      alert( "Error:ctrl {" + obj + "} does not exist!" );
	      return false;    
	}	
	
	if(servConnect){
		var ajxCon = servConnect;
		var slef = this;
		ajxCon.onFillArrayEnd = function(){
			_actb_tocomplete();
			if (!actb_display){
				actb_generate();
				actb_display=true;
			}
		}
		ajxCon.delDOM = function(){
			if (winDocum.getElementById('tat_table')){ winDocum.body.removeChild(winDocum.getElementById('tat_table')); }
			if (actb_toid) clearTimeout(actb_toid);
			//actb_removedisp();
		}
	}
		
	/* ---- Public Variables ---- */
	this.actb_timeOut = -1; // Autocomplete Timeout in ms (-1: autocomplete never time out)
	this.actb_lim = 4;    // Number of elements autocomplete can show (-1: no limit)
	this.actb_firstText = false; // should the auto complete be limited to the beginning of keyword?
	this.actb_mouse = true; // Enable Mouse Support
	this.actb_delimiter = new Array(';',',',' ');  // Delimiter for multiple autocomplete. Set it to empty array for single autocomplete
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
	//this.actb_keywords = new Array();
	/* ---- Private Variables---- */
	
	this.actb_keywords = [];
	var actb_self = this;
	
	actb_curr = obj;
	
	actb_curr.setAttribute( "autocomplete",  "off");
	EventHelper.add(actb_curr,"focus",
			function(){
				EventHelper.add(winDocum,"keydown",actb_checkkey,false);
				EventHelper.add(winDocum,"keypress",actb_keypress,false);
				
				if (DOMHelper.hasClass(actb_curr,"null-ref") || (ajxCon && ajxCon.getControl().getIsRef() && ajxCon.getControl().isNull()) ){
					//always null-ref
					DOMHelper.delClass(actb_curr, "null-ref");
					actb_generate();
				}
				if(ajxCon && !ajxCon.getMinLengthForQuery() && !actb_curr.value.length){
					actb_display = true;
					ajxCon.fillArrayOnPattern(actb_curr);
				}
			},
			false
		);
	EventHelper.add(actb_curr,"blur",
			function(){
				//EventHelper.del(winDocum,"keydown",actb_checkkey,false);
				//EventHelper.del(winDocum,"keypress",actb_keypress,false);
				removeWinEvents();
				if (actb_curr.value.length && servConnect && servConnect.getControl().getIsRef() && servConnect.getControl().isNull()){
					//no key
					//always null-ref
					DOMHelper.addClass(actb_curr, "null-ref");
				}
				//console.log("actb_removedisp actb_mouse_on_list="+actb_mouse_on_list)
				////if selection is active and mouse over it - do not remove
				//actb_mouse_on_list = 0; //does not work this way!!!
				actb_removedisp();
			},
			false
		);
	function removeWinEvents(){
		//console.log("removeWinEvents")
		EventHelper.del(winDocum,"keydown",actb_checkkey,false);
		EventHelper.del(winDocum,"keypress",actb_keypress,false);	
	}
				
	/*function actb_clear(evt){
		if (!evt) evt = event;
		EventHelper.del(winDocum,"keydown",actb_checkkey,false);
		EventHelper.del(actb_curr,"blur",actb_clear,false);
		EventHelper.del(winDocum,"keypress",actb_keypress,false);
		actb_removedisp();
	}*/
	
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
				if (DOMHelper.hasClass(tables[i],"focused")){
					DOMHelper.delClass(tables[i],"focused");
					break;
				}
			}
		}	
	}
	function actb_generate(){
	//console.log("actb_generate()")
		var node = CommonHelper.nd('tat_table',winDocum);
		if (node){
			actb_display = false;
			node.parentNode.removeChild(node);
		} 
		if (actb_kwcount == 0){
			actb_display = false;
			//console.log("actb_generate() actb_kwcount=0, setting actb_display = false")
			return;
		}
		
		unfocus_cur_table();
		
		var a_cont = winDocum.createElement("UL");
		a_cont.id = "tat_table";
		a_cont.className = "dropdown-menu";//popover
		//a_cont.setAttribute("role","tooltip");
		a_cont.style.position="absolute";
		a_cont.style.zIndex = "99999";//1060
		a_cont.style.top = ($(actb_curr).offset().top+$(actb_curr).outerHeight())+"px";		
		a_cont.style.left = $(actb_curr).offset().left+"px";
		a_cont.style["overflow-y"] = "scroll";
		if(ajxCon && ajxCon.getCount() && !ajxCon.m_countSend && ajxCon.m_listMaxHeight){
			a_cont.style["max-height"] = ajxCon.m_listMaxHeight + "px";
		}
		
		a_cont.style.display = "block";
		
		a = winDocum.createElement("LI");
		//a.className = "table table-hover act";
				
		var i;
		var first = true;
		var j = 1;
		if (actb_self.actb_mouse){
			a.onmouseout = actb_table_unfocus;
			a.onmouseover = actb_table_focus;
		}
		var counter = 0;
		for (i=0;i<actb_self.actb_keywords.length;i++){
			var c;
			if (actb_bool[i]){
				counter++;
				var ref_cl = "autoComplete";
				if (first && !actb_tomake){
					first = false;
					actb_pos = counter;
					ref_cl = ref_cl+" acCurrent";
				}else if(actb_pre == i){
					first = false;
					actb_pos = counter;
				}
				
				c = winDocum.createElement("A");
				c.setAttribute("href","#");
				if (ref_cl){
					c.setAttribute("class",ref_cl);
				}
				
				var ac_html = actb_parse(actb_self.actb_keywords[i]);
				
				//class				
				if (ajxCon){
					if (ajxCon.m_resultFieldIdsToAttr && ajxCon.m_resultFieldsToAttr && ajxCon.m_resultFieldsToAttr[i]){
						for (attr_i=0;attr_i<ajxCon.m_resultFieldsToAttr[i].length;attr_i++){
							c.setAttribute(ajxCon.m_resultFieldsToAttr[i][attr_i].attr,ajxCon.m_resultFieldsToAttr[i][attr_i].val);
						}
					}
					if(ajxCon.m_onCompleteTextOut){
						var r;
						if(ajxCon.getModel().getRow(i)){
							r = ajxCon.getModel().getFields();
						}
						ac_html = ajxCon.m_onCompleteTextOut(ac_html,r);
					}
				}
				
				c.innerHTML = ac_html;
				
				c.id = 'tat_td'+(j);
				c.setAttribute('pos',j);
				if (actb_self.actb_mouse){
					c.style.cursor = 'pointer';
					c.onclick=actb_mouseclick;
					//c.onmouseover = actb_table_highlight;
				}
				j++;
				
				a.appendChild(c);		
			}
			/*
			if (j - 1 == actb_self.actb_lim && j < actb_total){
				
				c = winDocum.createElement("A");
				c.setAttribute("href","#");

				replaceHTML(c,'\\/',winDocum);
				if (actb_self.actb_mouse){
					c.style.cursor = 'pointer';
					c.onclick = actb_mouse_down;
				}
				a.appendChild(c);
				break;
			}
			*/
		}
		if (ajxCon){
			var cnt = ajxCon.getCount();
			if (cnt && ajxCon.m_countSend && counter == cnt){
				//fetch more...
				var txt = winDocum.createElement("DIV");
				txt.setAttribute("class", "text-muted text-center acFetchMore");
				txt.setAttribute("title", actbAJX.prototype.FETCH_TITLE);
				txt.textContent = actbAJX.prototype.FETCH_LABEL;
				txt.onclick = (function(conn){
					return function(){
						var cont = document.getElementById("tat_table");
						conn.m_listMaxHeight = cont.offsetHeight;
						cont.style.maxHeight = (conn.m_listMaxHeight + "px");
						conn.m_countSend = false;
						conn.fillArrayOnPattern(actb_curr);
					}
				})(ajxCon)
				a.appendChild(txt);		
			}
		}		
		a_cont.appendChild(a);		
				
		winDocum.body.appendChild(a_cont);
		
		actb_rangeu = 1;
		actb_ranged = j-1;
		actb_display = true;
		if (actb_pos <= 0) actb_pos = 1;
	}
	function actb_remake(){
		actb_generate();
		return;
		/*
		winDocum.body.removeChild(CommonHelper.nd("tat_table",winDocum));
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
		DOMHelper.delClass(winDocum.getElementById("tat_td"+actb_pos),"acCurrent");
		actb_pos--;
		if (actb_pos < actb_rangeu) actb_moveup();
		DOMHelper.addClass(winDocum.getElementById("tat_td"+actb_pos),"acCurrent");
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);		
	}
	function actb_godown(){
		if (!actb_display) return;
		if (actb_pos == actb_total) return;
		var nd=winDocum.getElementById("tat_td"+actb_pos);
		//console.dir(nd)
		DOMHelper.delClass(nd,"acCurrent");
		actb_pos++;
		if (actb_pos > actb_ranged) actb_movedown();
		DOMHelper.addClass(winDocum.getElementById("tat_td"+actb_pos),"acCurrent");
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);
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
	/*function actb_mouse_down(evt){
		evt = EventHelper.fixKeyEvent(evt);
		if (evt.preventDefault){
			evt.preventDefault();
		}
		evt.stopPropagation();
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
		evt = EventHelper.fixKeyEvent(evt);
		if (evt.preventDefault){
			evt.preventDefault();
		}
		evt.stopPropagation();
		//winDocum.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
		actb_pos--;
		actb_moveup();
		//winDocum.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
		actb_curr.focus();
		actb_mouse_on_list = 0;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);
	}*/
	function actb_mouseclick(evt){
		evt = EventHelper.fixKeyEvent(evt);
		if (evt.preventDefault){
			evt.preventDefault();
		}
		evt.stopPropagation();
		
		if (!actb_display) return;
		actb_mouse_on_list = 0;
		actb_pos = this.getAttribute('pos');
		actb_penter();
	}
	function actb_table_focus(){
		actb_mouse_on_list = 1;
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

	function actb_insertword(a,wPos){
		actb_curr.value = a;
		actb_curr.focus();
		/*
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
		*/		
		//added for AJAX support
		if (ajxCon){			
			ajxCon.onSelected(wPos, actb_curr);
			removeWinEvents();//added 03/03/23
		}
		actb_mouse_on_list = 0;
		actb_removedisp();		
	}
	
	function actb_penter(evt){
		if (!actb_display) return;
		actb_display = false;
		var word = '';
		var c = 0;
		var w_pos;
		for (w_pos=0;w_pos<=actb_self.actb_keywords.length;w_pos++){
			if (actb_bool[w_pos]) c++;
			if (c == actb_pos){
				word = actb_self.actb_keywords[w_pos];
				break;
			}
		}
		actb_insertword(word,w_pos);
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
		//console.log("ajxCon.m_countSend="+ajxCon.m_countSend)
		if(ajxCon && ajxCon.m_count && !ajxCon.m_countSend){			
			ajxCon.m_countSend = true;
		}
		//console.log("ajxCon.m_countSend="+ajxCon.m_countSend)

		if (actb_caretmove) stopEvent(e);
		return !actb_caretmove;
	}
	//
	function actb_checkkey(evt){
		if (!evt) evt = event;
		a = evt.keyCode;
		caret_pos_start = getCaretStart(actb_curr,winDocum);
		actb_caretmove = 0;
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
					actb_penter(evt);
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
			default:
				setTimeout(function(){actb_tocomplete(a)},50);
				break;
		}
	}
	function actb_tocomplete(kc){
		//if (kc == 38 || kc == 40 || kc == 13) return;
		if (kc<46) return;
		
		//added for AJAX support
		if (ajxCon!=undefined && actb_curr.value!=""){			
			ajxCon.fillArrayOnPattern(actb_curr);
		}
		//added for AJAX support		
		_actb_tocomplete();
	}
	function _actb_tocomplete(){		
		if (ajxCon&&!ajxCon.getEnabled())return;
		
		if (ajxCon!=undefined && (!ajxCon.getMinLengthForQuery()|| (actb_curr.value!=""&&ajxCon.getMinLengthForQuery())) ){			
			actb_keywords = ajxCon.m_keywords;
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
		}
		else{
			actb_pre = -1
		};
		
		if (actb_curr.value == "" &&(!ajxCon || ajxCon.getMinLengthForQuery()) ){
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
		if (ot.length == 0 &&(!ajxCon || ajxCon.getMinLengthForQuery()) ){
			actb_mouse_on_list = 0;
			actb_removedisp();
		}
		if (ot.length < ( (ajxCon!=undefined)? ajxCon.getMinLengthForQuery():actb_self.actb_startcheck) ) return this;
		if (actb_self.actb_firstText){
			var re = new RegExp("^" + t, "i");
		}else{
			var re = new RegExp(t, "i");
		}

		actb_total = 0;
		actb_tomake = false;
		actb_kwcount = 0;
		if(actb_self.actb_keywords){
			for (i=0;i<actb_self.actb_keywords.length;i++){
				actb_bool[i] = false;
				if (re.test(actb_self.actb_keywords[i])){
					actb_total++;
					actb_bool[i] = true;
					actb_kwcount++;
					if (actb_pre == i) actb_tomake = true;
				}
			}

			if (actb_toid) clearTimeout(actb_toid);
			if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list = 0;actb_removedisp();},actb_self.actb_timeOut);
			actb_generate();
		}
	}
	
	return this;
}
