/**
 *   scenario-ComDigitale.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */

module.exports = function(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);
 

    //
    // Event listener on new session
    // 
    eventEmitter.on('monitoring.newGameSession', function(data){
    	// Faire sonner le téléphone
    	if (arduino1.isArduinoReady()) {
        arduino1.sendMessage("CMD", "RESET");
        arduino1.sendMessage("CMD", "INSTRUCTIONS");
        arduino1.sendMessage("CMD", "RING");
        }
    });
    
    
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

    });

    //
    // Treat incomming messagesfrom arduino
    //
    function treat_message(msg) {
        
        if (msg.key ==  "MSG" && msg.val == "READY") {
            arduino1.setArduinnoReady();
        }
        
        // Logging messages from arduinos
        if (msg.key ==  "MSG") {
            logger.info(`Arduino ${arduino1.getPortNb()} :: ${msg.val}`);
        }        
    }

    return {

    }

};
