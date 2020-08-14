/*--------------------------------------------------------------------------------------
	Utils functions to drive the Ableton Lauchpad via Midi protocol
--------------------------------------------------------------------------------------*/
const midi = require('midi');

module.exports = function(global_config){
  console.log(`Loading ${__filename}`);

  // Set up a new input.
  const input = new midi.Input();
  // Set up a new output.
  const output = new midi.Output();

  var midiPort = getPort();

  const launchpadButtonStatus = 144;
  const launchpadFunctionStatus = 176;
  const green = 122;
  const red = 120;
  const black = 0;
  // The array of each square pad state (green/red)
  var padStates = [];

// 
// Listening on incomming messages.
//
input.on('message', (deltaTime, message) => {
  // The message is an array of numbers corresponding to the MIDI bytes:
  //   [status, data1, data2]
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
  // information interpreting the messages.
  if (message[0] == launchpadButtonStatus && message[2] == 127) { // It is a noteOn message
    togglePad(message[1]);
  }

  if (message[0] == launchpadFunctionStatus && message[1] == 111 && message[2] == 127) { // It is a noteOn message
    init();
  }
});

//
// Getter on the Launchepad data
//
function getStates() {
  return padStates;
}


// 
// Select the right USB port automatically.
//
function getPort() {
    var i, portName, _i, _ref;
    var port = -1;
    for (i = _i = 0, _ref = output.getPortCount(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      portName = output.getPortName(i);
      console.log("Port " + i + ": " + portName);
      if (/^Launchpad(:\d+)?/.test(portName)) {
        port = i;
        break;
      }
    }
    if (port === -1) {
      // throw "Error : The Launchpad was not detected";
      console.log("Warning : The Launchpad was not detected.");
    }
    return port;
  }

  //
  // Clear all color on the launchpad;
  //
  /********
    Pads carrés : 
        - ligne d'en bas : 11-18
        - ligne d'en bas : 81-88
    Boutons de fonction : 
        - droite : [1-8]9
        - haut : 104 - 111
  */
function clear(color) {
  // tout à noir
  for (var x = 11; x < 90; x++) {
      output.sendMessage([launchpadButtonStatus, x, color]);
  }
  for (var x = 104; x < 112; x++) {
      output.sendMessage([launchpadFunctionStatus, x, color]);
  }
}

//
// Init lauchpad at startup
//
function init() {
  clear(black);
  for (var x = 1; x < 9; x++) {
      for (var y = 1; y < 9; y++) {
          var indx = 10*y + x;
          output.sendMessage([launchpadButtonStatus, indx, red]);
          padStates.push( { indx: indx, color: red} );
      }
  }
}

//
// Toogle Green / red values on a pad
//
function togglePad (idx) {
  padStates.forEach(p => {
      if (p.indx == idx) {
          if (p.color == green ) p.color = red;
          else p.color = green;
          output.sendMessage([launchpadButtonStatus, p.indx, p.color]);
          return false;
      }
  });
}

if (midiPort > -1) {
  // Open the first available input port.
  input.openPort(midiPort);
  // Open the first available output port.
  output.openPort(midiPort);
  // Sysex, timing, and active sensing messages are ignored
  input.ignoreTypes(false, false, false);
}
// init laucnchpad
init();

  return {
    init: init,
    togglePad: togglePad,
    getStates: getStates
  };
};