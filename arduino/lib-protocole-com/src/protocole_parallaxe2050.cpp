/**
 * Exemple d'envoie et de réceptions de messages entre arduino et un ordi
 * par la liaison USB/Serial.
 * 
 *    la librairie peut gérer une file de messages à la suite :
 *    Pour tester, ouvrir la moniteur serie et taper : 
 *    <CMD:STOP/><CMD:START/>
 * 
 **/

#include "protocole_parallaxe2050.h"

ParallaxeCom message;

void setup() {
  // Init Serial communication
  Serial.begin(9600);
  // Send a message to say arduino is ready
  message.send("MSG", "READY");
}

void loop() {
  /*
   
   ...
   Doing Super Stuff here
   ...

  */

  // Read an incoming message
  if (message.isKey("CMD")) {
    if (message.val() == "STOP") {
    // Send a OK feedback : This is important beacause it mark the message as treated.
    // /!\ This mandatory to send a feedback to treat next message.
      message.ack_ok();
    }
    if (message.val() == "START") {
    // Send a KO feedback : This is important beacause it mark the message as treated.
    // /!\ This mandatory to send a feedback to treat next message.
      message.ack_ko("Reason of the problem... This is just for testing !");
    }
  }
}

/*
  SerialEvent occurs whenever a new data comes in the hardware serial RX. This
  routine is run between each time loop() runs, so using delay inside loop can
  delay response. Multiple bytes of data may be available.
*/
void serialEvent() {
  message.receive();
}