/*
 * cordova is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */

/**
 * Constructor
 */
function ChildBrowser() {
};

ChildBrowser.CLOSE_EVENT = 0;
ChildBrowser.LOCATION_CHANGED_EVENT = 1;

/**
 * Display a new browser with the specified URL.
 * This method loads up a new web view in a dialog.
 *
 * @param url           The url to load
 * @param options       An object that specifies additional options
 */
ChildBrowser.prototype.showWebPage = function(url, options) {
    options = options || {
        showLocationBar: true,
        locationBarAlign: "top"
    };
    cordova.exec(this._onEvent, this._onError, "ChildBrowser", "showWebPage", [url, options]);
};

/**
 * Close the browser opened by showWebPage.
 */
ChildBrowser.prototype.close = function() {
    cordova.exec(null, null, "ChildBrowser", "close", []);
};

/**
 * Display a new browser with the specified URL.
 * This method starts a new web browser activity.
 *
 * @param url           The url to load
 * @param usecordova   Load url in cordova webview [optional]
 */
ChildBrowser.prototype.openExternal = function(url, usecordova) {
    if (usecordova === true) {
        navigator.app.loadUrl(url);
    }
    else {
        cordova.exec(null, null, "ChildBrowser", "openExternal", [url, usecordova]);
    }
};

/**
 * Method called when the child browser has an event.
 */
ChildBrowser.prototype._onEvent = function(data) {
    if (data.type == ChildBrowser.CLOSE_EVENT && typeof window.plugins.childBrowser.onClose === "function") {
        window.plugins.childBrowser.onClose();
    }
    if (data.type == ChildBrowser.LOCATION_CHANGED_EVENT && typeof window.plugins.childBrowser.onLocationChange === "function") {
        window.plugins.childBrowser.onLocationChange(data.location);
    }
};

/**
 * Method called when the child browser has an error.
 */
ChildBrowser.prototype._onError = function(data) {
    if (typeof window.plugins.childBrowser.onError === "function") {
        window.plugins.childBrowser.onError(data);
    }
};

/**
 * Maintain API consistency with iOS
 */
ChildBrowser.prototype.install = function(){
};

/**
 * Load ChildBrowser
 */

if(!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.childBrowser) {
    window.plugins.childBrowser = new ChildBrowser();
}
/**
 * 
 * Phonegap share plugin for Android
 * Kevin Schaul 2011
 *
 */

var Share = function() {};
            
Share.prototype.show = function(content, success, fail) {
    return cordova.exec( function(args) {
        success(args);
    }, function(args) {
        fail(args);
    }, 'Share', '', [content]);
};

if(!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.share) {
    window.plugins.share = new Share();
}

// ------------------------- Controles especificos de Android ----

enyo.kind({
    name: 'Controles',
    kind: 'Control',
    style: 'background: rgba(255, 160, 122, 0.1); height: 40px;',
    classes: 'onyx',
    published: {
        cid: '',
        subject: '',
        text: '',
        url: '',
        murl: ''
    },
    components: [
        {classes: 'icon-comment control', ontap: 'comments'}, 
        {classes: 'icon-forward control', ontap: 'noticia'},
        {classes: 'icon-network control', ontap: 'noticia_m'},
        {classes: 'icon-share control', ontap: 'share'}
    ],
    comments: function() {
        enyo.Signals.send('onComentarios', this.cid);
    },
    noticia: function() {
        window.plugins.childBrowser.showWebPage(this.url, { showLocationBar: false});
    },
    noticia_m: function() {
        window.plugins.childBrowser.showWebPage(this.murl, { showLocationBar: false});
    },
    share: function() {
        var that = this;

        window.plugins.share.show({
            subject: that.subject,
            text: that.text},
            function() {}, // Success function
            function() {alert('Share failed')} // Failure function
        );
    }

});
