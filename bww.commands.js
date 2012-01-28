/*
 * This is a library of Greasemonkey userscript commands.
 */
GM_registerMenuCommand("Clear blocked users list", GM_deleteValue("blocked_users"));

GM_registerMenuCommand("Set watched keywords",
	function() {
		current_keywords = GM_getValue("keywords", "nsfw");
		new_keywords = prompt("Enter a comma-separated list of keywords to watch for and highlight.", current_keywords);

		new_keywords = new_keywords.split(",");

		new_keywords.forEach(function (element, index, array) {
			array[index] = element.trim();
		});
		new_keywords = new_keywords.sort();
		new_keywords = new_keywords.join(", ");

		if (debugMode) {
			console.log("Keywords: " + new_keywords);
		}
		GM_setValue("keywords", new_keywords);
	});

GM_registerMenuCommand("Toggle debug mode",
	function() {
		debugMode = GM_getValue("debug_mode", false);
		debugMode = GM_setValue("debug_mode", !debugMode);

		if (debugMode) {
			alert("Debug mode on");
		} else {
			alert("Debug mode off");
		}

	});