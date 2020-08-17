/**
 *   scenario-BDD.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */
module.exports = function(io, rfid, arduino, scenario, eventEmitter) {
    console.log(`Loading ${__filename}`);
 
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

    });

    //
    // Treat incomming messagesfrom arduino
    //
    function handle_solution(studentResp) {
        console.log(studentResp);
        var found = true;
        var soluces = scenario.getCurrentStep().solutions.filter(s => s.set == scenario.getSolutionsSet());
        console.log(soluces[0].responses);
        // Analysing responses
        // return (Object(studentResp, soluces[0].responses));
        // return (studentResp === soluces[0].responses);
        if (studentResp.hour != soluces[0].responses.hour) found = false;

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

        if (found) {
            io.emit('toclient.responseAnalysis', {result: "OK"});
        } else {
            io.emit('toclient.responseAnalysis',  {result: "KO"});
        }
    }

    return {

    }

};