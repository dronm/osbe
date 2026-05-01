<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="Controller_php.xsl"/>

<!-- -->
<xsl:variable name="CONTROLLER_ID" select="'MainMenuConstructor'"/>
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

class <xsl:value-of select="@id"/>_Controller extends <xsl:value-of select="@parentId"/>{
	public function __construct($dbLinkMaster=NULL,$dbLink=NULL){
		parent::__construct($dbLinkMaster,$dbLink);<xsl:apply-templates/>
	}	
	<xsl:call-template name="extra_methods"/>
}
<![CDATA[?>]]>
</xsl:template>

<xsl:template name="extra_methods">

	public function genMenuForUser($userId,$roleId){
		$pm = new PublicMethod('update');
		$pm->addParam(new FieldExtString('content'));
		$pm->addParam(new FieldExtInt('user_id'));
		$pm->addParam(new FieldExtInt('role_id'));
	
		$id = $this->getDbLink()->query(sprintf(
			"SELECT * FROM main_menus WHERE user_id=%d
			UNION ALL
			SELECT * FROM main_menus WHERE user_id=%d AND role_id='%s'
			UNION ALL
			SELECT * FROM main_menus WHERE role_id='%s'",
			$userId,
			$userId,$roleId,
			$roleId
		));
		while($ar = $this->getDbLink()->fetch_array($id)){
			$this->gen_menu($pm,$ar['id']);
		}
	}

	private function gen_menu($pm,$newId){
		$p = new ParamsSQL($pm,$this->getDbLink());
		$p->addAll();
				
		$content = $p->getVal('content');
		$user_id = $p->getVal('user_id');
		$role_id = $p->getVal('role_id');
		if (!isset($content) || !isset($user_id) || !isset($role_id)){
			$id = $p->getDbVal('old_id');
			$id = (isset($id))? $id:$newId;
			//update content wasnt changed, so it does not exist
			$ar = $this->getDbLink()->query_first(sprintf("SELECT content,user_id,role_id FROM main_menus WHERE id=%s",$id));
			$content = (isset($content))? html_entity_decode($content):$ar['content'];
			$user_id = (isset($user_id))? $user_id:$ar['user_id'];
			$role_id = (isset($role_id))? $role_id:$ar['role_id'];
		}
		else{
			$content = html_entity_decode($content);
		}
		
		//!!!XMLNS!!!
		$content = str_replace('xmlns="http://www.w3.org/1999/xhtml"','',$content);
		$content = str_replace('xmlns="http://www.katren.org/crm/doc/mainmenu"','',$content);		
		$xml = simplexml_load_string($content);
		//throw new Exception("XML=".html_entity_decode($content));
		$items = $xml->xpath('//menuitem[@viewid]');
		$sql = '';
		foreach($items as $item){
			$id = $item->attributes()->viewid;
			if (!isset($id)||$id=='')continue;
			$sql.=($sql=='')? '':',';
			$sql.=sprintf(
				'(SELECT
					CASE WHEN v.c IS NOT NULL THEN \'c="\'||v.c||\'"\' ELSE \'\' END
					||CASE WHEN v.f IS NOT NULL THEN CASE WHEN v.c IS NULL THEN \'\' ELSE \' \' END||\'f="\'||v.f||\'"\' ELSE \'\' END
					||CASE WHEN v.t IS NOT NULL THEN CASE WHEN v.c IS NULL AND v.f IS NULL THEN \'\' ELSE \' \' END||\'t="\'||v.t||\'"\' ELSE \'\' END
					||CASE WHEN v.limited IS NOT NULL AND v.limited THEN CASE WHEN v.c IS NULL AND v.f IS NULL AND v.t IS NULL THEN \'\' ELSE \' \' END||\'limit="TRUE"\' ELSE \'\' END
				FROM views v WHERE v.id=%s) AS view_%s',
				$id,$id
			);
		}
		//throw new Exception("SELECT ".$sql);
		$ar = $this->getDbLink()->query_first("SELECT ".$sql);
		foreach($ar as $f=>$v){
			list($view_t, $view_id) = explode('_',$f);
			$content = str_replace(sprintf('viewid="%s"',$view_id),$v,$content);
			$content = str_replace(sprintf('viewid ="%s"',$view_id),$v,$content);
			$content = str_replace(sprintf('viewid= "%s"',$view_id),$v,$content);
			$content = str_replace(sprintf('viewid = "%s"',$view_id),$v,$content);
		}
		//throw new Exception(USER_MODELS_PATH.'MainMenu_Model_'.$role_id. ( (isset($user_id))? '_'.$user_id:'' ). '.php');
		
		$postf = ( (isset($role_id))? '_'.$role_id:'' ).( (isset($user_id))? '_'.$user_id:'' ); 		
		//USER_MODELS_PATH
		file_put_contents(
			OUTPUT_PATH.'MainMenu_Model'. $postf. '.php',
			sprintf('<![CDATA[<?php]]>
require_once(FRAME_WORK_PATH.\'basic_classes/Model.php\');

class MainMenu_Model%s extends Model{
	public function dataToXML(){
		return \'<![CDATA[<model id="MainMenu_Model" sysModel="1">]]>
		%s
		<![CDATA[</model>]]>\';
	}
}
<![CDATA[?>]]>',$postf,$content));
	}

	public function insert($pm){		
		$ids = parent::insert($pm);
		$this->gen_menu($pm,$ids['id']);
	}
	public function update($pm){
		$this->gen_menu($pm,NULL);
		parent::update($pm);	
	}

	public function delete($pm){
		$ar = $this->getDbLink()->query_first(sprintf(
			"SELECT user_id,role_id FROM main_menus
			WHERE id=%s",
		$this->getExtDbVal($pm,"id")
		));
		
		$postf = ( (isset($ar['role_id']))? '_'.$ar['role_id']:'' ).( (isset($ar['user_id']))? '_'.$ar['user_id']:'' ); 		
		$fl = USER_MODELS_PATH.'MainMenu_Model'. $postf. '.php';
		if (file_exists($fl)){
			unlink($fl);
		}
		parent::delete($pm);
	}
	
</xsl:template>

</xsl:stylesheet>
