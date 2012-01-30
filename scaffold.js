function User(username, userid) {
	this.username = username;
	this.userid = parseInt(userid);
}

User.prototype.userLink = function() {
	userLink = $(document.createElement('a'));
	userLink.attr("href", "user_info.aspx?user=" + this.userid);
	userLink.attr("title", this.username);
	userLink.addClass("user_link");
	userLink.text(this.username);
	return userLink;
}

User.prototype.postsLink = function() {
	postsLink = $(document.createElement('a'));
	postsLink.addClass("plain search_posts_link");
	postsLink.attr("title", "Search for ' + userName + '\'s posts");
	postsLink.attr("href","message_search.aspx?type=posts&amp;username=" + encodeURI(userName));
	return(postsLink);
}

function Post(postid, text, author, authorid) {
	this.id = postid;
	this.text = text;
	this.author = new User(author, authorid);
}

function Thread(threadid, topic, author, authorid, section) {
	this.id = threadid;
	this.topic = topic;
	this.author = author;
	this.authorid = authorid;
	this.section = section;
}

/*
 * This function checks whether you are logged in and, if so, stores your user-
 * name for future use.
 */
function checkLogin() {
	/*
	 * Currently, the logged-in user's username only appears in a B element at
	 * the top of the page. The XPath expression is ugly, but it's the quickest
	 * path to the element we want.
	 */
	userNameElement = document.evaluate('/html/body/table/tbody/tr/td/table/tbody/tr[2]/td/b', 
	document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

	/*
	 * If the element containing the username is found, return the text value of
	 * it (the username itself). Otherwise, return false.
	 */
	if (userNameElement) {
		/*
		 * Set an ID on the username element just in case we want to address it
		 * again later.
		 */
		$(userNameElement).attr("id", "username");

		GM_setValue("username", $(userNameElement).text());
		if (debugMode) {
			console.log("Logged in as " + GM_getValue("username"));
		}
	} else {
		return;
	}
}

/*
 * This procedure handles header & footer scaffolding common to all pages as
 * well as some standard script set-up.
 */
function scaffoldCommonElements() {
	if (debugMode) {
		console.group("Common elements");
	}

	getURLParameters();
	//addStyles();
	checkLogin();
	//createWolfLink();

	if (debugMode) {
		console.groupEnd("Common elements");
	}
}

/*
 * Parses the message boards list (message.aspx).
 */
function scaffoldMessageBoards() {

	if (debugMode) {
		console.groupCollapsed("Message Boards");
	}

	threadList = [];

	/*
	 * First, identify the table containing the list of sections and add an ID
	 * to it in case someone wants it later.
	 */
	sectionsTable = $("table.inbar");
	sectionsTable.attr("id", "tww_sections");

	/* 
	 * Next, we give the TABLE a THEAD and move the initial row of column
	 * headers out of the TBODY and into the THEAD. This is semantically
	 * pleasing, and it will simplify further parsing of the threads list since
	 * we won't be skipping the first row every time--we can treat all of the
	 * TBODY's children equally.
	 *
	 * TODO: Replace the header row's TD elements with TH elements.
	 */
	sectionsTableHead = $(document.createElement("thead"));
	sectionsTableHead.attr("id", "tww_sections_header");
	sectionsTableBody = $("#tww_sections > tbody");
	sectionsTableBody.attr("id", "tww_sections_body");
	sectionsTableBody.before(sectionsTableHead);

	sectionsTableHeaderRow = $("#tww_sections_body > tr:first-child");
	sectionsTableHeaderRow.attr("id", "tww_sections_header_row");
	sectionsTableHeaderRow.remove().appendTo(sectionsTableHead);

	/* 
	 * Here, we select all the TR elements descended from the TBODY and add a
	 * class identifying them.
	 *
	 * TODO: Add ID attributes to the rows signifying which message board
	 * section they represent.
	 */
	sectionRows = $("#tww_sections_body > tr");
	sectionRows.addClass("tww_section");

	if (debugMode) {
		console.time("Scaffolding section rows");		
	}

	sectionRows.each(function() {
		boardCells = $(this).children();
		boardCells.eq(0).addClass('board_status');
		boardName = boardCells.eq(1).addClass('board_name').children("a:first").text();
		boardCells.eq(2).addClass('board_topics');
		sectionLink = boardCells.eq(1).children("a:first");
		threadLink = boardCells.eq(3).addClass('board_last_post').children('a:first').addClass('thread_link');
		userLink = boardCells.eq(3).children('a:last').addClass('user_link');

		sectionNum = sectionLink.attr("href").split("=");
		sectionNum = sectionNum[1].split("&")[0];
		$(this).attr("id", "section_" + sectionNum);
		
		threadNum = threadLink.attr("href").split("=");
		threadNum = threadNum[1].split("&")[0];
		threadLink.attr("id", "thread_" + threadNum);
		threadTopic = threadLink.text();

		userNum = userLink.attr("href").split("=")[1];
		userLink.addClass("user_" + userNum);
		userName = userLink.text();

		boardCells.eq(4).addClass('board_moderators').children('a').addClass('user_link');

		threadList.push(
				new Thread(threadNum, threadTopic, userName, userNum, sectionNum)
		);
	});

	if (debugMode) {
		console.timeEnd("Scaffolding section rows");
		console.groupEnd("Message Boards");
	}

	return(threadList);
}

// This function extracts semantically meaningful information from the message
// board list and updates the page with more content-rich IDs, classes, and
// other attributes.
function parseMessageBoardList() {

	messageBoardThreadListing = [];

	// First, we identify the table containing the list of threads.
	boardTable = $('table.inbar').attr('id', 'tww_board_table');

	// Next, we give the TABLE a THEAD and move the initial row of column
	// headers out of the TBODY and into the THEAD. This is semantically
	// pleasing, and it will simplify further parsing of the threads list since
	// we won't be skipping the first row every time--we can treat all of the
	// TBODY's children equally.
	//
	// TODO: Replace the header row's TD elements with TH elements.
	boardTableHead = $(document.createElement('thead')).attr('id', 'tww_board_table_header');
	boardTableBody = $("#tww_board_table > tbody").attr('id', 'tww_board_table_body');
	boardTableBody.before(boardTableHead);
	boardTableHeaderRow = $('#tww_board_table_body > tr:first-child').attr('id', 'tww_board_table_header_row').remove().appendTo(boardTableHead);

	// Here, we select all the TR elements descended from the TBODY and add a
	// class identifying them.
	//
	// TODO: Add ID attributes to the rows signifying which message board
	// section they represent.
	$('#tww_board_table_body > tr').addClass('tww_board_row');

	// Now we begin processing each message board row. The cells denote certain
	// types of data about each board, so we'll class them to reflect that. You
	// can probably figure out what is what. Originally, the code was a little
	// more human-friendly, but this method is significantly faster. Think about
	// it this way: This is the heavy lifting that will make the cool stuff
	// easier to create, and you don't need to mess with it.
	$('.tww_board_row').each(function() {
		boardCells = $(this).children();
		boardCells.eq(0).addClass('board_status');
		boardName = boardCells.eq(1).addClass('board_name').children("a:first").text();
		boardCells.eq(2).addClass('board_topics');
		threadLink = boardCells.eq(3).addClass('board_last_post').children('a:first').addClass('thread_link');
		userLink = boardCells.eq(3).children('a:last').addClass('user_link');

		threadNum = threadLink.attr("href").split("=");
		threadNum = threadNum[1].split("&");
		threadLink.attr("id", "thread_" + threadNum[0]);
		threadTopic = threadLink.text();

		userNum = userLink.attr("href").split("=");
		userLink.addClass("user_" + userNum[1]);
		userName = userLink.text();

		boardCells.eq(4).addClass('board_moderators').children('a').addClass('user_link');
		
		messageBoardThreadListing.push(
			new MessageBoardListing(boardName, threadNum[0], threadTopic, userName, userNum[1])
		);
	});

	// We collect all of the IMG elements descended from the board status cells,
	// i.e. the "old" and "new" images, then we class the rows as either
	// new_posts or old_posts depending. You could probably do without this,
	// but it only adds about 25 ms to the page handling.
	boardStatusImages = $('.board_status img');
	boardStatusImages.filter("img[src*='new']").each(function() {
		$(this).parent().parent().parent().addClass("new_posts");
	});

	boardStatusImages.filter("img[src*='old']").each(function() {
		$(this).parent().parent().parent().addClass("old_posts");
	});

	return(messageBoardThreadListing);
}

// This function basically does the same as parseMessageBoardList() for a list
// of threads within a section. It does a lot more work, though, since there is
// much richer data to start with and an appalling lack of hooks to use it.
function parseThreadsList() {
	// Which section are we viewing?
	sectionNum = (location.search).match(/section=\d+/)[0].split("=")[1];
	GM_setValue("current_section_id", sectionNum);
	GM_setValue("current_section", document.title.substr(6));
	$(window).unload(function () {
		GM_deleteValue("current_section_id");
		GM_deleteValue("current_section");
	});

	// Again, we identify the TABLE we're interested in and build a new THEAD to
	// separate the column headers from the thread rows.
	//
	// TODO: Replace the header row's TD elements with TH elements.
	threadTable = $('table.inbar').attr('id', 'tww_thread_table');

	threadTableBody = $('#tww_thread_table > tbody').attr('id', 'tww_thread_table_body');

	threadTableHeaderRow = $('#tww_thread_table_body > tr:first-child').attr('id', 'tww_thread_table_header_row');

	threadTableHead = document.createElement('thead');
	threadTableHead.setAttribute('id', 'tww_thread_table_header');
	threadTableBody.before(threadTableHead);

	$('#tww_thread_table_header_row').remove().appendTo($('#tww_thread_table_header'));

	// And again, we add classes to each of the rows we're actually interested
	// in to reflect that they contain thread information.
	threadRows = $('#tww_thread_table_body > tr').addClass('tww_thread_row');

	threadListing = [];

	// Just like with the message boards list, we're going to just break down
	// each cell, take what we need, and build on to the document. This run of
	// code takes the longest to run. :P
	$('.tww_thread_row').each(function() {
		threadRow = $(this);
		threadCells = threadRow.children();
		threadCells.eq(0).addClass('thread_status');
		topicLink = threadCells.eq(1).addClass('thread_topic').children('a:first').addClass('thread_link');
		
		threadNum = topicLink.attr("href").split("=");
		threadTopic = topicLink.text();
		topicLink.parent().parent().attr('id', 'thread_' + threadNum[1]);

		threadCells.eq(2).addClass('thread_author');
		
		authorLink = threadCells.eq(2).children('a:first');
		userNum = authorLink.attr("href").split("=");
		userName = authorLink.text();
		authorLink.parent().parent().addClass("thread_by_" + userNum[1]);

		threadListing.push(new ThreadListing(threadNum[1], threadTopic, userName, userNum[1]));

		threadCells.eq(3).addClass('thread_replies');
		threadCells.eq(4).addClass('thread_views');
		threadCells.eq(5).addClass('thread_last_post').children('a:first').addClass('user_link');
	});

	// See the image handling in parseMessageBoardList() for more.
	threadStatusImages = $('.thread_status img');
	threadStatusImages.filter("img[src*='new']").each(function() {
		$(this).parent().parent().addClass("new_posts");
	});

	threadStatusImages.filter("img[src*='old']").each(function() {
		$(this).parent().parent().addClass("old_posts");
	});

	threadStatusImages.filter("img[src*='lock']").each(function() {
		$(this).parent().parent().addClass("locked");
	});

	return(threadListing);
}

// This function applies descriptive classes to three types of images: smileys,
// photo gallery pics, and all other images. It also protects you somewhat from
// huge images causing horizontal scrolling.
function parseImagesInThread() {
	allThreadImages = $("div.post_message_content img");
	
	allThreadImages.filter("[width=15], [height=15]").addClass('tww_smiley');
	allThreadImages.filter("img[border=0]").addClass('post_image');
	probablyLinkedPhotos = allThreadImages.not('.tww_smiley').not('.post_image').filter('href*=photos').addClass('photo_post_image');

	probablyLinkedPhotos.each(function() {
		linkedPhoto = $(this);
		linkedPhoto.attr("src", linkedPhoto.parent().attr("href"));
		linkedPhoto.parent().replaceWith(linkedPhoto);
	});

	// Here is where we defend against big images. This actually scales the
	// image by your viewport, resolution be damned!
	allThreadImages.css("max-width", parseInt(window.innerWidth * 0.84, 10));
}

/*
 * Scaffolds an individual post.
 */
function scaffoldPost(post) {
	if (debugMode) {
		console.groupCollapsed("Parsing post");
	}

	postBackgroundColor = post.attr("bgcolor");
	postCells = post.children();

	/*
	 * Assign unique IDs to each post row based on the post's own ID, which
	 * comes from its anchor.
	 */
	authorCell = postCells.eq(0);
	authorCell.addClass("post_author_info");
	postAnchor = authorCell.children("a[name]");
	postID = postAnchor.attr("name");

	/*
	 * Build additional links in the poster's cell: "send PM" and "view photos."
	 * TODO: Extend the post count as a link to search for all the users' posts.
	 */
	
	userLink = authorCell.children("a[href*='user_info']");
	userLink.addClass("user_link");
	userID = userLink.attr("href").split("=")[1];
	parentSpan = userLink.parent();
	userName = parentSpan.parent().children().filter("b:first").text();
	userLink.attr("title", userName);
	userLink.data("userid", userID);
	sendPM = createLink("mail_compose.aspx?user=" + userID, "send PM", {
		title: "Send " + userName + " a private message",
		classes: ["pm_link"]
	});

	$(document.createElement("br")).appendTo(parentSpan);
	sendPM.appendTo(parentSpan);

	viewPhotos = createLink("photo_folder.aspx?user=" + userID, "view photos", {
		title: "View " + userName + "'s photo gallery",
		classes: ["photo_gallery_link"]
	});
	viewPhotos.appendTo(parentSpan);

	postContentCell = postCells.eq(1);
	postContent = postContentCell.html();
	postContentCell.empty();
	postContentCell.addClass("post_message");
	postContentCell.prepend('<div id="content_' + postID + '" class="post_message_content content_by_' + userID + '" style="margin-top: -1em;"></div>');
	contentDiv = $("#content_" + postID);
	contentDiv.append(postContent);
	postFooter = contentDiv.children("p.small").remove();
	post.wrap('<tbody id="post_' + postID + '" class="tww_post post_by_' + userID + '"></tbody>');
	postBody = $("tbody#post_" + postID);
	postBody.addClass("post_by_" + userID);
	postBody.append('<tr id="footer_' + postID + '" class="post_footer"><td align="right"><div class="voting_links" style="float: left; display: none;"><a class="plain vote_link" style="font-size: 11px;" id="nsfw_' + postID + '">[nsfw]</a></div></td></tr>');
	postText = contentDiv.text();
	postCells.eq(0).attr("rowspan", "2");

	postFooter.appendTo('#footer_' + postID + ' > td:first-child').parent().css("height", "15px").attr("bgcolor", postBackgroundColor);
	postBody.appendTo("#tww_post_table");

	return(new Post(postID, postText, userName, userID));
}

// Okay, I bet you can't guess what this one does.
function scaffoldThread() {
	GM_deleteValue("current_section_id");
	GM_deleteValue("current_thread_id");
	GM_deleteValue("current_thread_page");

	parameters = JSON.parse(GM_getValue("current_parameters"));
	threadID = parameters["topic"];
	GM_setValue("current_thread_id", threadID); // TODO: Necessary?

	if (parameters["page"] != undefined) {
		GM_setValue("current_thread_page", parameters["page"]);
	} else {
		GM_setValue("current_thread_page", 1);
	}

	tempParams = $('#ctl00_lnkSection').attr('href').match(/section=\d+/);
	sectionID = tempParams[0].split("=")[1];
	GM_setValue("current_section_id", sectionID);

	postTable = $("table.inbar").attr("id", "tww_post_table");
	postTable.parent().parent().parent().parent().attr("id", "tww_post_table_head");
	postRows = $("#tww_post_table > tbody > tr");
	$("#tww_post_table_head > tr > td").eq(1).attr("id", "page_links");

	/*
	 * Parse the thread's topic out of the TITLE element.
	 */
	threadTopic = document.title.substr(6);
	/*
	 * For future sharing.
	metaTitle = $(document.createElement("meta"));
	metaTitle.attr("name", "title");
	metaTitle.attr("content", threadSubject);
	metaDescr = $(document.createElement("meta"));
	metaDescr.attr("name", "description");
	linkImage = $(document.createElement("link"));
	linkImage.attr("rel", "image_src");
	linkImage.attr("href", "images/logo.gif");
	*/
	GM_setValue("current_thread_subject", threadTopic);

	usersInThread = [];
	postsInThread = [];

	// We'll class each post up so the data we want later will be easier to
	// address.
	postRows.each(function() {
		post = scaffoldPost($(this));
		postsInThread.push(post);
		usersInThread.push(post.author); // Blocking is faster with a separate array.
	});

	/*
	 * Again, future sharing.
	threadDescr = $("div.post_message_content:first").text();
	metaDescr.attr("content", threadDescr);

	$("head").append(metaTitle).append(metaDescr).append(linkImage);
	*/

	$("#tww_post_table > tbody:first-child").remove();

	//parseImagesInThread();

	/*
	 * For future voting.
	 *
	$(".vote_link").bind("click", function() {
		voteValues = $(this).attr("id").split("_");
		post = voteValues[1];
		vote = voteValues[0];
		thread = GM_getValue("current_thread_id");
		page = GM_getValue("current_thread_page");
		section = GM_getValue("current_section_id");
		voter = GM_getValue("username");
		$.get('http://lolibrary.org/bww/vote.php', { post: post, vote: vote, thread: thread, voter: voter, section: section, page: page });
	});

	window.addEventListener('keydown', function(e) {
		if (e.keyCode == 86) {
			$('.voting_links').slideToggle('fast');
		}
	}, true);
	*/

	return([postsInThread, filterUniquesInArray(usersInThread)]); // Firefox supports multiple returns.
}

function wolfWebDialog(id, title, content) {
	return('<table id="'
	 + id + 
	 '" class="bar tww_script_dialog" cellspacing="0" cellpadding="3" style="position: absolute; z-index: 50; display: none;"><thead><tr><th style="text-align: left;">' 
	 + title + 
	 '</th></tr></thead><tbody><tr><td><table class="inbar" cellspacing="0" cellpadding="5" style="width: 100%;"><tbody><tr><td><div id="'
	  + id + 
	  '_content">'
	   + content + 
	   '</div></td></tr></tbody></table></td></tr></tbody></table>');
}

function parseUserListPage() {
	$('table.inbar:last').attr("id", "users_list");
	userRows = $('table#users_list tr');
	userRows.each(function() {
		userRow = $(this);
		userLink = userRow.children().eq(1).children();
		userNum = userLink.attr("href").split("=");
		userName = userLink.text();
		postsCell = userRow.children().eq(3);
		if (postsCell.text() != "0 posts") {
			postsCell.wrapInner('<a class="plain search_posts_link" title="Search for ' + userName + '\'s posts" href="message_search.aspx?type=posts&amp;username=' + encodeURI(userName) + "></a>");
		}
	});
}

function parseUserProfile() {
	tempParams = (location.search).match(/user=\d+/);
	userID = tempParams[0].split("=")[1];
	userName = document.title.substr(6);
	currentUser = new User(userName, userID);
	
	userProfileBody = $('#ctl00_tblInfo tbody').attr("id", "user_profile_body");
	userProfileBody.append('<tr><td class="medium" align="center" colspan="2"><a id="block_link" href="#">opa</a></td></tr>');
	userProfileRows = userProfileBody.children();
	userProfileRows.filter(":even").attr("bgcolor", "#E3E3E3");
	userProfileRows.filter(":odd").attr("bgcolor", "");
	return(currentUser);
}

function parsePhotoPage() {
	photoImg = $('img#ctl00_imgPhoto');
	photoTitle = document.title.substr(6);
	photoImg.attr("alt", photoTitle);

	tempParams = (location.search).match(/user=\d+/);
	photoUserID = tempParams[0].split("=")[1];
	photoUsername = $('#ctl00_folderCrumbs').text();
	photoOwner = new User(photoUsername, photoUserID);

	prevLink = $('#ctl00_prevLink').attr('href');
	nextLink = $('#ctl00_nextLink').attr('href');

	if (nextLink) {
		photoImg.bind('click', function(){
			window.location = nextLink;
		});
	}

	$(window).keypress(function(e) {
		switch(e.keyCode) {
			case 37: { if (prevLink) { window.location = prevLink; } return false; }
			case 39: { if (nextLink) { window.location = nextLink; } return false; }
		}
	});
}