/* jQuery reqsCheck Plugin v1.1.4 by Pikadude No. 1
   License (MIT): https://github.com/PikadudeNo1/jQuery-reqsCheck#license */
(function($) {
"use strict";

$.reqsCheck = function (reqs) {
	var result = {
		polyfillsNeeded: {},
		canMeetReqs: true
	};
	var polyfills = $.reqsCheckPolyfills;
	$.each( reqs, function() {
		try {
			var testResult =
				( typeof this == "function" ? this : new Function("return " + this) )();
		} catch (e) {
			var testResult = false;
		}
		if (!testResult) {
			if (this in polyfills) {
				result.polyfillsNeeded[ polyfills[this] ] = true;
			} else {
				result.canMeetReqs = false;
				return false;
			}
		}
	} );
	result.getPolyfills = result.promise = function() {
		var polyfillPromises = $.reqsCheckPolyfillPromises;
		if (!this.canMeetReqs) {
			return $.Deferred().reject(this);
		}
		var needed = [];
		for (var polyfill in this.polyfillsNeeded) {
			if (polyfillPromises[polyfill] == undefined) {
				polyfillPromises[polyfill] = $.ajax(polyfill, $.reqsCheckAjaxOptions).fail(function() {
					delete polyfillPromises[polyfill];
				});
			}
			needed.push(polyfillPromises[polyfill]);
		}
		return $.when.apply($, needed);
	}
	return result;
};
$.reqsCheckPolyfills = {};
$.reqsCheckPolyfillPromises = {};
$.reqsCheckAjaxOptions = {dataType: "script", cache: true};

})(jQuery);