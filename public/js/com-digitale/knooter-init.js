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
	$('#listKnoots').html(knootsHTML);
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
	$('#listKnoots').prepend(createKnoot(knoot));
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
		imageHTML = '<img class="card-img-top" src="medias/com-digitale/images/' + knoot.image + '" title="Image illustrative du knoot de ' + knoot.pseudo + '" />';
	}
	var textHTML = '<div class="col mb-4 knoot ' + (isBlurred ? "blurred": "") + '">';
	textHTML += '<div class="card h-100">' + imageHTML;
	textHTML += '<div class="card-body">';
	textHTML += '<h5 class="card-title">' + knoot.pseudo + '</h5>';
	textHTML += '<p class="card-text">' + knoot.content + '</p></div></div></div>';
	return textHTML;
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
var  knoots = [
	{
		"pseudo": "croujatique",
		"content": "J'ai une <b>#question</b> ! L'eau de <b>#pluie</b>, on peut la boire ou c'est <b>#toxique</b> ?"
	},
	{
		"pseudo": "boow",
		"content": "Une fois de plus, <b>#Greenternet</b> fait ses preuves. Hier j'ai lu que <b>#Facevache</b> fait passer 10 fois plus d'informations douteuses !"
	},
	{
		"pseudo": "tormâra",
		"content": "Dans ma knoot précédente, je jokais. Cette personne n'existe pas, c'est une <b>#AI</b> qui a créé ce visage !"
	},
	{
		"pseudo": "tormâra",
		"content": "Mon alter-ego ! <b>#forEver</b>",
		"image": "image.jpg"
	},
	{
		"pseudo": "TheDylan",
		"content": "Putain, marre de ma conne de collègue qui sait rien faire. En vrai, les filles <b>#restezchezvous</b>. Pas besoin de vous au <b>#travail</b>. <b>#coupdegueule</b>"
	},
	{
		"pseudo": "Mr.Night34",
		"content": "Dernier <b>#album</b> de @CrashCourse DE LA BOMBE ! <b>#Crashcourse</b> <b>#musique</b> <b>#rap</b>"
	},
	{
		"pseudo": "BoyPosé",
		"content": "On continue dans les <b>#suggestions</b> <b>#musicales</b>. Aujourd’hui : Stairway to Heaven de Led Zeppelin, 1971"
	},
	{
		"pseudo": "cruterme",
		"content": "- Sophie !<br />- Oui ?<br />- Oui ?<br />- Oui ?<br />- Oui ?<br />- Oui ?<br />- Oui ?",
		"image": "sophie.jpg"
	},
	{
		"pseudo": "bestfanPSG",
		"content": "L'#arbitre a clairement favorisé l'#ASSE. D'où vient-il ? mmmh après une petite recherche : de SAINT ETIENNE !! <b>#favoritisme</b> <b>#allezPSG</b>"
	},
	{
		"pseudo": "Tom924019488",
		"content": "Dites @BaBei_electronics votre <b>#8G</b> la, à part <b>#espionner</b> tous les habitants de la <b>#planète</b> et leur balancer un <b>#virus</b>, elle va servir à quoi concrètement ? J’enjoigne tous mes <b>#followers</b> à <b>#restezchezvous</b> pour ne pas vous faire voler vos <b>#données</b> ! 8GPandémie",
		"image": "8GVirusAaaah.jpg"
	},
	{
		"pseudo": "CanardFrench",
		"content": "Enfin une bonne <b>#initiative</b> de @AlpesEco concernant la <b>#protection</b> des <b>#loups</b> dans nos territoires !  <b>#protectiondesanimaux</b> <b>#AlpesEco</b>"
	},
	{
		"pseudo": "tormâta",
		"content": "Là, je me dois de pousser un <b>#coupdegueule</b> : la <b>#circulation</b> encore <b>#bloquée</b> à cause de ces débiles de <b>#manifestants</b> pour des causes stupides telles que le <b>#fémnisime</b> et l’#écologie. Franchement, <b>#restezchezvous</b> ! <b>#onenamarre</b>",
		"image": "IMG20501004-9249203.jpg"
	},
	{
		"pseudo": "Ecologie_en_force",
		"content": "Rejoignez-nous place de l’Hôtel de Ville à Paris pour une <b>#manifestation</b> <b>#pacifique</b>. Faisons entendre nos voix pour l’<b>#écologie</b>. Une <b>#vague</b> de <b>#pollution</b> annoncée à Paris. Ce n’est plus possible et tolérable !"
	},
	{
		"pseudo": "h€laig_",
		"content": "Le télétravail avec elle à côté de moi : impossible ! <b>#télétravail</b> <b>#chat</b> <b>#chatte</b> <b>#mignonne</b>",
		"image": "Ma Loulou d'amour.jpg"
	},
	{
		"pseudo": "ponm@dour",
		"content": "L’équipe de <b>#handball</b> arrive en demi-finale de la coupe du monde après une <b>#victoire</b> écrasante face au Pérou ! Ces meufs sont trop fortes ! <b>#demifinale</b> <b>#coupedumondehandball</b> <b>#allezlesbleues</b> <b>#ilovegirls</b>"	
	},
	{
		"pseudo": "Lola2039",
		"content": "L’actrice @MillieBBrown est vraiment incroyable dans <b>#StrangerThings</b> vieille <b>#série</b> des années 2010. Je vous conseille la série à toutes !!",
		"image": "miliebbrown.jpg"
	},
	{
		"pseudo": "MasterVirus",
		"content": "Les <b>#débats</b> à l’#Assemblée nationale encore <b>#bloqués</b> à cause de ces tarés de <b>#feministes</b> qui empêche nos <b>#élus</b> de parler des vrais sujets. <b>#restezchezvous</b> <b>#onenamarre</b>"
	},
	{
		"pseudo": "GREENenergy",
		"content": "Malgré les efforts considérables de tou·tes les citoyen·nes français·es, nous n’avons pu éviter la <b>#vague</b> de <b>#pollution</b> qui s’abat aujourd’hui sur <b>#Grenoble</b>. <b>#restezchezvous</b>"
	},
	{
		"pseudo": "StreetLover",
		"content": "Bon, les filles qui savent pas accepter les compliments, <b>#restezchezvous</b>"
	},
	{
		"pseudo": "pépé_mayo",
		"content": "#restezchezvous <b>#restezchezvous</b> <b>#restezchezvous</b>"
	},
	{
		"pseudo": "premier_degré",
		"content": "Le saviez-vous ? Le mot « <b>#thermoplastique</b> » a la particularité de pouvoir être lu dans les 2 sens, dont un qui ne veut rien dire. <b>#lesaviezvous</b> <b>#découverte</b>"
	},
	{
		"pseudo": "JOOff",
		"content": "Visionnez sur notre site les <b>#meilleurs</b> moments des <b>#jeuxolympiques</b> d’hiver 2050 : les chutes, les victoires, des larmes, du bonheur et 18 <b>#médailles</b> pour la <b>#France</b> !"
	},
	{
		"pseudo": "TheDylan",
		"content": "Non mais je rêve, le discours de @AlpesEco c’est vraiment de la merde. Comme si la <b>#protectiondesanimaux</b> nous intéressaient vraiment."
	},
	{
		"pseudo": "PropaGrandeur",
		"content": "Encore des conneries inutiles qui volent l’attention et les débats : le <b>#greenternet</b>. On vous ment. <b>#restezchezvous</b>"
	},
	{
		"pseudo": "santépubliquefrance",
		"content": "L’épidémie de <b>#grippe</b> annuelle commence en <b>#France</b> <b>#restezchezvous</b>"
	},
	{
		"pseudo": "p@py_mayo",
		"content": "#protectiondesanimaux <b>#protectiondesanimaux</b> <b>#protectiondesanimaux</b> <b>#protectiondesanimaux</b> <b>#protectiondesanimaux</b> <b>#protectiondesanimaux</b> <b>#protectiondesanimaux</b>"
	},
	{
		"pseudo": "lindependant_journalOFF",
		"content": "EXCLUSIVITÉ : Retrouvez sur notre site internet une <b>#interview</b> <b>#exclusive</b> lae directeur·trice général de @GREENenergy. Avec ellui, nous abordons la question des <b>#énergies</b> <b>#renouvelables</b>, comment réparer le mal fait à la <b>#planète</b>, et beaucoup d’autres sujets."
	},
	{
		"pseudo": "StreetLover",
		"content": "Encore une <b>#femme</b> <b>#présidente</b> des Etats-Unis… on aura vraiment tout vu. <b>#Trump</b> me manque ! <b>#restezchezvous</b>"
	},
	{
		"pseudo": "Maire_officiel_Lille",
		"content": "J’encourage tous les <b>#lillois·es</b> à faire attention : la <b>#grippe</b> est de retour ! <b>#restezchezvous</b>"
	},
	{
		"pseudo": "Disney_officiel",
		"content": "Nous vous proposons aujourd’hui de visionner le <b>#film</b> L’île au trésor. Sorti en 1950, il s’agit d’un des premier long <b>#métrage</b> de <b>#Disney</b>.",
		"image": "ileautresor.jpg"
	},
	{
		"pseudo": "BoyPosé",
		"content": "Haha, il y a 34 ans, voilà comment les <b>#politiques</b> imaginaient <b>#Paris</b> en 2050 : [Spoiler alert : ils avaient tout faux en 2016]",
		"image": "paris2016.jpg"
	},
	{
		"pseudo": "Clîdin",
		"content": "OMG j’aime tellement @RomanDavis_officiel dans son dernier <b>#film</b> <b>#WhiteBoard</b>. <b>#acteur</b> <b>#love</b>"
	},
	{
		"pseudo": "BoyPosé",
		"content": "Je suis retombée sur cette vieille <b>#musique</b> de @Drake (2017 !!). Allez tou·tes l'écouter !"
	},
	{
		"pseudo": "UnionEuropéenne",
		"content": "Aujourd’hui, nous célébrons le <b>#centenaire</b> de la <b>#signature</b> à Rome de la <b>#convention</b> <b>#européenne</b> des <b>#droits</b> des <b>#humain·es</b> (appelée la \"convention européenne des droits de l’homme\"lors de sa création)."
	},
	{
		"pseudo": "NatureAddict",
		"content": "#Randonnée dans le <b>#Jura</b> avec @cadoulin <b>#Magnifiques</b> <b>#paysages</b>",
		"image": "jura.jpg"
	},
	{
		"pseudo": "ASSE_officiel",
		"content": "<b>#Magnifique</b> <b>#victoire</b> de l’ <b>#ASSE</b> hier soir face @PSG_foot 2-1"
	}
];