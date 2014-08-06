var TrackFormatParser = {
	convertSMPTEtoSeconds: function(SMPTE) {
		if (typeof SMPTE != 'string')
			return false;

		SMPTE = SMPTE.replace(',', '.');

		var secs = 0,
			decimalLen = (SMPTE.indexOf('.') != -1) ? SMPTE.split('.')[1].length : 0,
			multiplier = 1;

		SMPTE = SMPTE.split(':').reverse();

		for (var i = 0; i < SMPTE.length; i++) {
			multiplier = 1;
			if (i > 0) {
				multiplier = Math.pow(60, i);
			}
			secs += Number(SMPTE[i]) * multiplier;
		}
		return Number(secs.toFixed(decimalLen));
	},
	webvvt: {
		// match start "chapter-" (or anythingelse)
		pattern_identifier: /^([a-zA-z]+-)?[0-9]+$/,
		pattern_timecode: /^([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --\> ([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$/,

		parse: function(trackText) {
			var
			i = 0,
				lines = TrackFormatParser.split2(trackText, /\r?\n/),
				entries = {
					text: [],
					times: []
				},
				timecode,
				text;
			for (; i < lines.length; i++) {
				// check for the line number
				if (this.pattern_identifier.exec(lines[i])) {
					// skip to the next line where the start --> end time code should be
					i++;
					timecode = this.pattern_timecode.exec(lines[i]);

					if (timecode && i < lines.length) {
						i++;
						// grab all the (possibly multi-line) text that follows
						text = lines[i];
						i++;
						while (lines[i] !== '' && i < lines.length) {
							text = text + '\n' + lines[i];
							i++;
						}
						text = $.trim(text).replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");
						// Text is in a different array so I can use .join
						entries.text.push(text);
						entries.times.push({
							start: (TrackFormatParser.convertSMPTEtoSeconds(timecode[1]) == 0) ? 0.200 : TrackFormatParser.convertSMPTEtoSeconds(timecode[1]),
							stop: TrackFormatParser.convertSMPTEtoSeconds(timecode[3]),
							settings: timecode[5]
						});
					}
				}
			}
			return entries;
		}
	},
	// Thanks to Justin Capella: https://github.com/johndyer/mediaelement/pull/420
	dfxp: {
		parse: function(trackText) {
			trackText = $(trackText).filter("tt");
			var
			i = 0,
				container = trackText.children("div").eq(0),
				lines = container.find("p"),
				styleNode = trackText.find("#" + container.attr("style")),
				styles,
				begin,
				end,
				text,
				entries = {
					text: [],
					times: []
				};


			if (styleNode.length) {
				var attributes = styleNode.removeAttr("id").get(0).attributes;
				if (attributes.length) {
					styles = {};
					for (i = 0; i < attributes.length; i++) {
						styles[attributes[i].name.split(":")[1]] = attributes[i].value;
					}
				}
			}

			for (i = 0; i < lines.length; i++) {
				var style;
				var _temp_times = {
					start: null,
					stop: null,
					style: null
				};
				if (lines.eq(i).attr("begin")) _temp_times.start = TrackFormatParser.convertSMPTEtoSeconds(lines.eq(i).attr("begin"));
				if (!_temp_times.start && lines.eq(i - 1).attr("end")) _temp_times.start = TrackFormatParser.convertSMPTEtoSeconds(lines.eq(i - 1).attr("end"));
				if (lines.eq(i).attr("end")) _temp_times.stop = TrackFormatParser.convertSMPTEtoSeconds(lines.eq(i).attr("end"));
				if (!_temp_times.stop && lines.eq(i + 1).attr("begin")) _temp_times.stop = TrackFormatParser.convertSMPTEtoSeconds(lines.eq(i + 1).attr("begin"));
				if (styles) {
					style = "";
					for (var _style in styles) {
						style += _style + ":" + styles[_style] + ";";
					}
				}
				if (style) _temp_times.style = style;
				if (_temp_times.start == 0) _temp_times.start = 0.200;
				entries.times.push(_temp_times);
				text = $.trim(lines.eq(i).html()).replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");
				entries.text.push(text);
				if (entries.times.start == 0) entries.times.start = 2;
			}
			return entries;
		}
	},
	split2: function(text, regex) {
		// normal version for compliant browsers
		// see below for IE fix
		return text.split(regex);
	}
};

// test for browsers with bad String.split method.
if ('x\n\ny'.split(/\n/gi).length != 3) {
	// add super slow IE8 and below version
	TrackFormatParser.split2 = function(text, regex) {
		var
		parts = [],
			chunk = '',
			i;

		for (i = 0; i < text.length; i++) {
			chunk += text.substring(i, i + 1);
			if (regex.test(chunk)) {
				parts.push(chunk.replace(regex, ''));
				chunk = '';
			}
		}
		parts.push(chunk);
		return parts;
	}
}