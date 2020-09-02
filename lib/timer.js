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
module.exports = function(global_config, io, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    // Socket definition for the monitoring
    const timerIO = io.of('/timercontrol');
    const INTERVALL = global_config.container.second;  // Interval of setTimeout, compensed by execution time

    var _totalTime = global_config.container.gameMode[0].defaultTimer; // Temps de jeu total en sec. Par defaut, c'est le mode classe entière, donc 1200 secondes
    var _timeElapsed = 0;
    var _timeRemaining = 0;
    var _timeOut = null;
    var _gameMode = global_config.container.gameMode[0].name; // "classroom"; // Mode de jeu, par défaut classe entière : classroom / classical
    var _started = false;

    logger.info(`   l___ Game mode is '${_gameMode}'.`);
    logger.info(`   l___ Game time is ${_totalTime/60} minutes.`);

    // 
    // Transform function
    //
    function getMin(t) {
        return Math.floor(t / 60);
    }

    function getSec(t) {
        return Math.round((((t / 60) % 1).toFixed(2)) * 60);
    }

    //
    //  driving lights
    //
    function driveLights() {
        if (_gameMode == "classroom" && _started) {
            // Send first set 10 time at timer's start
            if (_timeElapsed <= 10) { 
                logger.info("----- Send first set of ligths....");
                eventEmitter.emit('lights.setColors', {gameMode: _gameMode, set: 1});
            }
            if (_timeElapsed >= _totalTime/2 && _timeElapsed  < _totalTime/2 + 10 ) {
                logger.info("----- Send second set of ligths....");
                eventEmitter.emit('lights.setColors', {gameMode: _gameMode, set: 2});
            }
        } else {
            // Just send 10 times lights infos at timer start
            if (_timeElapsed <= 10) { 
                logger.info("----- Send first set of ligths....");  
                eventEmitter.emit('lights.setColors', {gameMode: _gameMode, set: 1});
            }
        }
    }
    //
    // Timer Start function
    //
    function startCount() {
            _timeRemaining = _totalTime - _timeElapsed;
            if (_timeRemaining >= 0) {
                // Send a tick to timer
                timerIO.emit('toclient.timerTick', {minutes: getMin(_timeRemaining), seconds: getSec(_timeRemaining)});
                // send event to server... to inform others modules such as... lights
                driveLights();
                _timeElapsed++;
                _timeOut = setTimeout( function() {
                    startCount();
                } , INTERVALL);
            } else {
                // Time is running oouuuuut, gosh keeping me alive...
                stopCount();
            }
    }

    //
    // Timer Stop function
    //
    function stopCount() {
        logger.info(`Stop timer for game mode '${_gameMode}'.`);
        clearTimeout(_timeOut);
        _started = false;
    }

    function resetCount() {
        logger.info(`Reseting timer for game mode '${_gameMode}'.`);
        stopCount();
        _timeElapsed = 0;
        _timeRemaining = 0;
        timerIO.emit('toclient.timerTick', {minutes: getMin(_totalTime), seconds: getSec(_totalTime)});
    }

    function setGameModeAndCount() {
        logger.info(`Setting the game mode to '${_gameMode}'.`);
        if (_gameMode == "classroom") {
            _totalTime = global_config.container.gameMode[0].defaultTimer;
        } else {
            _totalTime = global_config.container.gameMode[1].defaultTimer;
        }
        logger.info(`Game time is now '${_totalTime/60}' minutes.`);
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
    setTimeout(function() {
        sock.emit('toclient.timerTick', {minutes: getMin(_totalTime), seconds: getSec(_totalTime)});
        sock.emit('toclient.gameMode', {gameMode: _gameMode});
    }, 1000);

    //
    // Controlling timer : start / stop / pause / reset
    //
    sock.on('toserver.timerControl', function(data){
        _gameMode = data.gameMode;

        switch (data.action) {
            case "start": 
                if (!_started) { 
                    logger.info(`Starting timer for game mode '${_gameMode}'.`);
                    startCount();
                    _started = true;
                }
                break;
        
            case "stop":
                stopCount();
                break;
        
            case "reset":
                resetCount();
                break;
        
            case "set":
                setGameModeAndCount();
                resetCount();
                break;
        
                default:
                break;
        }
     
    });

    // // Setting timer from Monitoring IHM
    // sock.on('toserver.setTimer', function(data) {
    //     _totalTime = data.time;
    //     // Informing others that time has changed.
    //     resetCount();
    // });


  });
  
    return {
  
    };
  };