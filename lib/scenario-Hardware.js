/**
 *   scenario-Hardware.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */

module.exports = function(io) {
    console.log(`Loading ${__filename}`);

    //
    // Communication by socket with client
    // Server side validation of solutions
    //
    io.on('connection', function(socket) {
        socket.on('test', function(data){
            console.log(socket.id);
            console.log(data);
        })

    });
};