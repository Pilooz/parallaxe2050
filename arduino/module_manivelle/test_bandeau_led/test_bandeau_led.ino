#include "FastLED.h"
#include "protocole_parallaxe2050.h"

#define NUM_LEDS 17
#define DATA_PIN 3

#define MANIVELLE_PIN A0
#define RELAY_PIN 8
#define BUZZER_PIN 10

CRGB leds[NUM_LEDS];

ParallaxeCom message;

int counter;
bool activity;
bool buzz;
unsigned long currentMillis;

void setup() {
  // Init Sérial
  Serial.begin(9600);

  // Init buzzer, relay and manivelle pins
  pinMode (RELAY_PIN, OUTPUT);
  pinMode (BUZZER_PIN, OUTPUT);
  pinMode (MANIVELLE_PIN, INPUT);

  // contrôle
  buzz = false;
  activity = false;

  // Init led gestion
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  for (int r = 255, g = 0, nb_led = 0; nb_led < NUM_LEDS; nb_led++, r -= 15, g += 15)
    leds[nb_led] = CRGB(r, g, 0);
  counter = 0;

  // Init messaging
  message.send("MSG", "READY");
}

void loop() {
  currentMillis = millis();

  if (message.isKey("CMD")) {
    if (message.val() == "START") {
      buzz = true;
      activity = true;
      message.ack_ok();
    }
    if (message.val() == "STOP") {
      buzz = false;
      activity = false;
      message.ack_ok();
    }
  }

  if (((millis() - currentMillis) >= 500) && (analogRead(MANIVELLE_PIN) >= 1000) && (counter < 17))
    counter++;
  if (((millis() - currentMillis) >= 250) && (analogRead(MANIVELLE_PIN) <= 1000) && (counter > 0))
    counter--;

  if (buzz && activity) {
    if (counter == 0) {
      analogWrite(BUZZER_PIN, 600);
      digitalWrite(RELAY_PIN, HIGH);
    } else {
      analogWrite(BUZZER_PIN, 0);
      digitalWrite(RELAY_PINT, LOW);
    }
  } else {
    analogWrite(BUZZER_PIN, 0);
    digitalWrite(RELAY_PINT, LOW);
  }

  turn_on(counter);
}

void turn_on(int nb_led_max) {
  for (int r = 255, g = 0, nb_led = 0; nb_led < nb_led_max; nb_led++, r -= 15, g += 15)
    leds[nb_led] = CRGB(r, g, 0);
  for (int nb_led = nb_led_max; nb_led < NUM_LEDS; nb_led++)
    leds[nb_led] = CRGB(0, 0, 0);
  FastLED.show();
}

/*
void turn_off() {
  for (int nb_led = 0; nb_led < NUM_LEDS; nb_led++)
    leds[nb_led] = CRGB(0, 0, 0);
}
*/
