/*
 * Disables autostart on all EMBED elements. 
 */
function disableAutostart() {
	$('embed').attr("autostart", "false");
}

/*
 * Replaces a link to a YouTube video with an EMBED element.
 */
function embedYouTubeLink(link) {
	youTubeLink = $(link);
	videoID = youTubeLink.attr('href').replace(/^[^v]+v.(.{11}).*/, '$1');

	/* 
 	* TODO: This is a truly ugly method of replacing the link with an embedded
 	* object. I should probably create a function that intelligently parses
 	* the most common audio and video links into a nice, clean OBJECT.
	*/
	youTubeLink.replaceWith('<object class="youtube_video" width="445" height="364"><param name="movie" value="http://www.youtube.com/v/' + videoID + '&hl=en&fs=1&color1=0xdd0000&color2=0x660000&border=1"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/' + videoID + '&hl=en&fs=1&color1=0xdd0000&color2=0x660000&border=1" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="445" height="364"></embed></object>');
}

function applyMediaEnhancements() {
	messageLinks = $('div.post_message_content a');
	messageLinks.filter('a[href*=.mp3]').each(function() {
		mp3Link = $(this);
		mp3LinkURL = mp3Link.attr("href");
		mp3Link.replaceWith('<embed class="mp3_player" type="application/x-shockwave-flash" src="http://www.google.com/reader/ui/3247397568-audio-player.swf?audioUrl=' + mp3LinkURL + '" width="400" height="27" allowscriptaccess="never" quality="best" bgcolor="#ffffff" wmode="window" flashvars="playerMode=embedded"><br><a href="' + mp3LinkURL + '" class="plain mp3_link" title="Download this MP3">Download this MP3</a>');
	});
}