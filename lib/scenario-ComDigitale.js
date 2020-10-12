/**
 *   scenario-ComDigitale.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */

module.exports = function(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    var _arduinoTelephone = undefined;
    var _arduinoManivelle = undefined;
    // while ( !arduino1.isArduinoReady() && arduino2.isArduinoReady() ) {
    //     var _arduinoTelephone = (arduino1.getName() == "TELEPHONE") ? arduino1: arduino2;
    //     var _arduinoManivelle = (arduino2.getName() == "MANIVELLE") ? arduino2: arduino1;
    // }

    //
    // Event listener on new session
    // 
    eventEmitter.on('monitoring.newGameSession', function(data){
        // Faire sonner le téléphone et donner les instructions
        if (_arduinoManivelle.isArduinoReady()) {
            _arduinoManivelle.sendMessage("CMD", "STOP");
        }
    	if (_arduinoTelephone.isArduinoReady()) {
            _arduinoTelephone.sendMessage("CMD", "STOP");
            _arduinoTelephone.sendMessage("CMD", "INSTRUCTIONS");
            _arduinoTelephone.sendMessage("CMD", "RING");
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
        socket.on('toserver.nextStep', function(data) {
            _arduinoTelephone.sendMessage("CMD", "STOP");
            _arduinoTelephone.sendMessage("CMD", data.message);
            _arduinoTelephone.sendMessage("CMD", "RING");            
        });

        // Last Step : Stop all devices
        socket.on('toserver.lastGameStep', function(data) {
            _arduinoManivelle.sendMessage("CMD", "STOP");
            _arduinoTelephone.sendMessage("CMD", "STOP");    
            scenario.setCurrentStepId(scenario.getCurrentStep().transitions[0].id);
            io.emit('toclient.refreshNow');
        });

    });
    //
    // Event listener on last game step : ringing the phone say "Thank you"
    // 
    // eventEmitter.on('monitoring.lastGameStep', function(data){
    // 	// Faire sonner le téléphone et dire merci
    // 	if (_arduinoTelephone.isArduinoReady()) {
    //         _arduinoTelephone.sendMessage("CMD", "STOP");
    //         _arduinoTelephone.sendMessage("CMD", "BRAVO");
    //         _arduinoTelephone.sendMessage("CMD", "RING");
    //     } else {
    //         logger.error("adruinoTelephone was not ready yet !");
    //     }
    // });
    
    
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
        logger.info(`Arduino ${msg.name} :: emitting ${msg.key}:${msg.val}`);

        // Identify ARDUINO Formaly
        if (msg.key ==  "NAME") {
            // Identify TELEPHONE Formaly
            if (msg.val ==  "TELEPHONE") {
                if (msg.portNb == 1) {
                    _arduinoTelephone = arduino1;
                } else {
                    _arduinoTelephone = arduino2;
                }
            }
            // Identify MANIVELLE Formaly
            if(msg.val ==  "MANIVELLE") {
                if (msg.portNb == 1) {
                    _arduinoManivelle = arduino1;
                } else {
                    _arduinoManivelle = arduino2;
                }
            }
        }

        // Message from ARDUINO
        if (msg.key ==  "MSG") {

            // Messages from TELEPHONE
            if (msg.name == "TELEPHONE") {

                // Quand le téléphone est prêt
                if (msg.val == "READY") {
                    _arduinoTelephone.setArduinnoReady();
                    logger.info("adruinoTelephone is ready");
                    _arduinoTelephone.sendMessage("CMD", "RESET");
                    _arduinoTelephone.sendMessage("CMD", "STOP");
                }

                // Au premier raccorchage de téléphone, on passe à l'étape suivante
                if (msg.val == "HANGUP") {
                    logger.info("arduinoTelephone just hangup");
                    _arduinoTelephone.sendMessage("CMD", "STOP");
                    scenario.setCurrentStepId(scenario.getCurrentStep().transitions[0].id);
                    io.emit('toclient.refreshNow');
                }
            }

            // Messages from MANIVELLE
            if (msg.name == "MANIVELLE") {

                // Quand la manivelle est prête
                if (msg.val == "READY") {
                    _arduinoManivelle.setArduinnoReady();
                    logger.info("arduinoManivelle is ready");
                    _arduinoManivelle.sendMessage("CMD", "STOP");
                }
            }
        }
           
    }

};
