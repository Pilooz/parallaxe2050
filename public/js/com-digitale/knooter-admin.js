$(document).ready(function() {
	// Détermine si on est sur la page admin ou non
	if(getUrlParameter("url") == "admin") {
		setAdminInterface();
	}
	else {
		setCookie("admin", null, 10000000);
	}

	// 
	// a key map of allowed keys
	var allowedKeys = {
		38: 'up',
		40: 'down',
		65: 'a',
		68: 'd',
		73: 'i',
		77: 'm',
		78: 'n'
	};

	// the 'official' Konami Code sequence
	var konamiCode = ['up', 'up', 'down', 'down', 'a', 'd', 'm', 'i', 'n'];

	// a variable to remember the 'position' the user has reached so far.
	var konamiCodePosition = 0;

	// add keydown event listener
	document.addEventListener('keydown', function(e) {
		// get the value of the key code from the key map
		var key = allowedKeys[e.keyCode];
		// get the value of the required key from the konami code
		var requiredKey = konamiCode[konamiCodePosition];

		// compare the key with the required key
		if (key == requiredKey) {

			// move to the next key in the konami code sequence
			konamiCodePosition++;

			// if the last key is reached, activate cheats
			if (konamiCodePosition == konamiCode.length) {
				setAdminInterface();
				konamiCodePosition = 0;
			}
		} else {
			konamiCodePosition = 0;
		}
	});


	function setAdminInterface() {
		if(getCookie("admin") && getCookie("admin") != "" && getCookie("admin") != null && getCookie('admin') != "null") {
			$('body').addClass('admin');
		}
		else {
			$('#authenticateAdminModal').modal('show');

			$('#connectButton').on('click', function(e) {
				e.preventDefault();
				// TODO : se mettre d'accord sur les identifiants inscrits dans le carnet / sur les affiches
				if($('#pseudo').val() == "marguerite" && $('#password').val() == "KN0 t€r") {
					setCookie('admin', $('#pseudo').val(), 5);
					$('#authenticateAdminModal').modal('hide');
					$('body').addClass('admin');
				}
			});
			$('#cancelButton').on('click', function(e) {
				$('#authenticateAdminModal').modal('hide');
			})
		}
	}


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

	// Bouton d'ajout des hashtags / des comptes
	$('#hashtagButton').on('click', function(e) {
		e.preventDefault();
		$('#blurredHashtags').append(' <span class="badge badge-secondary">#' + $('#hashtagToBlur').val() + '</span>');
		$('#hashtagToBlur').val("");
		$('#hashtagToBlurHelp .badge').html('#');
	})
	$('#accountButton').on('click', function(e) {
		e.preventDefault();
		$('#blurredAccounts').append(' <span class="badge badge-secondary">@' + $('#accountToBlur').val() + '</span>');
		$('#accountToBlur').val("");
		$('#accountToBlurHelp .badge').html('@');
	})

	var hasBlurredHashtag = false;
	// Bouton d'enregistrement des informations sur la page d'administration
	$('#administrationInterfaceSaveButton').on('click', function(e) {
		// Gestion des hashtags floutés
		var hashtagsArray = [];
		$('#blurredHashtags span').each(function(index) {
			hashtagsArray.push(($(this).html()).replace('#', ''));
			if($.inArray(($(this).html()).replace('#', ''), hashtags)) {
				hasBlurredHashtag = true;
			}
		})
		var hashtagsJson = JSON.stringify(hashtagsArray);
		setCookie('blurredHashtags', hashtagsJson, 9);
		// Gestion des comptes floutés
		var accountsArray = [];
		$('#blurredAccounts span').each(function(index) {
			accountsArray.push(($(this).html()).replace('@', ''));
		})
		var accountsJson = JSON.stringify(accountsArray);
		setCookie('blurredAccounts', accountsJson, 9);

		// Ferme la popup
		$('#administrationInterface').modal('hide');

		// Met à jour les knoots
		setKnoots();

		// Vérifie si le hashtag des bots a bien été ajouté aux hashtags floutés
		if(hasBlurredHashtag) {
			setCookie('hasValidatedSecondStep', true, 60);
			// TODO : lancer l'appel du téléphone qui félicite les élèves d'avoir réussi à banni le bon hashtag
			console.log('Bravo, vous avez réussi à blurrer le hashtag non-voulu !');
		}
	})
})



// Fonction pour récupérer un paramètre de l'URL
function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1),
	    sURLVariables = sPageURL.split('&'),
	    sParameterName,
	    i;

	for (i = 0; i < sURLVariables.length; i++) {
	    sParameterName = sURLVariables[i].split('=');

	    if (sParameterName[0] === sParam) {
	        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
	    }
	}
};