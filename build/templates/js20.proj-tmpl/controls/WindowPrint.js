/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2014
 
 * @class
 * @classdesc Shows print window with content
 
 * @param {namespace} options
 * @param {object} winOptions 
 * @param {bool} [options.print=true] print and close window
 * @param {string} [options.template=app.getTemplate("WindowPrint")]
 * @param {string} options.title window title
 * @param {string} options.content window content
 */
var WindowPrint = {
	show:function(options){
		options = options || {};
		var win_opts = options.winOptions || {};
		win_opts["name"] = "Print?"+CommonHelper.uniqid();
		var print_and_close = (options.print!=undefined)? options.print:true;
		win_opts.title = this.TITLE + ( (options.title!=undefined)? ": "+options.title:"" );
		
		var template = options.template || window.getApp().getTemplate("WindowPrint");
		win_opts.content = Mustache.render(
			template.replace("{{content}}",options.content),
			{"title":win_opts.title,
			"scriptId":window.getApp().getServVar("scriptId")
			}
		);
		
		/*		
		win_opts.content = options.template || window.getApp().getTemplate("WindowPrint");
		options.scriptId = window.getApp().getServVar("scriptId");
		var matches = win_opts.content.match( /{{.*}}/g );
		if (matches){
			for(var i=0;i<matches.length;i++){
				win_opts.content = win_opts.content.split(matches[i]).join(eval(matches[i].substring(2,matches[i].length-2)));
			}		
		}
		*/			
		//newWin.document.write(tmpl);		
		var winObj = new WindowForm(win_opts);//window.open(""); 
		var newWin = winObj.open();
		newWin.document.close();
		var win_del = setInterval(check_state,10);
		function check_state(){
			if (newWin.document.readyState=="complete"){
				clearInterval(win_del);
				newWin.focus();
				if (print_and_close){
					newWin.print();
					newWin.close();
				}
			}
		}
	}
}
