const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

/*--------------------------------------------------------------------------------------
	Arduino communications functions
--------------------------------------------------------------------------------------*/
module.exports = function(arduino, logger, eventEmitter){
    logger.info(`Loading ${__filename}`);

    // Init a new port
    const arduinoPort = new SerialPort(arduino.portName, {
      autoOpen: true,
      baudRate: arduino.baudRate
    });
    
    const _portNb = arduino.portName.match(/[0-9]/);

    var arduinoReady = false;
    var currentMessage = { key: "", val: "", portNb: _portNb };
  
    // Parser definiton
    const parser = arduinoPort.pipe(new Readline({ delimiter: '\n' }));
  
    // Parsing Message data
    parser.on('data', function(msg){
	if (parseMessage(msg)) {
          // Spread over the world that we have an incomming message !
          logger.info(`Emitting a new event 'newArduinoMsg'.`);
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
      currentMessage = { key: "", val: "", portNb: _portNb };
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
      logger.info("Arduino READY !");
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
    // Sending a message to arduino
    //
    function sendMessage(k, v){
      arduinoPort.write("<"+k+":"+v+"/>\n", "ascii");
    }

    //
    // writing utility
    //
    function messageIs(k, v) {
      return (currentMessage.key == v && currentMessage.val == v);
    }
  
    return {
      isArduinoReady: isArduinoReady,
      setArduinnoReady: setArduinnoReady,
      sendMessage: sendMessage,
      messageIs: messageIs,
      getPortNb: getPortNb
    };

  };
