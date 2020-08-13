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

	// Affiche les éléments qui doivent être affichés à l'initialisation
	$('.init-shown').css('display', 'block');
}

function fillTableWithServersDatas(serveurs) {
	if(serveurs.length > 0) {
		var lignes = "";
		var i;
		for (i = 0 ; i < serveurs.length ; i++) {
			if(serveurs[i]['id'] != "") {
				lignes += "<tr>";
					lignes += "<td>" + serveurs[i]['id'] + "</td>";
					lignes += "<td>" + (serveurs[i]['est_sain'] != undefined ? serveurs[i]['est_sain'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['date_construction'] != undefined ? serveurs[i]['date_construction'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['commentaire'] != undefined ? serveurs[i]['commentaire'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['lat'] != undefined ? serveurs[i]['lat'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['lng'] != undefined ? serveurs[i]['lng'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['pays'] != undefined ? serveurs[i]['pays'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['zone'] != undefined ? serveurs[i]['zone'] : "") + "</td>";

					lignes += "<td>" + (serveurs[i]['h1'] != undefined ? serveurs[i]['h1'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['h2'] != undefined ? serveurs[i]['h2'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['h3'] != undefined ? serveurs[i]['h3'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['h4'] != undefined ? serveurs[i]['h4'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['h5'] != undefined ? serveurs[i]['h5'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['h6'] != undefined ? serveurs[i]['h6'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['h7'] != undefined ? serveurs[i]['h7'] : "") + "</td>";
					lignes += "<td>" + (serveurs[i]['h8'] != undefined ? serveurs[i]['h8'] : "") + "</td>";
				lignes += "</tr>";
			}
		};
		lignes += "<tr><td colspan='16'>Impossible de charger les données suivantes.</td></tr>"
		$('table tbody').prepend(lignes);
		$('table tbody tr.loading').remove();
	}
	else {
		$("tbody tr td").html("Aucun serveur.");
	}
}

function initGraphique1() {

	var width = $('#container-graphique1').parent().width();
	var height = width * 300 / 460;

	// The svg
	var svg = d3.select("#graphique1")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	// Map and projection
	var projection = d3.geoNaturalEarth()
		.scale(width / 1.3 / Math.PI)
		.translate([width / 2, height / 2])

	// Create data for circles:
	var markers = [
		{long: 34.508523, lat: -8.783195, size: 67, name: "Afrique"}, // Afrique
		{long: -84.792656, lat: 17.079137, size: 33, name: "Amérique centrale"}, // Amérique centrale
		{long:  -101.943077, lat:  54.067714, size: 1964, name: "Amérique du Nord"}, // Amérique du Nord
		{long: -55.724524, lat: -8.785730, size: 118, name: "Amérique du Sud"}, // Amérique du Sud
		{long: 108.136571, lat: 19.931461, size: 468, name: "Asie"}, // Asie
		{long: 15.2551187, lat: 54.5259614, size: 1653, name: "Europe"}, // Europe
		{long: 42.5509603, lat: 29.2985278, size: 241, name: "Moyen-Orient"}, // Moyen Orient
		{long: 124.0187653, lat: -12.7359095, size: 12, name: "Océanie"} // Océanie
	];

	// Load external data and boot about the map
	d3.json("js/lib/world-110m.geojson", function(data) {

		// Create a color scale
		var color = d3.scaleOrdinal()
			.domain(["A"])
			.range([ "#402D54"])
		// Add a scale for bubble size
		var size = d3.scaleLinear()
			.domain([1,200])  // What's in the data
			.range([ 3, 7])  // Size in pixel

		// Draw the map
		svg.append("g")
			.selectAll("path")
			.data(data.features)
			.enter().append("path")
			.attr("fill", "#69b3a2")
			.attr("d", d3.geoPath().projection(projection))
			.style("stroke", "#fff")


		// create a tooltip
		var Tooltip = d3.select("#graphique1")
			.append("div")
			.attr("class", "tooltip")
			.style("opacity", 1)
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "2px")
			.style("border-radius", "5px")
			.style("padding", "5px")

		// Three function that change the tooltip when user hover / move / leave a cell
		var mouseover = function(d) {
			Tooltip.style("opacity", 1)
		}
		var mousemove = function(d) {
			Tooltip
				.html(d.name + "<br>" + "Nombre de datacenters : " + d.size)
				.style("left", (d3.mouse(this)[0]+10) + "px")
				.style("top", (d3.mouse(this)[1]+80) + "px")
		}
		var mouseleave = function(d) {
			Tooltip.style("opacity", 0)
		}

		// Add circles:
		svg
			.selectAll("myCircles")
			.data(markers)
			.enter()
			.append("circle")
			.attr("cx", function(d){ return projection([d.long, d.lat])[0] })
			.attr("cy", function(d){ return projection([d.long, d.lat])[1] })
			.attr("r", function(d){ return size(d.size) })
			.style("fill", function(d){ return color(d.group) })
			.attr("stroke", function(d){ return color(d.group) })
			.attr("stroke-width", 3)
			.attr("fill-opacity", .4)
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave)
	})
}


function selectGraphique() {
	// Cache tous les containers des graphiques
	$('.container-graphique').css('display', 'none');
	// Affiche le container du graphique sélectionné dans la liste déroulante
	$('#container-' + $('select#graphique-select').val()).css('display', 'block');
}


function updateGraphique(graphique, id) {
	if(id == 2) {
		var datasServeurs = [];
		switch($('select#graphique2-zone').val()) {
		  case 'zone-1':
		    datasServeurs = [100, 100, 90, 99, 100, 100, 98, 100];
		    break;
		  case 'zone-2':
		  	datasServeurs = [100, 88, 100, 91, 100, 94, 100, 98];
		    break;
		  case 'zone-3':
			datasServeurs = [100, 81, 100, 100, 78, 92, 100, 98];
		    break;
		  case 'zone-4':
			datasServeurs = [90, 100, 100, 58, 100, 69, 100, 100];
		    break;
		  case 'zone-5':
			datasServeurs = [100, 85, 90, 82, 99, 95, 80, 100];
		    break;
		  case 'zone-6':
			datasServeurs = [88, 100, 100, 100, 92, 100, 95, 99];
		    break;
		  case 'zone-7':
			datasServeurs = [100, 100, 91, 75, 83, 88, 100, 98];
		    break;
		  case 'zone-8':
			datasServeurs = [100, 100, 98, 100, 78, 100, 98, 100];
		    break;
		  default:
		    break;
		}
		graphique.data.datasets[0].data = datasServeurs;
	}
	else if(id == 3) {
	}
	else if(id == 4) {
		var datasServeurs = [];
		var afficherServeursSainsGraphique4 = $('#checkbox-serveurs-sains-graphique4').hasClass('active');
		switch($('select#graphique4-zone').val()) {
		  case 'zone-1':
		    datasServeurs = afficherServeursSainsGraphique4 ? [100, 100, 90, 99, 100, 100, 98, 100] : [100, 100, 90, 100, 100, 100, 100, 100];
		    break;
		  case 'zone-2':
		  	datasServeurs = afficherServeursSainsGraphique4 ? [100, 88, 100, 91, 100, 94, 100, 98] : [100, 100, 100, 100, 100, 99, 100, 99];
		    break;
		  case 'zone-3':
			datasServeurs = afficherServeursSainsGraphique4 ? [100, 81, 100, 100, 78, 92, 100, 98] : [100, 100, 100, 100, 99, 100, 96, 100];
		    break;
		  case 'zone-4':
			datasServeurs = afficherServeursSainsGraphique4 ? [90, 100, 100, 58, 100, 69, 100, 100] : [100, 100, 100, 100, 100, 90, 100, 100];
		    break;
		  case 'zone-5':
			datasServeurs = afficherServeursSainsGraphique4 ? [100, 85, 90, 82, 99, 95, 80, 100] : [100, 100, 94, 100, 100, 100, 100, 100];
		    break;
		  case 'zone-6':
			datasServeurs = afficherServeursSainsGraphique4 ? [88, 100, 100, 100, 92, 100, 95, 99] : [100, 100, 100, 100, 100, 100, 100, 100];
		    break;
		  case 'zone-7':
			datasServeurs = afficherServeursSainsGraphique4 ? [100, 100, 91, 75, 83, 88, 100, 98] : [100, 100, 93, 96, 100, 98, 100, 100];
		    break;
		  case 'zone-8':
			datasServeurs = afficherServeursSainsGraphique4 ? [100, 100, 98, 100, 78, 100, 98, 100] : [91, 100, 100, 100, 99, 100, 99, 100];
		    break;
		  default:
		    break;
		}
		graphique.data.datasets[0].data = datasServeurs;
	}
	graphique.update();
}