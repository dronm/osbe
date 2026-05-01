/**	
 * Cookie managing functions
 * 
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019 
 * code taken from https://learn.javascript.ru/cookie
 *
 * @class
 *
 */
var CookieManager = {
	/**
	 * Returns cookie with the given name or undefined if cookie dows not exist
	 * @returns string
	 */
	get: function (name) {
		var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	},

	set: function (name, value, options) {
		CommonHelper.merge(options,{"path": "/"});

		if (options.expires && options.expires.toUTCString) {
			options.expires = options.expires.toUTCString();
		}

		var updated_cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

		for (var option_key in options) {
			updated_cookie += "; " + option_key;
			var option_value = options[option_key];
			if (option_value !== true) {
				updated_cookie += "=" + option_value;
			}
		}
		//console.log("Setting cookie to "+updated_cookie)
		document.cookie = updated_cookie;
	},
	
	del: function (name) {
		this.set(name, "", {"max-age": -1});
	}
}
