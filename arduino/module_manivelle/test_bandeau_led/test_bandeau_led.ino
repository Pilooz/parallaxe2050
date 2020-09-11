#include "FastLED.h"

#define NUM_LEDS 17
#define DATA_PIN 3

CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  for (int r = 255, g = 0, nb_led = 0; nb_led < NUM_LEDS; nb_led++, r -= 15, g += 15)
    leds[nb_led] = CRGB(r, g, 0);

}

void loop() {
  turn_on(17);
  FastLED.show();
  delay(1000);
  turn_off(); 
  FastLED.show();
  delay(1000);
}

void turn_on(int nb_led_max) {
  for (int r = 255, g = 0, nb_led = 0; nb_led < nb_led_max; nb_led++, r -= 15, g += 15)
    leds[nb_led] = CRGB(r, g, 0);
  for (int nb_led = nb_led_max; nb_led < NUM_LEDS; nb_led++)
    leds[nb_led] = CRGB(0, 0, 0);
}

void turn_off() {
  for (int nb_led = 0; nb_led < NUM_LEDS; nb_led++)
    leds[nb_led] = CRGB(0, 0, 0);
}
