var DATA_SCENARIO;
//------------------------------------------------------------------------
// the scenario Functions
//------------------------------------------------------------------------
module.exports = function(config) {
    // Let's init with the right
    DATA_SCENARIO = require('../data/' + config.name + '.json');
    console.log(DATA_SCENARIO.steps.length + " steps in scenario.");
 
    function data() {
        return DATA_SCENARIO;
    }

    return {
        data: data
    };

};