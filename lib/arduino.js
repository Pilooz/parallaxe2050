const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

/*--------------------------------------------------------------------------------------
	Arduino communications functions
--------------------------------------------------------------------------------------*/
module.exports = function(global_config, eventEmitter){
    console.log(`Loading ${__filename}`);

    var arduinoReady = false;
    var currentMessage = { key: "", val: "" };
  
    // Init a new port
    const arduinoPort = new SerialPort(global_config.arduino.portName, {
      autoOpen: true,
      baudRate: global_config.arduino.baudRate
    });

    // Parser definiton
    const parser = arduinoPort.pipe(new Readline({ delimiter: '\n' }));
  
    // Parsing Message data
    parser.on('data', function(msg){
        console.log(`Received message from Arduino : ${msg}`);
        parseMessage(msg);
        // Spread over the world that we have an incomming message !
        eventEmitter.emit('newArduinoMsg', currentMessage);
    });
  
    // Opening serial port, checking for errors
    arduinoPort.open(function (err) {
      if (err) {
        return console.log('Error opening port: ', err.message);
      } else {
        console.log('Reading on ', global_config.arduino.portName);
      }
    });

    // When Serial port is effectively opened
    arduinoPort.on('open',function() {
      console.log('Serial Port ' + global_config.arduino.portName + ' is opened.');
    });

    //
    // Parsing incomming message to populate local object 'currentMessage'
    // Verifying that message is syntaxically corret.
    //
    function parseMessage(msg) {
      var parseResults = msg.match(/^<([A-Za-z0-9]+):([A-Za-z0-9{}':,-_&!()#" ]+)\/>/);
      if (parseResults == null) {
        console.log("Error matching message from Arduino " + msg + " is not a valide message !");
      } else {
        // The message is valid !
        currentMessage.key = parseResults[1];
        currentMessage.val = parseResults[2];
      }
    }

    //
    // Set a blank message in 'currentMessage'
    //
    function setMessageToBlank() {
      currentMessage = { key: "", val: "" };
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
      console.log("Arduino READY !");
      arduinoReady = true;
      setMessageToBlank();
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
      messageIs: messageIs
    };

  };