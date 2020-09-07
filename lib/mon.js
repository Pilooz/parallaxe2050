/*--------------------------------------------------------------------------------------
	Utils functions to monitor system
--------------------------------------------------------------------------------------*/
module.exports = function(io, scenario, eventEmitter, logger) {
  logger.info(`Loading ${__filename}`);
  const conf = require("../config/config.js");
  // Socket definition for the monitoring
  const monitorIO = io.of('/monitoring');

  // Get the color for lighting sequences
  const DATA_LIGHTS = require('../data/lights.json');

  // current values
  const _scenarioId = scenario.data().scenarioId;
  const _colorsSet1 = DATA_LIGHTS.colorsSet[0].list;
  const _colorsSet2 = DATA_LIGHTS.colorsSet[1].list;
  var _rfid = "";
  var _group = "";
  var _startTime = null;
  var _stepId = "";
  var _totalSteps = 0;
  var _solutions = null;
  var _solutionSet = 1;
  var _nextStep = "";

  // 
  // Event listener called at each Arduino Message
  //
  eventEmitter.on('newArduinoMsg', function(data){
      // Here we can count all messages from all arduinos ?
  });

  // new rfid event and emit to Monitoring client
  eventEmitter.on('monitoring.newGameSession', function(data){
    _rfid = data.tag;
    _group = data.group;
    _startTime = data.startTime;
    monitorIO.emit('toclient.newGameSession_' + _scenarioId, {tag: _rfid, group: _group, startTime: _startTime});
  });

  // Set New game step and emit to Monitoring client
  eventEmitter.on('monitoring.newGameStep', function(data){
    _stepId = data.stepId;
    _totalSteps = scenario.data().steps.length;
    monitorIO.emit('toclient.newGameStep_' + _scenarioId, {stepId: _stepId, totalSteps: _totalSteps});
  });

  // Set Solutions for the new step and emit to Monitoring client
  eventEmitter.on('monitoring.solutionsForStep', function(data){
    _solutions = data.solutions;
    _solutionSet = data.set;
    _nextStep = data.nextStep;
    monitorIO.emit('toclient.solutionsForStep_' + _scenarioId, {solutions: _solutions, solutionSet: _solutionSet, nextStep: _nextStep});
  });

  // Set colorSet and emit to Monitoring client
  eventEmitter.on('monitoring.colorsSets', function(data){
    var _colorSet = (data.set == 1) ? _colorsSet1 : _colorsSet2;
    // The colorSet is changed by timer Events
    //monitorIO.emit('toclient.colorsSets_' + _scenarioId, {colorsSet: _colorSet});
  });

  // Transfert Light event from timer to monitoring page
  eventEmitter.on('lights.setColors', function(data) {
    var _colorSet = (data.set == 1) ? _colorsSet1 : _colorsSet2;
    monitorIO.emit('toclient.colorsSets_' + _scenarioId, {colorsSet: _colorSet});
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

      monitorIO.emit('toclient.newGameSession_' + _scenarioId, {tag: _rfid, group: _group, startTime: _startTime});
      monitorIO.emit('toclient.newGameStep_' + _scenarioId, {stepId: _stepId, totalSteps: _totalSteps});
      monitorIO.emit('toclient.solutionsForStep_' + _scenarioId, {solutions: _solutions, solutionSet: _solutionSet});
      monitorIO.emit('toclient.colorsSets_' + _scenarioId, {colorsSet: _colorsSet1});
    }, 1000);

  });

  return {

  };
};