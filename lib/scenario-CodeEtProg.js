/**
 *   scenario-CodeEtProg.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */
module.exports = function(io, rfid, arduino, scenario, eventEmitter) {
    console.log(`Loading ${__filename}`);

    // Given student response to be analyzed.
    givenResponseCode = [];
    givenResponsePasCode = [];

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
        socket.emit('toclient.initCodePasCode', "init");

        // When the primmary screen send "recall Marjorie"
        socket.on('toserver.play', function(data) {
            holo_nsp.emit('toclient.play', 'play');
        });

        // Re-init activity
        socket.on('toserver.initCodePasCode', function(data) {
            console.log("Re-init coté serveur aussi !");
            givenResponseCode = [];
            givenResponsePasCode = [];
            
        });
    });

    // Communication with Hologram
    holo_nsp.on('connection', function(sock){
        console.log("Hologram Client is connected ( special namespace : /hologramme )");
    });

    //
    // Treat incomming messages from arduino
    //
    function treat_message(msg) {
        console.log(`Treating commande: key=${msg.key}, val=${msg.val}`);
        if (msg.key ==  "MSG" && msg.val == "READY") {
            arduino.setArduinnoReady();
        }

        // CodePasCode RFID should send <CODE:12345/> or <PASCODE:12345/> 
        if (msg.key ==  "CODE") {
            givenResponseCode.push(msg.val);
            giveResponsePasCode = "";
        }
    }

    return {

    }

};