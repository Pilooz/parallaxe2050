/*
Librairie de gestion du timer de jeu.
Cette lib est chargée uniquement par le serveur censé héberger l'administration du système.

Le timer est déclenché manuellement, car on fait le choix de décoreller l'authentification RFID qui démarre chaque activité du start du timer.
Il faut gérer les 2 modes de jeu (Classe entière = 2 x 10 min, et Evenementiel = 40 min de jeu)

Pilotage des lumières
Dans le mode de jeu "Classe entière", le timer doit piloter les lumières en leur envoyant un évènement au bout de 10 minutes de jeu.
Dans le mode "Evenementiel", pas d'évenement de chagement de couleur (?? A valider)

*/
/*--------------------------------------------------------------------------------------
	Utils functions to monitor system
--------------------------------------------------------------------------------------*/
module.exports = function(io, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    // Socket definition for the monitoring
    const timerIO = io.of('/timercontrol');

    var _totalTime = 1200;  // Temps de jeu total en sec. Par defaut, c'est le mode classe entière
    var _timeElapsed = 0;
    var _timeRemaining = 0;
    var _timeOut = null;
    var _gameMode = "classroom"; // Mode de jeu, par défaut classe entière : classroom / event

    function startCount(sock) {
        _timeOut = setTimeout( function() {
            _timeElapsed++;
            _timeRemaining = _timeElapsed - _timeElapsed;
            sock.emit('toclient.timercontrol', {totalTime: _totalTime, timeRemaining: _timeRemaining});
        } , 1000);
    }

    //
    // Communication by socket with client
    // Server side validation of solutions
    //
    io.on('connection', function(socket) {
  
    });
  
//
// Socket for monitoring page
//
timerIO.on('connection', function(sock){
    // Init timer page at connection
    // setTimeout( function() {
    //     sock.emit('toclient.setTimerValues', { duration: _totalTime, gameMode: _gameMode });
    // }, 1000);

    sock.on('toserver.timercontrol', function(data){
        _gameMode = data.gameMode;

        switch (data.action) {
            case "start": 
                logger.info(`Starting timer for game mode '${_gameMode}'.`);
                startCount(sock);
                // lights
                eventEmitter.emit('lights.setFirstColor', {gameMode: _gameMode});
                // TimerPage
                //sock.emit('toclient.timercontrol', {action: action, gameMode: _gameMode});
                break;
        
            case "stop":
                logger.info(`Stop timer for game mode '${_gameMode}'.`);
                break;
    
            case "pause":
                logger.info(`Pausing timer for game mode '${_gameMode}'.`);
                break;
        
            case "reset":
                logger.info(`Reseting timer for game mode '${_gameMode}'.`);
                break;
        
            default:
                break;
        }
     
    });

  });
  
    return {
  
    };
  };