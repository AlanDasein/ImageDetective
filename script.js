$(document).ready(function() {

	var CONSTANTS = {
		LEVELS: ["easy", "medium", "hard", "extreme", "insane", "impossible"],
		TOTAL_IMAGES: 32,
		LEVEL_UP: 75,
		TIME_TO: {
			SWITCH_TABS: 250,
			DISPLAY_COLLAGE: 10,
			COMPLETE_TASK: 30,
			PAUSE: 2500
		}
	};

	var DOM = {
		buttons: $("span.button"),
		tabs: $("div.tab"),
		thumbs: $("#thumbs"),
		pics: $("div.pics"),
		text_label: $("#text-label"),
		counters: $("span.counter")
	};

	var VARS = {
		current_level: CONSTANTS.LEVELS[0],
		images_displayed: CONSTANTS.TOTAL_IMAGES / 2,
		current_pic: CONSTANTS.TOTAL_IMAGES / 2,
		current_step: 0,
		score: 0,
		promedy: 0,
		counter: null,
		timer: null
	};

	var FUNCTIONS = {
		shuffle: function(o) {
			for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			return o;
		},
		get_images: function() {
			FUNCTIONS.shuffle(VARS.pics1);
			VARS.pics2 = VARS.pics1.slice(0);
			FUNCTIONS.shuffle(VARS.pics2);
		},
		switch_tabs: function(i,j) {
			DOM.tabs.eq(i).addClass("hidden");
			DOM.tabs.eq(j).css("opacity", 0).removeClass("hidden").animate({opacity: 1}, 250);
		},
		draw_pics: function (o) {
			for(var i = 0;i < VARS.images_displayed;i++) {
				if(o === 0) $("<div/>", {"class": "thumb", "html": ("<img src='assets/" + VARS.current_level + "/" + VARS.pics1[i] +".jpg'>")}).appendTo(DOM.thumbs);
				else $("<img/>", {"class": "pic", "src": ("assets/" + VARS.current_level + "/" + VARS.pics2[i] +".jpg")}).appendTo(DOM.pics);
			}
		},
		end_game: function() {
			clearInterval(VARS.timer);
			VARS.promedy = VARS.score === 0 ? 0 : Math.round((VARS.score / VARS.images_displayed) * 100);
			if(VARS.promedy < CONSTANTS.LEVEL_UP) aux = "YOU NEED TO SCORE<br>" + CONSTANTS.LEVEL_UP + "% OR HIGHER<br>TO UNLOCK<br>THE NEXT LEVEL";
			else {
				if(VARS.current_level === CONSTANTS.LEVELS[CONSTANTS.LEVELS.length - 1]) aux = "LAST LEVEL COMPLETED!";
				else {
					DOM.levels.eq(CONSTANTS.LEVELS.indexOf(VARS.current_level) + 1).removeClass("disabled");
					aux = "NEXT LEVEL UNLOCKED!";
				}
			}
			$("#score").html(VARS.score);
			$("#total").html(VARS.images_displayed);
			$("#promedy").html(VARS.promedy);
			$("#outcome").html(aux);
			FUNCTIONS.switch_tabs(3, 4);
		}
	};

	(function() { //init app begin (draw levels and store them in the DOM object, create array of first and second pics)
		var container = $("#level-group");
		for(var i = 0;i < CONSTANTS.LEVELS.length;i++) {
			$("<div/>", {"class": ("level " + (i === 0 ? "checked" : "disabled")), "html": CONSTANTS.LEVELS[i]}).appendTo(container);
		}
		DOM.levels = container.find("div.level");
		VARS.pics1 = [];
		for(var i = 0;i < CONSTANTS.TOTAL_IMAGES;i++) VARS.pics1[i] = (i + 1);
		FUNCTIONS.get_images();
	})(); //init app end

	DOM.levels.on("click", function() {
		var aux = DOM.levels.filter(function() {return !$(this).hasClass("disabled")});
		if(!$(this).hasClass("disabled") && !$(this).hasClass("checked") && aux.length > 1) {
			DOM.levels.each(function() {$(this).removeClass("checked");});
			$(this).addClass("checked");
			VARS.current_level = $(this).html();
		}
	});

	DOM.buttons.on("click", function() {

		var command = $(this).html().toLowerCase(), aux;

		if(command === "start") {

			DOM.text_label.html("LOADING IMAGES");

			DOM.tabs.eq(0).animate({opacity: 0}, CONSTANTS.TIME_TO.SWITCH_TABS, function() {FUNCTIONS.switch_tabs(0, 1);}); //show loading image tab (second)
			
			setTimeout(function() { //show images collage begin (third tab after a few seconds loading images)

				DOM.tabs.eq(1).animate({opacity: 0}, CONSTANTS.TIME_TO.SWITCH_TABS, function() {

					FUNCTIONS.draw_pics(0);

					VARS.counter = CONSTANTS.TIME_TO.DISPLAY_COLLAGE;
					DOM.counters.eq(0).html(VARS.counter < 10 ? "0" + VARS.counter : VARS.counter);

					FUNCTIONS.switch_tabs(1, 2); //it's showed up exactly here

					VARS.timer = setInterval(function() { //show collage for a while (DISPLAY_COLLAGE of seconds)
						VARS.counter--;
						if(VARS.counter === 0) { //hide collage to start the game
							if(VARS.current_step === 0) { //make a pause for a few seconds
								DOM.text_label.html("OK HERE WE GO!");
								FUNCTIONS.switch_tabs(2, 1);
								VARS.counter = CONSTANTS.TIME_TO.COMPLETE_TASK + 2;
								VARS.current_step++;
								FUNCTIONS.draw_pics(1);
								setTimeout(function() {FUNCTIONS.switch_tabs(1, 3);}, CONSTANTS.TIME_TO.PAUSE);
							}
							else FUNCTIONS.end_game();
						}
						else DOM.counters.eq(VARS.current_step).html(VARS.counter < 10 ? "0" + VARS.counter : VARS.counter);
					}, 1000);

				});

			}, CONSTANTS.TIME_TO.PAUSE); //show images collage end 

		}
		else {

			if(command === "back") { //reset app
				VARS.counter = 0;
				VARS.score = 0;
				VARS.current_step = 0;
				VARS.current_pic = VARS.images_displayed;
				DOM.thumbs.html("");
				DOM.pics.html("");
				FUNCTIONS.get_images();
				FUNCTIONS.switch_tabs(4, 0);
			}
			else { //nup-yes buttons
				VARS.current_pic--;
				var extra1, extra2;
				aux = command === "yes" ? 1 : 0;
				extra1 = VARS.pics1.indexOf(VARS.pics2[VARS.current_pic]);
				extra2 = $("img.pic").eq(VARS.current_pic);
				if((aux && extra1 < VARS.images_displayed) || (!aux && extra1 >= VARS.images_displayed)) VARS.score++;
				if(VARS.current_pic === 0) FUNCTIONS.end_game();
				else extra2.addClass("dismiss");
			}

		}
	});

});