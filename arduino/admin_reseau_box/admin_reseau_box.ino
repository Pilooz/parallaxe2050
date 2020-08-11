#include <Arduino.h>
#include "protocole_parallaxe2050.h"
/*

  // capteurs :

  - Capteur 01 : 2
  - Capteur 02 : 3
  - Capteur 03 : 4
  - Capteur 04 : 5
  - Capteur 05 : 6
  - Capteur 06 : 7
  - Capteur 07 : 8
  - Capteur 08 : 9
  - Capteur 09 : 10
  - Capteur 10 : 11
  - Capteur alliés 1 : 12
  - Capteur alliés 2 : 13
  - Capteur base : (pas de capteur, base = 5v)


  ///relais (aimants):

  - Relais 01 : 40         ----- port relais A : 4
  - Relais 02 : 41         ----- port relais A : 5
  - Relais 03 : 42         ----- port relais A : 6
  - Relais 04 : 43         ----- port relais A : 7
  - Relais 05 : 44         ----- port relais A : 8
  - Relais 06 : 45         ----- port relais B : 2
  - Relais 07 : 46         ----- port relais B : 3
  - Relais 08 : 47         ----- port relais B : 4
  - Relais 09 : 48         ----- port relais B : 5
  - Relais 10 : 49         ----- port relais B : 6
  - Relais alliés 1 : 51   ----- port relais B : 7
  - Relais alliés 2 : 52   ----- port relais B : 8
  - Relais base : 50       ----- port relais A : 1 (attention, relais A)


  // LEDs :

  - LED 01 : 18
  - LED 02 : 19
  - LED 03 : 20
  - LED 04 : 21
  - LED 05 : 22
  - LED 06 : 23
  - LED 07 : 24
  - LED 08 : 25
  - LED 09 : 26
  - LED 10 : 27
  - LED alliés 1 : 28
  - LED alliés 2 : 29
  - LED base : 30

  // bouton principal : 35

*/
// Pour communiquer avec le serveur via USBSerial
ParallaxeCom message;

typedef struct {
  String name;
  int pin;
  int default_value;
  int old_value;
  int value;
} PhysicalPin;

PhysicalPin capteurs[12] = {
  {"C01", 2, LOW},
  {"C02", 3, LOW},
  {"C03", 4, LOW},
  {"C04", 5, LOW},
  {"C05", 6, LOW},
  {"C06", 7, LOW},
  {"C07", 8, LOW},
  {"C08", 9, LOW},
  {"C09", 10, LOW},
  {"C10", 11, LOW},
  {"C_A01", 12, LOW},
  {"C_A02", 13, LOW}
};
PhysicalPin leds[13] = { {"LED01", 18, LOW}, {"LED02", 19, LOW}, {"LED03", 20, LOW}, {"LED04", 21, LOW}, {"LED05", 22, LOW}, {"LED06", 23, LOW}, {"LED07", 24, LOW}, {"LED08", 25, LOW}, {"LED09", 26, LOW}, {"LED10", 27, LOW}, {"LED_A01", 28, LOW}, {"LED_A02", 29, LOW}, {"LED_Base", 30, LOW} };
PhysicalPin relais[13] = { {"R_01", 40, HIGH}, {"R_02", 41, HIGH}, {"R_03", 42, HIGH}, {"R_04", 43, HIGH}, {"R_05", 44, LOW}, {"R_06", 45, LOW}, {"R_07", 46, LOW}, {"R_08", 47, LOW}, {"R_09", 48, LOW}, {"R_10", 49, LOW}, {"R_A01", 51, LOW}, {"R_A02", 52, LOW}, {"R_Base", 50, HIGH} };

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 12; i++) pinMode (capteurs[i].pin, INPUT);

  for (int i = 0; i < 13; i++) pinMode (leds[i].pin, OUTPUT);
  for (int i = 0; i < 13; i++) digitalWrite (leds[i].pin, leds[i].default_value);

  for (int i = 0; i < 13; i++) pinMode (relais[i].pin, OUTPUT);
  for (int i = 0; i < 13; i++) digitalWrite (relais[i].pin, relais[i].default_value);

  // Send a message to say arduino is ready
  message.send("MSG", "READY");
}

void loop() {
  // Lecture des capteurs
  for (int i = 0; i < 12; i++) {
    capteurs[i].old_value = capteurs[i].value;
    capteurs[i].value = digitalRead (capteurs[i].pin);
  }
  /*
  // Debug
  for (int i = 0; i < 12; i++) {
    if (capteurs[i].old_value != capteurs[i].value) {
      Serial.print (capteurs[i].name); Serial.print("="); Serial.println (capteurs[i].value);
    }
  }
*/

  //for (int i=0; i<13; i++) digitalWrite (relais[i].pin, !digitalRead(relais[i].pin));


  for (int i = 0; i < 12; i++) {
    digitalWrite (leds[i].pin, capteurs[i].value);
    if (capteurs[i].value == HIGH) {
      digitalWrite (leds[12].pin, capteurs[i].value);
      relais[i].value = (relais[i].default_value == LOW) ? HIGH : LOW;
      digitalWrite (relais[i].pin, relais[i].value);
    }
  }

  /* For testing

  */

  // Read an incoming messages from the server
  if (message.isKey("CMD")) {
    if (message.val() == "TEST") {
      // Send a OK feedback : This is important beacause it mark the message as treated.
      // /!\ This mandatory to send a feedback to treat next message.
      message.ack_ok();

      // Tester le système : les LEDS
      for (int i = 0; i < 13; i++) digitalWrite (leds[i].pin, HIGH);
      delay(1000);
      for (int i = 0; i < 13; i++) digitalWrite (leds[i].pin, LOW);
      delay(1000);

      // Faire tous les tests que l'on souhaite ici !
      /*
        .............
      */
    }
    //
    // Reset : lâcher tous les câbles
    //
    if (message.val() == "RELEASE") {
      for (int i = 0; i < 13; i++) {
        relais[i].value = relais[i].default_value;
        digitalWrite (relais[i].pin, relais[i].value);
      }
      message.ack_ok();
    }
    //
    // Envoyer les données de câbles connectés sur demande du serveur.
    //
    if (message.val() == "CONNECTIONS") {
      String connections = "[";
      for (int i = 0; i < 12; i++) {
        if (capteurs[i].value == HIGH) {
          connections += "{\"" + capteurs[i].name + "\":" + String(capteurs[i].value) +"},";
        }
      }
      if(connections.length() > 1) {
        connections =connections.substring(0, connections.length()-1);
      }
      connections += "]"; 
      message.send("CONNECTIONS", connections);
      message.ack_ok();
    }
  }
  delay(100);
}

/*
  SerialEvent occurs whenever a new data comes in the hardware serial RX. This
  routine is run between each time loop() runs, so using delay inside loop can
  delay response. Multiple bytes of data may be available.
*/
void serialEvent() {
  message.receive();
}
