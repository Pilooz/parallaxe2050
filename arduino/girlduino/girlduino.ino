#include <FastLED.h>


#define NUM_LEDS      6
#define DATA_PIN      5
#define COLOR_ORDER GRB
#define LED_TYPE WS2811
#define BRIGHTNESS    100
CRGB leds[NUM_LEDS];

int bouton = 3;
int sortie01 = 2;
int sortie02 = 4;

void setup() {
  // put your setup code here, to run once:
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  turn_led_to_color_rgb(0, 0, 0);

  pinMode       (A0, INPUT_PULLDOWN);
  pinMode       (A1, INPUT_PULLDOWN);
  pinMode       (A2, INPUT_PULLDOWN);
  pinMode       (A3, INPUT_PULLDOWN);
  pinMode       (A4, INPUT_PULLDOWN);
  pinMode       (A5, INPUT_PULLDOWN);

  pinMode       (bouton,INPUT_PULLDOWN);
  pinMode       (sortie01,OUTPUT);
  pinMode       (sortie02, OUTPUT);
  digitalWrite  (sortie01, LOW);
  digitalWrite  (sortie02, LOW);
}

void loop() {

  int valA0 = analogRead (A0);
  int valA1 = analogRead (A1);
  int valA2 = analogRead (A2);
  int valA3 = analogRead (A3);
  int valA4 = analogRead (A4);
  int valA5 = analogRead (A5);

  int valBouton = digitalRead(bouton);

  if (valBouton == 1) {

    if (valA0 == xxx && valA1 == xxx && valA2 == xxx && valA3 == xxx && valA4 == xxx && valA5 == xxx &&) {
      digitalWrite (sortie01,HIGH);
      delay(100);
    }
    else if (valA0 == xxx && valA1 == xxx && valA2 == xxx && valA3 == xxx && valA4 == xxx && valA5 == xxx &&) {
      digitalWrite (sortie02,HIGH);
      delay(100);
    }
    else {
      turn_led_to_color_rgb(255, 0, 0);
      digitalWrite (sortie01,LOW);
      digitalWrite (sortie02,LOW);
    }
  } else {
    digitalWrite (sortie01,LOW);
    digitalWrite (sortie02,LOW);
  }
}

void turn_led_to_color_rgb(int r, int g, int b) {
  for(int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB(r, g, b);
  }
  FastLED.show();
}