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
    const _repeatArtNetEvent = 3;
    var _indxArtNetEvent = 0;

    var _lastTimeSaved = require('../data/last-time-saved.json');

    var _totalTime = global_config.container.gameMode[0].defaultTimer; // Temps de jeu total en sec. Par defaut, c'est le mode classe entière, donc 1200 secondes
    var _timeElapsed = 0;
    var _timeRemaining = 0;
    var _timeOut = null;
    var _gameMode = global_config.container.gameMode[0].name; // "classroom"; // Mode de jeu, par défaut classe entière : classroom / classical
    var _started = false;

    logger.info(`   l___ Game mode is '${_gameMode}'.`);
    logger.info(`   l___ Game time is ${_totalTime/60} minutes.`);

    //
    // Init du timer soit par des valeurs par défault soit par le fichier de sauvegarde.
    //
    function initCount() {
        var msg = "   l___ ";
        // TODO : Si le paramètre "_lastTimeSaved" == true dans le fichier data/last-time-saved.json,
        if(_lastTimeSaved.isSaved) {
            msg += "Timer was previously saved,";
            _totalTime = _lastTimeSaved.totalTime;
            _timeElapsed = _lastTimeSaved.timeElapsed;
            // TODO : Mettre le paramètre "isSaved" = false dans le fichier data/last-time-saved.json
            _lastTimeSaved.isSaved = false;
            saveTimer();
            // Calcule le temps restant
            _timeRemaining = _totalTime - _timeElapsed;
            logger.info(`${msg} ${_timeRemaining/60} minutes remaining.`);
            // Lance le compteur
            startCount();
        } else {
            msg += "Timer start from scratch,";
            _timeElapsed = 0;
            _timeRemaining = _totalTime - _timeElapsed;
            logger.info(`${msg} ${_timeRemaining/60} minutes remaining.`);
            logger.info("En attente du lancement du compteur");
        }
    }

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
        var colorSet = 1; // Classical Mode : fixed lights
        //---------------------------------------------------------------------------------------
        // ___________.__    .__                               __             ._.
        // \__    ___/|  |__ |__| ______   ________ __   ____ |  | __  ______ | |
        //   |    |   |  |  \|  |/  ___/  /  ___/  |  \_/ ___\|  |/ / /  ___/ | |
        //   |    |   |   Y  \  |\___ \   \___ \|  |  /\  \___|    <  \___ \   \|
        //   |____|   |___|  /__/____  > /____  >____/  \___  >__|_ \/____  >  __
        //                 \/        \/       \/            \/     \/     \/   \/        
        // No need to change colors !!!!!! This was made for nothing, thanks for the 5 days spent on that !
        // So no need to drive Artnet light with expensive stuff :(
        // No need of RGB PAr LEDs.
        //    
        // var halfTime = ( _timeElapsed == Math.round(_totalTime/2, 0) ); 
        // if (halfTime) {
        //         _indxArtNetEvent = 0;
        // }
        //---------------------------------------------------------------------------------------

        // if ( _started && ( ( _indxArtNetEvent < _repeatArtNetEvent) || halfTime ) ) {
            if ( _started && ( ( _indxArtNetEvent < _repeatArtNetEvent) ) ) {
                // Classroom Mode :  lights change at half time
            // if ( _gameMode == "classroom") {
            // colorSet = ( _timeElapsed >= _totalTime/2 ) ? 2 : 1;
            // }
            logger.info(`--> Send set of lights #${colorSet}...`);
            eventEmitter.emit('lights.setColors', { gameMode: _gameMode, set: colorSet });
                _indxArtNetEvent++;
        }
    }

    //
    // Timer Start function
    //
    function startCount() {
        logger.info("Lancement du compteur !");
        // // TODO : Si le paramètre "_lastTimeSaved" == true dans le fichier data/last-time-saved.json,
        // if(_lastTimeSaved.isSaved) {
        //     _totalTime = _lastTimeSaved.totalTime;
        //     _timeElapsed = _lastTimeSaved.timeElapsed;
        //     // TODO : Mettre le paramètre "isSaved" = false dans le fichier data/last-time-saved.json
        //     _lastTimeSaved.isSaved = false;
        //     saveTimer();
        // }
        // Compte
        count();
    }

    function count() {
        _timeRemaining = _totalTime - _timeElapsed;
        if (_timeRemaining >= 0) {
            // Send a tick to timer
            timerIO.emit('toclient.timerTick', {minutes: getMin(_timeRemaining), seconds: getSec(_timeRemaining)});
            // send event to server... to inform others modules such as... lights
            driveLights();
            _timeElapsed++;
            _timeOut = setTimeout( function() {
                count();
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
	_indxArtNetEvent = 0;
        _started = false;
    }

    function resetCount() {
        logger.info(`Reseting timer for game mode '${_gameMode}'.`);
        // Arrête le compteur
        stopCount();
        // initCount();
        // TODO : Mettre le paramètre "isSaved" = false dans le fichier data/last-time-saved.json
        _lastTimeSaved.isSaved = false;
        saveTimer();
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
// Server events
// 
// Controlling timer
eventEmitter.on('toserver.killTimer', function(data) {
    logger.info(`On vient de killer le serveur qui héberge le timer...`);
    // TODO : Sauvegarde "isSaved" = true de data/last-time-saved.json
    _lastTimeSaved.isSaved = true;
    // TODO : Sauvegarde le _totalTime dans le "totalTime" de data/last-time-saved.json
    _lastTimeSaved.totalTime = _totalTime;
    // TODO : Sauvegarde le _timeElapsed dans le "timeElapsed" de data/last-time-saved.json
    _lastTimeSaved.timeElapsed = _timeElapsed;
    // Enregistre le timer
    saveTimer();
})


  
//
// Socket for monitoring page
//
timerIO.on('connection', function(sock){
    // Init timer page at connection
    setTimeout(function() {
        logger.info(`Min.: ${getMin(_timeRemaining)}`);
        logger.info(`Sec.: ${getSec(_timeRemaining)}`);
        sock.emit('toclient.timerTick', {minutes: getMin(_timeRemaining), seconds: getSec(_timeRemaining)});
        sock.emit('toclient.gameMode', {gameMode: _gameMode});
    }, 1000);

    function saveTimer() {
        var json = JSON.stringify(_lastTimeSaved, 2);
        logger.info("SAVE TIMER");
        var fs = require('fs');
        fs.writeFile('data/last-time-saved.json', json, 'utf8', function(err) {
          if (err) {
              logger.info('ERREUR - Fichier temps pas écrit', err)
              // sock.emit('toserver.killFFAndKillNodeJS', {});
          } else {
              logger.info('SUCCES - Fichier temps bien enregistré')
              // sock.emit('toserver.killFFAndKillNodeJS', {});
          }
        });
    }

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

    // Setting timer from Monitoring IHM
    sock.on('toserver.setTimer', function(data) {
        _totalTime = data.time;
        // Informing others that time has changed.
        resetCount();
    });


  });
  
    initCount();

    return {
  
    };
  };
