/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @class
 * @classdesc

 * @param {object} options
 * @param {object} options.colAttrs Column attributes
 * @param {bool} options.calc
 * @param {function} options.calcBegin
 * @param {function} options.calcEnd
 * @param {enum} options.calcOper sum/avg
 * @param {string} options.calcFieldId
 */
function GridCellFoot(id,options){
	options = options || {};
	GridCellFoot.superclass.constructor.call(this,id,options);
		
	this.setCalc(options.calc);
	this.setCalcBegin(options.calcBegin);
	this.setCalcEnd(options.calcEnd);	
	
	this.setCalcOper(options.calcOper);
	this.setCalcFieldId(options.calcFieldId);
}
extend(GridCellFoot,GridCell);

GridCellFoot.prototype.CALC_OPER_SUM = "sum";
GridCellFoot.prototype.CALC_OPER_AVG = "avg";

GridCellFoot.prototype.m_calc;
GridCellFoot.prototype.m_calcBegin;
GridCellFoot.prototype.m_calcEnd;
GridCellFoot.prototype.m_calcOper;
GridCellFoot.prototype.m_total;
GridCellFoot.prototype.m_calcFieldId;
GridCellFoot.prototype.m_count;

GridCellFoot.prototype.getCalcFieldId = function(v){
	return this.m_calcFieldId;
}

GridCellFoot.prototype.setCalcFieldId = function(v){
	this.m_calcFieldId = v;
}

GridCellFoot.prototype.getTotal = function(v){
	return this.m_total;
}

GridCellFoot.prototype.setTotal = function(v){
	this.m_total = v;
}


GridCellFoot.prototype.getCalcTotal = function(v){
	return this.m_calcTotal;
}

GridCellFoot.prototype.setCalcOper = function(v){
	this.m_calcOper = v;
	
	var self = this;
	if (this.m_calcOper){
	
		this.m_calc = this.m_calc || function(model){
			var f_val = model.getFieldValue(this.m_calcFieldId);
			if(isNaN(f_val))f_val = 0;
			
			self.setTotal(self.getTotal()+f_val);
			
			if (self.m_calcOper == self.CALC_OPER_AVG){
				this.m_count+=1;
			}
		}
		this.m_calcBegin = this.m_calcBegin || function(){
			self.setTotal(0);		
			this.m_count = 0;
		}
		this.m_calcEnd = this.m_calcEnd || function(){
			var res;
			if (self.m_calcOper == self.CALC_OPER_AVG){
				res = (this.m_count>0)? (self.getTotal() / this.m_count) : 0;
			}
			else{
				res = self.getTotal();
			}
		
			self.setValue(res);
		}
	}
}


GridCellFoot.prototype.setCalc = function(f){
	this.m_calc = f;
}

GridCellFoot.prototype.getCalc = function(){
	return this.m_calc;
}

GridCellFoot.prototype.setCalcBegin = function(f){
	this.m_calcBegin = f;
}

GridCellFoot.prototype.getCalcBegin = function(f){
	return this.m_calcBegin;
}

GridCellFoot.prototype.setCalcEnd = function(f){
	this.m_calcEnd = f;
}
GridCellFoot.prototype.getCalcEnd = function(){
	return this.m_calcEnd;
}
