<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="text" indent="yes"
			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 
			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/>

<xsl:key name="controller_models" match="/metadata/controllers/controller/publicMethod" use="@modelId"/>			

<!-- THIS TEMPLATE NEVER RUNS!!! OVERRIDDEN IN SPECIFIC CONTROLLERS!!!-->
<xsl:template match="controller"><![CDATA[<?php]]>
<xsl:call-template name="add_requirements"/>
class <xsl:value-of select="@id"/>_Controller extends <xsl:value-of select="@parentId"/>{
	public function __construct($dbLinkMaster=NULL, $dbLink=NULL){
		parent::__construct($dbLinkMaster, $dbLink);<xsl:apply-templates/>
	}
}
<![CDATA[?>]]>
</xsl:template>

<xsl:template match="controller/descr">
	/*<xsl:value-of select="node()"/>*/
</xsl:template>

<xsl:template match="publicMethod/descr">
	/*<xsl:value-of select="node()"/>*/
</xsl:template>


<xsl:template match="publicMethod[@id='insert']">
<xsl:variable name="model_id" select="@modelId"/>		
		<xsl:if test="../@processable='TRUE'">
		$this->setProcessable(TRUE);
		
		$pm = new PublicMethod('get_actions');
		$pm->addParam(new FieldExtInt('doc_id',array('required'=>TRUE)));				
		$this->addPublicMethod($pm);					
		
		$pm = new PublicMethod('set_unprocessed');
		$pm->addParam(new FieldExtInt('doc_id',array('required'=>TRUE)));				
		$this->addPublicMethod($pm);					
		</xsl:if>		
		<xsl:if test="../@details='TRUE'">
		/* before open */
		$pm = new PublicMethod('before_open');
		$pm->addParam(new FieldExtString('view_id',array('required'=>TRUE,'length'=>32)));
		$pm->addParam(new FieldExtInt('doc_id',array('required'=>TRUE)));				
		$this->addPublicMethod($pm);							
		
		/* get details */
		$pm = new PublicMethod('get_details');
		<xsl:call-template name="add_cond_fields"/>
		$this->addPublicMethod($pm);									
		</xsl:if>

		/* insert */
		$pm = new PublicMethod('insert');
		<xsl:if test="../@details='TRUE'">
		$pm->addParam(new FieldExtString('view_id',array('required'=>TRUE,'length'=>32)));
		</xsl:if>
		<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[not(@primaryKey='TRUE' and @autoInc='TRUE')]">
			$f_params = array();
			<xsl:if test="@alias">
				$f_params['alias']='<xsl:value-of select="@alias"/>';
			</xsl:if>
			<xsl:if test="@required">
				$f_params['required']=<xsl:value-of select="@required"/>;
			</xsl:if>				
			<xsl:if test="@unsigned='FALSE'">
				$f_params['unsigned']=FALSE;
			</xsl:if>				
			<xsl:choose>
				<xsl:when test="@fieldType='FT_LOOK_UP'">
				<xsl:variable name="look_up_model" select="@lookUpModel"/>
				<xsl:variable name="look_up_field" select="lookUpKey/@lookUpId"/>
				$param = new FieldExt<xsl:value-of select="/metadata/model[@id=$look_up_model]/field[@id=$look_up_field]/@dataType"/>('<xsl:value-of select="concat(@dataBase,'_',@dataTable,'_',$look_up_field)"/>'
				</xsl:when>
				<xsl:when test="@dataType='Enum'">
				<xsl:variable name="enum_id" select="@enumId"/>
				$param = new FieldExtEnum('<xsl:value-of select="@id"/>',',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>'
				</xsl:when>
				<xsl:otherwise>$param = new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>'
				</xsl:otherwise>
			</xsl:choose>,$f_params);
		$pm->addParam($param);
		</xsl:for-each>
		<!-- if there is a SERIAL field might need return new id -->
		<xsl:if test="/metadata/models/model[@id=$model_id]/field[@autoInc='TRUE']">
		$pm->addParam(new FieldExtInt('ret_id'));
		</xsl:if>
		<!-- Extra params-->
		<xsl:for-each select="field">
			$f_params = array();
			<xsl:if test="@alias">
				$f_params['alias']='<xsl:value-of select="@alias"/>';
			</xsl:if>
			<xsl:if test="@required">
				$f_params['required']=<xsl:value-of select="@required"/>;
			</xsl:if>				
			<xsl:if test="@unsigned='FALSE'">
				$f_params['unsigned']=FALSE;
			</xsl:if>				
			<xsl:choose>
			<xsl:when test="@dataType='Enum'">
			<xsl:variable name="enum_id" select="@enumId"/>
			$param = new FieldExtEnum('<xsl:value-of select="@id"/>',',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>'
			</xsl:when>
			<xsl:otherwise>$param = new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>'
			</xsl:otherwise>
		</xsl:choose>,$f_params);
		$pm->addParam($param);		
		</xsl:for-each>
				
		<xsl:if test="not(events)">
		//default event
		$ev_opts = [
			'dbTrigger'=>FALSE
			,'eventParams' =>[<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">
				<xsl:if test="position() &gt; 1">,</xsl:if>'<xsl:value-of select="@id"/>'
			</xsl:for-each>]
		];
		$pm->addEvent('<xsl:value-of select="../@id"/>.insert',$ev_opts);
		</xsl:if>		
		<xsl:apply-templates/>
		$this->addPublicMethod($pm);
		$this->setInsertModelId('<xsl:value-of select="concat($model_id,'_Model')"/>');
</xsl:template>

<xsl:template match="publicMethod[@id='update']">
<xsl:variable name="model_id" select="@modelId"/>
		/* update */		
		$pm = new PublicMethod('update');
		<xsl:if test="../@details='TRUE'">
		$pm->addParam(new FieldExtString('view_id',array('required'=>TRUE,'length'=>32)));
		</xsl:if>		
		<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">
		<xsl:variable name="enum_id" select="@enumId"/>
		$pm->addParam(new FieldExt<xsl:value-of select="@dataType"/>('old_<xsl:value-of select="@id"/>',<xsl:if test="@dataType='Enum'">',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>',</xsl:if>array('required'=>TRUE)));
		</xsl:for-each>
		$pm->addParam(new FieldExtInt('obj_mode'));
		<xsl:for-each select="/metadata/models/model[@id=$model_id]/field">
			$f_params=array();
			<xsl:if test="@alias">
				$f_params['alias']='<xsl:value-of select="@alias"/>';
			</xsl:if>
			<xsl:if test="@unsigned='FALSE'">
				$f_params['unsigned']=FALSE;
			</xsl:if>							
			<xsl:choose>
				<xsl:when test="@fieldType='FT_LOOK_UP'">
				<xsl:variable name="look_up_model" select="@lookUpModel"/>
				<xsl:variable name="look_up_field" select="lookUpKey/@lookUpId"/>				
				$param = new FieldExt<xsl:value-of select="/metadata/model[@id=$look_up_model]/field[@id=$look_up_field]/@dataType"/>('<xsl:value-of select="concat(@dataBase,'_',@dataTable,'_',$look_up_field)"/>'
				</xsl:when>
				<xsl:when test="@dataType='Enum'">
				<xsl:variable name="enum_id" select="@enumId"/>
				$param = new FieldExtEnum('<xsl:value-of select="@id"/>',',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>'
				</xsl:when>
				<xsl:otherwise>$param = new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>'
				</xsl:otherwise>
			</xsl:choose>,$f_params);
			$pm->addParam($param);
		</xsl:for-each>
		<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">
			<xsl:variable name="enum_id" select="@enumId"/>
			$param = new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>',<xsl:if test="@dataType='Enum'">',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>',</xsl:if>array(
			<xsl:if test="@alias">
				'alias'=>'<xsl:value-of select="@alias"/>'
			</xsl:if>));
			$pm->addParam($param);
		</xsl:for-each>
		
		<!-- Extra params-->
		<xsl:for-each select="field">
			$f_params = array();
			<xsl:if test="@alias">
				$f_params['alias']='<xsl:value-of select="@alias"/>';
			</xsl:if>
			<xsl:if test="@required">
				$f_params['required']=<xsl:value-of select="@required"/>;
			</xsl:if>				
			<xsl:choose>
			<xsl:when test="@dataType='Enum'">
			<xsl:variable name="enum_id" select="@enumId"/>
			$param = new FieldExtEnum('<xsl:value-of select="@id"/>',',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>'
			</xsl:when>
			<xsl:otherwise>$param = new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>'
			</xsl:otherwise>
		</xsl:choose>,$f_params);
		$pm->addParam($param);		
		</xsl:for-each>
					
			<xsl:if test="not(events)">
			//default event
			$ev_opts = [
				'dbTrigger'=>FALSE
				,'eventParams' =>[<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">
					<xsl:if test="position() &gt; 1">,</xsl:if>'<xsl:value-of select="@id"/>'
				</xsl:for-each>]
			];
			$pm->addEvent('<xsl:value-of select="../@id"/>.update',$ev_opts);
			</xsl:if>		
			<xsl:apply-templates/>
			$this->addPublicMethod($pm);
			$this->setUpdateModelId('<xsl:value-of select="concat($model_id,'_Model')"/>');
</xsl:template>

<xsl:template match="publicMethod[@id='get_list']">
<xsl:variable name="model_id" select="@modelId"/>
		/* get_list */
		$pm = new PublicMethod('get_list');
		<xsl:call-template name="add_cond_fields"/>
		<xsl:for-each select="field">
			$f_params = array();
			<xsl:if test="@alias">
				$f_params['alias']='<xsl:value-of select="@alias"/>';
			</xsl:if>
			<xsl:if test="@required">
				$f_params['required']=<xsl:value-of select="@required"/>;
			</xsl:if>				
			<xsl:choose>
			<xsl:when test="@dataType='Enum'">
			<xsl:variable name="enum_id" select="@enumId"/>
			$param = new FieldExtEnum('<xsl:value-of select="@id"/>',',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>'
			</xsl:when>
			<xsl:otherwise>$param = new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>'
			</xsl:otherwise>
		</xsl:choose>,$f_params);
		$pm->addParam($param);		
		</xsl:for-each>
		$this->addPublicMethod($pm);
		<xsl:if test="$model_id">
		$this->setListModelId('<xsl:value-of select="concat($model_id,'_Model')"/>');
		</xsl:if>		
</xsl:template>


<xsl:template match="publicMethod[@id='get_object']">
<xsl:variable name="cur_model_id" select="@modelId"/>
		/* get_object */
		$pm = new PublicMethod('get_object');
		$pm->addParam(new FieldExtString('mode'));
		<xsl:variable name="model_id">
		<xsl:choose>
		<xsl:when test="/metadata/models/model[@id=$cur_model_id and @virtual='TRUE']/@baseModelId">
			<xsl:value-of select="/metadata/models/model[@id=$cur_model_id]/@baseModelId"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="@modelId"/>
		</xsl:otherwise>
		</xsl:choose>	
		</xsl:variable>
		
		<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">
		<xsl:variable name="enum_id" select="@enumId"/>
		$pm->addParam(new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>'
		<xsl:if test="@dataType='Enum'">,',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>'</xsl:if>));
		</xsl:for-each>
		<xsl:for-each select="field">
			$f_params = array();
			<xsl:if test="@alias">
				$f_params['alias']='<xsl:value-of select="@alias"/>';
			</xsl:if>
			<xsl:if test="@required">
				$f_params['required']=<xsl:value-of select="@required"/>;
			</xsl:if>				
			<xsl:choose>
			<xsl:when test="@dataType='Enum'">
			<xsl:variable name="enum_id" select="@enumId"/>
			$param = new FieldExtEnum('<xsl:value-of select="@id"/>',',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>'
			</xsl:when>
			<xsl:otherwise>$param = new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>'
			</xsl:otherwise>
		</xsl:choose>,$f_params);		
		$pm->addParam($param);		
		</xsl:for-each>
		$pm->addParam(new FieldExtString('lsn'));
		$this->addPublicMethod($pm);
		$this->setObjectModelId('<xsl:value-of select="concat($cur_model_id,'_Model')"/>');		
</xsl:template>

<xsl:template match="controller[@parentId='ControllerSQLMasterDetail']/publicMethod[@id='get_object']">
<xsl:variable name="model_id" select="@modelId"/>
		/* get_object */
		$pm = new PublicMethod('get_object');
		$pm->addParam(new FieldExtString('mode'));
		$pm->addParam(new FieldExtString('details'));
		<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">
		<xsl:variable name="enum_id" select="@enumId"/>
		$pm->addParam(new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>'
		<xsl:if test="@dataType='Enum'">,',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>'</xsl:if>));
		</xsl:for-each>
		$this->addPublicMethod($pm);
		$this->setObjectModelId('<xsl:value-of select="concat($model_id,'_Model')"/>');
</xsl:template>

<xsl:template match="publicMethod[@id='delete']">
<xsl:variable name="model_id" select="@modelId"/>
		/* delete */
		$pm = new PublicMethod('delete');
		<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">
		<xsl:variable name="enum_id" select="@enumId"/>
		$pm->addParam(new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>'
		<xsl:if test="@dataType='Enum'">,',','<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>'</xsl:if>));		
		</xsl:for-each>
		$pm->addParam(new FieldExtInt('count'));
		$pm->addParam(new FieldExtInt('from'));				
				
		<xsl:if test="not(events)">
		//default event
		$ev_opts = [
			'dbTrigger'=>FALSE
			,'eventParams' =>[<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">
				<xsl:if test="position() &gt; 1">,</xsl:if>'<xsl:value-of select="@id"/>'
			</xsl:for-each>]
		];
		$pm->addEvent('<xsl:value-of select="../@id"/>.delete',$ev_opts);
		</xsl:if>		
		<xsl:apply-templates/>
		$this->addPublicMethod($pm);					
		$this->setDeleteModelId('<xsl:value-of select="concat($model_id,'_Model')"/>');
</xsl:template>

<xsl:template match="publicMethod[@id='complete']">
<xsl:variable name="model_id" select="@modelId"/>
		/* complete  */
		$pm = new PublicMethod('complete');
		$pm->addParam(new FieldExtString('pattern'));
		$pm->addParam(new FieldExtInt('count'));
		$pm->addParam(new FieldExtInt('ic'));
		$pm->addParam(new FieldExtInt('mid'));
		$pm->addParam(new FieldExtString('<xsl:value-of select="@patternFieldId"/>'));		
		$this->addPublicMethod($pm);					
		$this->setCompleteModelId('<xsl:value-of select="concat($model_id,'_Model')"/>');
</xsl:template>

<xsl:template match="publicMethod">
		$pm = new PublicMethod('<xsl:value-of select="@id"/>');
		<xsl:if test="@condFields='TRUE'">
		<xsl:call-template name="add_cond_fields"/>
		</xsl:if>
		<xsl:if test="@paginationFields='TRUE'">
		<xsl:call-template name="add_pagination_fields"/>
		</xsl:if>
		<xsl:apply-templates/>
		$this->addPublicMethod($pm);
</xsl:template>
<xsl:template match="publicMethod/field">
	<xsl:variable name="model_id" select="../@modelId"/>
	<xsl:variable name="field_id" select="@id"/>
	<xsl:variable name="model_field" select="/metadata/models/model[@id=$model_id]/field[@id=$field_id]"/>
	$opts=array();
	<xsl:choose>
	<xsl:when test="$model_field">
		<xsl:if test="$model_field/@alias">
		$opts['alias']='<xsl:value-of select="$model_field/@alias"/>';</xsl:if>
		<xsl:if test="$model_field/@length">
		$opts['length']=<xsl:value-of select="$model_field/@length"/>;</xsl:if>
		<xsl:if test="$model_field/@required='TRUE'">
		$opts['required']=TRUE;</xsl:if>
		<xsl:if test="$model_field/@unsigned='FALSE'">
		$opts['unsigned']=FALSE;</xsl:if>				
		<xsl:if test="$model_field/@defaultValue">
		$opts['value']=<xsl:value-of select="$model_field/@defaultValue"/>;</xsl:if>		
		$pm->addParam(new FieldExt<xsl:value-of select="$model_field/@dataType"/>('<xsl:value-of select="@id"/>',$opts));
	</xsl:when>
	<xsl:otherwise>		
		<xsl:if test="@alias">
		$opts['alias']='<xsl:value-of select="@alias"/>';</xsl:if>
		<xsl:if test="@length">
		$opts['length']=<xsl:value-of select="@length"/>;</xsl:if>
		<xsl:if test="@required='TRUE'">
		$opts['required']=TRUE;</xsl:if>
		<xsl:if test="@unsigned='FALSE'">
		$opts['unsigned']=FALSE;</xsl:if>		
		<xsl:if test="@defaultValue">
		$opts['value']=<xsl:value-of select="@defaultValue"/>;</xsl:if>				
		$pm->addParam(new FieldExt<xsl:value-of select="@dataType"/>('<xsl:value-of select="@id"/>',$opts));
	</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="publicMethod/events/event[not(@dbTrigger) or @dbTrigger='FALSE']">
	<xsl:variable name="model_id" select="../../@modelId"/>
		$ev_opts = [
			'dbTrigger'=>FALSE
			,'eventParams' =>[<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">
				<xsl:if test="position() &gt; 1">,</xsl:if>'<xsl:value-of select="@id"/>'
			</xsl:for-each>]
		];
		$pm->addEvent('<xsl:value-of select="../../@id"/>.delete',$ev_opts);
</xsl:template>

<xsl:template match="controller/detail">
	$this->addDetailModelId("<xsl:value-of select="@modelId"/>");
</xsl:template>

<xsl:template name="add_cond_fields">
		$pm->addParam(new FieldExtInt('count'));
		$pm->addParam(new FieldExtInt('from'));
		$pm->addParam(new FieldExtString('cond_fields'));
		$pm->addParam(new FieldExtString('cond_sgns'));
		$pm->addParam(new FieldExtString('cond_vals'));
		$pm->addParam(new FieldExtString('cond_ic'));
		$pm->addParam(new FieldExtString('ord_fields'));
		$pm->addParam(new FieldExtString('ord_directs'));
		$pm->addParam(new FieldExtString('field_sep'));
		$pm->addParam(new FieldExtString('lsn'));
</xsl:template>

<xsl:template name="add_pagination_fields">
		$pm->addParam(new FieldExtInt('count'));
		$pm->addParam(new FieldExtInt('from'));
</xsl:template>

<xsl:template name="add_requirements">
<xsl:choose>
<xsl:when test="@parentType='user'">
require_once(USER_CONTROLLERS_PATH.'<xsl:value-of select="@parentId"/>.php');</xsl:when>
<xsl:otherwise>
require_once(FRAME_WORK_PATH.'basic_classes/<xsl:value-of select="@parentId"/>.php');</xsl:otherwise>
</xsl:choose>
<xsl:if test="/metadata/models/model/field/@dataType='Int'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtInt.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='String'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtString.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Char'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtChar.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Float'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtFloat.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Enum'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtEnum.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Text'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtText.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='DateTime'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtDateTime.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Date'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtDate.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Time'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtTime.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Password'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtPassword.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Bool'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtBool.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='GeomPoint'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtGeomPoint.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='GeomPolygon'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtGeomPolygon.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Interval'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtInterval.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='DateTimeTZ'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtDateTimeTZ.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='JSON'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtJSON.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='JSONB'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtJSONB.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Array'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtArray.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='XML'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtXML.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='BigInt'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtBigInt.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='SmallInt'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtSmallInt.php');</xsl:if>
<xsl:if test="/metadata/models/model/field/@dataType='Bytea'">
require_once(FRAME_WORK_PATH.'basic_classes/FieldExtBytea.php');</xsl:if>

/**
 * THIS FILE IS GENERATED FROM TEMPLATE build/templates/controllers/Controller_php.xsl
 * ALL DIRECT MODIFICATIONS WILL BE LOST WITH THE NEXT BUILD PROCESS!!!
 */

</xsl:template>

</xsl:stylesheet>
