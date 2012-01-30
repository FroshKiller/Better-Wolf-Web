// ==UserScript==
// @name          Better Wolf Web
// @author        Jonathan Hamilton
// @namespace     http://jlhamilt.freeshell.org/
// @version       2.0
// @description   Extensions for the Wolf Web
// @include       http://*thewolfweb.com/*
// @include       http://*brentroad.com/*
// @exclude       http://site3.thewolfweb.com/*
// @require       http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js
// @require       https://raw.github.com/FroshKiller/Better-Wolf-Web/master/bww.utils.js
// @require       https://raw.github.com/FroshKiller/Better-Wolf-Web/master/bww.commands.js
// @require       https://raw.github.com/FroshKiller/Better-Wolf-Web/master/bww.blocking.js
// @require       https://raw.github.com/FroshKiller/Better-Wolf-Web/master/scaffold.js
// @require       https://raw.github.com/FroshKiller/Better-Wolf-Web/master/gm_jq_xhr.js
// ==/UserScript==

if (window.top != window.self) {
	$.noop(); // Don't run the script if the page is in an IFRAME.
} else {
	debugMode = GM_getValue("debug_mode", false);

	if (debugMode) {
		console.group("Better Wolf Web");
		console.time("Overall script execution");
	}

	scaffoldCommonElements();

	switch(location.pathname) {
		case "/message.aspx":
			threadList = scaffoldMessageBoards();
			break;
		case "/message_section.aspx":
			threadList = scaffoldThreads();
			break;
		case "/message_topic.aspx":
			[postsInThread, usersInThread] = scaffoldThread(); // Firefox supports multiple returns.
			break;
		case "/user_info.aspx":
			currentUser = scaffoldUserProfile();
			break;
		case "/user_settings.aspx":
			scaffoldSettingsPage();
			break;
		default:
			break;
	}

	if (debugMode) {
		document.title += " - Debugging";
		console.groupEnd("Better Wolf Web");
	}
}