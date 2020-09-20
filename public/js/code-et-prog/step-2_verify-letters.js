$(document).ready(function() {

	$('.files-list li').on('click', function(e) {
		e.preventDefault();

		// Masque tous les "fichiers" et enlève la classe "active" sur tous les éléments de la liste de gauche
		$('.file').css('display','none');
		$('.files-list li').removeClass('active');

		// Affiche le bon "fichier" et ajoute la classe "active" sur l'élément actif de la liste de gauche
		$('#' + $(this).data('file')).css('display', 'flex');
		$(this).addClass('active');

		// Change le path de la page
		$('.path').html("Editeur de code : C:/wamp/www/" + $(this).html());
	})

	// Clique sur le test du fichier 1
	$('#testerFile1').on('click', function(e) {
		e.preventDefault();
		testFile1($('#inputFile1').val());
	})

	// Clique sur le test du fichier 2
	$('#testerFile2').on('click', function(e) {
		e.preventDefault();
		testFile2($('#inputFile2').val());
	})

function testFile1(charactere) {
	if(charactere.length == 1) {
		if(charactere == "a") {
			alert('Succès ! Vous avez utilisé le bon caractère.');
			alert('Trouvez maintenant le langage associé à ce caractère.');
		}
		else {
			alert('Echec ! Essayez un autre caractère.');
		}
	}
	else {
		alert('Vous devez tester avec un seul caractère.');
	}
}

function testFile2(characteres) {
	for (var i = 0; i < characteres.length; i++) {
		alert('Test du caractère "' + characteres.charAt(i) + '".');
		if(characteres.charAt(i) == "a") {
			alert('Succès ! Vous avez trouvé le bon caractère.');
			alert('Trouvez maintenant le langage associé à ce caractère.');
			i = characteres.length;
		}
	}
}
});