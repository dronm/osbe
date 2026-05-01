<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="Controller_php.xsl"/>

<!-- -->
<xsl:variable name="CONTROLLER_ID" select="'ClientSearch'"/>
<!-- -->

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>
			
<xsl:template match="/">
	<xsl:apply-templates select="metadata/controllers/controller[@id=$CONTROLLER_ID]"/>
</xsl:template>

<xsl:template match="controller"><![CDATA[<?php]]>
<xsl:call-template name="add_requirements"/>

require_once(FRAME_WORK_PATH.'basic_classes/ParamsSQL.php');
require_once(FRAME_WORK_PATH.'basic_classes/ModelVars.php');
require_once(FRAME_WORK_PATH.'basic_classes/Field.php');
require_once('common/ClientSearch.php');

class <xsl:value-of select="@id"/>_Controller extends <xsl:value-of select="@parentId"/>{
	public function __construct($dbLinkMaster=NULL,$dbLink=NULL){
		parent::__construct($dbLinkMaster,$dbLink);<xsl:apply-templates/>
	}	
	<xsl:call-template name="extra_methods"/>
}
<![CDATA[?>]]>
</xsl:template>

<xsl:template name="extra_methods">
	public function search($pm){
		$params = new ParamsSQL($pm,$this->getDbLink());
		$params->addAll();
		
		$resp = ClientSearch::search($params->getVal("query"));
		$json = json_decode($resp);
		$model = new Model(array('id'=>'SearchResult_Model'));		
		/*
		$row = array(
			new Field('name',DT_STRING,array('value'=>$json->suggestions[0]->value)),
			new Field('dirname',DT_STRING,array('value'=>$json->suggestions[0]->data->management->name)),
			new Field('dirpost',DT_STRING,array('value'=>$json->suggestions[0]->data->management->post)),
			new Field('inn',DT_STRING,array('value'=>$json->suggestions[0]->data->inn)),
			new Field('kpp',DT_STRING,array('value'=>$json->suggestions[0]->data->kpp)),
			new Field('ogrn',DT_STRING,array('value'=>$json->suggestions[0]->data->ogrn)),
			new Field('okpo',DT_STRING,array('value'=>$json->suggestions[0]->data->okpo)),
			new Field('okved',DT_STRING,array('value'=>$json->suggestions[0]->data->okved)),
			new Field('status',DT_STRING,array('value'=>$json->suggestions[0]->data->state->registration_date)),
			new Field('address',DT_STRING,array('value'=>$json->suggestions[0]->data->address->value))
		);
		*/
		$row = array(
			new Field('param',DT_STRING,array('value'=>'Наименование')),
			new Field('val',DT_STRING,array('value'=>$json->suggestions[0]->value))
		);
		$model->insert($row);					
		//
		if ($json->suggestions[0]->data){
			if ($json->suggestions[0]->data->management){
				$row = array(
					new Field('param',DT_STRING,array('value'=>'ФИО руководителя')),
					new Field('val',DT_STRING,array('value'=>$json->suggestions[0]->data->management->name))
				);
				$model->insert($row);					
				//
				$row = array(
					new Field('param',DT_STRING,array('value'=>'Должность руководителя')),
					new Field('val',DT_STRING,array('value'=>$json->suggestions[0]->data->management->post))
				);
				$model->insert($row);					
			}			
			//
			if ($json->suggestions[0]->data->inn){
				$row = array(
					new Field('param',DT_STRING,array('value'=>'ИНН')),
					new Field('val',DT_STRING,array('value'=>$json->suggestions[0]->data->inn))
				);
				$model->insert($row);					
			}
			//
			if ($json->suggestions[0]->data->kpp){
				$row = array(
					new Field('param',DT_STRING,array('value'=>'КПП')),
					new Field('val',DT_STRING,array('value'=>$json->suggestions[0]->data->kpp))
				);
				$model->insert($row);					
			}
			//
			if ($json->suggestions[0]->data->ogrn){
				$row = array(
					new Field('param',DT_STRING,array('value'=>'ОГРН')),
					new Field('val',DT_STRING,array('value'=>$json->suggestions[0]->data->ogrn))
				);
				$model->insert($row);					
			}
			//
			if ($json->suggestions[0]->data->okpo){
				$row = array(
					new Field('param',DT_STRING,array('value'=>'ОКПО')),
					new Field('val',DT_STRING,array('value'=>$json->suggestions[0]->data->okpo))
				);
				$model->insert($row);					
			}
			//
			if ($json->suggestions[0]->data->okved){
				$row = array(
					new Field('param',DT_STRING,array('value'=>'ОКВЭД')),
					new Field('val',DT_STRING,array('value'=>$json->suggestions[0]->data->okved))
				);
				$model->insert($row);					
			}
			//
			/*
			if ($json->suggestions[0]->data->state &amp;&amp; $json->suggestions[0]->data->state->registration_date){
				$row = array(
					new Field('param',DT_STRING,array('value'=>'Дата регистрации')),
					new Field('val',DT_STRING,array('value'=>date('Y-m-d',$json->suggestions[0]->data->state->registration_date)))
				);
				$model->insert($row);					
			}
			*/
			//
			if ($json->suggestions[0]->data->address &amp;&amp; $json->suggestions[0]->data->address->value){
				$row = array(
					new Field('param',DT_STRING,array('value'=>'Адрес')),
					new Field('val',DT_STRING,array('value'=>$json->suggestions[0]->data->address->value))
				);
				$model->insert($row);					
			}
		}				
		$this->addModel($model);
	}
</xsl:template>

</xsl:stylesheet>
