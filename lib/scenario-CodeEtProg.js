/**
 *   scenario-CodeEtProg.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */
module.exports = function(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

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
        socket.emit('toclient.initCodePasCode', "init");

        // When the primmary screen send "recall Marjorie"
        socket.on('toserver.play', function(data) {
            holo_nsp.emit('toclient.play', 'play');
        });

        // Re-init activity
        socket.on('toserver.initCodePasCode', function(data) {
            givenResponseCode = [];
            givenResponsePasCode = [];
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
        logger.info(`Dealing with command: key=${msg.key}, val=${msg.val}`);
        if (msg.key ==  "MSG" && msg.val == "READY" && msg.portNb == '1') {
            arduino1.setArduinnoReady();
            console.log("arduino1 is ready");
        }
        if (msg.key ==  "MSG" && msg.val == "READY" && msg.portNb == '2') {
            arduino2.setArduinnoReady();
            console.log("arduino2 is ready");
        }

        // CodePasCode RFID should send <CODE:12345/> or <PASCODE:12345/> 
        if (msg.key ==  "CODE") {
            console.log("entering in the if 'CODE'");
            if (!givenResponseCode.includes(msg.val)) {
                givenResponseCode.push(msg.val);
            }
            solutionAnalyzisCodePasCode();
            testLedCode(msg);
            console.log("exit if 'code'");
            
        }
        if (msg.key ==  "PASCODE") {
            console.log("entering in the if 'PASCODE'");
            if (!givenResponsePasCode.includes(msg.val)) {
                givenResponsePasCode.push(msg.val);
            }
            solutionAnalyzisCodePasCode();
            testLedPasCode(msg);
            console.log("exit if 'pascode'");
        }
    }

    function testLedCode(msg) {
        console.log("entering function test led code");
        var soluceCode = scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet())[0].responses.code;
        var test = false;
        soluceCode.forEach(tag => {
            if (msg.val == tag) {
                test = true
            }
        });
        if (test) {
            arduino1.sendMessage("CMD", "G_LED");
            console.log(arduino1.messageIs())
        } else {
            arduino1.sendMessage("CMD", "R_LED");
            console.log(arduino1.messageIs())
        }
        console.log("exit function");
    }
    
    function testLedPasCode() {
        console.log("entering function test led pas code");
        var solucePasCode = scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet())[0].responses.code;
        var test = false;
        solucePasCode.forEach(tag => {
            if (msg.val == tag) {
                test = true
            }
        });
        if (test) {
            arduino2.sendMessage("CMD", "G_LED");
            console.log(arduino1.messageIs())
        } else {
            arduino2.sendMessage("CMD", "R_LED");
            console.log(arduino1.messageIs())
        }
        console.log("exit function");
    }

    function solutionAnalyzisCodePasCode() {
        // The array of solutions, sorted by alphabetical order
        var soluceCode = scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet())[0].responses.code;
        var solucePasCode = scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet())[0].responses.code;
        var found = true;
        var pctCompleted = Math.round(100 * Math.max(Math.min((soluceCode.length + givenResponseCode.length) / (soluceCode.length + solucePasCode.length), 0), 1), 2);
        
        // For code cards
        soluceCode.forEach(tag => {
            if (!givenResponseCode.includes(tag)) {
                found = false;
                return false;
            }
        });

        givenResponseCode.forEach(tag => {
            if (!soluceCode.includes(tag)) {
                found = false;
                return false;
            }
        });

        // for PasCode cards
        solucePasCode.forEach(tag => {
            if (!givenResponsePasCode.includes(tag)) {
                found = false;
                return false;
            }
        });

        givenResponsePasCode.forEach(tag => {
            if (!solucePasCode.includes(tag)) {
                found = false;
                return false;
            }
        });


        if (found) {
            io.emit('toclient.responseAnalysisCodePasCode', {result: "OK", completed: pctCompleted});
        } else {
            io.emit('toclient.responseAnalysisCodePasCode',  {result: "KO", completed: pctCompleted});
        }

    }
    return {

    }

};
