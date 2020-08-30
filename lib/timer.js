/*
Librairie de gestion du timer de jeu.
Cette lib est chargée uniquement par le serveur censé héberger l'administration du système.

Le timer est déclenché manuellement, car on fait le choix de décoreller l'authentification RFID qui démarre chaque activité du start du timer.
Il faut gérer les 2 modes de jeu (Classe entière = 2 x 10 min, et Evenementiel = 40 min de jeu)

Pilotage des lumières
Dans le mode de jeu "Classe entière", le timer doit piloter les lumières en leur envoyant un évènement au bout de 10 minutes de jeu.
Dans le mode "Evenementiel", pas d'évenement de chagement de couleur (?? A valider)

*/

const { substr, substring } = require("../config/config");

/*--------------------------------------------------------------------------------------
	Utils functions to monitor system
--------------------------------------------------------------------------------------*/
module.exports = function(io, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    // Socket definition for the monitoring
    const timerIO = io.of('/timercontrol');
    const INTERVALL = 980;  // Interval of setTimeout, compensed by execution time

    var _totalTime = 10;  // Temps de jeu total en sec. Par defaut, c'est le mode classe entière
    var _timeElapsed = 0;
    var _timeRemaining = 0;
    var _timeOut = null;
    var _gameMode = "classroom"; // Mode de jeu, par défaut classe entière : classroom / event
    var _started = false;

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
        // eventEmitter.emit('lights.setColors', {gameMode: _gameMode, set: "1"});

        if (_gameMode == "classroom") {
            if (_timeElapsed <= 1) {
                console.log("----- Emission du premier event lumière....");
                eventEmitter.emit('lights.setColors', {gameMode: _gameMode, set: 1});
            }
            if (_timeElapsed >= 5) {
                console.log("----- Emission du deuxieme event lumière....");
                eventEmitter.emit('lights.setColors', {gameMode: _gameMode, set: 2});
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
                logger.info(_timeElapsed);
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
        clearTimeout(_timeOut);
        _started = false;
    }

    function resetCount() {
        stopCount();
        _timeElapsed = 0;
        _timeRemaining = 0;
        timerIO.emit('toclient.timerTick', {minutes: getMin(_totalTime), seconds: getSec(_totalTime)});
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
    }, 1000);

    //
    // Controlling timer : start / stop / pause / reset
    //
    sock.on('toserver.timerControl', function(data){
        _gameMode = data.gameMode;

        switch (data.action) {
            case "start": 
                logger.info(`Starting timer for game mode '${_gameMode}'.`);
                if (!_started) { 
                    startCount();
                    _started = true;
                }
                // lights
                eventEmitter.emit('lights.setColors', {gameMode: _gameMode});
                break;
        
            case "stop":
                logger.info(`Stop timer for game mode '${_gameMode}'.`);
                stopCount();
                break;
        
            case "reset":
                logger.info(`Reseting timer for game mode '${_gameMode}'.`);
                resetCount();
                break;
        
            default:
                break;
        }
     
    });

  });
  
    return {
  
    };
  };