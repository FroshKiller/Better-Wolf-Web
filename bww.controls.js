/*
 * Builds a pop-up search form and binds it to the Search button on message
 * board pages.
 * 
 * TODO: Replace all this hard-coded HTML with something a bit more modular.
 */
function buildSearchForm() {
	sectionName = "Message Boards";
	sectionID = "";

	if (location.pathname = "message_section.aspx") {
		sectionID = ' <input type="hidden" name="section" value="' + GM_getValue("current_section_id") + '">';
		sectionName = GM_getValue("current_section");
	}

	searchButton = $('a[href*="message_search.aspx"]')[0]; // Only bind to the top Search link.

	searchButton.after('<form id="quick_search" action="message_search.aspx" method="get" style="position: absolute; z-index: 50; right: 4; display: none;">' + sectionID + '<table class="bar" cellspacing="0" cellpadding="3"><tbody><tr><td>Search ' + sectionName + '</td><td align="right"><a href="message_search.aspx">Advanced Search</a></td></tr><tr><td valign="top" colspan="2"><table width="100%" cellspacing="0" cellpadding="5" border="0" class="inbar"><tbody><tr bgcolor="#e3e3e3"><td class="rightbold"><label for="quick_search_searchstring">Keywords:</label> </td><td align="right"><input id="quick_search_searchstring" type="text" size="30" name="searchstring"></td></tr><tr><td><input type="radio" value="topic" name="type" checked>&nbsp;topics&nbsp;<input type="radio" value="posts" name="type">&nbsp;posts&nbsp;</label></td><td align="right"><input type="submit" value="search" class="button"></td></tr><tr bgcolor="#e3e3e3"><td class="rightbold"><label for="quick_search_username">Username:</label> </td><td align="right"><input id="quick_search_username" type="text" size="30" name="username" id="search_username"></td></tr><tr><td colspan="2"><input type="radio" checked name="usertype" value="match">&nbsp;matches&nbsp;<input type="radio" name="usertype" value="like">&nbsp;sounds like</td></tbody></table></td></tr></tbody></table></form>');
	searchButton.bind("click", function() {
		$('#quick_search').slideToggle("fast");
		return false;
	});
}
