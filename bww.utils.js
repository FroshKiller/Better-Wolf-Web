/*
 * Returns an anchor element created with the supplied parameters.
 */
function createLink(href, text, parameters) {
	newLink = $(document.createElement('a'));

	newLink.attr("href", href);
	newLink.text(text);

	/*
	 * If a title has been provided in the parameters array, set it on the an-
	 * chor element. Otherwise, default to the link text.
	 */
	title = (parameters['title'] != undefined) ? parameters['title'] : text;
	newLink.attr("title", title);

	if (parameters['classes'] == undefined) {
		newLink.addClass("plain"); // This is a Wolf Web style.
	} else {
		/*
		 * Apply each class in the classes array passed as part of the pa-
		 * rameters to the link.
		 */
		parameters['classes'].forEach(
			function(element, index, array) {
				newLink.addClass(element);
			}
		);
	}

	if (parameters['attributes'] != undefined) {
		/*
		 * If an associative array of attributes has been passed in the pa-
		 * rameters, apply them to the link. I don't check whether they're
		 * valid for anchors--that's the browser's problem.
		 */
		attributes = parameters['attributes']; // TODO: Unnecessary assignment?
		for (var key in attributes) {
			newLink.attr(key, attributes[key]);
		}
	}

	return newLink;
}

/*
 * Given an array, returns a new array of only the unique members.
 */
function filterUniquesInArray(array) {
	var arrayOfUniques = [];
	var arrayLength = array.length;

	for (var i = 0; i < arrayLength; i++) {
		for (var j = i + 1; j < arrayLength; j++) {
			if (array[i] === array[j])
				j = ++i;
		}

		arrayOfUniques.push(array[i]);
	}

	return arrayOfUniques;
}

/*
 * TODO: Replace this obsolete wrapper with a call to the generic function
 * in the blocking library.
 */
function filterUniqueUsers(users) {
	return filterUniquesInArray(users);
}

/*
 * Parses any URL parameters out of the document's location and stores them
 * in a Greasemonkey value for convenient use in other functions.
 */
function getURLParameters() {
	if (debugMode) {
		console.groupCollapsed("URL parameters");
	}

	var parametersArray = {};

	// A bit hackish.
	if (location.href.indexOf("#") > -1) {
    	location.assign(location.href.replace(/\/?#\//, "/"));
	}

	location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		setting = value.split("#")[0]; // Haaaaaaaaaack.
		parametersArray[key] = setting;
	});

	parameters = JSON.stringify(parametersArray);
	GM_setValue("current_parameters", parameters);

	if (debugMode) {
		console.dir(parametersArray);
		console.groupEnd("URL parameters");
	}
}

/*
 * Replaces IFRAME elements with an anchor that links to the IFRAME's source.
 * TODO: Might be faster done inline while processing posts.
 */
function removeInlineFrames() {
	inlineFrames = $('.post_message_content iframe');
	inlineFrames.each(function(){
		iFrame = $(this);
		iFrameURL = iFrame.attr("src");
		iFrameLink = createLink(iFrameURL, iFrameURL, {target: "new"});
		iFrame.replaceWith(iFrameLink);
	});
}