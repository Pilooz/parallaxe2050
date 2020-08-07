/*--------------------------------------------------------------------------------------
	Utils functions to parse Message sent by RFID Reader via the microcontroller
--------------------------------------------------------------------------------------*/
module.exports = function(global_config){

  const defaultGroup = "A";
  var currentGroup = "";

  // db of students groups by Rfid Tag
  const students_groups_db = require(global_config.app.dbPath + '/db-rfid.json');
  // Current read rfid badge.
  var rifdBadge            = { code: "", reader: ""};

// setter for rfid code
function setCurrentCode(code) {
  rifdBadge.code = code;
} 

// getter for rfid code
function getCurrentCode() {
  return rifdBadge.code;
} 

// setter for rfid reader
function setCurrentReader(reader) {
  rifdBadge.reader = reader;
} 

// getter for rfid code
function getCurrentReader() {
  return rifdBadge.reader;
} 


// Getter for db of students groups
function currentBadge() {
  return rifdBadge;
}

// Getter for current rfid badge
function groups_db() {
  return students_groups_db;
}

// testing if a rfid code exists in db
function exists(code) {
  return ( students_groups_db.badges.filter(badge => badge.code == code)[0] !== undefined );
}

// setter for student group from current rfid code
function setCurrentGroup() {
  currentGroup = (exists(rifdBadge.code)) ? students_groups_db.badges.filter(badge => badge.code == rifdBadge.code)[0].params.group : defaultGroup;
}

// return group from current badge
function getCurrentGroup() {
  return currentGroup;
}

/**
 * Extract RFID Tag
 *
 * @param  {String} msg
 * @return {String}
 */
function extractTag(msg) {
  var code = "";
  	if(msg.indexOf("<TAG:") > -1) {
      code =  String(msg).split("<TAG:").join("").split("/>")[0];
    } 
    setCurrentCode(code);
    setCurrentGroup();
}

  /**
   * Extract Rfid Reader
   *
   * @param  {String} msg
   * @return {String}
   */
  function extractReader(msg) {
    var reader = "";
  	if(msg.indexOf("<TAG:") > -1) {
      reader =  String(msg).split("<READER:")[1].split("/>")[0];
    }
    setCurrentReader(reader);
  }

  return {
      setCurrentCode: setCurrentCode,
      getCurrentCode: getCurrentCode,
      setCurrentReader: setCurrentReader,
      getCurrentReader: getCurrentReader,
      currentBadge: currentBadge,
      groups_db: groups_db,
      exists: exists,
      extractTag: extractTag,
      extractReader: extractReader,
      setCurrentGroup: setCurrentGroup,
      getCurrentGroup: getCurrentGroup
  };
};


/* Some unit test
@TODO : see how to automate ?

// Testing for null data
rfid.extractTag("");
rfid.extractReader("");
console.log(rfid.currentBadge());
console.log(rfid.getCurrentGroup());
console.log(scenario.getSolutionsForCurrentStep(rfid.getCurrentGroup()));
console.log("------------------------------------------------------------");
// Testing for group A
rfid.extractTag("<TAG:49426960/><READER:1/>");
rfid.extractReader("<TAG:49426960/><READER:1/>");
console.log(rfid.currentBadge());
console.log(rfid.getCurrentGroup());
console.log(scenario.getSolutionsForCurrentStep(rfid.getCurrentGroup()));

// Testing for group B
rfid.extractTag("<TAG:CE4E2B60/><READER:2/>");
rfid.extractReader("<TAG:CE4E2B60/><READER:2/>");
console.log(rfid.currentBadge());
console.log(rfid.getCurrentGroup());
console.log(scenario.getSolutionsForCurrentStep(rfid.getCurrentGroup()));

// Testing for group C
rfid.extractTag("<TAG:E12CD11D/><READER:3/>");
rfid.extractReader("<TAG:E12CD11D/><READER:3/>");
console.log(rfid.currentBadge());
console.log(rfid.getCurrentGroup());
console.log(scenario.getSolutionsForCurrentStep(rfid.getCurrentGroup()));
*/