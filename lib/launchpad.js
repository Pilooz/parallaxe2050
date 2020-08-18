/*--------------------------------------------------------------------------------------
	Utils functions to drive the Ableton Lauchpad via Midi protocol
--------------------------------------------------------------------------------------*/
const midi = require('midi');

module.exports = function(eventEmitter){
  console.log(`Loading ${__filename}`);

  // Set up a new input.
  const input = new midi.Input();
  // Set up a new output.
  const output = new midi.Output();

  var midiPort = getPort();

  const launchpadButtonStatus = 144;
  const launchpadFunctionStatus = 176;
  const active_color = 122;
  const default_color = 1;
  const black = 0;
  // Colors for hours from h1 to h8
  const y_colors_on = [8, 4, 40, 35, 11, 39, 59,  51];

  // [ jaune, rouge, bleu, vert, orange, turquoise, fushia, violet]
  const x_colors_on = [13, 5, 45, 21, 9, 36, 57, 49];
  // The array of each square pad state (active_color default_color)
  var padStates = [];

// 
// Listening on incomming messages.
//
input.on('message', (deltaTime, message) => {
  // The message is an array of numbers corresponding to the MIDI bytes:
  //   [status, data1, data2]
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
  // information interpreting the messages.
  
  // Handles every Square Pad
  if (message[0] == launchpadButtonStatus && message[2] == 127) { // It is a noteOn message
    togglePad(message[1]);
  }

  // Handles "Mixer" button as re-init.
  if (message[0] == launchpadFunctionStatus && message[1] == 111 && message[2] == 127) { // It is a noteOn message
    init();
  }

  // handles Right circle buttons
  // Sending an array with the toggled On data
  if ( message[0] == launchpadButtonStatus && String(message[1]).substring(1) == "9"  && message[2] == 127) {
    var y = String(message[1]).substring(0, 1);
    var dataToSend = { hour: getHourFromY(y), continents : [] };
    padStates.forEach(function (p) {
      if (p.color != default_color && String(p.indx).substring(0,1) == y) {
        dataToSend.continents.push(p.indx - (10 * y));
      }
    });
    // Send an event for who needs to know that fuckin' shit...
    eventEmitter.emit('newLaunchpadMsg.needValidation', dataToSend);
  }

});

//
// returns H1, ... H8 from the y pos of launchpad
//
function getHourFromY(y){
  return "H" + (8 - y + 1);
}
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

function initXHeader() {
  var index = 104;
  x_colors_on.forEach(c=> {
    output.sendMessage([launchpadFunctionStatus, index, c]);
    index++;
  });
}

function initYHeader() {
  var index = 1;
  y_colors_on.forEach(c=> {
    output.sendMessage([launchpadButtonStatus, 10 * index + 9, c]);
    index++;
  });

}

function init() {
  clear(black);
  initXHeader();
  initYHeader();
  padStates = [];
  for (var x = 1; x < 9; x++) {
      for (var y = 1; y < 9; y++) {
          var indx = 10*y + x;
          output.sendMessage([launchpadButtonStatus, indx, default_color]);
          padStates.push( { indx: indx, color: default_color} );
      }
  }
}

Number.prototype.mod = function(n) {
	return (( this % n ) + n ) % n;
};

//
// Toogle active_color / default_color values on a pad
//
function togglePad (idx) {
  // Just take the unit number : this is the index of the x_colors_on array.
  // Take the tenth number and this is index for y_colors_on.
  // colorIdx = parseInt(String(idx).substring(1)) - 1;
  colorIdx = parseInt(String(idx).substring(0,1)) - 1;
  // var active_color = x_colors_on[colorIdx];
  var active_color = y_colors_on[colorIdx];
  padStates.forEach(p => {
      if (p.indx == idx) {
          if (p.color == active_color ) p.color = default_color;
          else p.color = active_color;
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
  // Sysex, timing, and active sensing messages are ign default_color
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