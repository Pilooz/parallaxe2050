$(document).ready(function() {

	var selectedImage = "";

	// Bouton d'expression
	$('#addKnootButton').on('click', function(e) {
		if(getCookie("admin") && getCookie("admin") != "" && getCookie("admin") != null && getCookie('admin') != "null") {
			$('#publishAs i').html(getCookie("admin"));
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

				// Génération d'un nombre aléatoire de likes
				var currentLikes = Math.round(Math.random() * 10000);
				var isLastTweet = false;
				// Si on a passé la 2e étape et qu'on a sélectionné une image, on affiche le nombre de likes qui est la solution
				if(getCookie('hasValidatedSecondStep') && getCookie('hasValidatedSecondStep') != null && getCookie('hasValidatedSecondStep') != "null" && selectedImage != "") {
					currentLikes = likes;
					isLastTweet = true;
				}

				// Création d'un knoot en JSON
				var knootJSON = {
					'pseudo': $('#publishAs i').html(),
					'content': $('#contentKnoot').val(),
					'image': selectedImage,
					'likes': currentLikes
				};

				// On paramètre les cookies
				var addedKnootsInCookies = [knootJSON];
				if(getCookie('addedKnoots') && getCookie('addedKnoots') != "") {
					$.each(JSON.parse(getCookie('addedKnoots')), function(index, value) {
						addedKnootsInCookies.push(value);
					})
				}
				setCookie('addedKnoots', JSON.stringify(addedKnootsInCookies), 60);

				setAllKnoots();

				// On ferme la modale
				$('#writeKnoot').modal('hide');

				// On réinitialise la modale
				$('#writeKnoot .modal-body .alert').remove();
				$('#contentKnoot').val("");
				$('#removeButton').trigger('click');
				$('#verificationKnoot').prop('checked', false).parent().removeClass('active');

				if(isLastTweet) {
					selectedImage = "";
					setCookie('hasValidatedThirdStep', true, 60);
					setTimeout(function() {
						socket.emit('toserver.previousStep', {previousStep: previousStep, message: "BRAVO"});
					}, 4000);
				}
			}
			else {
				$('#writeKnoot .modal-body .alert').remove();
				$('#writeKnoot .modal-body').prepend('<div class="alert alert-danger" role="alert">L\'image est trop lourde, vous ne pouvez pas la publier sur Knooter.</div>');
			}
		}
		else {
			if($('#writeKnoot .modal-body .alert').length == 0) {
				$('#writeKnoot .modal-body').prepend('<div class="alert alert-danger" role="alert">Le texte ne doit pas être vide et la case doit être cochée.</div>');
			}
		}
	})
})







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