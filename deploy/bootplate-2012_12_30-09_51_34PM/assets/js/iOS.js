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

//
//  ShareKitPlugin.js
//  
//
//  Created by Erick Camacho on 28/07/11.
//  MIT Licensed
//

function ShareKitPlugin()
{
	console.log('creating plugin');
};

ShareKitPlugin.prototype.share = function(message, url)
{
	cordova.exec(null, null, "ShareKitPlugin", "share", [message, url]);
    
};


ShareKitPlugin.prototype.isLoggedToTwitter = function( callback )
{
	
    cordova.exec(callback, null, "ShareKitPlugin", "isLoggedToTwitter", [] );
};

ShareKitPlugin.prototype.isLoggedToFacebook = function( callback )
{
	
    cordova.exec(callback, null, "ShareKitPlugin", "isLoggedToFacebook", [] );

};

ShareKitPlugin.prototype.logoutFromTwitter = function()
{
	
    cordova.exec(null, null, "ShareKitPlugin", "logoutFromTwitter", [] );

};

ShareKitPlugin.prototype.logoutFromFacebook = function()
{
	
    cordova.exec(null, null, "ShareKitPlugin", "logoutFromFacebook", [] );

};


ShareKitPlugin.prototype.facebookConnect = function()
{
	
    cordova.exec(null, null, "ShareKitPlugin", "facebookConnect", [] );
    
};

ShareKitPlugin.prototype.shareToFacebook = function( message, url)
{
	
    cordova.exec(null, null, "ShareKitPlugin", "shareToFacebook", [message, url] );
    
};

ShareKitPlugin.prototype.shareToTwitter = function( message, url)
{
	
    cordova.exec(null, null, "ShareKitPlugin", "shareToTwitter", [message, url] );
    
};

ShareKitPlugin.prototype.shareToMail = function( subject, message)
{
	
    cordova.exec(null, null, "ShareKitPlugin", "shareToMail", [subject, message] );
    
};




ShareKitPlugin.install = function()
{
    if(!window.plugins)
    {
        window.plugins = {};	
    }

    window.plugins.shareKit = new ShareKitPlugin();
    return window.plugins.shareKit;
};

cordova.addConstructor(ShareKitPlugin.install);
