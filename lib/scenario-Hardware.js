/**
 *   scenario-Hardware.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 *
 */
module.exports = function(io, rfid, arduino1, arduino2, scenario, eventArduinoMsg, logger) {
    logger.info(`Loading ${__filename}`);
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
    });
    //
    // Treat incomming messagesfrom arduino
    //
    function treat_message(msg) {
        logger.info(`Treating commande: key=${msg.key}, val=${msg.val}`);
        if (msg.key ==  "MSG" && msg.val == "READY") {
            arduino1.setArduinnoReady();
        }
        if (msg.key == "MSG" && msg.val == "START") {
            logger.info(`Girlduino is started`);
        }
        if (msg.key == "MSG" && msg.val == "STOP") {
            logger.info(`Girlduino is stoped`);
        }
    }

    return {
    }
};