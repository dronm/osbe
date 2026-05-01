/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends Control
 * @requires core/extend.js
 * @requires Control.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {string} options.period 
 */
function PeriodSelect(id,options){
	options = options || {};	
	
	var self = this;
	
	options.events = {
		"click":function(e){
			self.onClick(e);
		}
	};
	
	options.attrs = options.attrs || {};
	options.attrs.style = "cursor:pointer;";
	options.value = options.value || options.period || this.PERIOD_ALIASES[0];
	
	PeriodSelect.superclass.constructor.call(this,id,"A",options);
	
}
extend(PeriodSelect,Control);

/* Constants */
PeriodSelect.prototype.PERIOD_ALIASES = ["all","day","week","month","quarter","year"];
PeriodSelect.prototype.CLASS_SELECTED = "alert-success";

/* private members */
PeriodSelect.prototype.m_pop;

/* protected*/


/* public methods */
PeriodSelect.prototype.onClick = function(e){
	if (!this.m_pop){
		var self = this;
		var cont_el = [];
		var cur = this.getValue();
		//console.log("cur="+cur)
		for (var i=0;i<this.PERIOD_ALIASES.length;i++){
			cont_el.push(new Control(CommonHelper.uniqid(),"P",{
				"className":"forSelect" + ( (cur==this.PERIOD_ALIASES[i])? " "+this.CLASS_SELECTED:""),
				"value":this.PERIODS[i],
				"attrs":{
					"period":this.PERIOD_ALIASES[i],
					"style":"cursor:pointer;"
				},
				"events":{
					"click":function(e){
						self.m_pop.setVisible(false);
						var par = e.target.parentNode;
						for (var j=0;j<par.childNodes.length;j++){
							if (par.childNodes[j]==e.target){
								DOMHelper.addClass(e.target,self.CLASS_SELECTED);
							}
							else if (DOMHelper.hasClass(par.childNodes[j],self.CLASS_SELECTED)){
								DOMHelper.delClass(par.childNodes[j],self.CLASS_SELECTED);
							
							}
						}
						self.setValue(e.target.getAttribute("period"));
					}
				}
			}));
		}
		var cont = new ControlContainer(null,"DIV",{
			"elements":cont_el
		});
		this.m_pop = new PopOver(this.getId()+":popover",{
			"contentElements":[cont],
			"zIndex":"2001"
		});
		this.m_pop.toDOM(e,this.getNode());
	}
	else{
		this.m_pop.setVisible(!this.m_pop.getVisible());
	}
	
}

PeriodSelect.prototype.setValue = function(v){
	var p = CommonHelper.inArray(v,this.PERIOD_ALIASES);
	if (p==-1){
		throw Error(this.ER_PERIOD_NOT_FOUND);
	}
	
	this.setAttr("period",v);

	PeriodSelect.superclass.setValue.call(this,this.PERIODS[p]);
}

PeriodSelect.prototype.getValue = function(){
	return this.getAttr("period");
}
