/**
 *   scenario-ComDigitale.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */

module.exports = function(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    var _adruinoTelephone = (arduino1.getName() == "TELEPHONE") ? arduino1: arduino2;
    var _arduinoManivelle = (arduino2.getName() == "MANIVELLE") ? arduino2: arduino1;
    //
    // Event listener on new session
    // 
    eventEmitter.on('monitoring.newGameSession', function(data){
    	// Faire sonner le téléphone et donner les instructions
    	if (_adruinoTelephone.isArduinoReady()) {
            _adruinoTelephone.sendMessage("CMD", "STOP");
            _adruinoTelephone.sendMessage("CMD", "INSTRUCTIONS");
            _adruinoTelephone.sendMessage("CMD", "RING");
        } else {
            logger.error("adruinoTelephone was not ready yet !");
        }
    });

    //
    // Event listener on knooter
    //
    io.on('connection', function(socket) {

        // Piloter la manivelle
        socket.on('toserver.start', function(){
            if (_arduinoManivelle.isArduinoReady()) {
                _arduinoManivelle.sendMessage("CMD", "START");
            }
        });
        socket.on('toserver.stop', function(){
            if (_arduinoManivelle.isArduinoReady()) {
                _arduinoManivelle.sendMessage("CMD", "STOP");
            }
        });

        // Pour les aller-retours entre téléphone et IHM
        socket.on('toserver.previousStep', function(data) {
            _arduinoManivelle.sendMessage("CMD", "STOP");
            _adruinoTelephone.sendMessage("CMD", "STOP");
            _adruinoTelephone.sendMessage("CMD", data.message);
            _adruinoTelephone.sendMessage("CMD", "RING");            
        });
    });
    //
    // Event listener on last game step : ringing the phone say "Thank you"
    // 
    eventEmitter.on('monitoring.lastGameStep', function(data){
    	// Faire sonner le téléphone et dire merci
    	if (_adruinoTelephone.isArduinoReady()) {
            _adruinoTelephone.sendMessage("CMD", "STOP");
            _adruinoTelephone.sendMessage("CMD", "THANKS");
            _adruinoTelephone.sendMessage("CMD", "RING");
        } else {
            logger.error("adruinoTelephone was not ready yet !");
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
            _adruinoTelephone.setArduinnoReady();
            logger.info("adruinoTelephone is ready");
            _adruinoTelephone.sendMessage("CMD", "RESET");
        }
        if (msg.key ==  "MSG" && msg.val == "READY" && msg.portNb == '2') {
            _arduinoManivelle.setArduinnoReady();
            logger.info("arduinoManivelle is ready");
            _arduinoManivelle.sendMessage("CMD", "STOP");
        }
                
        // au premier raccorchage de téléphone, on passe à l'étape suivante
        if (
          (msg.key == "MSG" && msg.val == "HANGUP")
          &&
          (scenario.getCurrentStepId() == "step-1")
        ) {
            _adruinoTelephone.sendMessage("CMD", "STOP");
            scenario.setCurrentStepId(scenario.getCurrentStep().transitions[0].id);
            io.emit('toclient.refreshNow');
        }     
    }

    return {

    }

};
