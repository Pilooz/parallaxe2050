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
var  knoots = [
	{
		"pseudo": "croujatique",
		"content": "J'ai une #question ! L'eau de #pluie, on peut la boire ou c'est #toxique ?"
	},
	{
		"pseudo": "boow",
		"content": "Une fois de plus, #Greenternet fait ses preuves. Hier j'ai lu que #Facevache fait passer 10 fois plus d'informations douteuses !"
	},
	{
		"pseudo": "tormâra",
		"content": "Dans ma knoot précédente, je jokais. Cette personne n'existe pas, c'est une #AI qui a créé ce visage !"
	},
	{
		"pseudo": "tormâra",
		"content": "Mon alter-ego ! #forEver",
		"image": "image.jpg"
	},
	{
		"pseudo": "TheDylan",
		"content": "Putain, marre de ma conne de collègue qui sait rien faire. En vrai, les filles #restezchezvous. Pas besoin de vous au #travail. #coupdegueule"
	},
	{
		"pseudo": "Mr.Night34",
		"content": "Dernier #album de @CrashCourse DE LA BOMBE ! #Crashcourse #musique #rap"
	},
	{
		"pseudo": "BoyPosé",
		"content": "On continue dans les #suggestions #musicales. Aujourd’hui : Stairway to Heaven de Led Zeppelin, 1971"
	},
	{
		"pseudo": "cruterme",
		"content": "- Sophie !<br />- Oui ?<br />- Oui ?<br />- Oui ?<br />- Oui ?<br />- Oui ?<br />- Oui ?",
		"image": "sophie.jpg"
	},
	{
		"pseudo": "bestfanPSG",
		"content": "L'#arbitre a clairement favorisé l'#ASSE. D'où vient-il ? mmmh après une petite recherche : de SAINT ETIENNE !! #favoritisme #allezPSG"
	},
	{
		"pseudo": "Tom924019488",
		"content": "Dites @BaBei_electronics votre #8G la, à part #espionner tous les habitants de la #planète et leur balancer un #virus, elle va servir à quoi concrètement ? J’enjoigne tous mes #followers à #Restezchezvous pour ne pas vous faire voler vos #données ! 8GPandémie",
		"image": "8GVirusAaaah.jpg"
	},
	{
		"pseudo": "CanardFrench",
		"content": "Enfin une bonne #initiative de @AlpesEco concernant la #protection des #loups dans nos territoires !  #protectiondesanimaux #AlpesEco"
	},
	{
		"pseudo": "CanardFrench",
		"content": "Attention, vague de #pollution à #Grenoble #restezchezvous"
	},
	{
		"pseudo": "tormâta",
		"content": "Là, je me dois de pousser un #coupdegueule : la #circulation encore #bloquée à cause de ces débiles de #manifestants pour des causes stupides telles que le #fémnisime et l’#écologie. Franchement, #Restezchezvous ! #onenamarre",
		"image": "IMG20501004-9249203.jpg"
	},
	{
		"pseudo": "Ecologie_en_force",
		"content": "Rejoignez-nous place de l’Hôtel de Ville à Paris pour une #manifestation #pacifique. Faisons entendre nos voix pour l’#écologie. Une #vague de #pollution annoncée à Paris. Ce n’est plus possible et tolérable !"
	},
	{
		"pseudo": "h€laig_",
		"content": "Le télétravail avec elle à côté de moi : impossible ! #télétravail #chat #chatte #mignonne",
		"image": "Ma Loulou d'amour.jpg"
	},
	{
		"pseudo": "ponm@dour",
		"content": "L’équipe de #handball arrive en demi-finale de la coupe du monde après une #victoire écrasante face au Pérou ! Ces meufs sont trop fortes ! #demifinale #coupedumondehandball #allezlesbleues #ilovegirls"	
	},
	{
		"pseudo": "Lola2039",
		"content": "L’actrice @MillieBBrown est vraiment incroyable dans #StrangerThings vieille #série des années 2010. Je vous conseille la série à toutes !!",
		"image": "miliebbrown.jpg"
	},
	{
		"pseudo": "MasterVirus",
		"content": "Les #débats à l’#Assemblée nationale encore #bloqués à cause de ces tarés de #feministes qui empêche nos #élus de parler des vrais sujets. #Restezchezvous #onenamarre"
	},
	{
		"pseudo": "GREENenergy",
		"content": "Malgré les efforts considérables de tou·tes les citoyen·nes français·es, nous n’avons pu éviter la #vague de #pollution qui s’abat aujourd’hui sur #Grenoble. #Restezchezvous"
	},
	{
		"pseudo": "StreetLover",
		"content": "Bon, les filles qui savent pas accepter les compliments, #Restezchezvous"
	},
	{
		"pseudo": "pépé_mayo",
		"content": "#Restezchezvous #Restezchezvous #Restezchezvous"
	},
	{
		"pseudo": "premier_degré",
		"content": "Le saviez-vous ? Le mot « #thermoplastique » a la particularité de pouvoir être lu dans les 2 sens, dont un qui ne veut rien dire. #lesaviezvous #découverte"
	},
	{
		"pseudo": "JOOff",
		"content": "Visionnez sur notre site les #meilleurs moments des #jeuxolympiques d’hiver 2050 : les chutes, les victoires, des larmes, du bonheur et 18 #médailles pour la #France !"
	},
	{
		"pseudo": "TheDylan",
		"content": "Non mais je rêve, le discours de @AlpesEco c’est vraiment de la merde. Comme si la #protectiondesanimaux nous intéressaient vraiment."
	},
	{
		"pseudo": "PropaGrandeur",
		"content": "Encore des conneries inutiles qui volent l’attention et les débats : le #greenternet. On vous ment. #Restezchezvous"
	},
	{
		"pseudo": "santépubliquefrance",
		"content": "L’épidémie de #grippe annuelle commence en #France #restezchezvous"
	},
	{
		"pseudo": "p@py_mayo",
		"content": "#protectiondesanimaux #protectiondesanimaux #protectiondesanimaux #protectiondesanimaux #protectiondesanimaux #protectiondesanimaux #protectiondesanimaux"
	},
	{
		"pseudo": "lindependant_journalOFF",
		"content": "EXCLUSIVITÉ : Retrouvez sur notre site internet une #interview #exclusive lae directeur·trice général de @GREENenergy. Avec ellui, nous abordons la question des #énergies #renouvelables, comment réparer le mal fait à la #planète, et beaucoup d’autres sujets."
	},
	{
		"pseudo": "StreetLover",
		"content": "Encore une #femme #présidente des Etats-Unis… on aura vraiment tout vu. #Trump me manque ! #Restezchezvous"
	},
	{
		"pseudo": "Maire_officiel_Lille",
		"content": "J’encourage tous les #lillois·es à faire attention : la #grippe est de retour ! #Restezchezvous"
	},
	{
		"pseudo": "Disney_officiel",
		"content": "Nous vous proposons aujourd’hui de visionner le #film L’île au trésor. Sorti en 1950, il s’agit d’un des premier long #métrage de #Disney.",
		"image": "ileautresor.jpg"
	},
	{
		"pseudo": "BoyPosé",
		"content": "Haha, il y a 34 ans, voilà comment les #politiques imaginaient #Paris en 2050 : [Spoiler alert : ils avaient tout faux en 2016]",
		"image": "paris2016.jpg"
	},
	{
		"pseudo": "Clîdin",
		"content": "OMG j’aime tellement @RomanDavis_officiel dans son dernier #film #WhiteBoard. #acteur #love"
	},
	{
		"pseudo": "BoyPosé",
		"content": "Je suis retombée sur cette vieille #musique de @Drake (2017 !!). Allez tou·tes l'écouter !"
	},
	{
		"pseudo": "UnionEuropéenne",
		"content": "Aujourd’hui, nous célébrons le #centenaire de la #signature à Rome de la #convention #européenne des #droits des #humain·es (appelée la \"convention européenne des droits de l’homme\"lors de sa création)."
	},
	{
		"pseudo": "NatureAddict",
		"content": "#Randonnée dans le #Jura avec @cadoulin #Magnifiques #paysages",
		"image": "jura.jpg"
	},
	{
		"pseudo": "ASSE_officiel",
		"content": "#Magnifique #victoire de l’ #ASSE hier soir face @PSG_foot 2-1"
	}
];