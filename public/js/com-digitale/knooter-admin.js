$(document).ready(function() {

	// 
	// Konamicode pour afficher la modale de connexion
	// 
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
		var requiredKeyAdmin = konamiCodeAdmin[konamiCodeAdminPosition];
		if (key == requiredKeyAdmin) {
			konamiCodeAdminPosition++;
			if (konamiCodeAdminPosition == konamiCodeAdmin.length && (!getCookie("admin") || getCookie("admin") == "" || getCookie("admin") == null || getCookie('admin') == "null")) {
				openAdministrationConnexionModal();
				konamiCodeAdminPosition = 0;
			}
		} else {
			konamiCodeAdminPosition = 0;
		}
		var requiredKeyLogout = konamiCodeLogout[konamiCodeLogoutPosition];
		if (key == requiredKeyLogout) {
			konamiCodeLogoutPosition++;
			if (getCookie('hasValidatedThirdStep') && konamiCodeLogoutPosition == konamiCodeLogout.length && getCookie("admin") && getCookie("admin") != "" && getCookie("admin") != null && getCookie('admin') != "null") {
				setCookie("admin", null);
				socket.emit('toserver.nextStep', {nextStep: nextStep});
			}
		} else {
			konamiCodeLogoutPosition = 0;
		}
	});



	//
	// Affichage ou non du bandeau d'administration
	//
	setAdminInterface();


	// Ouverture de l'interface d'administration
	$('#openAdministrationInterface').on('click', function(e) {
		e.preventDefault();
		$('#administrationInterface').modal('show');
		setCookie('justAddedHashtags', JSON.stringify([]));
		setCookie('justAddedAccounts', JSON.stringify([]));
	})

	// Typing dans les hashtags / les comptes à flouter
	$('#hashtagToBlur').on('keyup', function(e) {
		$('#hashtagToBlurHelp .badge').html('#' + $('#hashtagToBlur').val());
	})
	$('#accountToBlur').on('keyup', function(e) {
		$('#accountToBlurHelp .badge').html('@' + $('#accountToBlur').val());
	})

	// Bouton d'ajout des hashtags / des comptes
	var justAddedBlurredHashtags;
	var justAddedBlurredAccounts;
	$('#hashtagButton').on('click', function(e) {
		e.preventDefault();
		var textHashtag = $('#hashtagToBlur').val();
		$('#blurredHashtags').append(' <span class="badge badge-secondary">#' + textHashtag + '</span>');
		$('#hashtagToBlur').val("");
		$('#hashtagToBlurHelp .badge').html('#');
		justAddedBlurredHashtags = JSON.parse(getCookie('justAddedHashtags'));
		justAddedBlurredHashtags.push(textHashtag);
		setCookie('justAddedHashtags', JSON.stringify(justAddedBlurredHashtags));
	})
	$('#accountButton').on('click', function(e) {
		e.preventDefault();
		var textAccount = $('#accountToBlur').val();
		$('#blurredAccounts').append(' <span class="badge badge-secondary">@' + textAccount + '</span>');
		$('#accountToBlur').val("");
		$('#accountToBlurHelp .badge').html('@');
		justAddedBlurredAccounts = JSON.parse(getCookie('justAddedAccounts'));
		justAddedBlurredAccounts.push(textAccount);
		setCookie('justAddedAccounts', JSON.stringify(justAddedBlurredAccounts));
	})

	var addedBlurredHashtags;
	var addedBlurredAccounts;
	var hasBlurredHashtag = false;
	// Bouton d'enregistrement des informations sur la page d'administration
	$('#administrationInterfaceSaveButton').on('click', function(e) {
		// Gestion des hashtags floutés
		justAddedBlurredHashtags = JSON.parse(getCookie('justAddedHashtags'));
		addedBlurredHashtags = JSON.parse(getCookie('addedHashtags'));
		$.each(justAddedBlurredHashtags, function(index, value) {
			addedBlurredHashtags.push(value);
			if(value == 'restezchezvous') {
				hasBlurredHashtag = true;
			}
		})
		setCookie('addedHashtags', JSON.stringify(addedBlurredHashtags));

		// Gestion des comptes floutés
		justAddedBlurredAccounts = JSON.parse(getCookie('justAddedAccounts'));
		addedBlurredAccounts = JSON.parse(getCookie('addedAccounts'));
		$.each(justAddedBlurredAccounts, function(index, value) {
			addedBlurredAccounts.push(value);
		})
		setCookie('addedAccounts', JSON.stringify(addedBlurredAccounts));


		// Ferme la popup
		$('#administrationInterface').modal('hide');

		// Met à jour les knoots
		setKnoots();

		// Vérifie si le hashtag des bots a bien été ajouté aux hashtags floutés
		if(hasBlurredHashtag) {
			setCookie('hasValidatedSecondStep', true, 60);
			setTimeout(function() {
				socket.emit('toserver.previousStep', {previousStep: previousStep});
			}, 4000);
		}
	})
})

// Fonction pour ouvrir la modal de connexion à l'administration
function openAdministrationConnexionModal() {
	$('#authenticateAdminModal').modal('show');

	$('#connectButton').on('click', function(e) {
		e.preventDefault();
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

// Fonction pour afficher ou non l'interface d'administration
function setAdminInterface() {
	if(getCookie("admin") && getCookie("admin") != "" && getCookie("admin") != null && getCookie('admin') != "null") {
		$('body').addClass('admin');
	}
	else {
		$('body').removeClass('admin');
	}
}