/*------------------------------------------------------------------

  PARALLAXE2050 :  téléphone MP3.
  Auteurs : Arthur Baude, Pierre-Gilles Levallois

  Le téléphone sonne via un message envoyé par l'ordinateur : <CMD:RING/>
  Tant qu'il n'a pas été décrocher, il continue de sonner.

  Une fois décroché, le téléphone joue son message en boucle.
  Le téléphone envoie <MSG:INCALL/>

  Une fois le message écouté, et le téléphone re-raccroché, il ne sonne plus.
  Il est possible de ré-écouter le message tant qu'on veut.

  -------------------------------------------------------------------*/
#include <Arduino.h>
#include "protocole_parallaxe2050.h"

#include <SoftwareSerial.h>
#include <DFPlayerMini_Fast.h>

//#define DEBUG

// Pour communiquer avec le serveur via USBSerial
ParallaxeCom message;

// Lecteur MP3
SoftwareSerial mySerial(10, 11); // RX, TX
DFPlayerMini_Fast myMP3;


boolean isPlaying = false;
boolean faire_sonner_le_tel = false;

// int RFID = 4;
int bouton = 5;
int led = 8;
int buzzer = 9;

long currentTime = 0;
long LastTime = 0;
const long between_ring = 200;
const long end_ring_cycle = 3 * between_ring;
long ringInterval = between_ring; // intervalle entre 2 sonneries en ms.
int ringCount = 0;

//
// Faire sonner le téléphone
// Sonnerie non bloquante pour le reste du programme.
//
void ringing() {
  currentTime = millis();
  if (currentTime - LastTime > ringInterval) {
    digitalWrite (led, !digitalRead(led));
    digitalWrite (buzzer, !digitalRead(buzzer));
    LastTime = currentTime;
    ringInterval = between_ring;
    ringCount++;
  }
  if (ringCount > 11) {
    ringCount = 0;
    ringInterval = end_ring_cycle;
  }
}

void stopRinging() {
  digitalWrite (led, LOW); 
  digitalWrite (buzzer, LOW);
  faire_sonner_le_tel = false;
}

void setup() {

  Serial.begin(9600);
  mySerial.begin(9600);

  myMP3.begin(mySerial);

  Serial.println("Setting volume to max");
  myMP3.volume(20);
  delay(2000);

  isPlaying = true;

  //pinMode (RFID, INPUT);
  pinMode (bouton, INPUT);
  pinMode (led, OUTPUT);
  pinMode (buzzer, OUTPUT);
  stopRinging();

}

void loop() {
  // Lire les entrées
  int sigBouton = digitalRead (bouton);

  if (faire_sonner_le_tel) {
    ringing();
  }
  
  //
  // Traiter les entrées sorties
  //
  if ( sigBouton == HIGH) {
    // Jouer le MP3, s'il n'est pas déjà en train de jouer
    if ( myMP3.isPlaying() == false) {
      myMP3.play(1);
      stopRinging();
      message.send("MSG", "INCALL");
    }
  } else { // Le téléphone est raccroché
    if ( myMP3.isPlaying() == true) {
      myMP3.reset();
    }
  }

  /*
    //int sigRFID = digitalRead (RFID);
    int sigRFID = 1;
    int sigBouton = digitalRead (bouton);
    Serial.print ("RFID :");
    Serial.println (sigRFID);
    Serial.print ("bouton :");
    Serial.println (sigBouton);


    if (sigRFID == 1 && sigBouton == 1)
      //if(sigBouton == 1)
    {
      if ( myMP3.isPlaying() == false) {
        myMP3.play(1);

      }
    }

    else if (sigRFID == 1 && sigBouton == 0)
    {
      if ( myMP3.isPlaying() == true) {

        myMP3.reset();
      }

      dring();
    }
    else {
      digitalWrite (led, LOW);
      digitalWrite (buzzer, LOW);
    }
  */

  //
  // Traiter les messages venant du serveur/ordinateur
  //
  if (message.isKey("CMD")) {
    if (message.val() == "TEST") {
      // Send a OK feedback : This is important beacause it mark the message as treated.
      // /!\ This mandatory to send a feedback to treat next message.
      message.ack_ok();
    }
    //
    // Reset : lâcher tous les câbles
    //
    if (message.val() == "RING") {
      faire_sonner_le_tel = true;
      message.ack_ok();
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
