/*--------------------------------------------------------------------------------------
	Utils functions to monitor system
--------------------------------------------------------------------------------------*/
module.exports = function(io, rfid, arduino, scenario, eventEmitter, logger) {
  logger.info(`Loading ${__filename}`);
  const conf = require("../config/config.js");
  // Socket definition for the monitoring
  // @TODO : Voir s'il ne faut pas définir le serveur de monitoring
  const monitorIO = io.of('/monitoring');

  // current values
  const _scenarioId = scenario.data().scenarioId;
  var _rfid = "";
  var _group = "";
  var _stepId = "";
  var _totalSteps = 0;
  var _solutions = null;
  var _solutionSet = 1;
  var _nextStep = "";

  // 
  // Event listener called at each Arduino Message
  //
  eventEmitter.on('newArduinoMsg', function(data){

  });

  // new rfid event
  eventEmitter.on('monitoring.newGameSession', function(data){
    _rfid = data.tag;
    _group = data.group;
    monitorIO.emit('toclient.newGameSession_' + _scenarioId, {code: data});
  });

  // New game step
  eventEmitter.on('monitoring.newGameStep', function(data){
    _stepId = data.stepId;
    _totalSteps = scenario.data().steps.length;
    monitorIO.emit('toclient.newGameStep' + _scenarioId, {stepId: _stepId, totalSteps: _totalSteps});
  });

  // Solutions for the new step
  eventEmitter.on('monitoring.solutionsForStep', function(data){
    _solutions = data.solutions;
    _nextStep = data.nextStep;
    monitorIO.emit('toclient.solutionsForStep' + _scenarioId, {solutions: _solutions, solutionSet: _solutionSet, nextStep: _nextStep});
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

      monitorIO.emit('toclient.newGameSession_' + _scenarioId, {tag: _rfid, group: _group});
      monitorIO.emit('toclient.newGameStep' + _scenarioId, {stepId: _stepId, totalSteps: _totalSteps});
      monitorIO.emit('toclient.solutionsForStep' + _scenarioId, {solutions: _solutions, solutionSet: _solutionSet});
    }, 1000);

  });

  return {

  };
};