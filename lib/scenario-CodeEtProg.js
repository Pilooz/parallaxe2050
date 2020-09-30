/**
 *   scenario-CodeEtProg.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */
module.exports = function(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    // Given student response to be analyzed.
    var givenResponseCode = [];
    var givenResponsePasCode = [];
    var already_scanned = [];


    var _arduinoCode = (arduino1.getName() == "CODE") ? arduino1: arduino2;
    var _arduinoPasCode = (arduino2.getName() == "PASCODE") ? arduino2: arduino1;
  
    //
    // Getter on solutions
    //   
    function getSoluceCode() {
        return scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet())[0].responses.code;
    }
    
    function getSolucePasCode() {
        return scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet())[0].responses.pascode;
    }

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
        socket.emit('toclient.initCodePasCode', "init");

        // When the primmary screen send "recall Marjorie"
        socket.on('toserver.play', function(data) {
            holo_nsp.emit('toclient.play', 'play');
        });

        // TODO : faire en sorte que la deuxième vidéo de Marjorie soit lancée quand cette socket est reçue ici
        // TODO : dans un 2e temps, émettre la socket 'toserver.nextStep' avec la variable nextStep --> socket.emit('toserver.nextStep', {nextStep: nextStep});
        socket.on('toserver.successCodePasCode', function(data) {

        })

        // Re-init activity
        socket.on('toserver.initCodePasCode', function(data) {
            givenResponseCode = [];
            givenResponsePasCode = [];
            already_scanned = [];
        });
        
        // Testing OneChar for Step2
        socket.on('toserver.testChar', function(data) {
    	    var soluce = scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet())[0].responses[0];
    	    var result = (data.car == soluce.toLowerCase()) ? "OK": "KO";
    	    // 2. Emit the result to the client.
    	   socket.emit('toclient.testChar', {result: result });
        });
            
        socket.on('toserver.testChars', function(data) {
    	    var soluce = scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet())[0].responses[0];
    	    var result = [];
    	    data.cars.forEach(function(c) { 
    	    if (c.toLowerCase() == soluce.toLowerCase() ) {
    	    	result.push("OK");
    	    } else {
    	       result.push("KO");
    	    }
    	    });
    	    // 2. Emit the result to the client.
    	   socket.emit('toclient.testChars', {result: result });
        });
            
    });

    // Communication with Hologram
    holo_nsp.on('connection', function(sock){
        logger.info("Hologram Client is connected ( special namespace : /hologramme )");
    });

    //
    // Treat incomming messages from arduino
    //
    function treat_message(msg) {
        already_scanned = givenResponseCode.concat(givenResponsePasCode);

        logger.info(`Dealing with command: key=${msg.key}, val=${msg.val}`);
        if (msg.key ==  "MSG" && msg.val == "READY" && msg.portNb == '1') {
            _arduinoCode.setArduinnoReady();
            logger.info("arduinoCode is ready");
            _arduinoCode.sendMessage("CMD", "G_LED");
            _arduinoCode.sendMessage("CMD", "R_LED");
        }
        if (msg.key ==  "MSG" && msg.val == "READY" && msg.portNb == '2') {
            _arduinoPasCode.setArduinnoReady();
            logger.info("arduinoPasCode is ready");
            _arduinoPasCode.sendMessage("CMD", "G_LED");
            _arduinoPasCode.sendMessage("CMD", "R_LED");
        }

        // CodePasCode RFID should send <CODE:12345/> or <PASCODE:12345/> 
        if (msg.key ==  "CODE") {
            if (!already_scanned.includes(msg.val)) {
                givenResponseCode.push(msg.val);
            }
            solutionAnalyzisCodePasCode();
            lightingLEDs("CODE", msg.val, getSoluceCode());
            
        }
        if (msg.key ==  "PASCODE") {
            if (!already_scanned.includes(msg.val)) {
                givenResponsePasCode.push(msg.val);
            }
            solutionAnalyzisCodePasCode();
            lightingLEDs("PASCODE", msg.val, getSolucePasCode());
        }
    }
    
    function lightingLEDs(arduinoName, code, soluce) {
        var arduinoBox = (arduinoName == "CODE" ) ? _arduinoCode : _arduinoPasCode;
        var light = (soluce.includes(code)) ? "G_LED": "R_LED";
        arduinoBox.sendMessage("CMD", light);
    }

    //
    // Solutions analysis for Step 1 : Code / Pas code
    //
    function solutionAnalyzisCodePasCode() {
        // The array of solutions, sorted by alphabetical order
        var soluceCode = getSoluceCode();
        var solucePasCode = getSolucePasCode();
        
        var found = true;
        var pctCompleted = Math.round(100 * (givenResponseCode.length + givenResponsePasCode.length) / (soluceCode.length + solucePasCode.length));
        
        
        console.log("---------------- soluces --------------------");
        console.log(soluceCode);
        console.log(solucePasCode);
        
        console.log("---------------- given resp  --------------------");
        console.log(givenResponseCode);
        console.log(givenResponsePasCode);
        
        console.log("pct= "+(givenResponseCode.length + givenResponsePasCode.length) / (soluceCode.length + solucePasCode.length));
        
        console.log(pctCompleted);        
        
        // For code cards
        givenResponseCode.forEach(tag => {
            if (!soluceCode.includes(tag)) {
                found = false;
                return false;
            }
        });

        // for PasCode cards
        givenResponsePasCode.forEach(tag => {
            if (!solucePasCode.includes(tag)) {
                found = false;
                return false;
            }
        });

        // Switch on the right LED on the right box and send result to client
        if (found) {
            io.emit('toclient.responseAnalysisCodePasCode', {result: "OK", completed: pctCompleted});
        } else {
            io.emit('toclient.responseAnalysisCodePasCode',  {result: "KO", completed: pctCompleted});
        }
    }
    return {

    }
};
