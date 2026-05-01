App.prototype.ER_WS_NOT_SUPPERTED = "Браузер не поддерживает работу с вэб сокетами. Функциональность приложения ограничена.";
App.prototype.NT_WS_CONNECTED = "Соединение с сервером установлено.";
App.prototype.ER_WS_NOT_CONNECTED = "Ошибка соединения с сервером.";

FatalException.prototype.HEADER = "Критическая ошибка";

ServConnector.prototype.ER_STATUS0 = "Ошибка установки оединения с сервером";
ServConnector.prototype.ER_NO_RESP_MODEL = "Неверный ответ сервера";

Model.prototype.ER_NO_MODEL = "Модель % не найдена.";
Model.prototype.ER_NO_FIELD = "Поле % модели % не найдено.";
Model.prototype.ER_NO_FIELDS = "Поля модели % не определены.";
Model.prototype.ER_LOCKED = "Модель заблокирована.";
Model.prototype.ER_REС_NOT_FOUND = "Запись не найдена.";

Validator.prototype.ER_EMPTY = "пустое значение";
Validator.prototype.ER_TOO_LONG = "значение слишком длинное";
Validator.prototype.ER_TOO_SHORT = "значение слишком короткое";
Validator.prototype.ER_INVALID = "неверное значение.";

ValidatorBool.prototype.TRUE_VALS = ["да","д","истина"];

ValidatorInt.prototype.ER_VIOL_NOT_ZERO = "значение равно нулю";
ValidatorInt.prototype.ER_VIOL_MAX = "значение больше %";
ValidatorInt.prototype.ER_VIOL_MIN = "значение меньше %";
ValidatorInt.prototype.ER_VIOL_UNSIGNED = "значение меньше нуля";

//ValidatorFloat.prototype.DECIMAL_SEP = ".";

Field.prototype.ER_NO_VALIDATOR = "Поле:%, не задан валидатор.";
Field.prototype.ER_SET_VAL = "Ошибка установки значения, поле:%, %";

//FieldRef.prototype.ER_NO_KEY = "ключевое поле не найдено.";


DateHelper.MON_DATE_LIST = Array("Января","Февраля","Марта","Апреля","Мая",
	"Июня","Июля","Августа","Сентября","Октября","Ноября","Декабря");
DateHelper.MON_LIST = Array("Январь","Февраль","Март","Апрель","Май",
	"Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь");
	
DateHelper.WEEK_LIST = Array("Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница",
	"Суббота");	
DateHelper.FORMAT_STR = "d/m/Y H:i:s";

EventHelper.DEL_ERR = "Невозможно удалить событие.";

Response.prototype.ERR_NO_MODEL = "Модель % не найдена.";

PublicMethod.prototype.ER_NO_FIELD = "Контроллер %, метод %, поле % не найдено.";
PublicMethod.prototype.ER_NO_CONTROLLER = "Метод %, не задан контроллер.";

Controller.prototype.ER_NO_METHOD = "Метод % контроллера % не найден.";
Controller.prototype.ER_EMPTY = "Контроллер %, метод %, поле %, не задано обязательное значение.";

ControllerObjClient.prototype.ER_UNSUPPORTED_CLIENT_MODEL = "Не поддерживоемый тип клиентской модели.";

ModelFilter.prototype.ER_NO_CTRL = "Фильтр %, не указан контрол.";
ModelFilter.prototype.ER_INVALID_CTRL = "Есть неправильные значения в фильтре.";

VersException.prototype.HEADER = "Обновление программы";
VersException.prototype.NOTE = "Сохраните все данные и обновите страницу!";
VersException.prototype.CAP_POSTPONE = "Отложить на % мин.";
VersException.prototype.TITLE_POSTPONE = "Дать возможность сохранить данные, задать вопрос через % мин.";
VersException.prototype.CAP_RELOAD = "Обновить сейчас";
VersException.prototype.TITLE_RELOAD = "Перезагрузить страницу сейчас";
