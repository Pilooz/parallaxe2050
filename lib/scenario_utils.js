const { sub } = require('../config/config');

var DATA_SCENARIO;
//------------------------------------------------------------------------
// the scenario Functions
//------------------------------------------------------------------------
module.exports = function(config, eventEmitter) {
    console.log(`Loading ${__filename}`);
    // Let's init with the right
    DATA_SCENARIO = require('../data/' + config.name + '.json');
    DATA_SOLUTIONS_SETS = require('../data/solutions_sets.json');

    const scenarioId = DATA_SCENARIO.scenarioId;
    // Init the stepId index on the first scenario step
    var stepId = DATA_SCENARIO.steps[0].stepId;

    var solutionsSet; // Set of solutions from the scenario
    var oldSolutionsSet = 0; // Set of solutions from the scenario

    // Some logs at loading.
    console.log(`${DATA_SCENARIO.steps.length} steps in scenario '${scenarioId}'.`);


    // Setter for stepId
    function setCurrentStepId(id) {
        stepId = id;
        // Send event to monitoring
        eventEmitter.emit('monitoring.newGameStep', { stepId: stepId });

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

    function getSolutionsSet() {
        return solutionsSet;
    }

    function getOldSolutionsSet() {
        return oldSolutionsSet;
    }

    // Returns the solutions for the current step for the current group of students
    // 2 sets of solutions A & B alhpa beta
    function setSolutionsSetForCurrentStep(group, subgroup) {
        var setObj = DATA_SOLUTIONS_SETS.solutionSets.filter(soluce => (soluce.team == group + subgroup && soluce.scenarioId == scenarioId));
        // console.log(setObj);
        if (setObj[0] == undefined) {
            // this case arrives when the wrong rfid was badged on the wrong installation
            console.log(`Error : No solution for the group '${group}${subgroup}' on device '${scenarioId}'.`);
            return -1;
        } else {
            oldSolutionsSet = solutionsSet;
            solutionsSet = parseInt(setObj[0].set)
            return solutionsSet;
        }
        // return 1;  // default set
    }

    return {
        data: data,
        setCurrentStepId: setCurrentStepId,
        getCurrentStepId: getCurrentStepId,
        getCurrentStep: getCurrentStep,
        getStepById: getStepById,
        setSolutionsSetForCurrentStep: setSolutionsSetForCurrentStep,
        getSolutionsSet: getSolutionsSet,
        getOldSolutionsSet: getOldSolutionsSet
    };

};
