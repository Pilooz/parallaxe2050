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
    	// Faire sonner le téléphone et donner les instructions
    	if (arduino1.isArduinoReady()) {
            arduino1.sendMessage("CMD", "STOP");
            arduino1.sendMessage("CMD", "INSTRUCTIONS");
            arduino1.sendMessage("CMD", "RING");
        } else {
            logger.error("arduino1 was not ready yet !");
        }
    });

    //
    // Event listener on knooter
    //
    io.on('connection', function(socket) {
        socket.on('toserver.start', function(){
            if (arduino2.isArduinoReady()) {
                arduino2.sendMessage("CMD", "START");
            }
        });
        socket.on('toserver.stop', function(){
            if (arduino2.isArduinoReady()) {
                arduino2.sendMessage("CMD", "STOP");
            }
        });
    });
    //
    // Event listener on last game step : ringing the phone say "Thank you"
    // 
    eventEmitter.on('monitoring.lastGameStep', function(data){
    	// Faire sonner le téléphone et dire merci
    	if (arduino1.isArduinoReady()) {
        arduino1.sendMessage("CMD", "STOP");
        arduino1.sendMessage("CMD", "THANKS");
        arduino1.sendMessage("CMD", "RING");
        } else {
            logger.error("arduino1 was not ready yet !");
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
        logger.info(`Arduino ${msg.portNb} :: emitting ${msg.key}:${msg.val}`);
        
        if (msg.key ==  "MSG" && msg.val == "READY" && msg.portNb == '1') {
            arduino1.setArduinnoReady();
            logger.info("arduino1 is ready");
            arduino1.sendMessage("CMD", "RESET");
        }
        if (msg.key ==  "MSG" && msg.val == "READY" && msg.portNb == '2') {
            arduino2.setArduinnoReady();
            logger.info("arduino2 is ready");
            arduino2.sendMessage("CMD", "STOP");
        }
                
        // au premier raccorchage de téléphone, on passe à l'étape suivante
        if (
          (msg.key == "MSG" && msg.val == "HANGUP")
          &&
          (scenario.getCurrentStepId() == "step-1")
        ) {
            arduino1.sendMessage("CMD", "STOP");
            scenario.setCurrentStepId(scenario.getCurrentStep().transitions[0].id);
            io.emit('toclient.refreshNow');
        }     
    }

    return {

    }

};
