function resetActivity() {
	console.log("Réinitialisation de l'activité.");
	// Réinitialisation des select
	$('select').val('reset');

	// Réinitialisation de la checkbox
	$('input[type=checkbox]').attr('checked', 'checked');
	$('input[type=checkbox]').parent().addClass('active');

	// Cache les containers des graphiques
	$('.container-graphique').css('display', 'none');

	// Cache les graphiques
	$('canvas').css('display', 'none');
}

function fillTableWithServersDatas(serveurs) {
	if(serveurs.length > 0) {
		var lignes = "";
		var i;
		for (var j = 0; j < 100; j++) {
			for (i = serveurs.length - 1; i >= 0; i--) {
				if(serveurs[i]['id'] != "") {
					lignes += "<tr>";
						lignes += "<td>" + serveurs[i]['id'] + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['est_sain'] != undefined ? serveurs[i]['params']['est_sain'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['date_construction'] != undefined ? serveurs[i]['params']['date_construction'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['commentaire'] != undefined ? serveurs[i]['params']['commentaire'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['lat'] != undefined ? serveurs[i]['params']['lat'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['lng'] != undefined ? serveurs[i]['params']['lng'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['pays'] != undefined ? serveurs[i]['params']['pays'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['zone'] != undefined ? serveurs[i]['params']['zone'] : "") + "</td>";

						lignes += "<td>" + (serveurs[i]['params']['h1'] != undefined ? serveurs[i]['params']['h1'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['h2'] != undefined ? serveurs[i]['params']['h2'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['h3'] != undefined ? serveurs[i]['params']['h3'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['h4'] != undefined ? serveurs[i]['params']['h4'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['h5'] != undefined ? serveurs[i]['params']['h5'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['h6'] != undefined ? serveurs[i]['params']['h6'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['h7'] != undefined ? serveurs[i]['params']['h7'] : "") + "</td>";
						lignes += "<td>" + (serveurs[i]['params']['h8'] != undefined ? serveurs[i]['params']['h8'] : "") + "</td>";
					lignes += "</tr>";
				}
			};
		};
		$('table tbody').prepend(lignes);
		$('table tbody tr.loading').remove();
	}
	else {
		$("tbody tr td").html("Aucun serveur.");
	}
}


function selectGraphique() {
	// Cache tous les containers des graphiques
	$('.container-graphique').css('display', 'none');
	// Affiche le container du graphique sélectionné dans la liste déroulante
	$('#container-' + $('select#graphique-select').val()).css('display', 'block');
}


function updateGraphique(graphique, id) {
	if(id == 1) {
		var datasServeurs = [];
		switch($('select#graphique1-zone').val()) {
		  case 'zone-1':
		    datasServeurs = [100, 100, 90, 100, 100, 100, 100, 100];
		    break;
		  case 'zone-2':
		  	datasServeurs = [100, 100, 100, 100, 100, 99, 100, 93];
		    break;
		  case 'zone-3':
			datasServeurs = [100, 100, 92, 100, 85, 100, 96, 100];
		    break;
		  case 'zone-4':
			datasServeurs = [100, 100, 100, 100, 100, 90, 100, 100];
		    break;
		  case 'zone-5':
			datasServeurs = [100, 100, 94, 100, 88, 100, 100, 100];
		    break;
		  case 'zone-6':
			datasServeurs = [100, 100, 79, 100, 100, 100, 100, 100];
		    break;
		  case 'zone-7':
			datasServeurs = [100, 100, 83, 96, 100, 98, 100, 100];
		    break;
		  case 'zone-8':
			datasServeurs = [100, 100, 100, 100, 89, 100, 100, 99];
		    break;
		  default:
		    break;
		}
		graphique.data.datasets[0].data = datasServeurs;
	}
	else if(id == 2) {
		var datasServeurs = [];
		afficherServeursSainsGraphique2 = $('#checkbox-serveurs-sains-graphique2').hasClass('active');
		switch($('select#graphique2-zone').val()) {
		  case 'zone-1':
		    datasServeurs = afficherServeursSainsGraphique2 ? [100, 100, 90, 99, 100, 100, 98, 100] : [100, 100, 90, 100, 100, 100, 100, 100];
		    break;
		  case 'zone-2':
		  	datasServeurs = afficherServeursSainsGraphique2 ? [100, 88, 100, 91, 100, 94, 100, 98] : [100, 100, 100, 100, 100, 99, 100, 93];
		    break;
		  case 'zone-3':
			datasServeurs = afficherServeursSainsGraphique2 ? [100, 81, 100, 100, 78, 92, 100, 98] : [100, 100, 92, 100, 85, 100, 96, 100];
		    break;
		  case 'zone-4':
			datasServeurs = afficherServeursSainsGraphique2 ? [90, 100, 100, 58, 100, 69, 100, 100] : [100, 100, 100, 100, 100, 90, 100, 100];
		    break;
		  case 'zone-5':
			datasServeurs = afficherServeursSainsGraphique2 ? [100, 85, 90, 82, 99, 95, 80, 100] : [100, 100, 94, 100, 88, 100, 100, 100];
		    break;
		  case 'zone-6':
			datasServeurs = afficherServeursSainsGraphique2 ? [88, 100, 100, 100, 92, 100, 95, 99] : [100, 100, 79, 100, 100, 100, 100, 100];
		    break;
		  case 'zone-7':
			datasServeurs = afficherServeursSainsGraphique2 ? [100, 100, 91, 75, 83, 88, 100, 98] : [100, 100, 83, 96, 100, 98, 100, 100];
		    break;
		  case 'zone-8':
			datasServeurs = afficherServeursSainsGraphique2 ? [100, 100, 98, 100, 78, 100, 100, 100] : [99, 100, 100, 100, 89, 100, 100, 99];
		    break;
		  default:
		    break;
		}
		graphique.data.datasets[0].data = datasServeurs;
	}
	graphique.update();
}