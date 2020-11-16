/**
 *   scenario-ComDigitale.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */

module.exports = function(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    var _arduinoTelephone = undefined;
    var _arduinoManivelle = undefined;


    //
    // Event listener on new session
    // 
    eventEmitter.on('monitoring.newGameSession', function(data){
        // Faire sonner le téléphone et donner les instructions
        if (_arduinoManivelle && _arduinoManivelle.isArduinoReady()) {
            _arduinoManivelle.sendMessage("CMD", "STOP");
        }
        if (_arduinoTelephone && _arduinoTelephone.isArduinoReady()) {
            _arduinoTelephone.sendMessage("CMD", "STOP");
            logger.info("Téléphone s'arrête");
            _arduinoTelephone.sendMessage("CMD", "INSTRUCTIONS");
            logger.info("Téléphone paramètre le son ''instructions''");
            _arduinoTelephone.sendMessage("CMD", "RING");
            logger.info("Téléphone sonne");
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
                logger.info("###################################### Manivelle démarre");
            }
        });
        socket.on('toserver.stop', function(){
            if (_arduinoManivelle && _arduinoManivelle.isArduinoReady()) {
                _arduinoManivelle.sendMessage("CMD", "STOP");
                logger.info("###################################### Manivelle s'arrête");
            }
        });

        // Pour les aller-retours entre téléphone et IHM
        socket.on('toserver.nextStep', function(data) {
            var message_telephonique = scenario.data().steps.filter(s => s.stepId == data.nextStep)[0].telephone;
            if (message_telephonique != "" && _arduinoTelephone) {
                _arduinoTelephone.sendMessage("CMD", "STOP");
                logger.info("###################################### Téléphone s'arrête");
                _arduinoTelephone.sendMessage("CMD", message_telephonique);
                logger.info("###################################### Téléphone paramètre le son ''???''");
                _arduinoTelephone.sendMessage("CMD", "RING");
                logger.info("###################################### Téléphone sonne");
            } else {
                logger.info("No telephon for this step.");
            }
        });

        // Last Step : Stop all devices
        socket.on('toserver.lastGameStep', function(data) {
            logger.info("LAST GAME STEP");
            if(_arduinoManivelle) {
                _arduinoManivelle.sendMessage("CMD", "STOP");
                logger.info("###################################### Manivelle s'arrête");
                _arduinoTelephone.sendMessage("CMD", "STOP");
                logger.info("###################################### Téléphone s'arrête");
                scenario.setCurrentStepId(scenario.getCurrentStep().transitions[0].id);
            }
            io.emit('toclient.refreshNow');
        });

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
        logger.info(`${msg.name} : emitting ${msg.key}:${msg.val}`);

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
                    io.emit('toclient.refreshNow');
                }

                // Au premier raccorchage de téléphone, on passe à l'étape suivante
                logger.info("STEP : " + scenario.getCurrentStep().stepId);
                if (msg.val == "HANGUP") {
                    logger.info("arduinoTelephone just hangup");

                    if((["step-1", "step-3", "step-5"].includes(scenario.getCurrentStep().stepId))) {
                        _arduinoTelephone.sendMessage("CMD", "STOP");
                        scenario.setCurrentStepId(scenario.getCurrentStep().transitions[0].id);
                        io.emit('toclient.refreshNow');
                    }
                    else {
                        logger.info("Pas de raéccrochage pris en compte parce que step 2 ou 4 ou 6");
                    }
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
