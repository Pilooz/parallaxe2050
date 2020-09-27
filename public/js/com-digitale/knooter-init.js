$(document).ready(function() {

	// 
	// Scroll en haut
	// 
	$(window).scrollTop(0);


	// TODO : faire en sorte que Knooter soit initialisé lorsqu'une team badge
	initKnooterForNewTeam();

	setInitKnoots();
	initKnooter();

	//
	// Knoots floutés et événements
	//
	$('body').on('click', '.knoot.blurred .card-footer', function(e) {
		e.preventDefault();
		$(this).parents('.knoot').removeClass('blurred').find('.card-footer').remove();
	})


	//
	// Animation
	//
	// Contrôleur de l'animation
    var controller = new ScrollMagic.Controller({
        globalSceneOptions: {
            triggerHook: "onLeave"
        }
    });

    var startpin = new ScrollMagic.Scene({
            duration: 10000
        })
        .setPin("#listKnoots")
        .addTo(controller);

	// Animations
	var animatedElement;

    // Affichage jusqu'à une opacité de 1 et un scale de 1
    for (var i = 0; i < 40; i++) {
    	if(i == 0) {
    		animatedElementSelector = "#listKnoots .knoot:first-child";
    	}
    	else {
    		animatedElementSelector = "#listKnoots .knoot:nth-child(40n+" + (i+1) + ")";
    	}
    	if($(animatedElementSelector).length > 0) {
	    	new ScrollMagic.Scene({
	            duration: 300 * i,
	            offset: 0
	        })
	        .setTween(new TimelineMax({repeat: 0, yoyo: false})
		        .add(TweenMax.to(animatedElementSelector, 0.3, {transform: "scale(" + ((1 - 0.04*i) < 0 ? 0 : (1 - 0.04*i)) + ")", opacity: ((1 - 0.08*i) < 0 ? 0 : (1 - 0.08*i)) }))
		        .add(TweenMax.to(animatedElementSelector, 0.3, {transform: "scale(1)", opacity: "1"})))
	        .addTo(controller);
	    }
    }

	for (var i = 0; i < 40; i++) {
    	if(i == 0) {
    		animatedElementSelector = "#listKnoots .knoot:first-child";
    	}
    	else {
    		animatedElementSelector = "#listKnoots .knoot:nth-child(40n+" + (i+1) + ")";
    	}
    	if($(animatedElementSelector).length > 0) {
		    new ScrollMagic.Scene({
	            duration: 300,
	            offset: (i * 300)
	        })
	        .setTween(new TimelineMax({repeat: 0, yoyo: false})
		        .add(TweenMax.to(animatedElementSelector, 0.3, {transform: "scale(1)", opacity: "1"}))
		        .add(TweenMax.to(animatedElementSelector, 0.3, {transform: "scale(1.2)", opacity: "0.5"}))
		        .add(TweenMax.to(animatedElementSelector, 0.3, {transform: "scale(1.5)", opacity: "0", pointerEvents: "none" })))
	        .addTo(controller);
	    }
	};
})

// Fonction pour initialiser Knooter dès qu'il y a une nouvelle team qui badge
function initKnooterForNewTeam() {
	// TODO : paramétrer la durée max des cookies en fonction du type de jeu
	var maxCookieDuration = 9;
	// Initialise les hashtags et comptes floutés
	setCookie('blurredHashtags', JSON.stringify(blurredHashtags), maxCookieDuration);
	setCookie('blurredAccounts', JSON.stringify(blurredAccounts), maxCookieDuration);

	// Initialise le cookie des knoots ajoutés
	setCookie('addedKnoots', JSON.stringify([]), 60);
}

// Fonction pour initialiser les knoots lorsqu'il y a un nouveau groupe
function setInitKnoots() {

	// Parcourt les knoots et les ajoute au HTML (avec ou sans flou)
	var knootsHTML = "";
	$.each(knoots, function(index, value) {
		knootsHTML += createKnoot(value);
	})

	// Met à jour le HTML avec les knoots
	$('#listKnoots').html(knootsHTML);
}








// Fonction pour initialiser la page knooter
function initKnooter() {

	// Paramètre la page d'administration
	$.each(blurredHashtags, function(index, value) {
		$('#blurredHashtags').append(' <span class="badge badge-secondary">#' + value + '</span>');
	})
	$.each(blurredAccounts, function(index, value) {
		$('#blurredAccounts').append(' <span class="badge badge-secondary">@' + value + '</span>');
	})

	// Paramètre le "publie en tant que..."
	$('#publishAs i').html("anonyme");

	// Met à jour les knoots
	setKnoots();
}


function setKnoots() {
	var addedKnootsInCookies = JSON.parse(getCookie('addedKnoots'));

	$.each(addedKnootsInCookies, function(index, value) {
		addOneKnoot(value);
	})
}

function addOneKnoot(knoot) {
	$('#listKnoots').prepend(createKnoot(knoot));
}

function createKnoot(knoot) {
	// Récupère les comptes et hashtags floutés
	var blurredAccounts = JSON.parse(getCookie('blurredAccounts'));
	var blurredHashtags = JSON.parse(getCookie('blurredHashtags'));

	var isBlurred;
	isBlurred = false;

	if($.inArray(knoot.pseudo, blurredAccounts) !== -1) {
		isBlurred = true;
	}
	else {
		$.each(blurredHashtags, function(i, v) {
			if((knoot.content).indexOf("#" + v) >= 0) {
				isBlurred = true;
			}
		})
	}
	var imageHTML = "";
	if(knoot.image) {
		imageHTML = '<img class="card-img-top" src="medias/com-digitale/images/' + knoot.image + '" title="Image illustrative du knoot de ' + knoot.pseudo + '" />';
	}
	var textHTML = '<div class="card mb-4 knoot' + (isBlurred ? " blurred": "") + '">';
	textHTML += '<div class="h-100">' + imageHTML + '</div>';
	textHTML += '<div class="card-body">';
	textHTML += '<h5 class="card-title">' + knoot.pseudo + '</h5>';
	textHTML += '<p class="card-text">' + knoot.content + '</p></div>';
	if(isBlurred) {
		textHTML += '<div class="card-footer text-muted">Afficher</div>'
	}
	textHTML += '</div>';
	return textHTML;
}





// Fonction pour paramétrer un cookie
function setCookie(cname, cvalue, min) {
  var d = new Date();
  d.setTime(d.getTime() + (min*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Fonction pour récupérer un cookie
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}