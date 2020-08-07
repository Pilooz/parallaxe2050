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

    // Setter for stepId
    function setCurrentStepId(id) {
        stepId = id;
    }

    // Getter for stepId
    function getCurrentStepId() {
        return stepId;
    }

    // Return the whole scenario structure as an object.
    function data() {
        return DATA_SCENARIO;
    }

    // Get step data from stepId
    function getCurrentStep() {
        return DATA_SCENARIO.steps.filter(currentStep => stepId == currentStep.stepId)[0];
    }

    // Function getStepById : return a step definition for a spcific stepId
    function getStepById(specificStepId) {
        var stepObj = DATA_SCENARIO.steps.filter(currentStep => specificStepId == currentStep.stepId);
        stepId = stepObj.stepId;
        return stepObj;
    }

    // Returns the solutions for the current step for the current group of students
    function getSolutionsForCurrentStep(group) {
        var solutions = DATA_SCENARIO.steps.filter(currentStep => stepId == currentStep.stepId)[0].solutions;
        return solutions.filter(currentSolutions => group == currentSolutions.group);
    }

    return {
        data: data,
        setCurrentStepId: setCurrentStepId,
        getCurrentStepId: getCurrentStepId,
        getCurrentStep: getCurrentStep,
        getStepById: getStepById,
        getSolutionsForCurrentStep: getSolutionsForCurrentStep
    };

};