#include <Arduino.h>
#include <protocole_parallaxe2050.h>

// #define TELEPHONE
// #define MANIVELLE
#define CODE
// #define PASCODE

#define DECROCHER 9
#define GOOD 8
#define NOTGOOD 7

String code[8] = {"4C809DD6","9CFB9CD6","5C309FD6","9CE79CD6","5C619CD6","FCA19FD6","CCB29FD6","AC22A0D6"};
String pascode[8] = {"8C2A9FD6","6C099BD6","BC499CD6","CCBC9BD6","3CAC9BD6","0C1D9BD6","0C2DA0D6","1C909AD6"};
int index = 0;

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

#ifdef CODE
  pinMode(GOOD, INPUT_PULLUP);
  pinMode(NOTGOOD, INPUT_PULLUP);
  message.send("NAME", "CODE");
  index = 0;
#endif

#ifdef PASCODE
  pinMode(GOOD, INPUT_PULLUP);
  pinMode(NOTGOOD, INPUT_PULLUP);
  message.send("NAME", "PASCODE");
  index = 0;
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

#ifdef CODE
  if (digitalRead(GOOD) == LOW) {
    message.send("MSG", "un tag bon...");
    message.send("CODE", code[index]);
    delay(500);
    index++;
    if (index > 7) {
      index = 0;
    }
  }
  
  if (digitalRead(NOTGOOD) == LOW) {
    message.send("MSG", "un tag pas bon...");
    message.send("CODE", pascode[index]);
    delay(500);
    index++;
    if (index > 7) {
      index = 0;
    }
  }
  
  if (message.isKey("CMD")) {
    if (message.val() == "G_LED") {
      message.send("MSG", "Green Led blink");
      message.ack_ok();
    }
    if (message.val() == "R_LED") {
      message.send("MSG", "Red Led blink");
      message.ack_ok();
    }
    if (!message.isProcessed()) {
      message.ack_ko("The command <CMD:" + message.val() + "/> is not recognized !");
    }
  }
#endif

#ifdef PASCODE
  if (digitalRead(GOOD) == LOW) {
    message.send("MSG", "un tag bon...");
    message.send("PASCODE", pascode[index]);
    delay(500);
    index++;
    if (index > 7) {
      index = 0;
    }
  }
  
  if (digitalRead(NOTGOOD) == LOW) {
    message.send("MSG", "un tag pas bon...");
    message.send("PASCODE", code[index]);
    delay(500);
    index++;
    if (index > 7) {
      index = 0;
    }
  }
  
  if (message.isKey("CMD")) {
    if (message.val() == "G_LED") {
      message.send("MSG", "Green Led blink");
      message.ack_ok();
    }
    if (message.val() == "R_LED") {
      message.send("MSG", "Red Led blink");
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