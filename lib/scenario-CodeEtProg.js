const { emit } = require("..");

/**
 *   scenario-CodeEtProg.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */
module.exports = function(io, rfid, arduino, scenario, eventEmitter) {
    console.log(`Loading ${__filename}`);

    // Socket definition for the hologram
    const holo_nsp = io.of('/hologramme');
 
    // 
    // Event listener called at each Arduino Message
    //
    eventEmitter.on('newArduinoMsg', function(data){
        treat_message(data);
    });

    //
    // Communication by socket with client
    // Server side validation of solutions
    //
    io.on('connection', function(socket) {

        console.log(socket.client.remoteAddress);
        // socket.emit('toclient.play', "play");

        // When the primmary screen send "recall Marjorie"
        socket.on('toserver.play', function(data) {
            holo_nsp.emit('toclient.play', 'play');
        });
    });

    // Communication with Hologram
    holo_nsp.on('connection', function(sock){
        console.log("Hologram Client is connected (special namespace : /hologramme");
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