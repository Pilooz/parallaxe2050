const { sub } = require('../config/config');

var DATA_SCENARIO;
//------------------------------------------------------------------------
// the scenario Functions
//------------------------------------------------------------------------
module.exports = function(config) {
    console.log(`Loading ${__filename}`);
    // Let's init with the right
    DATA_SCENARIO = require('../data/' + config.name + '.json');
    DATA_SOLUTIONS_SETS = require('../data/solutions_sets.json');

    const scenarioId = DATA_SCENARIO.scenarioId;
    // Init the stepId index on the first scenario step
    var stepId = DATA_SCENARIO.steps[0].stepId;

    // Some logs at loading.
    console.log(`${DATA_SCENARIO.steps.length} steps in scenario '${scenarioId}'.`);


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
    // 2 sets of solutions A & B alhpa beta
    function getSolutionsSetForCurrentStep(group, subgroup) {
        // console.log(DATA_SOLUTIONS_SETS.solutionSets.filter(soluce => soluce.team == group + subgroup && soluce.scenarioId == scenarioId));
        var setObj = DATA_SOLUTIONS_SETS.solutionSets.filter(soluce => (soluce.team == group + subgroup && soluce.scenarioId == scenarioId));
        if (setObj!==undefined) {
            // this case arrives when the wrong rfid was badged on the wrong installation
            console.log(`Error : No solution for the group '${group}${subgroup}' on device '${scenarioId}'.`);
            return -1;
        } else {
            return parseInt(setObj[0].set);
        }
        // return 1;  // default set
    }

    return {
        data: data,
        setCurrentStepId: setCurrentStepId,
        getCurrentStepId: getCurrentStepId,
        getCurrentStep: getCurrentStep,
        getStepById: getStepById,
        getSolutionsSetForCurrentStep: getSolutionsSetForCurrentStep
    };

};