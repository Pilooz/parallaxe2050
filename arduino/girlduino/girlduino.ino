#include <FastLED.h>


#define NUM_LEDS 6
#define DATA_PIN 3
CRGB leds[NUM_LEDS];

int bouton = 2;
int sortie01 = 3;
int sortie02 = 4;

void setup() {
  // put your setup code here, to run once:
FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);

    for(int i = 0; i < NUM_LEDS; i = i + 1) {
      // Turn our current led on to white, then show the leds
      leds[i] = CRGB::Black;
      // Show the leds (only one of which is set to white, from above)
      FastLED.show();      
   }
   #define BRIGHTNESS          100
   pinMode (bouton,INPUT);
   pinMode (sortie01,OUTPUT);
   pinMode (sortie02,OUTPUT);
}

void loop() {

int valA0 = analogRead (A0);
int valA1 = analogRead (A1); 
int valA2 = analogRead (A2); 
int valA3 = analogRead (A3); 
int valA4 = analogRead (A4);
int valA5 = analogRead (A5);  

int valBouton = digitalRead(bouton);

if (valBouton == 1)
{

if (valA0 == xxx && valA1 == xxx && valA2 == xxx && valA3 == xxx && valA4 == xxx && valA5 == xxx &&)
{
  digitalWrite (sortie01,HIGH);   
}

else if (valA0 == xxx && valA1 == xxx && valA2 == xxx && valA3 == xxx && valA4 == xxx && valA5 == xxx &&)
{
  digitalWrite (sortie02,HIGH);   
}

else {
  
    for(int i = 0; i < NUM_LEDS; i = i + 1) {
      // Turn our current led on to white, then show the leds
      leds[i] = CRGB::Red;
      // Show the leds (only one of which is set to white, from above)
      FastLED.show();      
        digitalWrite (sortie01,LOW); 
        digitalWrite (sortie02,LOW); 
   }
}
}

else {
  digitalWrite (sortie01,LOW); 
  digitalWrite (sortie02,LOW);   
}


}
