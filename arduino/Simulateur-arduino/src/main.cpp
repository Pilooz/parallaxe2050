#include <Arduino.h>
#include <protocole_parallaxe2050.h>

#define TELEPHONE
// #define MANIVELLE

#define DECROCHER 9

ParallaxeCom message;

void setup() {
  Serial.begin(9600);
#ifdef TELEPHONE
  pinMode(DECROCHER, INPUT_PULLUP);
  message.send("NAME", "TELEPHONE");
#endif

#ifdef MANIVELLE
  message.send("NAME", "MANIVELLE");
#endif

  delay(2000);
  message.send("MSG", "READY");
}

void loop() {
#ifdef TELEPHONE
  if (digitalRead(DECROCHER) == LOW) {
    message.send("MSG", "Le telephone va raccrocher dans 2 secondes...");
    delay(2000);
    message.send("MSG", "HANGUP");
  }
  // Simulate telephone
  if (message.isKey("CMD")) {
    if (message.val() == "RING" || message.val() == "STOP" || message.val() == "INSTRUCTIONS" || message.val() == "THANKS" || message.val() == "BRAVO" || message.val() == "RESET") {
      message.ack_ok();
    }

    if (!message.isProcessed()) {
      message.ack_ko("The command <CMD:" + message.val() + "/> is not recognized !");
    }
  }
#endif

#ifdef MANIVELLE
  if (message.isKey("CMD")) {
    if (message.val() == "START" || message.val() == "STOP") {
      message.ack_ok();
    }

    if (!message.isProcessed()) {
      message.ack_ko("The command <CMD:" + message.val() + "/> is not recognized !");
    }
  }
#endif

}

void serialEvent() {
  message.receive();
}