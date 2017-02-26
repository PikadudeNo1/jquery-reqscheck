<h1>jQuery reqsCheck Plugin</h1>

[Get the plugin](https://github.com/PikadudeNo1/jQuery-reqsCheck/raw/v1.1.1/jquery.reqscheck.min.js)

<h2>What it does</h2>

This lightweight, flexible jQuery plugin simplifies the process of testing whether the end user's browser meets (a subset of) your app's requirements and loading polyfills to provide a little help to browsers that need it. Even if not every requirement has a polyfill, even if you want to test different sets of requirements to enable different parts of your app, even if polyfilling a requirement entails something besides loading a script, this plugin can help you!

<a href="https://modernizr.com/">Modernizr</a> can test many aspects of browsers' functionality and makes a great companion to this plugin, and its wiki features <a href="https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills">a guide to polyfills you could load</a>.

<h2>Table of contents</h2>

- <a href="#API">API</a>
	- <a href="#jQueryNamespace">Parts of the jQuery Namespace</a>
		- <a href="#jQuery.reqsCheck"><code>$.reqsCheck()</code></a>
		- <a href="#jQuery.reqsCheckPolyfills"><code>$.reqsCheckPolyfills</code></a>
		- <a href="#jQuery.reqsCheckPolyfillPromises"><code>$.reqsCheckPolyfillPromises</code></a>
		- <a href="#jQuery.reqsCheckAjaxOptions"><code>$.reqsCheckAjaxOptions</code></a>
	- <a href="#resultsObject">Properties of Results Objects</a>
		- <a href="#obj-canMeetReqs"><code>.canMeetReqs</code></a>
		- <a href="#obj-polyfillsNeeded"><code>.polyfillsNeeded</code></a>
		- <a href="#obj-getPolyfills"><code>.getPolyfills()</code></a>
		- <a href="#obj-promise"><code>.promise()</code></a>
- <a href="#license">License (MIT)</a>

<h2 id="API">API</h2>

<h3 id="jQueryNamespace">Parts of the jQuery Namespace</h3>

<h4 id="jQuery.reqsCheck"><code>$.reqsCheck()</code> - Parameter: <code>(array) reqs</code></h4>

Each element in <code>reqs</code> is a requirement that must be met either by the browser or an available polyfill. Requirements are represented as either:

- A string, which will be prepended with <code>"return "</code> and passed to <code>new Function</code>
- A function, optionally with a <code>toString</code> method returning a property name of <a href="#jQuery.reqsCheckPolyfills"><code>$.reqsCheckPolyfills</code></a>

The requirement is considered to be met by the browser if the resulting function returns a truthy value without throwing an exception.

Returns a <a href="#resultsObject">results object</a>.

```javascript
// Basic usage
var results = $.reqsCheck(["Modernizr.flexbox", "Object.assign"]);

// If you have a Content Security Policy that lacks unsafe-eval, you must use functions instead
// Consider a factory like this one to make it easier
function makeModernizrReq(req) {
	var test = function() { return Modernizr[req]; };
	test.toString = function() { return "Modernizr." + req; };
	return test;
}
// You could then use your factory with reqsCheck like so
var results = $.reqsCheck([ makeModernizrReq("flexbox"), makeModernizrReq("promises") ])
```

<h4 id="jQuery.reqsCheckPolyfills"><code>$.reqsCheckPolyfills</code> - Object</h4>

The name of each property is the string representation of a requirement passed to <code>$.reqsCheck()</code>. The value is either the URL of a polyfill script that can meet that requirement, or the name of an appropriate property of <a href="#jQuery.reqsCheckPolyfillPromises"><code>$.reqsCheckPolyfillPromises</code></a>. A value may be used as many times as necessary. Note that this object has no properties by default, leaving the decision of which polyfills are suitable to you.

```javascript
$.reqsCheckPolyfills = {
	"Element.prototype.prepend": "/polyfills/dom4.js",
	"Object.assign": "/polyfills/ecmascript6.js",
	"Map": "/polyfills/ecmascript6.js" // used twice but will only be loaded once
};
```

<h4 id="jQuery.reqsCheckPolyfillPromises"><code>$.reqsCheckPolyfillPromises</code> - Object</h4>

The name of each property is one of the polyfills specified in <code>$.reqsCheckPolyfills</code>. Each value is a <a href="https://api.jquery.com/jQuery.Deferred/">Deferred</a> (or any Promise/thenable, for jQuery 3+) that must be resolved when the polyfill is ready to use, or rejected if attempting to prepare the polyfill failed.

The <code>.getPolyfills</code> method of results objects assumes that any polyfill with no property here is a script, and will automatically create a property with the value returned by <code><a href="https://api.jquery.com/jQuery.ajax/">$.ajax</a>(polyfill, <a href="#jQuery.reqsCheckAjaxOptions">$.reqsCheckAjaxOptions</a>)</code>. Such auto-created properties are also auto-deleted if loading the script fails, allowing another <code>.getPolyfills</code> call to try <code>$.ajax</code> again.

<h4 id="jQuery.reqsCheckAjaxOptions"><code>$.reqsCheckAjaxOptions</code> - Object</h4>

These options are passed to <a href="https://api.jquery.com/jQuery.ajax/"><code>$.ajax</code></a> whenever reqsCheck attempts to load a polyfill. It defaults to <code>{dataType: "script", cache: true}</code>.

<h3 id="resultsObject">Properties of the Results Object</h3>

<h4 id="obj-canMeetReqs"><code>.canMeetReqs</code> - Boolean</h4>

If <code>true</code>, indicates that the browser can theoretically meet the specified requirements, assuming any needed polyfills load.

<h4 id="obj-polyfillsNeeded"><code>.polyfillsNeeded</code> - Object</h4>

The name of each property is a polyfill that must be loaded for the requirements to be met, as specified in the values of <a href="#jQuery.reqsCheckPolyfills"><code>$.reqsCheckPolyfills</code></a>. All values are <code>true</code>. If <code>.canMeetReqs</code> is false, not every helpful polyfill may be included.

You may add/remove properties from this object before calling <code>.getPolyfills()</code> to alter its behavior.

```javascript
// Sometimes a polyfill's API isn't quite the same as the standard it enables support for.
// After .getPolyfills() does its thing, you can work around that like so.

if (results.polyfillsNeeded[urlOfPolyfill]) {
	// Use the polyfill's API
} else {
	// Use the standard API
}
```

<h4 id="obj-getPolyfills"><code>.getPolyfills()</code> - No parameters</h4>

Begins loading any needed polyfills, and returns a <a href="https://api.jquery.com/Types/#Promise">jQuery Promise</a> that is resolved when the requirements are satisfied with any needed polyfills loaded successfully. The Promise is rejected if any polyfills fail to load, or if <code>.canMeetReqs</code> is false (no polyfills are loaded in the latter case).

```javascript
results.getPolyfills().then( function done() {
	// Use required features as you please!
}, function fail() {
	if (results.canMeetReqs) {
		// Polyfills failed to load.
	} else {
		// The browser is unable to meet the requirements.
	}
} );
```

<h4 id="obj-promise"><code>.promise()</code> - No parameters</h4>

An alias for <code>.getPolyfills</code>. This lets you use undocumented behavior of <a href="https://api.jquery.com/jQuery.when/"><code>$.when</code></a> to treat the results object as if it were a Deferred.

```javascript
// Proceed when the document is loaded and requirements are met
// For more info about $.ready:
// https://jquery.com/upgrade-guide/3.0/#feature-jquery-ready-promise-is-formally-supported

$.when($.ready, results).then(myFunc);
```

<h2 id="license">License (MIT)</h2>

This plugin is made available for use under the MIT License, the text of which is below. To summarize, the answer to "Can I do x?" is "yes", unless x is "remove the opening comment" or "sue the author".

> Copyright (c) 2016, Pikadude No. 1
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.