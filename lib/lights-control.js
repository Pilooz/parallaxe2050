/*
Librairie de gestion des lumières en Artnet / DMX

2 modes : 
    - "classeroom" : Chaque activité est allumée par une couleur différente pendant 10 min
                     ensuite les couleurs changent pour les 10 min suivantes.
                     Temps total : 20 min

    - "showroom"    : Mode évenementiel pendant lequel chaque activité est allumée 
                     par une couleur différente pendant 40 min

*/


/*--------------------------------------------------------------------------------------
	controlling Ligths
--------------------------------------------------------------------------------------*/
module.exports = function(global_config, io, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);

    logger.info(`   l___ Loading Artnet Lib`);
    const artnet = require('artnet')(global_config.artnet);

    // Socket definition for the monitoring
    const lightsIO = io.of('/lights');
  
    // Loading the lights color definitions.
    const DATA_LIGHTS = require('../data/lights.json');
    const _colorsSet1 = DATA_LIGHTS.colorsSet[0].list;
    const _colorsSet2 = DATA_LIGHTS.colorsSet[1].list;

    logger.info(`   l___ ${DATA_LIGHTS.colorsSet.length} sets of lights definitions`);
    logger.info(`   l___ ${_colorsSet1.length} colors in colorSet1.`);
    logger.info(`   l___ ${_colorsSet2.length} colors in colorSet2.`);

    var _gameMode = "classroom";
    
    //
    // Init socket connection.
    //
    lightsIO.on('connection', function(sock) {
        looger.info("Sending colorsSet #1 to clients.");
        sock.emit("toclient.setColors", { gameMode: _gameMode, set: _colorsSet1 } );
    });
    
    //
    // Swapping color Sets
    //
    function chooseColorsSet(set) {
        return ( set == 1) ?  _colorsSet1 : _colorsSet2; 
    }

    // ----------------------------------------------------------------
    // Listener sur l'evenement de changement de couleurs des lights
    // ----------------------------------------------------------------
    // En mode "classroom", Le groupe/sous-groupe et le set de solution définit 
    // l'ordre de passage dans le container donc l'ordre d'enchainement des lumières
    // Tout le groupe "A"
    // En mode "event", lumières fixes ?
    // Bla bla bla ....
    // En fait, dans tous les modes de jeu on change toutes les 10 min.

    // Mapping des differents rgb pour tout envoyer d'un coup au controleur lumière.
    // AdminReseau : sur channels 1, 2, 3
    // BDD         : sur channels 4, 5, 6
    // CodeEtProg  : sur channels 7, 8, 9
    // ComDigitale : sur channels 10, 1, 12
    // Hardware    : sur channels 13, 14, 15

    // Si on envoie tout en tableau à partir du canal 1, ça doit le faire.
    // Par contre il faut que les PARs LEDs soient chainés les un aux autres en DMX OUT -> DMX IN
    // le premier étant branché sur le canal 1 du contrôleur.


    // ----------------------------------------------------------------
    eventEmitter.on('lights.setColors', function(data){
        _gameMode = data.gameMode;
        var colorsSet = chooseColorsSet(data.set);

        var bigTableau = [];
        var canal = 1;
        colorsSet.forEach(function(c) { bigTableau.push(c.rgb) });
        bigTableau = [].concat.apply([], bigTableau);

        // Sending Arnet infos
        artnet.set(1, bigTableau, function (err, res) {
            logger.info(`Artnet Result : ${res}`);
            if (err) {
                logger.error(`Artnet Error : ${err}`);
                artnet.close();
            }
        });

 	// Send to all browsers that they have to change color.  
	lightsIO.emit("toclient.setColors", { gameMode: _gameMode, set: colorsSet } );

    });

    return {
  
    };
  };
