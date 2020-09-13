$(document).ready(function() {

	var selectedImage;

	// Bouton d'expression
	$('#writeKnootButton').on('click', function(e) {
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
	$('.image-1-creation').html(getGoodFormateDate((new Date()).addDays(-40)));
	$('.image-2-creation').html(getGoodFormateDate((new Date()).addDays(-1)));
	$('.image-3-creation').html(getGoodFormateDate((new Date()).addDays(-1)));
	$('.image-4-creation').html(getGoodFormateDate((new Date()).addDays(-1300)));
	$('.image-4-modification').html(getGoodFormateDate((new Date()).addDays(-1290)));
	$('.image-5-creation').html(getGoodFormateDate((new Date()).addDays(-1180)));

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

			var sizeText = $('tr.table-active .sizeImage').data('size');
			// TODO : s'assurer que 100 ko c'est ok pour la taille max (et reporter la taille choisie sur les affiches / le carnet)
			if(parseFloat(sizeText) <= 100) {
				var knootJSON = {
					'pseudo': $('#publishAs i').html(),
					'content': $('#contentKnoot').val(),
					'image': selectedImage
				};
				// On paramètre les cookies
				var addedKnootsInCookies = JSON.parse(getCookie('addedKnoots'));
				addedKnootsInCookies.push(knootJSON);
				setCookie('addedKnoots', JSON.stringify(addedKnootsInCookies), 60);

				// On crée le html de la knoot
				addOneKnoot(knootJSON);

				// On ferme la modale
				$('#writeKnoot').modal('hide');

				// On réinitialise la modale
				$('#writeKnoot .modal-body .alert').remove();
				$('#contentKnoot').val("");
				$('#removeButton').trigger('click');
				$('#verificationKnoot').prop('checked', false).parent().removeClass('active');

				if($.inArray(selectedImage, images) && getCookie('hasValidatedSecondStep')) {
					// TODO : lancer l'appel téléphonique de félicitations si la knoot contient une des images
					console.log("Ca y est, vous avez publié un message suffisamment intéressant ! Bravo !");
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