/*--------------------------------------------------------------------------------------
	Utils functions to parse Message sent by RFID Reader via the microcontroller
--------------------------------------------------------------------------------------*/
/**
 * Extract RFID Tag
 *
 * @param  {String} msg
 * @return {String}
 */
module.exports = {
  extractTag: function(msg) {
  	if(msg.indexOf("<TAG:") > -1) {
    	return String(msg).split("<TAG:").join("").split(">")[0];
    }
    return '';
  },

  /**
   * Extract Rfid Reader
   *
   * @param  {String} msg
   * @return {String}
   */
  extractReader: function(msg) {
  	if(msg.indexOf("<TAG:") > -1) {
    	return String(msg).split("<READER:")[1].split(">")[0];
    }
    return '';
  }
};
