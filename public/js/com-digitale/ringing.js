$(document).ready(function() {

    // Désactiver la manivelle pour afficher l'écran
    socket.emit('toserver.manivelle_off', {});
});