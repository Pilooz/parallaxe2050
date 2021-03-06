const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

/*--------------------------------------------------------------------------------------
	Arduino communications functions
--------------------------------------------------------------------------------------*/
module.exports = function(arduino, logger, eventEmitter, index){
    logger.info(`Loading ${__filename}`);

    // Init a new port
    var arduinoPort = new SerialPort(arduino.portName, {
      autoOpen: true,
      baudRate: arduino.baudRate
    });
    
    const _portNb = index; // arduino.portName.match(/[0-9]/);
    const _portName = arduino.portName;

    var arduinoReady = false;
    var currentMessage = { key: "", val: "", name: "", portNb: _portNb, portName: _portName}; //
  
    // Parser definiton
    var parser = arduinoPort.pipe(new Readline({ delimiter: '\n' }));
  
    // Parsing Message data
    parser.on('data', function(msg){
	if (parseMessage(msg)) {
          // Before emitting any message, we have to deal with unique name
          if (currentMessage.key == "NAME") {
            currentMessage.name = currentMessage.val;
            logger.info(`---------- '${currentMessage.name}' is on port '${arduino.portName}' ----------`);
          }
          // Spread over the world that we have an incomming message !
          eventEmitter.emit('newArduinoMsg', currentMessage);
        } 
        // else, the message is ignored because it has incorrect syntax
    });
  
    // Opening serial port, checking for errors
    arduinoPort.open(function (err) {
      if (err) {
        return logger.error('Error opening port: ', err.message);
      } else {
        logger.info('Reading on ', arduino.portName);
      }
    });

    // When Serial port is effectively opened
    arduinoPort.on('open',function() {
      logger.info('Serial Port ' + arduino.portName + ' is opened.');
    });

    //
    // Parsing incomming message to populate local object 'currentMessage'
    // Verifying that message is syntaxically corret.
    //
    function parseMessage(msg) {
      var parseResults = msg.match(/^<([A-Za-z0-9]+):([A-Za-z0-9{}':,-_&!()#" ]+)\/>/);
      if (parseResults == null) {
        logger.warn("Matching message from Arduino " + msg + " is not a valide message !");
        return  false;
      } 
      // The message is valid !
      currentMessage.key = parseResults[1];
      currentMessage.val = parseResults[2];
      return true;
    }

    //
    // Set a blank message in 'currentMessage'
    //
    function setMessageToBlank() {
      currentMessage.key =  "";
      currentMessage.val = "";
    }

    //
    // getter on arduinoReady
    //
    function isArduinoReady() {
      return arduinoReady;
    }

    //
    // setter arduinoReady
    //
    function setArduinnoReady() {
      arduinoReady = true;
      setMessageToBlank();
    }
    
    //
    // Getter for portNb
    //
    function getPortNb() {
    	return _portNb;
    }
    
    //
    // Getter for name
    //
    function getName() {
      return currentMessage.name;
    }

    //
    // Sending a message to arduino
    //
    function sendMessage(k, v){
      // Flush data on serial beafore sending something
      arduinoPort.flush(function(err,results){
        if(err) {
            logger.error(`Error flushing SerialPort ${arduino.portName}. ${err}`);
            eventEmitter.emit('newArduinoMsg', { key: "MSG", val: "KO"});
          }
      });
      logger.info(`Sending ${k} : ${v} to ${currentMessage.name}`);
      arduinoPort.write("<"+k+":"+v+"/>\n", "ascii");
      arduinoPort.flush(function(err,results){
        if(err) {
          logger.error(`Error flushing SerialPort ${arduino.portName}. ${err}`);
          eventEmitter.emit('newArduinoMsg', { key: "MSG", val: "KO"});
          }
      });
    }

    //
    // writing utility
    //
    function messageIs(k, v) {
      return (currentMessage.key == k && currentMessage.val == v);
    }
  
    return {
      isArduinoReady: isArduinoReady,
      setArduinnoReady: setArduinnoReady,
      sendMessage: sendMessage,
      messageIs: messageIs,
      getPortNb: getPortNb,
      getName: getName
    };

  };
