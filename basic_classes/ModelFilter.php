<?phprequire_once(FRAME_WORK_PATH.'basic_classes/Model.php');class ModelFilter extends Model{			public function __construct(){		parent::__construct();	}	public function toSQL(){		if ($this->getFieldCount()){			$fields = $this->getFieldIterator(); 			$res = '';			while($fields->valid()) {				$field = $fields->current();				$res.=($res=='')? '':' '.$field->getLogicOper().' ';				$res.= $field->toSQL();				$fields->next();			}					return $res;		}	}}?>