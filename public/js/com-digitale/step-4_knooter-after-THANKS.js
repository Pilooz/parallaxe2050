$(document).ready(function() {
	/*********************************
	**********************************
	**********************************
	**********************************
	**********************************
	**********************************
	* INITIALISATION DU KNOOTER ET DE SON FONCTIONNEMENT NORMAL, HORS ENIGME
	**********************************
	**********************************
	**********************************
	**********************************
	**********************************
	**********************************/

	// Paramètre le "publie en tant que..."
	$('#publishAs i').html("anonyme");

	// Knoots floutés et défloutage
	$('body').on('click', '.knoot.blurred .card-footer', function(e) {
		e.preventDefault();
		$(this).parents('.knoot').removeClass('blurred').find('.card-footer.text-muted').remove();
	})

	// Paramètre la page d'administration
	$.each(blurredHashtags, function(index, value) {
		$('#blurredHashtags').append(' <span class="badge badge-secondary">#' + value + '</span>');
	})
	$.each(blurredAccounts, function(index, value) {
		$('#blurredAccounts').append(' <span class="badge badge-secondary">@' + value + '</span>');
	})

	setAllKnoots();





	/*********************************
	**********************************
	**********************************
	**********************************
	**********************************
	**********************************
	* PUBLICATION D'UNE KNOOT SUR KNOOTER
	**********************************
	**********************************
	**********************************
	**********************************
	**********************************
	**********************************/

	var selectedImage = "";
	// Bouton d'expression
	$('#addKnootButton').on('click', function(e) {
		if(isAdmin) {
			$('#publishAs i').html("Marguerite");
		}
		else {
			$('#publishAs i').html("anonyme");
		}
		$('#writeKnoot').modal('show');
	})

	// Bouton de sélection d'image
	$('#chooseImageButton').on('click', function(e) {
		e.preventDefault();
		$('#chooseImage').modal('show');
	})
	
	// Dates et heures des images
	$('.image-1-creation').html(getGoodFormateDate((new Date()).addDays(-40 + (30*365))));
	$('.image-2-creation').html(getGoodFormateDate((new Date()).addDays(-1 + (30*365))));
	$('.image-3-creation').html(getGoodFormateDate((new Date()).addDays(-1 + (30*365))));
	$('.image-4-creation').html(getGoodFormateDate((new Date()).addDays(-1300 + (30*365))));
	$('.image-4-modification').html(getGoodFormateDate((new Date()).addDays(-1290 + (30*365))));
	$('.image-5-creation').html(getGoodFormateDate((new Date()).addDays(-1180 + (30*365))));

	// Gestion de l'image
	var currentImageLine;
	$('.imageName').on('click', function(e) {
		e.preventDefault();
		currentImageLine = $(this).parents('tr');
		$('#apercu').html('<img src="medias/com-digitale/images/' + $(this).html() + '" title="Aperçu de l\'image ' + currentImageLine.find('.title').html() + '" />');
		$('#chooseImage tr').removeClass('table-active');
		currentImageLine.addClass('table-active');
	})

	// Bouton d'enregistrement de l'image
	$('#chooseImageSaveButton').on('click', function(e) {
		e.preventDefault();
		selectedImage = $('tr.table-active button').html();
		$('#chooseImage').modal('hide');
		$('#formImage label span').html(' : ' + selectedImage + '<br /><span class="badge badge-secondary" id="removeButton">Retirer</span>');
		$('#formImage .row .container-image').addClass('withImage').html('<img src="medias/com-digitale/images/' + selectedImage + '" id="fileKnoot" />');
	})
	$('#chooseImageDismissButton').on('click', function(e) {
		e.preventDefault();
		selectedImage = "";
		$('#chooseImage').modal('hide');
	})

	// Bouton "retirer l'image"
	$('body').on('click', '#removeButton', function(e) {
		e.preventDefault();
		selectedImage = "";
		$('#formImage label span').html("");
		$('#formImage .container-image').html("").removeClass('withImage');
	})


	// Bouton de publication de la knoot
	$('#sendKnoot').on('click', function(e) {
		e.preventDefault();
		if($('#contentKnoot').val() != "" && $('#verificationKnoot').is(':checked')) {
			// Récupère la taille de l'image
			var sizeText = $('tr.table-active .sizeImage').data('size');

			// S'il n'y a pas d'image ou que l'image ne fait pas plus de 100ko
			if(sizeText === undefined || parseFloat(sizeText) <= 100) {

				// Si on publie une knoot avec une image, on affiche le nombre de likes et on set une variable qui permettra de passer à l'étape suivante
				var isTheKnootOKToBeASolution = false;
				if(selectedImage != "") {
					currentLikes = likes;
					isTheKnootOKToBeASolution = true;
				}

				knoots.unshift({ "pseudo": $('#publishAs i').html(), "content": $('#contentKnoot').val(), "image": selectedImage, "likes": Math.round(Math.random() * 10000) });
				setAllKnoots();
				$('#writeKnoot').modal('hide');

				// On réinitialise la modale
				$('#writeKnoot .modal-body .alert').remove();
				$('#contentKnoot').val("");
				$('#removeButton').trigger('click');
				$('#verificationKnoot').prop('checked', false).parent().removeClass('active');
				selectedImage = "";

				// Si c'est une knoot qui permet de valider l'étape, alors on passe au step suivant
				if(isTheKnootOKToBeASolution) {
					setTimeout(function() {
						socket.emit('toserver.nextStep', {nextStep: 'step-5', message: "BRAVO"});
					}, 4000);
				}
			}
		}
	})





	/*********************************
	**********************************
	**********************************
	**********************************
	**********************************
	**********************************
	* ADMIN
	**********************************
	**********************************
	**********************************
	**********************************
	**********************************
	**********************************/
	setAdminInterface();
	var allowedKeys = {
		38: 'up',
		40: 'down',
		65: 'a',
		68: 'd',
		73: 'i',
		77: 'm',
		78: 'n',
		76: 'l',
		79: 'o',
		71: 'g',
		85: 'u',
		84: 't'

	};
	var konamiCodeAdmin = ['up', 'up', 'down', 'down', 'a', 'd', 'm', 'i', 'n'];
	var konamiCodeAdminPosition = 0;
	var konamiCodeLogout = ['up', 'up', 'down', 'down', 'l', 'o', 'g', 'o', 'u', 't'];
	var konamiCodeLogoutPosition = 0;
	document.addEventListener('keydown', function(e) {
		var key = allowedKeys[e.keyCode];

		// Connexion à l'administration
		var requiredKeyAdmin = konamiCodeAdmin[konamiCodeAdminPosition];
		if (key == requiredKeyAdmin) {
			konamiCodeAdminPosition++;
			if (konamiCodeAdminPosition == konamiCodeAdmin.length && !isAdmin) {

				// Ouverture de la modal de connexion
				$('#authenticateAdminModal').modal('show');
				// Clic sur le bouton de connexion
				$('#connectButton').on('click', function(e) {
					e.preventDefault();
					if($('#pseudo').val() == login && $('#password').val() == password) {
						isAdmin = true;
						setAdminInterface();
						$('#pseudo').removeClass('is-invalid');
						$('#password').removeClass('is-invalid');
					}
					else {
						$('.invalid-feedback-for-pseudo').remove();
						$('.invalid-feedback-for-password').remove();

						// Si erreur dans le pseudo
						if($('#pseudo').val() != login) {
							$('#pseudo').addClass('is-invalid').after('<div class="invalid-feedback invalid-feedback-for-pseudo">Ce pseudo n\'est pas enregistré dans notre base de données d\'utilisateur·trice. Merci de vérifier l\'orthographe.</div>');
						} else {
							$('#pseudo').removeClass('is-invalid');
						}
						// Si erreur dans le mot de passe
						if($('#password').val() != login) {
							$('#password').addClass('is-invalid').after('<div class="invalid-feedback invalid-feedback-for-password">Ce mot de passe ne correspond pas au pseudo que vous avez entré. Merci de réessayer avec un autre mot de passe.</div>');
						} else {
							$('#password').removeClass('is-invalid');
						}
					}
				});
				$('#cancelButton').on('click', function(e) {
					$('#authenticateAdminModal').modal('hide');
				})
			}
		} else {
			konamiCodeAdminPosition = 0;
		}

		// Déconnexion de l'administration
		var requiredKeyLogout = konamiCodeLogout[konamiCodeLogoutPosition];
		if (key == requiredKeyLogout) {
			konamiCodeLogoutPosition++;
			if (konamiCodeLogoutPosition == konamiCodeLogout.length && isAdmin) {
				isAdmin = false;
				setAdminInterface();
			}
		} else {
			konamiCodeLogoutPosition = 0;
		}
	});


	// Ouverture de l'interface d'administration
	$('#openAdministrationInterface').on('click', function(e) {
		e.preventDefault();
		$('#administrationInterface').modal('show');
	})

	// Typing dans les hashtags / les comptes à flouter
	$('#hashtagToBlur').on('keyup', function(e) {
		$('#hashtagToBlurHelp .badge').html('#' + $('#hashtagToBlur').val());
	})
	$('#accountToBlur').on('keyup', function(e) {
		$('#accountToBlurHelp .badge').html('@' + $('#accountToBlur').val());
	})
	var hasBlurredHashtag = false;
	var tempBlurredHashtags = [];
	$('#hashtagButton').on('click', function(e) {
		e.preventDefault();
		var textHashtag = $('#hashtagToBlur').val();
		$('#blurredHashtags').append(' <span class="badge badge-secondary">#' + textHashtag + '</span>');
		$('#hashtagToBlur').val("");
		$('#hashtagToBlurHelp .badge').html('#');
		tempBlurredHashtags.push(textHashtag);
	})
	var tempBlurredAccounts = [];
	$('#accountButton').on('click', function(e) {
		e.preventDefault();
		var textAccount = $('#accountToBlur').val();
		$('#blurredAccounts').append(' <span class="badge badge-secondary">@' + textAccount + '</span>');
		$('#accountToBlur').val("");
		$('#accountToBlurHelp .badge').html('@');
		tempBlurredAccounts.push(textAccount);
	})
	// Bouton d'enregistrement des informations sur la page d'administration
	$('#administrationInterfaceSaveButton').on('click', function(e) {
		$.each(tempBlurredHashtags, function(index, textHashtag) {
			blurredHashtags.push(textHashtag);
		});
		tempBlurredHashtags = [];
		$.each(tempBlurredAccounts, function(index, textAccount) {
			blurredAccounts.push(textAccount);
		});
		tempBlurredAccounts = [];

		// Gestion des hashtags floutés
		if(blurredHashtags.indexOf(hashtag) > -1) {
			hasBlurredHashtag = true;
		}

		// Ferme la popup
		$('#administrationInterface').modal('hide');

		// Met à jour les knoots
		setAllKnoots();

		// Vérifie si le hashtag des bots a bien été ajouté aux hashtags floutés
		if(hasBlurredHashtag) {
			setTimeout(function() {
				socket.emit('toserver.nextStep', {nextStep: 'step-3', message: "THANKS"});
			}, 4000);
		}
	})
})



function setAllKnoots() {
	var knootsHTML = "";
	$.each(knoots, function(index, value) {
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


function createKnoot(knoot) {

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
	textHTML += '<div class="card-footer">' + knoot.likes + ' réactions</div>';
	if(isBlurred) {
		textHTML += '<div class="card-footer text-muted">Afficher</div>'
	}
	textHTML += '</div>';
	return textHTML;
}




// Fonction pour ajouter un jour
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

// Fonction pour avoir une date au bon format
function getGoodFormateDate(date) {
	var twoDigitMonth = (date.getMonth() + 1) + "";
	if(twoDigitMonth.length == 1) {
		twoDigitMonth = "0" + twoDigitMonth;
	}
	var twoDigitDate = date.getDate() + "";
	if(twoDigitDate.length == 1) {
		twoDigitDate = "0" + twoDigitDate;
	}
	return twoDigitDate + "/" + twoDigitMonth + "/" + date.getFullYear();
}



// Fonction pour afficher ou non l'interface d'administration
function setAdminInterface() {
	// Re-initialise les champs de la modal
	$('#pseudo').val("");
	$('#password').val("");

	// Gère la vue : affiche ou non la modale et la barre d'administration en haut.
	if(isAdmin) {
		$('#authenticateAdminModal').modal('hide');
		$('body').addClass('admin');
	}
	else {
		$('body').removeClass('admin');
	}
}