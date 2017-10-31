/* Copyright (c) 2010 
	Andrey Mikhalevich, Katren ltd.
*/
/*
	Calculator control class
	Calculator
*/

/**
 * @requires main.js
*/

function Calculator(inputId,options){
	options = options||{};
	this.m_winObj = options.winObj;
	this.inputId = inputId;
	this.resetVars();
}
Calculator.prototype.CALC_CLASS = 'calc';
Calculator.prototype.getVal = function(){
	return nd("ekran",this.getWinObjDocum()).value;
}
Calculator.prototype.setVal = function(val){
	nd("ekran",this.getWinObjDocum()).value = val;
}
Calculator.prototype.close = function(cancel){
	if (!cancel){
		var node = nd(this.inputId,this.getWinObjDocum());
		if (node!=undefined){
			node.value = this.getVal();
			node.focus();
		}
	}
	var n = nd(this.inputId+"_calc",this.getWinObjDocum());
	if (n){
		n.parentNode.removeChild(n);
	}
}

Calculator.prototype.wynik=0;
Calculator.prototype.op;
Calculator.prototype.nowe=0;
Calculator.prototype.nowe2=0;
Calculator.prototype.done=1;
Calculator.prototype.oset=0;
Calculator.prototype.kropka;
Calculator.prototype.temp;
Calculator.prototype.resetVars = function(){
	this.wynik = 0,this.op = 0,this.nowe  = 0,this.nowe2 = 0, this.done  = 1,this.oset  = 0;
}

Calculator.prototype.reset = function(value){
	this.setVal(value);
	this.resetVars();
}
Calculator.prototype.wspolna = function(new_temp){
	this.kropka = 1;
	if(this.nowe || this.done) {
		this.nowe = 0;
		this.done = 0;
		this.temp = new_temp;
	}
	for(var i=0; i<this.temp.length; i++) if (this.temp[i]=='.') this.kropka=0;
}
Calculator.prototype.calcButton = function(ktory,ktory2){
	this.temp = this.getVal();
	if(ktory2=='.') {
		this.wspolna('0');
		if(this.kropka) {
			this.temp += ktory2;
			this.setVal(this.temp);
			this.oset = 0;
		}
	}
	if(ktory>=0 && ktory<=9)  {
		this.wspolna('');
		if(this.temp==0 && this.kropka==1) this.temp='';
		this.temp += ktory;
		this.setVal(this.temp);
		this.oset = 1;
	}
	if(ktory2=='-' || ktory2=='+' || ktory2=='/' || ktory2=='*') {
		if(this.nowe) this.op = ktory2
		else {
			if(!this.nowe2) {
				this.op = ktory2;
				this.wynik = this.temp;
				this.nowe2=1;
			}
			else {
				this.wynik = eval(this.wynik + this.op + this.temp);
				this.op = ktory2;
				this.setVal(wynik);
			}
		this.oset=0;
		this.nowe = 1;
		}
	}
	if(ktory2=='1/x' ) { this.wynik = eval(1 / this.temp) ; this.reset(this.wynik); }
	if(ktory2=='sqrt') { this.wynik = Math.sqrt(this.temp); this.reset(this.wynik); }
	if(ktory2=='exp' ) { this.wynik = Math.exp(this.temp) ; this.reset(this.wynik); }
	if(ktory2=='+/-')  this.setVal(eval(-this.temp));
	if(ktory2=='=' && this.oset && this.op!='0') this.reset(eval(this.wynik + this.op + this.temp));
	if (ktory2=='C') this.reset(0);
	if(this.getVal()[0] == '.')
		this.setVal('0') + this.getVal();
}

Calculator.prototype.getHTML = function(){
var calc_html = '<table cellPadding="0" cellSpacing="5">'+
	'<tbody>'+
	'<tr align="left">'+
	'<td colSpan="5" align="right"><div id="'+this.inputId+'_calc_cancel"><img src="img/modal/close.gif"></div></td></tr>'+
	'<td colSpan="5"><input style="width:100%;" id="ekran" value="0" size="20"/></td></tr>'+
	'<tr align="middle">'+
	'<td colSpan="3">Калькулятор</td>'+
	'<td><input id="'+this.inputId+'_calc_btn_C" type="button" value="C"/></td>'+
	'<td><input id="'+this.inputId+'_calc_btn_OK" type="button" value="OK"/></td></tr>'+
	'<tr align="middle">'+
	'<td><input id="calc_btn_7" class="calc_ctrl" type="button" value="  7  "/></td>'+
	'<td><input id="calc_btn_8" class="calc_ctrl" type="button" value="  8  "/></td>'+
	'<td><input id="calc_btn_9" class="calc_ctrl" type="button" value="  9  "/></td>'+
	'<td><input id="calc_btn_/" class="calc_ctrl" type="button" value="  /  "/></td>'+
	'<td><input id="calc_btn_sqrt" class="calc_ctrl" type="button" value="sqrt"/></td></tr>'+
	'<tr align="middle">'+
	'<td><input id="calc_btn_4" class="calc_ctrl" type="button" value="  4  "/></td>'+
	'<td><input id="calc_btn_5" class="calc_ctrl" type="button" value="  5  "/></td>'+
	'<td><input id="calc_btn_6" class="calc_ctrl" type="button" value="  6  "/></td>'+
	'<td><input id="calc_btn_*" class="calc_ctrl" type="button" value=" *  "/></td>'+
	'<td><input id="calc_btn_exp" class="calc_ctrl" type="button" value="exp"/></td></tr>'+
	'<tr align="middle">'+
	'<td><input id="calc_btn_1" class="calc_ctrl" type="button" value="  1  "/></td>'+
	'<td><input id="calc_btn_2" class="calc_ctrl" type="button" value="  2  "/></td>'+
	'<td><input id="calc_btn_3" class="calc_ctrl" type="button" value="  3  "/></td>'+
	'<td><input id="calc_btn_-" class="calc_ctrl" type="button" value="  -  "/></td>'+
	'<td><input id="calc_btn_1/x" class="calc_ctrl" type="button" value="1/x "/></td></tr>'+
	'<tr align="middle">'+
	'<td><input id="calc_btn_0" class="calc_ctrl" type="button" value="  0  "/></td>'+
	'<td><input id="calc_btn_+/-" class="calc_ctrl" class="calc_ctrl" type="button" value=" +/- "/></td>'+
	'<td><input id="calc_btn_." class="calc_ctrl" type="button" value="  ,  "/></td>'+
	'<td><input id="calc_btn_+" class="calc_ctrl" type="button" value="  +  "/></td>'+
	'<td><input id="calc_btn_=" class="calc_ctrl" type="button" value="  =  "/></td>'+
	'</tr>'+
	'</tbody>'+
	'</table>';
	return calc_html;
}
Calculator.prototype.assignControls = function(){
	var self = this;
	nd(this.inputId+"_calc_cancel",this.getWinObjDocum()).onclick = function(){
		self.close(true);
	};
	nd(this.inputId+"_calc_btn_OK",this.getWinObjDocum()).onclick = function(){
		self.close(false);
	};
	
	nd(this.inputId+"_calc_btn_C",this.getWinObjDocum()).onclick = function(){
		self.calcButton(11,"C");
	};
	var list = DOMHandler.getElementsByAttr('calc_ctrl', this.calcNode, 'class');
	var id;
	for (var i=0;i<list.length;i++){		
		list[i].onclick = function(event){
			event = EventHandler.fixMouseEvent(event);
			id = event.target.id.replace(/calc_btn_/,'');
			self.calcButton(id,id);
		};
	}
}
Calculator.prototype.show = function(){
	var node = nd(this.inputId,this.getWinObjDocum());
	if (node!=undefined && nd(this.inputId+"_calc",this.getWinObjDocum())==undefined){
		//closeAllInstances(this.CALC_CLASS);
		this.calcNode = document.createElement('div');
		this.calcNode.id = this.inputId+"_calc";
		this.calcNode.className = this.CALC_CLASS;
		with (this.calcNode.style) {
			border     = "1px solid gray";
			background = '#FFFFFF';
			color      = '#000000';
			position   = 'absolute';
			display    = 'block';
			padding    = '2px';
			cursor     = 'default';
		}
		this.calcNode.innerHTML = this.getHTML();
        this.calcNode.style.top  = (findPosY(node)+ node.offsetHeight+2)+ "px";
        this.calcNode.style.left = (findPosX(node)+ node.offsetWidth+2)+ "px";				
		this.getWinObjDocum().body.appendChild(this.calcNode);
		this.assignControls();
		this.setVal(node.value);
	}	
}
Calculator.prototype.refresh = function(){
	if (this.calcNode!=undefined){
		this.calcNode.innerHTML = this.getHTML();
		this.assignControls();
	}
}
Calculator.prototype.getWinObjDocum = function(){
	if (this.m_winObj){
		return this.m_winObj.getWindowForm().document;
	}
	else{
		return window.document;
	}
}