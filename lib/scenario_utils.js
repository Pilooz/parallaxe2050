var DATA_SCENARIO;
//------------------------------------------------------------------------
// the scenario Functions
//------------------------------------------------------------------------
module.exports = function(config) {
    // Let's init with the right
    DATA_SCENARIO = require('../data/' + config.name + '.json');
    console.log(DATA_SCENARIO.steps.length + " steps in scenario.");

    // Init the stepId index on the first scenario step
    var stepId = DATA_SCENARIO.steps[0].stepId;
    
    //
    // Return the whole scenario structure as an object.
    //
    function data() {
        return DATA_SCENARIO;
    }

    //
    // Get step data from stepId
    //
    function getCurrentStep() {
        return DATA_SCENARIO.steps.filter(currentStep => stepId == currentStep.stepId);
    }

    //
    // Function getStepById : return a step definition for a spcific stepId
    //
    function getStepById(specificStepId) {
        stepObj = DATA_SCENARIO.steps.filter(currentStep => specificStepId == currentStep.stepId);
        stepId = stepObj.stepId;
        return stepObj;
    }

    return {
        data: data,
        getCurrentStep: getCurrentStep,
        getStepById: getStepById
    };

};