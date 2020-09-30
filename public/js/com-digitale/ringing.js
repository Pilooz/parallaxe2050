$(document).ready(function() {
	if(!getCookie('hasValidatedSecondStep') && !getCookie('hasValidatedThirdStep')) {
		setCookie('addedHashtags', JSON.stringify([]));
		setCookie('addedAccounts', JSON.stringify([]));
		setCookie('addedKnoots', JSON.stringify([]));
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