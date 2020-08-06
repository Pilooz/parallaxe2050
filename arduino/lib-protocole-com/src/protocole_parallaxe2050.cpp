#include "protocole_parallaxe2050.h"

ParalaxeCom message;

void setup() {
  // Init Serial communication
  Serial.begin(9600);
  // Send a message to say arduino is ready
  message.send("MSG", "READY");
}

void loop() {
  // Sending a group of messages
  // message.send("TAG", "12345");
  // message.send("READER", "1");

  // delay(1000);
  // // sending a unique message
  // message.send("DATA", String(message.count));
  // delay(1000);

  // Read an incoming message
  if (message.isKey("CMD")) {
    Serial.println("key = " + message.key());
    Serial.println("val = " + message.val());  
    // Send a feedback : This is important beacause it mark the message as treated.
    message.ack_ok();
    // message.ack_ko("Reasonok the problem...");
  
    delay(1000);
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