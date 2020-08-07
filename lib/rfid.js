/*--------------------------------------------------------------------------------------
	Utils functions to parse Message sent by RFID Reader via the microcontroller
--------------------------------------------------------------------------------------*/
module.exports = function(global_config){

  // db of students groups by Rfid Tag
  const students_groups_db = require(global_config.app.dbPath + '/db-rfid.json');
  // Current read rfid badge.
  var rifdBadge            = { code: "x", reader: "1"};

// Getter for db of students groups
function currentBadge() {
  return rifdBadge;
}

// Getter for current rfid badge
function groups_db() {
  return students_groups_db;
}

/**
 * Extract RFID Tag
 *
 * @param  {String} msg
 * @return {String}
 */
function extractTag(msg) {
  	if(msg.indexOf("<TAG:") > -1) {
    	return String(msg).split("<TAG:").join("").split("/>")[0];
    }
    return '';
  }

  /**
   * Extract Rfid Reader
   *
   * @param  {String} msg
   * @return {String}
   */
  function extractReader(msg) {
  	if(msg.indexOf("<TAG:") > -1) {
    	return String(msg).split("<READER:")[1].split("/>")[0];
    }
    return '';
  }

  return {
    currentBadge: currentBadge,
    groups_db: groups_db,
    extractTag: extractTag,
    extractReader: extractReader
};
};
