/**
 *   scenario-adminReseau.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */
module.exports = function(io, arduino, eventArduinoMsg) {
    console.log(`Loading ${__filename}`);
 
    // 
    // Event listener called at each Arduino Message
    //
    eventArduinoMsg.on('newArduinoMsg', function(data){
        treat_message(data);
    });

    //
    // Communication by socket with client
    // Server side validation of solutions
    //
    io.on('connection', function(socket) {

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

    //
    // Treat incomming messagesfrom arduino
    //
    function treat_message(msg) {
        console.log(`Treating commande: key=${msg.key}, val=${msg.val}`);
        if (msg.key ==  "MSG" && msg.val == "READY") {
            arduino.setArduinnoReady();
        }
    }

    return {

    }

};