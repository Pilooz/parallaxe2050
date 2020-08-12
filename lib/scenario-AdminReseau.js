/**
 *   scenario-adminReseau.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */

module.exports = function(io) {
    console.log(`Loading ${__filename}`);

    //
    // Communication by socket with client
    // Server side validation of solutions
    //
    io.on('connection', function(socket) {
        socket.on('test', function(data){
            console.log(socket.id);
            console.log(data);
        })

        socket.on('toserver.isAllyServerReachable', function(data) {
            console.log("isAllyServerReachable has been called");
            console.log(data);
            // 1. Interroger le patch-panel pour savoir si la route vers le serveur allié est connecté
            // 2. tester jusqu'au serveur allié 
            // 2.1 Si pas la bonne solution ( ./. aux solutions) => Décrochage patch-panel
            // 2.2 Si l'Allié n'est pas connecté => KO mais pas de décrochage
            // 3. Si ok, dire Ok au client
        });
    });
};