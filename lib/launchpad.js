(function() {
    var Launchpad,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  
    Launchpad = (function() {
      function Launchpad() {
        this.clear = __bind(this.clear, this);
        this.onMidiEvent = __bind(this.onMidiEvent, this);
        this.onExit = __bind(this.onExit, this);
        this.initMidi();
        this.clear();
      }
  
      Launchpad.prototype.initMidi = function() {
        var i, portName, _i, _ref;
        this.midi = require('midi');
        this.midiOut = new this.midi.output;
        this.midiIn = new this.midi.input;
        process.on('SIGINT', this.onExit);
        this.midiIn.openPort(0);
        this.midiIn.on('message', this.onMidiEvent);
        this.port = -1;
        for (i = _i = 0, _ref = this.midiOut.getPortCount(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          portName = this.midiOut.getPortName(i);
          console.log("Port " + i + ": " + portName);
          if (/^Launchpad(:\d+)?/.test(portName)) {
            this.port = i;
            break;
          }
        }
        if (this.port === -1) {
          throw "Launchpad was not detected";
        }
        return this.midiOut.openPort(this.port);
      };
  
      Launchpad.prototype.onExit = function() {
        setTimeout((function() {
          return process.exit();
        }), 1000);
        return this.stopMidi();
      };
  
      Launchpad.prototype.onMidiEvent = function(delta, msg) {
        var x, y;
        x = msg[1] % 16;
        y = parseInt(msg[1] / 16);
        if (msg[2] !== 0) {
          return this.onButtonDown(x, y);
        } else {
          return this.onButtonUp(x, y);
        }
      };
  
      Launchpad.prototype.stopMidi = function() {
        console.log("shutting down midi");
        this.clear();
        this.midiOut.closePort();
        return this.midiIn.closePort();
      };
  
      Launchpad.prototype.onButtonDown = function(x, y) {};
  
      Launchpad.prototype.onButtonUp = function(x, y) {};
  
      Launchpad.prototype.xy2i = function(x, y) {
        return 16 * (y % 8) + x;
      };
  
      Launchpad.prototype.cRange = function(c) {
        return parseInt(Math.min(Math.max(0, c), 3));
      };
  
      Launchpad.prototype.color = function(red, green) {
        return 0xc + this.cRange(red) + this.cRange(green) * 8;
      };
  
      Launchpad.prototype.set = function(x, y, r, g) {
        return this.midiOut.sendMessage([144, this.xy2i(x, y), this.color(r, g)]);
      };
  
      Launchpad.prototype.clear = function() {
        var x, y, _i, _results;
        _results = [];
        for (x = _i = 0; _i < 8; x = ++_i) {
          _results.push((function() {
            var _j, _results1;
            _results1 = [];
            for (y = _j = 0; _j < 8; y = ++_j) {
              _results1.push(this.set(x, y, 0, 0));
            }
            return _results1;
          }).call(this));
        }
        return _results;
      };
  
      return Launchpad;
  
    })();
  
    module.exports = function() {
      return new Launchpad;
    };
  
  }).call(this);