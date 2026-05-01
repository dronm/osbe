<?php
/*я*/
class FieldXMl extends Field {

	/**
	 * no htmlspecialchars, value is a xml string!
	 */
	public function dataToXML(){
		$id = $this->getId();
		$val = $this->getValue();
		return (is_null($val)?
				sprintf('<%s xsi:nil="true">%s</%s>',$id,$val,$id) : sprintf('<%s>%s</%s>',$id,$val,$id)
		);
	}

}

?>
