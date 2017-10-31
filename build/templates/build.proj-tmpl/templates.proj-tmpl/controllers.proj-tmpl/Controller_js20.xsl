<?xml version="1.0" encoding="UTF-8"?><xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:output method="text" indent="yes"			doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" 			doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"/><xsl:variable name="PARENT_CONTROLLER" select="'ControllerObjServer'"/><xsl:variable name="PUBLIC_METHOD_CLASS" select="'PublicMethodServer'"/>		<xsl:template match="controller[not(@client) or @client='TRUE']"><![CDATA[]]><xsl:variable name="parent_class"><xsl:choose><xsl:when test="@parentIdJS"><xsl:value-of select="@parentIdJS"/></xsl:when><xsl:otherwise><xsl:value-of select="$PARENT_CONTROLLER"/></xsl:otherwise></xsl:choose></xsl:variable>/** * @author Andrey Mikhalevich &lt;katrenplus@mail.ru&gt;, 2017  * THIS FILE IS GENERATED FROM TEMPLATE build/templates/controllers/Controller_js20.xsl * ALL DIRECT MODIFICATIONS WILL BE LOST WITH THE NEXT BUILD PROCESS!!!  * @class * @classdesc controller  * @extends <xsl:value-of select="$parent_class"/>   * @requires core/extend.js * @requires core/<xsl:value-of select="$parent_class"/>.js   * @param {Object} options * @param {Model} options.listModelClass * @param {Model} options.objModelClass */ <xsl:variable name="contr_id" select="concat(@id,'_Controller')"/>function <xsl:value-of select="$contr_id"/>(options){	options = options || {};	<xsl:if test="publicMethod[@id='get_list']/@modelId">options.listModelClass = <xsl:value-of select="publicMethod[@id='get_list']/@modelId"/>_Model;	</xsl:if>	<xsl:if test="publicMethod[@id='get_object']/@modelId">options.objModelClass = <xsl:value-of select="publicMethod[@id='get_object']/@modelId"/>_Model;	</xsl:if>	<xsl:value-of select="$contr_id"/>.superclass.constructor.call(this,options);			//methods	<xsl:if test="@processable='TRUE'">	//get_actions	var pm = new <xsl:value-of select="$PUBLIC_METHOD_CLASS"/>("get_actions",{"controller":this,"requestType":"get"});	pm.addField(new FieldInt("doc_id",{"required":true}));	this.addPublicMethod(pm);		//set_unprocessed	var pm = new <xsl:value-of select="$PUBLIC_METHOD_CLASS"/>("set_unprocessed",{"controller":this,"requestType":"get"});	pm.addField(new FieldInt("doc_id",{"required":true}));	this.addPublicMethod(pm);		</xsl:if>			<xsl:if test="@details='TRUE'">	//before open	var pm = new <xsl:value-of select="$PUBLIC_METHOD_CLASS"/>("before_open",{"controller":this,"requestType":"get"});	pm.addField(new FieldString("view_id",{"required":true,"length":32}));	pm.addField(new FieldInt("doc_id",{"required":true}));	this.addPublicMethod(pm);			// get details	var pm = new <xsl:value-of select="$PUBLIC_METHOD_CLASS"/>("get_details",{"controller":this,"requestType":"get"});<xsl:call-template name="add_cond_fields"/>	this.addPublicMethod(pm);		</xsl:if>		<xsl:for-each select="publicMethod">	<xsl:choose>	<xsl:when test="@id='insert'">this.addInsert();	</xsl:when>	<xsl:when test="@id='update'">this.addUpdate();	</xsl:when>	<xsl:when test="@id='delete'">this.addDelete();	</xsl:when>	<xsl:when test="@id='get_list'">this.addGetList();	</xsl:when>	<xsl:when test="@id='get_object'">this.addGetObject();	</xsl:when>	<xsl:when test="@id='complete'">this.addComplete();	</xsl:when>		<xsl:otherwise>this.add_<xsl:value-of select="@id"/>();	</xsl:otherwise>		</xsl:choose>	</xsl:for-each>	}extend(<xsl:value-of select="$contr_id"/>,<xsl:value-of select="$parent_class"/>);<xsl:apply-templates/><![CDATA[]]></xsl:template><!--controller[not(@server) or @server='TRUE']/--><xsl:template match="publicMethod[@id='insert']"><xsl:variable name="contr_id" select="concat(../@id,'_Controller')"/><xsl:variable name="model_id" select="@modelId"/><xsl:value-of select="$contr_id"/>.prototype.addInsert = function(){	<xsl:value-of select="$contr_id"/>.superclass.addInsert.call(this);	<!-- [not(@primaryKey='TRUE' and @autoInc='TRUE')] -->	var pm = this.getInsert();	<xsl:if test="../@details='TRUE'">	pm.addField(new FieldString("view_id",{"required":true,"length":32}));	</xsl:if>	<xsl:for-each select="/metadata/models/model[@id=$model_id]/field">	var options = {};	<xsl:if test="@alias">options.alias = "<xsl:value-of select="@alias"/>";</xsl:if>	<xsl:if test="@primaryKey='TRUE'">options.primaryKey = true;</xsl:if>	<xsl:if test="@autoInc='TRUE'">options.autoInc = true;</xsl:if>	<xsl:if test="@required='TRUE' and (not(@primaryKey='TRUE') or (@primaryKey='TRUE' and not(@autoInc='TRUE')))">options.required = true;</xsl:if>			<xsl:choose>	<xsl:when test="@dataType='Enum'">	<xsl:variable name="enum_id" select="@enumId"/>		options.enumValues = '<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>';	var field = new FieldEnum("<xsl:value-of select="@id"/>",options);	</xsl:when>	<xsl:otherwise>	var field = new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",options);	</xsl:otherwise>	</xsl:choose>	pm.addField(field);	</xsl:for-each>	<!-- if there is a SERIAL field might need return new id -->	<xsl:if test="/metadata/models/model[@id=$model_id]/field[@autoInc='TRUE']">	pm.addField(new FieldInt("ret_id",{}));	</xsl:if>	<!-- EXTRA PARAMS -->	<xsl:for-each select="field">		var options = {};		<xsl:if test="@alias">options.alias = "<xsl:value-of select="@alias"/>";</xsl:if>		<xsl:if test="@primaryKey='TRUE'">options.primaryKey = true;</xsl:if>		<xsl:if test="@autoInc='TRUE'">options.autoInc = true;</xsl:if>		<xsl:if test="@required='TRUE' and (not(@primaryKey='TRUE') or (@primaryKey='TRUE' and not(@autoInc='TRUE')))">options.required = true;</xsl:if>				pm.addField(new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",options));	</xsl:for-each>	}</xsl:template><xsl:template match="publicMethod[@id='update']"><xsl:variable name="model_id" select="@modelId"/><xsl:variable name="contr_id" select="concat(../@id,'_Controller')"/><xsl:value-of select="$contr_id"/>.prototype.addUpdate = function(){	<xsl:value-of select="$contr_id"/>.superclass.addUpdate.call(this);	var pm = this.getUpdate();	<xsl:if test="../@details='TRUE'">	pm.addField(new FieldString("view_id",{"required":true,"length":32}));	</xsl:if>	<xsl:for-each select="/metadata/models/model[@id=$model_id]/field">	var options = {};	<xsl:if test="@alias">options.alias = "<xsl:value-of select="@alias"/>";</xsl:if>	<xsl:if test="@primaryKey='TRUE'">options.primaryKey = true;</xsl:if>	<xsl:if test="@autoInc='TRUE'">options.autoInc = true;</xsl:if>	<!--<xsl:if test="@required='TRUE' and not(@primaryKey='TRUE')">options.required = true;</xsl:if>-->	<xsl:choose>	<xsl:when test="@dataType='Enum'">	<xsl:variable name="enum_id" select="@enumId"/>		options.enumValues = '<xsl:for-each select="/metadata/enums/enum[@id=$enum_id]/value"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>';	<xsl:if test="@required='TRUE'">options.enumValues+= (options.enumValues=='')? '':',';	options.enumValues+= 'null';	</xsl:if>	var field = new FieldEnum("<xsl:value-of select="@id"/>",options);	</xsl:when>	<xsl:otherwise>	var field = new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",options);	</xsl:otherwise>	</xsl:choose>	pm.addField(field);	<!-- old key -->	<xsl:if test="@primaryKey='TRUE'">	field = new Field<xsl:value-of select="@dataType"/>("old_<xsl:value-of select="@id"/>",{});	pm.addField(field);	</xsl:if>	</xsl:for-each>	<!-- EXTRA PARAMS -->	<xsl:for-each select="field">		var options = {};		<xsl:if test="@alias">options.alias = "<xsl:value-of select="@alias"/>";</xsl:if>		<xsl:if test="@primaryKey='TRUE'">options.primaryKey = true;</xsl:if>		<xsl:if test="@autoInc='TRUE'">options.autoInc = true;</xsl:if>		<xsl:if test="@required='TRUE'">options.required = true;</xsl:if>				pm.addField(new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",options));	</xsl:for-each>	}</xsl:template><xsl:template match="publicMethod[@id='delete']"><xsl:variable name="cur_model_id" select="@modelId"/><xsl:variable name="contr_id" select="concat(../@id,'_Controller')"/><xsl:value-of select="$contr_id"/>.prototype.addDelete = function(){	<xsl:value-of select="$contr_id"/>.superclass.addDelete.call(this);	var pm = this.getDelete();<xsl:for-each select="/metadata/models/model[@id=$cur_model_id]/field[@primaryKey='TRUE']">	var options = {"required":true};	<xsl:if test="@alias">options.alias = "<xsl:value-of select="@alias"/>";</xsl:if>		pm.addField(new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",options));</xsl:for-each>}</xsl:template><xsl:template match="publicMethod[@id='complete']"><xsl:variable name="contr_id" select="concat(../@id,'_Controller')"/><xsl:variable name="cur_model_id" select="@modelId"/><xsl:value-of select="$contr_id"/>.prototype.addComplete = function(){	<xsl:value-of select="$contr_id"/>.superclass.addComplete.call(this);	<xsl:variable name="pattern_field_id" select="@patternFieldId"/>		<xsl:variable name="model_id">	<xsl:choose>	<xsl:when test="/metadata/models/model[@id=$cur_model_id and @virtual='TRUE']/@baseModelId">		<xsl:value-of select="/metadata/models/model[@id=$cur_model_id]/@baseModelId"/>	</xsl:when>	<xsl:otherwise>		<xsl:value-of select="$cur_model_id"/>	</xsl:otherwise>	</xsl:choose>		</xsl:variable>	<xsl:variable name="pattern_field" select="/metadata/models/model[@id=$model_id]/field[@id=$pattern_field_id]"/>	var f_opts = {};	<xsl:if test="$pattern_field/@alias">f_opts.alias = "<xsl:if test="$pattern_field/@alias"/>";</xsl:if>	var pm = this.getComplete();	pm.addField(new Field<xsl:value-of select="$pattern_field/@dataType"/>("<xsl:value-of select="$pattern_field_id"/>",f_opts));	pm.getField(this.PARAM_ORD_FIELDS).setValue("<xsl:value-of select="$pattern_field_id"/>");	}</xsl:template><xsl:template match="publicMethod[@id='get_object']"><xsl:variable name="contr_id" select="concat(../@id,'_Controller')"/><xsl:variable name="cur_model_id" select="@modelId"/><xsl:value-of select="$contr_id"/>.prototype.addGetObject = function(){	<xsl:value-of select="$contr_id"/>.superclass.addGetObject.call(this);	<xsl:variable name="model_id">	<xsl:choose>	<xsl:when test="/metadata/models/model[@id=$cur_model_id and @virtual='TRUE']/@baseModelId">		<xsl:value-of select="/metadata/models/model[@id=$cur_model_id]/@baseModelId"/>	</xsl:when>	<xsl:otherwise>		<xsl:value-of select="@modelId"/>	</xsl:otherwise>	</xsl:choose>		</xsl:variable>	var pm = this.getGetObject();<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">	var f_opts = {};	<xsl:if test="@alias">f_opts.alias = "<xsl:value-of select="@alias"/>";</xsl:if>		pm.addField(new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",f_opts));</xsl:for-each>}</xsl:template><!-- ???? --><xsl:template match="controller[@parentId='ControllerSQLMasterDetail']/publicMethod[@id='get_object']"><xsl:variable name="model_id" select="@modelId"/><xsl:variable name="contr_id" select="concat(../@id,'_Controller')"/><xsl:value-of select="$contr_id"/>.prototype.addGetObject = function(){	<xsl:value-of select="$contr_id"/>.superclass.addGetObject.call(this);	var options = {};	<xsl:if test="@alias">options.alias = "<xsl:value-of select="@alias"/>";</xsl:if>	var pm = this.getGetObject();<xsl:for-each select="/metadata/models/model[@id=$model_id]/field[@primaryKey='TRUE']">	pm.addField(new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",options));</xsl:for-each>}</xsl:template><!-- ???? --><xsl:template match="publicMethod[@id='get_list']"><xsl:variable name="cur_model_id" select="@modelId"/><xsl:variable name="contr_id" select="concat(../@id,'_Controller')"/><xsl:value-of select="$contr_id"/>.prototype.addGetList = function(){	<xsl:value-of select="$contr_id"/>.superclass.addGetList.call(this);		<xsl:variable name="model_id">	<xsl:choose>	<xsl:when test="/metadata/models/model[@id=$cur_model_id and @virtual='TRUE']/@baseModelId">		<xsl:value-of select="/metadata/models/model[@id=$cur_model_id]/@baseModelId"/>	</xsl:when>	<xsl:otherwise>		<xsl:value-of select="@modelId"/>	</xsl:otherwise>	</xsl:choose>		</xsl:variable>		var pm = this.getGetList();	<xsl:call-template name="add_cond_fields"/>		<xsl:for-each select="/metadata/models/model[@id=$model_id]/field">	var f_opts = {};	<xsl:if test="@alias">f_opts.alias = "<xsl:value-of select="@alias"/>";</xsl:if>	pm.addField(new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",f_opts));</xsl:for-each>	<xsl:for-each select="field">		var options = {};		<xsl:if test="@alias">			options.alias = "<xsl:value-of select="@alias"/>";		</xsl:if>		<xsl:if test="@required">			options.required = true;		</xsl:if>						pm.addField(new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",options));	</xsl:for-each>	<xsl:variable name="order" select="/metadata/models/model[@id=$cur_model_id]/defaultOrder"/>	<xsl:if test="$order">	pm.getField(this.PARAM_ORD_FIELDS).setValue("<xsl:for-each select="$order/field"><xsl:if test="position() &gt; 1">,</xsl:if><xsl:value-of select="@id"/></xsl:for-each>");	</xsl:if>}</xsl:template><xsl:template match="publicMethod"><xsl:variable name="contr_id" select="concat(../@id,'_Controller')"/><xsl:value-of select="$contr_id"/>.prototype.add_<xsl:value-of select="@id"/> = function(){	var opts = {"controller":this};	<xsl:if test="@requestType">	opts.requestType = '<xsl:value-of select="@requestType"/>';	</xsl:if>	var pm = new <xsl:value-of select="$PUBLIC_METHOD_CLASS"/>('<xsl:value-of select="@id"/>',opts);	<xsl:if test="@condFields='TRUE'">	<xsl:call-template name="add_cond_fields"/>	</xsl:if>			<xsl:apply-templates/>	this.addPublicMethod(pm);}</xsl:template><xsl:template match="publicMethod/field">	<xsl:variable name="model_field" select="/metadata/models/model[@id=./../@modelId]/field[@id=./@id]"/>		var options = {};	<xsl:if test="@alias">		options.alias = "<xsl:value-of select="@alias"/>";	</xsl:if>	<xsl:if test="@required">		options.required = true;	</xsl:if>					<xsl:if test="@length">		options.maxlength = "<xsl:value-of select="@length"/>";	</xsl:if>					<xsl:if test="@fixLength">		options.fixLength = "<xsl:value-of select="@fixLength"/>";	</xsl:if>					<xsl:if test="@minLength">		options.minLength = "<xsl:value-of select="@minLength"/>";	</xsl:if>						<xsl:choose>	<xsl:when test="$model_field">		pm.addField(new Field<xsl:value-of select="$model_field/@dataType"/>("<xsl:value-of select="@id"/>",options));		</xsl:when>	<xsl:otherwise>		pm.addField(new Field<xsl:value-of select="@dataType"/>("<xsl:value-of select="@id"/>",options));	</xsl:otherwise>	</xsl:choose></xsl:template><xsl:template name="add_cond_fields">	pm.addField(new FieldInt(this.PARAM_COUNT));	pm.addField(new FieldInt(this.PARAM_FROM));	pm.addField(new FieldString(this.PARAM_COND_FIELDS));	pm.addField(new FieldString(this.PARAM_COND_SGNS));	pm.addField(new FieldString(this.PARAM_COND_VALS));	pm.addField(new FieldString(this.PARAM_COND_ICASE));	pm.addField(new FieldString(this.PARAM_ORD_FIELDS));	pm.addField(new FieldString(this.PARAM_ORD_DIRECTS));	pm.addField(new FieldString(this.PARAM_FIELD_SEP));</xsl:template></xsl:stylesheet>