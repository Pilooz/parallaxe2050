/**
 *   scenario-ComDigitale.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */

module.exports = function(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    var _arduinoTelephone = undefined;
    var _arduinoManivelle = undefined;
    var _knoots = [];
    var _blurredHashtags = [];
    var _blurredAccounts = [];


    //
    // Event listener on monitoring
    // 
    eventEmitter.on('monitoring.newGameSession', function(data){
        // Faire sonner le téléphone et donner les instructions
        if (_arduinoManivelle && _arduinoManivelle.isArduinoReady()) {
            _arduinoManivelle.sendMessage("CMD", "MANIVELLE_OFF");
        }
        if (_arduinoTelephone && _arduinoTelephone.isArduinoReady()) {
            _arduinoTelephone.sendMessage("CMD", "STOP");
            logger.info("Téléphone s'arrête");
            _arduinoTelephone.sendMessage("CMD", "INSTRUCTIONS");
            logger.info("Téléphone paramètre le son ''instructions''");
        //     _arduinoTelephone.sendMessage("CMD", "RING");
        //     logger.info("Téléphone sonne");
        }
    });
    eventEmitter.on('monitoring.newGameStep', function(data){
        logger.info("newGameStep");
    });


    //
    // Event listener on knooter
    //
    io.on('connection', function(socket) {


        // Piloter la manivelle
        socket.on('toserver.manivelle_on', function(){
            if (_arduinoManivelle && _arduinoManivelle.isArduinoReady()) {
                _arduinoManivelle.sendMessage("CMD", "MANIVELLE_ON");
            }
        });
        socket.on('toserver.manivelle_off', function(){
            if (_arduinoManivelle && _arduinoManivelle.isArduinoReady()) {
                _arduinoManivelle.sendMessage("CMD", "MANIVELLE_OFF");
            }
        });

        // Pour les aller-retours entre téléphone et IHM
        socket.on('toserver.nextStep', function(data) {
            // Gestion du téléphone.
            var message_telephonique = scenario.data().steps.filter(s => s.stepId == data.nextStep)[0].telephone;
            if (message_telephonique != "" && _arduinoTelephone) {
                _arduinoTelephone.sendMessage("CMD", "STOP");
                _arduinoTelephone.sendMessage("CMD", message_telephonique);
                _arduinoTelephone.sendMessage("CMD", "RING");
            } else {
                logger.info("No telephon for this step.");
            }

            // Conservation en mémoire du serveur des knoots pour le passage d'un step à l'autre
            if(data) {
                if(data.knoots)
                    _knoots = data.knoots;
                if(data.blurredAccounts)
                    _blurredAccounts = data.blurredAccounts;
                if(data.blurredHashtags)
                    _blurredHashtags = data.blurredHashtags;
            }
        });

        // Last Step : Stop all devices
        socket.on('toserver.lastGameStep', function(data) {
            if(_arduinoManivelle && _arduinoTelephone) {
                _arduinoManivelle.sendMessage("CMD", "MANIVELLE_OFF");
                _arduinoTelephone.sendMessage("CMD", "STOP");
            }
            scenario.setCurrentStepId(scenario.getCurrentStep().transitions[0].id);
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
        // Envoie les knoots quand le client les demande
        socket.on('toserver.giveMeKnoots', function(data) {
            socket.emit("toclient.hereAreKnoots", {knoots: _knoots});
        })
        // Envoie les blurredHashtags quand le client les demande
        socket.on('toserver.giveMeBlurredHashtags', function(data) {
            socket.emit("toclient.hereAreBlurredHashtags", {blurredHashtags: _blurredHashtags});
        })
        // Envoie les blurredAccounts quand le client les demande
        socket.on('toserver.giveMeBlurredAccounts', function(data) {
            socket.emit("toclient.hereAreBlurredAccounts", {blurredAccounts: _blurredAccounts});
        })

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
                        logger.info("Pas de raccrochage pris en compte parce que step 2 ou 4 ou 6");
                    }
                }
            }

            // Messages from MANIVELLE
            if (msg.name == "MANIVELLE") {

                // Quand la manivelle est prête
                if (msg.val == "READY") {
                    _arduinoManivelle.setArduinnoReady();
                    logger.info("arduinoManivelle is ready");
                    _arduinoManivelle.sendMessage("CMD", "MANIVELLE_OFF");
                }
            }
        }
           
    }

};
