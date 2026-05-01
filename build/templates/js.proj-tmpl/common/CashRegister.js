/* интерфейс для работы с кассой*/
function CashRegister(){
	try{
		this.ECR = new ActiveXObject ("AddIn.FPrnM45");
		this.ECR.DeviceEnabled = 1;
	}
	catch(e){
		WindowMessage.show({
			"type":WindowMessage.TP_ER,
			"text":"Ошибка создания объекта: "+e.message
		});
	}
}

CashRegister.prototype.showProperties = function(){
	this.ECR.ShowProperties();  
}
CashRegister.prototype.getEnabled = function(){
	if (this.ECR){
		return this.ECR.DeviceEnabled;  
	}
}

/*
params
	pwd=1
	total
	typeClose
	items
		name
		price
		quant
		dep
*/
CashRegister.prototype.printCheck = function(params){
	if (!params||!params.items||!params.items.length) return;
	
	this.ECR.Password = params.pwd;
  // входим в режим регистрации
	this.ECR.Mode = 1;
	if (this.ECR.SetMode() != 0){
		throw new Error("Ошибка ККМ: не верный режим работы!");
	}
	//регистрация товаров
	for (var i=0;i<params.items.length;i++){
		this.ECR.Name		= params.items[i].name;
		this.ECR.Price		= parseFloat(params.items[i].price);
		this.ECR.Quantity	= parseFloat(params.items[i].quant);
		this.ECR.Department	= (params.items[i].dep)? params.items[i].dep:1;
		this.ECR.TaxTypeNumber	= 6;
		if (this.ECR.Registration() != 0){
			throw new Error("Ошибка при регистрации товара");
		}		
	}
	// закрытие чека наличными с вводом полученной от клиента суммы
	this.ECR.Summ = parseFloat(params.total);
	this.ECR.TypeClose = parseInt(params.typeClose);
	if (this.ECR.Delivery() != 0){
		throw new Error("Ошибка при закрытии чека ");
	}
	
}
/* X - отчет
params
	pwd=29
*/
CashRegister.prototype.printX = function(params){
	// устанавливаем пароль системного администратора ККМ
	this.ECR.Password = params.pwd;
	// входим в режим отчетов с гашением
	this.ECR.Mode = 2;
	if (this.ECR.SetMode() != 0){
		throw new Error("Ошибка");
	}
	// снимаем отчет
	this.ECR.ReportType = 2;
	if (this.ECR.Report() != 0){
		throw new Error("Ошибка");
	}
}

/* Z - отчет
params
	pwd=30
*/
CashRegister.prototype.printZ = function(params){
	// устанавливаем пароль системного администратора ККМ
	this.ECR.Password = params.pwd;
	// входим в режим отчетов с гашением
	this.ECR.Mode = 3;
	if (this.ECR.SetMode() != 0){
		throw new Error("Ошибка");
	}
	// снимаем отчет
	this.ECR.ReportType = 1;
	if (this.ECR.Report() != 0){
		throw new Error("Ошибка");
	}
}
