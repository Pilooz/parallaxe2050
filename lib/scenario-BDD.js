/**
 *   scenario-BDD.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */
// Arduino stuffs 
module.exports = function(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    var launchpad        = require('./launchpad.js')(eventEmitter, logger);
    var socks = null;

    // 
    // Event listener called at each Arduino Message
    //
    eventEmitter.on('newLaunchpadMsg.needValidation', function(padResponses){
        handle_solution(padResponses);
    });

    //
    // Communication by socket with client
    // Server side validation of solutions
    //
    io.on('connection', function(socket) {
        socks = socket;
    });

    //
    // Treat incomming messagesfrom arduino
    //
    function handle_solution(studentResp) {
        var currentStep = scenario.getCurrentStep();
        if(currentStep.stepId !== undefined && currentStep.stepId == "step-2") {
            var found = true;
            var soluces = scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet());
            if(soluces !== undefined && soluces[0] !== undefined) {
                logger.info("Right responses   : " + JSON.stringify(soluces[0].responses));
                logger.info("Student responses : " + JSON.stringify(studentResp));
                // Analysing responses
                if (studentResp.hour != soluces[0].responses.hour) found = false;

                if(soluces[0].responses !== undefined) [
                    soluces[0].responses.continents.forEach(continentIdx => {
                        if (!studentResp.continents.includes(continentIdx)) {
                            found = false;
                            return false;
                        }
                    });

                    studentResp.continents.forEach(continentIdx => {
                        if (!soluces[0].responses.continents.includes(continentIdx)) {
                            found = false;
                            return false;
                        }
                    });
                }
                else {
                    found = false;
                }

                if (found) {
                    socks.emit('toclient.responseAnalysis', {result: "OK"});
                } else {
                    socks.emit('toclient.responseAnalysis',  {result: "KO"});
                }
            }
        }
    }

    return {

    }

};