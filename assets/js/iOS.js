/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi


(function() {

var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks

function ChildBrowser() {
    // Does nothing
}

// Callback when the location of the page changes
// called from native
ChildBrowser._onLocationChange = function(newLoc)
{
    window.plugins.childBrowser.onLocationChange(newLoc);
};

// Callback when the user chooses the 'Done' button
// called from native
ChildBrowser._onClose = function()
{
    window.plugins.childBrowser.onClose();
};

// Callback when the user chooses the 'open in Safari' button
// called from native
ChildBrowser._onOpenExternal = function()
{
    window.plugins.childBrowser.onOpenExternal();
};

// Pages loaded into the ChildBrowser can execute callback scripts, so be careful to
// check location, and make sure it is a location you trust.
// Warning ... don't exec arbitrary code, it's risky and could fuck up your app.
// called from native
ChildBrowser._onJSCallback = function(js,loc)
{
    // Not Implemented
    //window.plugins.childBrowser.onJSCallback(js,loc);
};

/* The interface that you will use to access functionality */

// Show a webpage, will result in a callback to onLocationChange
ChildBrowser.prototype.showWebPage = function(loc)
{
    cordovaRef.exec("ChildBrowserCommand.showWebPage", loc);
};

// close the browser, will NOT result in close callback
ChildBrowser.prototype.close = function()
{
    cordovaRef.exec("ChildBrowserCommand.close");
};

// Not Implemented
ChildBrowser.prototype.jsExec = function(jsString)
{
    // Not Implemented!!
    //PhoneGap.exec("ChildBrowserCommand.jsExec",jsString);
};

// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.childBrowser
ChildBrowser.install = function()
{
    if(!window.plugins) {
        window.plugins = {};
    }
        if ( ! window.plugins.childBrowser ) {
        window.plugins.childBrowser = new ChildBrowser();
    }

};


if (cordovaRef && cordovaRef.addConstructor) {
    cordovaRef.addConstructor(ChildBrowser.install);
} else {
    console.log("ChildBrowser Cordova Plugin could not be installed.");
    return null;
}


})();

/**
 * @author sam
 */
/* MIT licensed */
// (c) 2010 Jesse MacFadyen, Nitobi
// Contributions, advice from : 
// http://www.pushittolive.com/post/1239874936/facebook-login-on-iphone-phonegap

function FBConnect()
{
	if(window.plugins.childBrowser == null)
	{
		ChildBrowser.install();
	}
}

FBConnect.prototype.connect = function(client_id,redirect_uri,display)
{
	this.client_id = client_id;
	this.redirect_uri = redirect_uri;
	
	var authorize_url  = "https://graph.facebook.com/oauth/authorize?";
	authorize_url += "client_id=" + client_id;
	authorize_url += "&redirect_uri=" + redirect_uri;
	authorize_url += "&display="+ ( display ? display : "touch" );
	authorize_url += "&type=user_agent";
	//if you want to post message on the wall : publish_stream, offline_access,
	authorize_url += "&scope=offline_access,publish_stream";
	
	window.plugins.childBrowser.showWebPage(authorize_url);
	var self = this;
	window.plugins.childBrowser.onLocationChange = function(loc){self.onLocationChange(loc);};
}

FBConnect.prototype.onLocationChange = function(newLoc)
{
	if(newLoc.indexOf(this.redirect_uri) == 0)
	{
		console.log('onLocationChange url='+newLoc);
		var result = unescape(newLoc).split("#")[1];
		result = unescape(result);
		
		// TODO: Error Check
		this.accessToken = result.split("&")[0].split("=")[1];		
		//this.expiresIn = result.split("&")[1].split("=")[1];
		
		window.plugins.childBrowser.close();
		this.onConnect();
		
	}
}

FBConnect.prototype.getFriends = function()
{
	var url = "https://graph.facebook.com/me/friends?access_token=" + this.accessToken;
	var req = new XMLHttpRequest();
	
	req.open("get",url,true);
	req.send(null);
	req.onerror = function(){alert("Error");};
	return req;
}


FBConnect.prototype.postFBWall = function(message, urlPost, urlPicture, callBack)
{
	
	console.log('inside postFBWall '+message + ' urlPost='+urlPost + ' urlPicture='+urlPicture);
	
	var url = 'https://graph.facebook.com/me/feed?access_token=' + this.accessToken+'&message='+message;
	
	if (urlPost) {
		url += '&link='+encodeURIComponent(urlPost);
	}
	if (urlPicture) {
		url += '&picture='+encodeURIComponent(urlPicture);
	}
	
	var req = this.postFBGraph(url);
	
	req.onload = callBack;
}

FBConnect.prototype.postFBGraph = function(url)
{
	console.log('inside postFBGraph url='+url);
	
	var req = new XMLHttpRequest(); 
	req.open("POST", url, true); 
	/*req.onreadystatechange = function() {//Call a function when the state 
	 if(req.readyState == 4 && req.status == 200) { 
	 alert(req.responseText); 
	 }
	 };*/
	
	req.send(null); 
	return req; 
}


// Note: this plugin does NOT install itself, call this method some time after deviceready to install it
// it will be returned, and also available globally from window.plugins.fbConnect
FBConnect.install = function()
{
    console.log('FBConnect.install');
	if(!window.plugins)
	{
		window.plugins = {};	
	}

	window.plugins.fbConnect = new FBConnect();
}

/**
 * @constructor
 */
var Twitter = function(){};
/**
 * Checks if the Twitter SDK is loaded
 * @param {Function} response callback on result
 * @param {Number} response.response is 1 for success, 0 for failure
 * @example
 *      window.plugins.twitter.isTwitterAvailable(function (response) {
 *          console.log("twitter available? " + response);
 *      });
 */
Twitter.prototype.isTwitterAvailable = function(response){
    cordova.exec(response, null, "TwitterPlugin", "isTwitterAvailable", []);
};
/**
 * Checks if the Twitter SDK can send a tweet
 * @param {Function} response callback on result
 * @param {Number} response.response is 1 for success, 0 for failure
 * @example
 *      window.plugins.twitter.isTwitterSetup(function (r) {
 *          console.log("twitter configured? " + r);
 *      });
 */
Twitter.prototype.isTwitterSetup = function(response){
    cordova.exec(response, null, "TwitterPlugin", "isTwitterSetup", []);
};
/**
 * Sends a Tweet to Twitter
 * @param {Function} success callback
 * @param {Function} failure callback
 * @param {String} failure.error reason for failure
 * @param {String} tweetText message to send to twitter
 * @param {Object} options (optional)
 * @param {String} options.urlAttach URL to embed in Tweet
 * @param {String} options.imageAttach Image URL to embed in Tweet
 * @param {Number} response.response - 1 on success, 0 on failure
 * @example
 *     window.plugins.twitter.composeTweet(
 *         function () { console.log("tweet success"); }, 
 *         function (error) { console.log("tweet failure: " + error); }, 
 *         "Text, Image, URL", 
 *         {
 *             urlAttach:"http://m.youtube.com/#/watch?v=obx2VOtx0qU", 
 *             imageAttach:"http://i.ytimg.com/vi/obx2VOtx0qU/hqdefault.jpg?w=320&h=192&sigh=QD3HYoJj9dtiytpCSXhkaq1oG8M"
 *         }
 * );
 */
Twitter.prototype.composeTweet = function(success, failure, tweetText, options){
    options = options || {};
    options.text = tweetText;
    cordova.exec(success, failure, "TwitterPlugin", "composeTweet", [options]);
};
/**
 * Gets Tweets from Twitter Timeline
 * @param {Function} success callback
 * @param {Object[]} success.response Tweet objects, see [Twitter Timeline Doc]
 * @param {Function} failure callback
 * @param {String} failure.error reason for failure
 * @example
 *     window.plugins.twitter.getPublicTimeline(
 *         function (response) { console.log("timeline success: " + JSON.stringify(response)); }, 
 *         function (error) { console.log("timeline failure: " + error); }
 *     );
 * 
 * [Twitter Timeline Doc]: https://dev.twitter.com/docs/api/1/get/statuses/public_timeline
 */
Twitter.prototype.getPublicTimeline = function(success, failure){
    cordova.exec(success, failure, "TwitterPlugin", "getPublicTimeline", []);
};
/**
 * Gets Tweets from Twitter Mentions
 * @param {Function} success callback
 * @param {Object[]} success.result Tweet objects, see [Twitter Mentions Doc]
 * @param {Function} failure callback
 * @param {String} failure.error reason for failure
 * @example
 *     window.plugins.twitter.getMentions(
 *         function (response) { console.log("mentions success: " + JSON.stringify(response)); },
 *         function (error) { console.log("mentions failure: " + error); }
 *     );
 * 
 * [Twitter Timeline Doc]: https://dev.twitter.com/docs/api/1/get/statuses/public_timeline
 */
Twitter.prototype.getMentions = function(success, failure){
    cordova.exec(success, failure, "TwitterPlugin", "getMentions", []);
};
/**
 * Gets Tweets from Twitter Mentions API
 * @param {Function} success callback
 * @param {String} success.response Twitter Username
 * @param {Object[]} success.result Tweet objects, see [Twitter Mentions Doc]
 * @param {Function} failure callback
 * @param {String} failure.error reason for failure
 * 
 * [Twitter Mentions Doc]: https://dev.twitter.com/docs/api/1/get/statuses/mentions
 */
Twitter.prototype.getTwitterUsername = function(success, failure) {
    cordova.exec(success, failure, "TwitterPlugin", "getTwitterUsername", []);
};
/**
 * Gets Tweets from Twitter Mentions API
 * @param {String} url of [Twitter API Endpoint]
 * @param {Object} params key-value map, matching [Twitter API Endpoint]
 * @param {Function} success callback
 * @param {Object[]} success.response objects returned from Twitter API (Tweets, Users,...)
 * @param {Function} failure callback
 * @param {String} failure.error reason for failure
 * @param {Object} options (optional) other options for the HTTP request
 * @param {String} options.requestMethod HTTP Request type, ex: "POST"
 * @example
 *     window.plugins.twitter.getTWRequest(
 *          'users/lookup.json',
 *          {user_id: '16141659,783214,6253282'},
 *          function (response) { console.log("usersLookup success: " + JSON.stringify(response)); }, 
 *          function (error) { console.log("usersLookup failure: " + error); },
 *          {requestMethod: 'POST'}
 *     );
 * 
 * [Twitter API Endpoints]: https://dev.twitter.com/docs/api
 */
Twitter.prototype.getTWRequest = function(url, params, success, failure, options){
    options = options || {};
    options.url = url;
    options.params = params;
    cordova.exec(success, failure, "TwitterPlugin", "getTWRequest", [options]);
};
// Plug in to Cordova
cordova.addConstructor(function() {
					   
					   /* shim to work in 1.5 and 1.6  */
						if (!window.Cordova) {
						window.Cordova = cordova;
						};
						
					   
					   if(!window.plugins) window.plugins = {};
					   window.plugins.twitter = new Twitter();
					   });
/**
 * Clipboard plugin for PhoneGap
 * 
 * @constructor
 */
function ClipboardPlugin(){ }

/**
 * Set the clipboard text
 *
 * @param {String} text The new clipboard content
 */
ClipboardPlugin.prototype.setText = function(text) {
	PhoneGap.exec("ClipboardPlugin.setText", text);
}

/**
 * Get the clipboard text
 *
 * @param {String} text The new clipboard content
 */
ClipboardPlugin.prototype.getText = function(callback) {
	PhoneGap.exec(callback, null, "ClipboardPlugin", "getText", []);
}

/**
 * Register the plugin with PhoneGap
 */
PhoneGap.addConstructor(function() {
	if(!window.plugins) window.plugins = {};
	window.plugins.clipboardPlugin = new ClipboardPlugin();
});
