// launchpad = require('./lib/launchpad')();
// launchpad.clear();

// noiseDemo = function() {
//     for(var x=0; x<8; x++) {
//         for(var y=0; y<8; y++) {
//             var red   = ~~(Math.random()*4);
//             var green = ~~(Math.random()*4);
//             launchpad.set(x,y,red,green);
//         }
//     }
// }
// // setInterval(noiseDemo, 200);
// launchpad.set(1,1, 0, 0);

const midi = require('midi');
// Set up a new input.
const input = new midi.Input();
// Set up a new output.
const output = new midi.Output();

var midiPort = getLaunchpadPort();

const launchpadButtonStatus = 144;
const launchpadFunctionStatus = 176;
const green = 122;
const red = 120;
const black = 0;
var pad = {indx: null, color: ""};
var padStates = [];

function getLaunchpadPort() {
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
      throw "Launchpad was not detected";
    }
    return port;
  };

  /*
    Pads carrés : 
        - ligne d'en bas : 11-18
        - ligne d'en bas : 81-88
    Boutons de fonction : 
        - droite : [1-8]9
        - haut : 104 - 111
  */
function clearLaunchpad(color) {
    // tout à noir
    for (var x = 11; x < 90; x++) {
        output.sendMessage([launchpadButtonStatus, x, color]);
    }
    for (var x = 104; x < 112; x++) {
        output.sendMessage([launchpadFunctionStatus, x, color]);
    }
}

function initLaunchpad() {
    clearLaunchpad(black);
    for (var x = 1; x < 9; x++) {
        for (var y = 1; y < 9; y++) {
            var indx = 10*y + x;
            output.sendMessage([launchpadButtonStatus, indx, red]);
            padStates.push( { indx: indx, color: red} );
        }
    }
}

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

// Configure a callback.
input.on('message', (deltaTime, message) => {
  // The message is an array of numbers corresponding to the MIDI bytes:
  //   [status, data1, data2]
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
  // information interpreting the messages.
  if (message[0] == launchpadButtonStatus && message[2] == 127) { // It is a noteOn message
    togglePad(message[1]);
  }

  if (message[0] == launchpadFunctionStatus && message[1] == 111 && message[2] == 127) { // It is a noteOn message
    initLaunchpad();
  }

//   console.log(`m: ${message} d: ${deltaTime}`);
});

// Open the first available input port.
input.openPort(midiPort);

// Open the first available output port.
output.openPort(midiPort);

// Sysex, timing, and active sensing messages are ignored
// by default. To enable these message types, pass false for
// the appropriate type in the function below.
// Order: (Sysex, Timing, Active Sensing)
// For example if you want to receive only MIDI Clock beats
// you should use
// input.ignoreTypes(true, false, true)
input.ignoreTypes(false, false, false);

// ... receive MIDI messages ...

// Close the port when done.
// setTimeout(function() {
//   input.closePort();
// }, 100000);


// // Send a MIDI message.
// output.sendMessage([176,22,1]);

// // Close the port when done.
// output.closePort();

initLaunchpad();