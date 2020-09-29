$(document).ready(function() {

	// Paramètre le "publie en tant que..."
	$('#publishAs i').html("anonyme");

	// Knoots floutés et défloutage
	$('body').on('click', '.knoot.blurred .card-footer', function(e) {
		e.preventDefault();
		$(this).parents('.knoot').removeClass('blurred').find('.card-footer.text-muted').remove();
	})

	//
	// Initialisation des hashtags ajoutés et des comptes ajoutés et des knoots ajoutés
	//
	socket.on('toclient.justRestarted', function(){
		setCookie('addedHashtags', JSON.stringify([]));
		setCookie('addedAccounts', JSON.stringify([]));
		setCookie('addedKnoots', JSON.stringify([]));
		setCookie('hasValidatedSecondStep', null);
		setCookie('justAddedHashtags', JSON.stringify([]));
		setCookie('justAddedAccounts', JSON.stringify([]));
    });

	//
	// Récupère les hashtags, les comptes et les knoots de base et ceux ajoutés
	//
	allBlurredHashtags = getAllBlurredHashtags();
	allBlurredAccounts = getAllBlurredAccounts();

	//
	// Initialisation des knoots
	//
	// Paramètre la page d'administration
	$.each(blurredHashtags, function(index, value) {
		$('#blurredHashtags').append(' <span class="badge badge-secondary">#' + value + '</span>');
	})
	$.each(blurredAccounts, function(index, value) {
		$('#blurredAccounts').append(' <span class="badge badge-secondary">@' + value + '</span>');
	})
	// Parcourt les knoots et les ajoute au HTML (avec ou sans flou)
	setAllKnoots();
})




function addOneKnoot(knoot) {
	$('#listKnoots').prepend(createKnoot(knoot));
}


function setAllKnoots() {
	allKnoots = getAllKnoots();

	var knootsHTML = "";
	$.each(allKnoots, function(index, value) {
		knootsHTML += createKnoot(value);
	})
	// Met à jour le HTML avec les knoots
	$('#listKnoots').html(knootsHTML);


	// Création des animations
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
}



function createKnoot(knoot, blurredHashtags, blurredAccounts) {
	// Récupère les comptes et hashtags floutés
	var allBlurredAccounts = getAllBlurredAccounts();
	var allBlurredHashtags = getAllBlurredHashtags();

	var isBlurred;
	isBlurred = false;

	if($.inArray(knoot.pseudo, allBlurredAccounts) !== -1) {
		isBlurred = true;
	}
	else {
		$.each(allBlurredHashtags, function(i, v) {
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
	textHTML += '<div class="card-footer">' + knoot.likes + ' réactions</div>';
	if(isBlurred) {
		textHTML += '<div class="card-footer text-muted">Afficher</div>'
	}
	textHTML += '</div>';
	return textHTML;
}


function getAllBlurredAccounts() {
	var addedAccounts = JSON.parse(getCookie('addedAccounts'));
	var newAccounts = blurredAccounts;
	$.each(addedAccounts, function(index, value) {
		newAccounts.push(value);
	})
	return newAccounts;
}
function getAllBlurredHashtags() {
	var addedHashtags = JSON.parse(getCookie('addedHashtags'));
	var newHashtags = blurredHashtags;
	$.each(addedHashtags, function(index, value) {
		newHashtags.push(value);
	})
	return newHashtags;
}
function getAllKnoots() {
	var addedKnoots = JSON.parse(getCookie('addedKnoots'));
	$.each(knoots, function(index, value) {
		addedKnoots.push(value);
	})
	return addedKnoots;
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