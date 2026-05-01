/* Copyright (c) 2010 
	Andrey Mikhalevich, Katren ltd.
*/
/*
	class	
	DOMHandler
*/
//пп
/**
 * @requires common/functions.js
*/

var DOMHandler = {
	//returns bool value of a string
	getBoolValue:function(str){
		if (typeof str=='string'){
			l_str = str.toLowerCase();
			return (l_str=='1'
				|| l_str=='yes'
				|| l_str=='true'
				||l_str=='да');
		}
		else if (typeof str=='boolean'){
			return str;
		}
	},

	createImgElement:function(src,alt,h,w){
		var element = document.createElement('img');
		element.src = src;
		if (alt!=undefined)element.alt = alt;
		if (h!=undefined)element.setAttribute("height",h);
		if (w!=undefined)element.setAttribute("width",w);
		return element;
	},
	createAnchorImgElement:function(href,text,src,alt){
		var element = document.createElement("a");
		element.href = href;
		if (text!=undefined){
			element.appendChild(document.createTextNode(text));
		}
		if (src!=undefined){
			element.appendChild(this.createImgElement(src,alt));
		}
		return element;
	},
	createHrefElement:function(href, text, src, alt){
		var element = document.createElement("a");
		element.href = href;
		if (text!=undefined){
			element.appendChild(document.createTextNode(text));
		}
		if (src!=undefined){
			element.appendChild(this.createImgElement(src,alt));
		}
		return element;
	},
	//adds new attribute to a node
	setAttr:function(node, attrName, attrValue){
		if (node && attrName && attrValue){
			node.setAttribute(attrName,attrValue);
		}
	},
	getAttr:function(node, name){
		if (node){
			return node.getAttribute(name);
		}
	},
	removeAttr:function(node, name){
		if (node){
			return node.removeAttribute(name);
		}
	},	
	addAttr:function(node,name,val){
		this.setAttr(node,name,val);
	},		
	getAttrBool:function(node, name){
		return this.getBoolValue(getAttr(node, name));
	},
	/*
		deletes all nodes of a given class
	*/
	removeAllNodesOnClass:function(class_val){
		var body = document.getElementsByTagName('body')[0];
		var list = this.getElementsByAttr(class_val, body, "class");
		for (var i=0;i<list.length;i++){
			body.removeChild(list[i]);
		}
	},
	//classStr list - attr values separated by space
	//node - node from which start searching
	//attrName - atrib name for searching
	//uniq- true if its unique
	getElementsByAttr:function(classStr, node, attrName, uniq,tag) {
		tag = tag || "*";
		var node = node || document;
		var list = node.getElementsByTagName(tag);
		var length = list.length;
		var classArray = classStr.split(/\s+/);
		var classes = classArray.length;
		var result = new Array();
		for(var i = 0; i < length; i++) {
			if (uniq && result.length>0)break;
			for(var j = 0;j<classes;j++)  {
				if (
					((attrName=='class')&&(list[i].className!=undefined
					&& typeof list[i].className=='string')
						&&(list[i].className.search('\\b' + classArray[j] + '\\b') != -1))
					||
					((list[i].attributes!=undefined)
				&&(list[i].getAttribute(attrName)!=undefined)
				&&(list[i].getAttribute(attrName).search('\\b' + classArray[j] + '\\b') != -1)) 
				){
					result.push(list[i]);
					break;			
				}
			}
		}
		return result;
	},

	swapClassesOfANode:function(node, new_class, old_class){
		node.className = node.className.replace(old_class,new_class);
	},
	
	swapClassesOfChildrenOfANode:function(node, new_class, old_class){
		var list = getElementsByAttr(old_class, node, 'class');
		for (var i=0;i<list.length;i++){
			this.swapClassesOfANode(list[i], new_class, old_class)
		}
		
	},
	addClass:function(node, classToAdd){
		var re = new RegExp("(^|\\s)" + classToAdd + "(\\s|$)", "g");
		if (re.test(node.className)) return;
		node.className = (node.className + " " + classToAdd).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
	},		  
	removeClass:function(node, classToRemove){
		//if (!node)return;
		var re = new RegExp("(^|\\s)" + classToRemove + "(\\s|$)", "g");
		node.className = node.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
	},
	hasClass:function(node, classToCheck) {
		return (node)?
			(node.className && new RegExp("(^|\\s)" + classToCheck+ "(\\s|$)").test(node.className)):null;
	},
	removeNode:function(node){
		if (node && node.parentNode)
			node.parentNode.removeChild(node);
	},	
	removeAttr:function(node,attr){
		if (node.attributes && node.attributes.length>0){
			node.removeAttribute(attr);
		}
	},
	getParentByTagName:function(node,tagName){
		var p = node.parentNode;
		if (p){
			var tn = tagName.toLowerCase();
			while(p && p.nodeName.toLowerCase()!=tn){
				p = p.parentNode;
			}
			return ((p&&p.nodeName.toLowerCase()==tn)? p:null);
		}
	},	
	getElementIndex:function(n){
		var i=0;
		while(n=n.previousSibling){
			if (n.nodeType === 1){
				i++;
			}
		}
		return i;
	},
	xmlDocFromString:function(txt){
		var xmlDoc;
		if (window.DOMParser){
			xmlDoc=(new DOMParser()).parseFromString(txt,"text/xml");
		}
		else{// Internet Explorer
			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async=false;
			xmlDoc.loadXML(txt);
		} 		
		return xmlDoc;
	}
	,delAttr:function(node, name){
		if (node){
			return node.removeAttribute(name);
		}
	}
	/**
	 * adds new attribute to a node
	 * @public
	 */
	,setAttr:function(node, attrName, attrValue){
		if (node){
			//try{
			node.setAttribute(attrName,attrValue);
			/*
			}
			catch(e){
			console.log("attrName="+attrName+" attrValue=")
			console.dir(attrValue)
			}
			*/
		}
	}
	
}	
