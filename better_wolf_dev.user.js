// ==UserScript==
// @name          Better Wolf Dev
// @author        Jonathan Hamilton
// @namespace     http://jlhamilt.freeshell.org/
// @version       1.0
// @description   Extensions for the Wolf Web
// @include       http://*thewolfweb.com/*
// @include       http://*brentroad.com/*
// @exclude       http://site3.thewolfweb.com/*
// @require       http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js
// @require       http://jlhamilt.freeshell.org/bwd/bww.blocking.js
// @require       http://jlhamilt.freeshell.org/bwd/scaffold.js
// @require       http://jlhamilt.freeshell.org/bwd/gm_jq_xhr.js
// ==/UserScript==

if (window.top != window.self) {
	$.noop(); // Don't run the script if the page is in an IFRAME.
} else {


// This function just checks the document's URL against a regular expression and
// calls different functions based on what it finds. There may be a better way
// to do this later.
function checkWolfWebURL() {
	currentURL = location.href;

	if (currentURL.match(/iframe/)){
		return false;
	} else if (currentURL.match(/\/message\.aspx/)) {
		parseMessageBoardList();
		buildSearchForm();
		blockUsersInBoardList();
	} else if (currentURL.match(/message_section\.aspx/)) {
		threadsList = parseThreadsList();
		buildSearchForm();
		blockUsersInThreadsList();
		section = GM_getValue("current_section_id");
		threadIDs = [];
		jQuery.each(threadListing, function(key, value){threadIDs.push(this.id);});
		$.getJSON('http://lolibrary.org/bww/getvotes.php', { 'threads[]': threadIDs, section: section },
		 function(json){
		 	if (json != null) {
				$.each(json, function(key, value){
					$('#thread_' + value).addClass('nsfw');
				});
				$('.nsfw').attr('bgcolor', '').css('backgroundColor','#ffb2b2');
			}
		});
	} else if (currentURL.match(/message_topic\.aspx/)) {
		[postsInThread, usersInThread] = parseCurrentThread();
		applyMediaEnhancements();
		gunzzDegayifier();
		blockUsersInThread(usersInThread);
	} else if (currentURL.match(/user\.aspx/)) {
		parseUserListPage();
	} else if (currentURL.match(/user_info\.aspx/)) {
		currentUser = parseUserProfile();
		addBlockLink(currentUser); 	
	} else if (currentURL.match(/photo_photo\.aspx/)) {
		parsePhotoPage();
	}

	wolflink = $('a').eq(0).attr("id", "wolflink");
	logo = wolflink.children("img").attr("id", "logo");
	wolflink.replaceWith(logo);
	logo.after(wolfWebDialog("blocked_users_dialog", "Blocked users", "omg undefined content"));
	logo.bind("click", function() {
		renderBlockedUsers("#blocked_users_dialog_content");
		$('#blocked_users_dialog').slideToggle("fast");
		return false;
	});
};

// And the whole thing boils down to this stub. :P
GM_registerMenuCommand("Clear blocked users list", function() { GM_deleteValue("blocked_users"); });
checkLogin();
checkWolfWebURL();
}