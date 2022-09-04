// ==UserScript==
// @name         Mabinogi World Wiki - Time Travel (G13/MabiPro Wiki Conversion)
// @namespace    http://twitter.com/MusicalAnvil
// @version      0.1
// @description  Browse like it's 2011 - Redirects to older versions of pages on the Mabinogi World Wiki.
// @author       Embruh/Anvil
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mabinogiworld.com
// @match        http://wiki.mabinogiworld.com*
// @match        https://wiki.mabinogiworld.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.openInTab
// @grant        GM.xmlHttpRequest
// @run-at       document-start
// @updateURL    https://github.com/MusicalAnvil/Mabinogi-World-Wiki-Time-Travel/raw/main/Mabi-Wiki-TimeTravel.user.js
// @downloadURL  https://github.com/MusicalAnvil/Mabinogi-World-Wiki-Time-Travel/raw/main/Mabi-Wiki-TimeTravel.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Search for revision link before certain date. The revision ID is a sequential edit counter of every edit on the whole wiki.
    //     ie. The wiki as it was at the date and time of an edit can be found by grabbing the first edit less than or equal to the specified ID on every page. (Some exceptions apply.)
    // 274799 = 11:48, 17 April 2011 - A couple weeks before G14 released on NA
    // 269270 = 15:53, 31 March 2011

    //***Change to set time-travel date***
    var targetRevision = 274799;

    var selectedRevision;

    // Open a specified page
    function xhr_getrev(link) {
        const xhr = new XMLHttpRequest();
        var reply;
        xhr.open("GET", link, false);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200){
                    reply = select_revision(xhr.responseText);
                    console.log("Reply: " + reply);
                }

                if (xhr.status != 200){
                    console.log('History page did not load correctly.')
                }
            }
        };
        xhr.send(null);
        return reply;
    }

    // Select revision off of page
    function select_revision(xhrResponse, revisionID) {
        console.log("Revision select start");

        var container = document.implementation.createHTMLDocument().documentElement;
        container.innerHTML = xhrResponse;

        var liArray = container.querySelectorAll('[data-mw-revid]');

        for (var i = 0, l = liArray.length; i < l; i++) {
            if (liArray[i].getAttribute('data-mw-revid') <= targetRevision) {
                revisionID = liArray[i].getAttribute('data-mw-revid');
                i = liArray.length;
                console.log("In function: " + revisionID);
            }
        }
        console.log("Revision select end");
        return revisionID;
    }

    // main function
    window.addEventListener("load", function() {
        var currentURL = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search;
        if (currentURL.includes('&oldid=') || currentURL.includes('&action')) {
            return;
        }

        const historyElement = document.querySelector("#ca-history")

        if (document.querySelector("#ca-history") == null) {
            return
        }
        else {
            var pageTitle = window.location.pathname;
            if (window.location.pathname == "/index.php") {
                pageTitle = window.location.search;
                pageTitle = pageTitle.replace('?title=', '');
            }
            else {
                pageTitle = pageTitle.replace('/view/', '');
            }
            console.log(pageTitle);

            if (pageTitle.includes('_Dungeon')){
                pageTitle = pageTitle.replace('Category:', '');
                pageTitle = pageTitle + "&redirect=no";
            }

            var historyURL = window.location.protocol + "//" + window.location.host + "/index.php?title=" + pageTitle + "&offset=&limit=9999&action=history";
            console.log(historyURL);

            var selectedRevision;
            selectedRevision = xhr_getrev(historyURL);
            console.log("Out of function: " + selectedRevision);

            var newURL = window.location.protocol + "//" + window.location.host + "/index.php?title=" + pageTitle + "&oldid=" + selectedRevision;
            console.log(newURL);

            location.replace (newURL);

        }
    }, false)

})();
