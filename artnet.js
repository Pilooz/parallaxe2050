var options = {
    host: '192.168.1.102',
    port: 6454,
    refresh: 4000,
    //iface: // (optional string IP address - bind udp socket to specific network interface)
    sendAll: true // sends always the full DMX universe instead of only changed values. Default false
}
 
var artnet = require('artnet')(options);
    
    // adminReseau
    function set_adminReseau() {
        artnet.set(1, [115, 7, 177], function (err, res) {
            console.log(err);
            artnet.close();
        });
    }
    
    // BDD 
    function set_BDD() {
        artnet.set(1, [194, 8, 251], function (err, res) {
            console.log(err);
            artnet.close();
        });
    }
    
    // ComDigitale
    function set_ComDigitale() {
        artnet.set(1, [215, 0, 116], function (err, res) {
            console.log(err);
            artnet.close();
        });
    }
    
    // CodeEtProg
    function set_CodeEtProg() {
        artnet.set(1, [249, 110, 0], function (err, res) {
            console.log(err);
            artnet.close();
        });
    }

    // Hardware
    function set_Hardware() {
        artnet.set(1, [230, 25, 131], function (err, res) {
            console.log(err);
            artnet.close();
        });
    }

    // set_adminReseau();
    // set_BDD();
    // set_ComDigitale();
    set_CodeEtProg();
    // set_Hardware();
