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

// This variable gets used later. Basically, if there is a word or phrase you
// want to look for in thread titles, stick it here.
topicRegexp = ['nsfw', 'official', 'tww'];

function gunzzDegayifier() {
	gunzzFrames = $('.post_message_content iframe');
	gunzzFrames.each(function(){
		iFrame = $(this);
		iFrameURL = iFrame.attr("src");
		iFrame.replaceWith('<a href="' + iFrameURL + '" target="new">' + iFrameURL + '</a>');
	});
}

function applyMediaEnhancements() {
	messageLinks = $('div.post_message_content a');
	messageLinks.filter('a[href*=.mp3]').each(function() {
		mp3Link = $(this);
		mp3LinkURL = mp3Link.attr("href");
		mp3Link.replaceWith('<embed class="mp3_player" type="application/x-shockwave-flash" src="http://www.google.com/reader/ui/3247397568-audio-player.swf?audioUrl=' + mp3LinkURL + '" width="400" height="27" allowscriptaccess="never" quality="best" bgcolor="#ffffff" wmode="window" flashvars="playerMode=embedded"><br><a href="' + mp3LinkURL + '" class="plain mp3_link" title="Download this MP3">Download this MP3</a>');
	});

	$('embed').attr("autostart", "false");

	messageLinks.filter('a[href*=youtube.com/watch]').each(function() {
		videoID = $(this).attr("href").replace(/^[^v]+v.(.{11}).*/,"$1");
		$(this).replaceWith('<object class="youtube_video" width="445" height="364"><param name="movie" value="http://www.youtube.com/v/' + videoID + '&hl=en&fs=1&color1=0xdd0000&color2=0x660000&border=1"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/' + videoID + '&hl=en&fs=1&color1=0xdd0000&color2=0x660000&border=1" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="445" height="364"></embed></object>');
	});
}

// Shortcut search!
function buildSearchForm() {
	sectionName = "Message Boards";
	sectionID = "";

	if (location.href.match(/message_section\.aspx/)) {
		sectionID = ' <input type="hidden" name="section" value="' + GM_getValue("current_section_id") + '">';
		sectionName = GM_getValue("current_section");
	}

	searchButton = $('a[href*="message_search.aspx"]');

	searchButton.after('<form id="quick_search" action="message_search.aspx" method="get" style="position: absolute; z-index: 50; right: 4; display: none;">' + sectionID + '<table class="bar" cellspacing="0" cellpadding="3"><tbody><tr><td>Search ' + sectionName + '</td><td align="right"><a href="message_search.aspx">Advanced Search</a></td></tr><tr><td valign="top" colspan="2"><table width="100%" cellspacing="0" cellpadding="5" border="0" class="inbar"><tbody><tr bgcolor="#e3e3e3"><td class="rightbold"><label for="quick_search_searchstring">Keywords:</label> </td><td align="right"><input id="quick_search_searchstring" type="text" size="30" name="searchstring"></td></tr><tr><td><input type="radio" value="topic" name="type" checked>&nbsp;topics&nbsp;<input type="radio" value="posts" name="type">&nbsp;posts&nbsp;</label></td><td align="right"><input type="submit" value="search" class="button"></td></tr><tr bgcolor="#e3e3e3"><td class="rightbold"><label for="quick_search_username">Username:</label> </td><td align="right"><input id="quick_search_username" type="text" size="30" name="username" id="search_username"></td></tr><tr><td colspan="2"><input type="radio" checked name="usertype" value="match">&nbsp;matches&nbsp;<input type="radio" name="usertype" value="like">&nbsp;sounds like</td></tbody></table></td></tr></tbody></table></form>');
	searchButton.bind("click", function() {
		$('#quick_search').slideToggle("fast");
		return false;
	});
}



function addBlockLink(user) {
	blockedUsers = getBlockedUsers();
	blockedUserIDs = [];
	blockText = "Block this user";

	if (blockedUsers) {
		blockedUsers.forEach(function(value, index, array){
			blockedUserIDs.push(value.userid);
		});
		
		if (jQuery.inArray(user.userid, blockedUserIDs) != -1) {
			blockText = "Unblock this user";
		}
	}
	$('#block_link').text(blockText);
	$('#block_link').bind("click", function(){
		alert(toggleUserOnBlockList(user));
		return false;
	});
}





function hideMsg(msg) {
	console.log("hiding post " + msg.attr("id"));
	postCell = msg.parent();
	hiddenMsg = msg.hide();
	toggleLink = $(document.createElement('a'));
	toggleLink.attr("href", "#" + msg.attr("id").substr(8));
	toggleLink.addClass("post_toggle");
	toggleLink.text("Show this post");
	postCell.prepend(toggleLink);
	toggleLink.append(hiddenMsg);
	
	toggleLink.bind("click", function() {
		postContent = $(this).children();
		$(this).replaceWith(postContent);
		postContent.show();
	});
};



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