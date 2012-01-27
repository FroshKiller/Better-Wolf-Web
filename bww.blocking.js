/*
 * Adds a "Block this user" or "Unblock this user" link to a user's profile
 * page. The user parameter is a User object.
 */
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

/*
 * This function combs the scaffolded message boards list (message.aspx) and
 * obscures the names of blocked users as "a blocked user." God forbid you
 * accidentally see a blocked user's name. You can hover over the link if
 * you want to see which user it is.
 */
function blockUsersInBoardList() {
	blockedUsers = getBlockedUsers();
	if (blockedUsers) {
		blockedUsers.forEach(function(value, index, array) {
			/*
			 * TODO: Maybe I should change this up a bit. Instead of setting
			 * the user profile link's title to the username, I could change
			 * the text from "a blocked user" to the username on hover and
			 * switch it back when the element loses hover focus.
			 */
			$('.user_' + value.userid).addClass("blocked_user").attr("title", value.username).text("a blocked user");
		});
	}
}

/*
 * Checks the current thread for posts by blocked users and hides the posts.
 */
function blockUsersInThread(usersToBlock) {
	blockedUsers = getBlockedUsers();

	// TODO: Return immediately if there are no blocked users.
	if (blockedUsers) {
		userIDsToBlock = [];
		blockedUserIDs = [];
		
		usersToBlock.forEach(function(value, index, array){
			userIDsToBlock.push(value.userid);
		});
		// TODO: what is this i don't even
		blockedUsers.forEach(function(value, index, array){
			blockedUserIDs.push(value.userid);
		});
		
		userIDsToBlock.forEach(function(value, index, array){
			if (jQuery.inArray(value, blockedUserIDs) != -1) {
				$('.content_by_' + value).each(function() {
					msg = $(this);
					hideMsg(msg);
				});
			}
		});
	}
}

/*
 * Moves all threads created by blocked users on message board indices to a
 * separate DIV at the bottom of the table that can be hidden or shown with
 * a click. 
 */
function blockUsersInThreadsList() {
	blockedUsers = getBlockedUsers();
	if (blockedUsers) {
		// TODO: if (typeOf FroshKiller == "moron") { reinventWheel(); }
		blockedUsers.forEach(function(value, index, array){
			threadsToBlock = $('.thread_by_' + value.userid);
			threadsToBlock.addClass("blocked_thread");
			$('a.user_link[href$="' + value.userid + '"]').attr("title", value.username).text("a blocked user");
		});

		if ($('.blocked_thread').size() > 0) { // TODO: No wonder this is slow.
			blockedThreadsBody = $(document.createElement('tbody'));
			blockedThreadsBody.attr("id", "blocked_threads").appendTo('#tww_thread_table').hide();
			
			threadTableFoot = $(document.createElement('tfoot'));
			threadTableFoot.attr("id", "tww_thread_table_footer");
			threadTableFootRow = $(document.createElement('tr')).appendTo(threadTableFoot).css("background-color", "#FFAAAA"); // TODO: Use user preference for highlight color?
			threadTableFootCell = $(document.createElement('td')).appendTo(threadTableFootRow).attr("colspan", "6").attr("align", "center");
			blockedThreadsLink = $(document.createElement('a')).attr("id", "show_blocked_threads_link").attr("href", "#").addClass("plain");
			blockedThreadsLink.appendTo(threadTableFootCell);
			blockedThreadsLink.text("Show blocked threads");
			threadTableBody.before(threadTableFoot);
			
			$('#show_blocked_threads_link').bind("click", function(){
				if ($('#show_blocked_threads_link').text() == "Show blocked threads") { // TODO: Test blockThreadsBody's visibility, not this link text. Jesus.
					$('#show_blocked_threads_link').text("Hide blocked threads");
				}
				else {
					$('#show_blocked_threads_link').text("Show blocked threads");
				}

				blockedThreadsBody.toggle();
				return false;
			});
			
			$('.blocked_thread').remove().appendTo('#blocked_threads');
		}
		
		$('.tww_thread_row').filter(":even").attr("bgcolor", "#E3E3E3"); // TODO: User preference for highlight color?
		$('.tww_thread_row').filter(":odd").attr("bgcolor", "");
	}
}

/*
 * Parses a JSON string of blocked users to an associative array, sorts it,
 * and returns it.
 */
function getBlockedUsers() {
	blockedUsers = GM_getValue("blocked_users", JSON.stringify(null));
	blockedUsers = JSON.parse(blockedUsers);

	// TODO: Dear God, why? Who can even read this?
	if ((blockedUsers != null) && blockedUsers.length > 0) {
		return blockedUsers.sort(function(a, b){
			usernameA = a.username.toLowerCase();
			usernameB = b.username.toLowerCase();
			if (usernameA < usernameB) {
				return -1;
			}
			else 
				if (usernameA > usernameB) {
					return 1;
				}
				else {
					return 0;
				}
		});
	} else {
		return false;
	}
}

/*
 * Hides a post made by a blocked user.
 */
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


/*
 * Appends a list of blocked users to the target element.
 */
function renderBlockedUsers(target) {
	blockedUsers = getBlockedUsers();
	$(target).empty();
	if (blockedUsers) {
		blockedUsers.forEach(function(value, index, array){
			blockedUser = new User(value.username, value.userid);
			$(target).append(blockedUser.userLink());
			$(target).append("<br>");
		});
	} else {
		$(target).append("<p>No blocked users found.</p>");
	}
}

/*
 * Toggles whether you're blocking the user given as the parameter. Note that
 * the user parameter is a User object. I don't know why I'm trying to half-
 * ass OOP when the job is procedural.
 */
function toggleUserOnBlockList(user){
	blockedUsers = getBlockedUsers();
	blockedUserIDs = [];
	
	if (blockedUsers) {
		/*
		 * TODO: This is really stupid. I think that every time you see content
		 * from a user that you might want to block, the username is a link to
		 * the user's profile, so why do I even bother making an associative
		 * array when I could use the user ID in the profile link as the key?
		 * Then, I could just test whether blockedUsers[key] is undefined.
		 */
		blockedUsers.forEach(function(value, index, array){
			blockedUserIDs.push(value.userid);
		});
		
		// The stupidity continues.
		userInBlockedList = jQuery.inArray(user.userid, blockedUserIDs);
		
		/*
		 * TODO: I don't even remember the point of this. Why the hell am I
		 * testing for -1, and what's going on with that splice?
		 */
		if (userInBlockedList != -1) {
			blockedUsers.splice(userInBlockedList, 1);
			$('#block_link').text("Block this user");
			result = "User removed from block list";
		}
		else {
			blockedUsers.push(user);
			$('#block_link').text("Unblock this user");
			result = "User added to block list";
		}
	}
	else {
		blockedUsers = [];
		blockedUsers.push(user);
		$('#block_link').text("Unblock this user");
		result = "User added to block list";
	}
	GM_setValue("blocked_users", JSON.stringify(blockedUsers));
	
	// TODO: Clearing using the return value in an alert. Stupid.
	return result;
}