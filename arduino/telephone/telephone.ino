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
int track_number = 1;

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
boolean has_already_played = false; // True quand la track a été jouée au moins une fois.

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
  ringInterval = between_ring;
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

  // Sending a READY message
  message.send("MSG", "READY");

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
    if ( !myMP3.isPlaying()) {
      stopRinging();
      myMP3.play(track_number);
      message.send("MSG", "Playing track #" + String(track_number));
      has_already_played = true;
    }
  } else { // Le téléphone est raccroché
    if ( myMP3.isPlaying()) {
      //myMP3.reset();
      myMP3.pause();
      // Si on a déja écouté la track alors on envoie HANGUP quand on reccroche
      // Ca évite de l'envoyer tout le temps quant on reset le téléphone (message RESET)
      if ( has_already_played ) {
        message.send("MSG", "HANGUP");
      }
    }
  }

  //
  // Traiter les messages venant du serveur/ordinateur
  //
  if (message.isKey("CMD")) {
    //
    // RING Faire sonner le téléphone
    //
    if (message.val() == "RING") {
      faire_sonner_le_tel = true;
      message.ack_ok();
    }
    //
    // STOP Arrêter le sonnerie du téléphone
    //
    if (message.val() == "STOP") {
      faire_sonner_le_tel = false;
      stopRinging();
      message.ack_ok();
    }
    //
    //  INSTRUCTIONS : Lire les instructions
    //
    if (message.val() == "INSTRUCTIONS") {
      track_number = 1;
      message.ack_ok();
    }
    //
    // THANKS : lire le remerciement
    //
    if (message.val() == "THANKS") {
      track_number = 2;
      message.ack_ok();
    }
    //
    // THANKS : lire le remerciement
    //
    if (message.val() == "BRAVO") {
      track_number = 3;
      message.ack_ok();
    }
    //
    // RESET Tout remettre au début
    //
    if (message.val() == "RESET") {
      stopRinging();
      track_number = 1;
      has_already_played = false;
      myMP3.reset();
      message.ack_ok();
    }

    if (!message.isProcessed()) {
      message.ack_ko("The command <CMD:" + message.val() + "/> is not recognized !");
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
