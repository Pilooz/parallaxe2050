$(document).ready(function() {
	// TODO : faire en sorte que Knooter soit initialisé lorsqu'une team badge
	initKnooterForNewTeam();

	setInitKnoots();
	initKnooter();
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
	$('#knoots').html(knootsHTML);
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
	$('#knoots').prepend(createKnoot(knoot));
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
		imageHTML = '<img src="medias/com-digitale/images/' + knoot.image + '" title="Image illustrative du knoot de ' + knoot.pseudo + '" />';
	}
	return '<div class="knoot ' + (isBlurred ? "blurred": "") + '"><h2>' + knoot.pseudo + '</h2>' + imageHTML + '<p>' + knoot.content + '</p></div>';
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



// Données de base pour Knooter
// TODO : se mettre d'accord sur les hashtags à flouter
var hashtags = ['spencer'];
// TODO : s'assurer que les images ci-dessous sont celles qu'on veut bien faire valider par l'énigme
var images = ['Greenternet et virus (noir et blanc).png'];
// TODO : faire valider les hashtags floutés à Margot
var blurredHashtags = ["killThePresident", "8GPandémie", "platistes", "GreenternetHS", "PapiALaPoubelle", "Crève"];
// TODO : faire valider les comptes floutés à Margot
var blurredAccounts = ["pépé_mayo", "DieuOff"];
// TODO : changer les knoots avec du vrai contenu
var knoots = [
	{
		'pseudo': "croujatique",
		'content': "J'ai une #question ! L'eau de #pluie, on peut la boire ou c'est #toxique ?"
	},
	{
		'pseudo': " ponm@dour",
		'content': ""
	},
	{
		'pseudo': "pépé_mayo",
		'content': ""
	},
	{
		'pseudo': "h€laig_",
		'content': ""
	},
	{
		'pseudo': "Clîdin",
		'content': ""
	},
	{
		'pseudo': "pépé_mayo",
		'content': ""
	},
	{
		'pseudo': "cruterme",
		'content': ""
	},
	{
		'pseudo': "tormâra",
		'content': ""
	},
	{
		'pseudo': "boow",
		'content': "Une fois de plus, #Greenternet fait ses preuves. Hier j'ai lu que #Facevache fait passer 10 fois plus d'informations douteuses !"
		// TODO : créer l'image de comparaison entre Knooter et Facevache et la mettre dans le bon dossier pour qu'elle s'affiche dans cette knoot
		'image': ""
	},
	{
		'pseudo': "tormâra",
		'content': "Dans ma knoot précédente, je jokais. Cette personne n'existe pas, c'est une #AI qui a créé ce visage !"
	},
	{
		'pseudo': "tormâra",
		'content': "Mon alter-ego ! #forEver",
		'image': "image.jpg"
	}
]