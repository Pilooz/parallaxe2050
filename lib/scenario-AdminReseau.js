/**
 *   scenario-adminReseau.js
 *  Librairie des fonctions et traitement spécifique au scénario Admin Réseau
 * 
 */
module.exports = function(io, rfid, arduino1, arduino2, scenario, eventEmitter, logger) {
    logger.info(`Loading ${__filename}`);
 
    var soluceServeurAllie = {};

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

        socket.on('toserver.responseAnalysis', function(data) {    
            soluceServeurAllie = data;
            // 1. Interroger le patch-panel pour savoir si la route vers le serveur allié est connecté
            arduino1.sendMessage("CMD","CONNECTIONS");
        });
    });

    //
    // Treat incomming messagesfrom arduino
    //
    function treat_message(msg) {
        logger.info(`Treating commande: key=${msg.key}, val=${msg.val}`);
        if (msg.key == "MSG" && msg.val == "READY") {
            arduino1.setArduinnoReady();
        }

        // Response to <CMD:CONNECTIONS/> message
        if (msg.key == "CONNECTIONS") {
            var status = ((analizeSolution(msg.val)) ? "OK" : "KO");
            io.emit('toclient.responseAnalysis', {result: status, ip: soluceServeurAllie.serveurAllie.ip});
        }
    }

    //
    // Analyzes solution, and return true/fase if it's right/wrong
    //
    function analizeSolution(val) {
        // Splitter le tableau du patch-panel en fonction du serveur allié envoyé par le client web
        // En effet le client a renvoyé la solution du ping recherché dans la variable "soluceServeurAllie"
        // Les élèves sont censés câbler les serveurs alliés un par un.
        // On obtient donc un tableau issu de l'arduino
        // [ '01', '06', 'A01', '08', '07', '09', 'A02' ]
        // On doit donc couper ce tableau entre 2 serveur allié ou au premier serveur allié
        var responses = JSON.parse(val);
        var servAllie = "";
        var idxServAllie, autreAllie;
        var goodResponses = [];
        if (soluceServeurAllie.serveurAllie.chemin1) {
            servAllie = "A01"; 
            autreAllie =  "A02";
            goodResponses = soluceServeurAllie.serveurAllie.chemin1;
        } else {
            servAllie = "A02";
            autreAllie =  "A01";
            goodResponses = soluceServeurAllie.serveurAllie.chemin2;
        }

        idxServAllie = responses.indexOf(servAllie);  
        // Le chemin ne va pas jusqu'à l'allié, ca ne va pas du tout !
        if (idxServAllie < 0) return false;

        logger.info(`servAllie=${servAllie}`);
        logger.info(`autreAllie=${autreAllie}`);

        // On prépare le chemin à tester.
        var noeudsATester = [];
        var found = false;
        var soluceTrouvee = true;
        responses.forEach((noeud, index) => {
            logger.info('--------------------------------');
            logger.info(`${index} : noeud=${noeud}`);
            if (!found) {
                if (noeud == servAllie ) {
                    if (index == 0) {
                        // Le premier est l'allié : pas de connxion directe, pas valide !
                        soluceTrouvee = false;
                    } else {
                        found = true;
                    }
                } else {
                    // L'allié n'est pas le premier, donc tout ce qui est avant, c'est LE chemin à tester
                    if (noeud == autreAllie) {
                        // Ici c'était le chemin vers l'autre allié, 
                        // pas celui qu'on teste dont on efface tout le tableau noeudsATester
                        noeudsATester = [];
                    } else {
                        noeudsATester.push(parseInt(noeud));
                    }
                }
            }
        });

        logger.info(`Réponses attendues : ${goodResponses}`);
        logger.info(`noeudsATester : ${noeudsATester}`);

        // Tester que tous les noeuds fournis font partie des réponse attendues
        noeudsATester.forEach(noeud => {
            noeud = parseInt(noeud);
            // Si il y en a ne serait-ce qu'un qui est faux, ma parole....
            if (!goodResponses.includes(noeud)) {
                logger.info(`Le noeud ${noeud} n'e devrait pas présent.`);
                soluceTrouvee = false;
            }
        });

        // Tester que toutes les réponses attendues sont présentes dans les noeuds fournis
        goodResponses.forEach(rep => {
            if (!noeudsATester.includes(rep)) {
                logger.info("Le noeud "+ rep + " était attendu dans les réponses.");
                soluceTrouvee = false;
            }            
        });
        logger.info(`soluceTrouvee ? ${soluceTrouvee}`);

        // Décrocher les câbles si c'est faux
        if (!soluceTrouvee) arduino1.sendMessage("CMD","RELEASE");
        return soluceTrouvee;       
    }

    return {

    }

};