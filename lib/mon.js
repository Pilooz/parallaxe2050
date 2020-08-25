/*--------------------------------------------------------------------------------------
	Utils functions to monitor system
--------------------------------------------------------------------------------------*/
module.exports = function(io, rfid, arduino, scenario, eventEmitter, logger) {
  logger.info(`Loading ${__filename}`);
  const conf = require("../config/config.js");
  const scenarioId = scenario.data().scenarioId;

  // Socket definition for the monitoring
  // @TODO : Voir s'il ne faut pas définir le serveur de monitoring
  const monitorIO = io.of('/monitoring');

  // current values
  var _rfid = "";
  var _group = "";
  // 
  // Event listener called at each Arduino Message
  //
  eventEmitter.on('newArduinoMsg', function(data){

  });

  // new rfid event
  eventEmitter.on('monitoring.newGameSession', function(data){
    _rfid = data.tag;
    _group = data.group;
    monitorIO.emit('toclient.newGameSession', {code: data});
  });

  //
  // Communication by socket with client
  // Server side validation of solutions
  //
  io.on('connection', function(socket) {

  });

  //
  // Socket for monitoring page
  //
  monitorIO.on('connection', function(sock){
    logger.info("Monitoring page is connected ! Sending monitoring data in a few seconds...");

    setTimeout( function() {

      monitorIO.emit('toclient.newGameSession_' + scenarioId, {tag: _rfid, group: _group});
    }, 2000);

  });

  return {

  };
};