#include <SoftwareSerial.h>
#include <DFPlayerMini_Fast.h>


SoftwareSerial mySerial(10, 11); // RX, TX
DFPlayerMini_Fast myMP3;


boolean isPlaying = false;

int RFID = 4;
int bouton = 5;
int led = 8;
int buzzer = 9;

void setup() {

  Serial.begin(9600);
  mySerial.begin(9600);

  myMP3.begin(mySerial);

  Serial.println("Setting volume to max");
  myMP3.volume(20);
  delay(2000);

  isPlaying = true;

  pinMode (RFID, INPUT);
  pinMode (bouton, INPUT);
  pinMode (led, OUTPUT);
  pinMode (buzzer, OUTPUT);

}

void loop() {

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

    digitalWrite (led, HIGH);
    digitalWrite (buzzer, HIGH);
    delay(200);
    digitalWrite (led, LOW);
    digitalWrite (buzzer, LOW);
    delay(200);
    digitalWrite (led, HIGH);
    digitalWrite (buzzer, HIGH);
    delay(200);
    digitalWrite (led, LOW);
    digitalWrite (buzzer, LOW);
    delay(200);
    digitalWrite (led, HIGH);
    digitalWrite (buzzer, HIGH);
    delay(200);
    digitalWrite (led, LOW);
    digitalWrite (buzzer, LOW);
    delay(600);
  }
  else {
    digitalWrite (led, LOW);
    digitalWrite (buzzer, LOW);
  }
}
