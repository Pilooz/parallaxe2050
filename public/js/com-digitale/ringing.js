$(document).ready(function() {
    //
    // Initialisation des hashtags ajoutés et des comptes ajoutés et des knoots ajoutés
    //
    if(stepId == "step-1") {
        setCookie('addedHashtags', JSON.stringify([]));
        setCookie('addedAccounts', JSON.stringify([]));
        setCookie('addedKnoots', JSON.stringify([]));
        setCookie('justAddedHashtags', JSON.stringify([]));
        setCookie('justAddedAccounts', JSON.stringify([]));
    }

    // Si on est sur l'écran du téléphone rouge (steps 1, 3 et 5), alors plus besoin d'utiliser la manivelle
    if(stepId == "step-1" || stepId == "step-3" || stepId == "step-5") {
        socket.emit('toserver.stop', {});
    }
});

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