
// code forké sur un code initial d'equalizer

#include <FastLED.h>
#include "protocole_parallaxe2050.h"


#define LED_PIN     4
#define NUM_LEDS    17
#define BRIGHTNESS  10
#define LED_TYPE    WS2811
#define COLOR_ORDER GRB
CRGB leds[NUM_LEDS];

#define UPDATES_PER_SECOND 100

ParallaxeCom message;

//  INPUT SETUP
int pin_manivelle = A0;
int relay = 8;
int buzzer = 10;


// STANDARD VISUALIZER VARIABLES
int loop_max = 0;
int k = 255; // COLOR WHEEL POSITION
int decay = 0; // HOW MANY MS BEFORE ONE LIGHT DECAY
int decay_check = 0;
long pre_react = 0; // NEW SPIKE CONVERSION
long react = 0; // NUMBER OF LEDs BEING LIT
long post_react = 0; // OLD SPIKE CONVERSION

// RAINBOW WAVE SETTINGS
int wheel_speed = 3;

// create the bool value for buzzing
bool buzz;
// create the bool value for activity
bool activity;

void setup()
{
  // SERIAL SETUP
  Serial.begin(9600);

  pinMode (relay, OUTPUT);
  pinMode (buzzer, OUTPUT);
  // LED LIGHTING SETUP
  delay( 3000 ); // power-up safety delay
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection( TypicalLEDStrip );
  FastLED.setBrightness(  BRIGHTNESS );

  // CLEAR LEDS
  for (int i = 0; i < NUM_LEDS; i++)
    leds[i] = CRGB(0, 0, 0);
  FastLED.show();

  // INPUT SETUP
  pinMode(pin_manivelle, INPUT);

  // interaction with computer
  buzz = false;
  activity = false;


  // arduino just finish setup
  message.send("MSG", "READY");
}

// FUNCTION TO GENERATE COLOR BASED ON VIRTUAL WHEEL
// https://github.com/NeverPlayLegit/Rainbow-Fader-FastLED/blob/master/rainbow.ino
CRGB Scroll(int pos) {
  CRGB color (0, 0, 0);
  if (pos < 85) {
    color.g = 0;
    color.r = 255;
    color.b = 0;
  } else if (pos > 85 && pos < 170) {
    color.g = 255;
    color.r = 255;
    color.b = 0;
  } else if (pos > 170 && pos < 256) {
    color.b = 0;
    color.g = 255;
    color.r = 0;
  }
  return color;
}

// FUNCTION TO GET AND SET COLOR
// THE ORIGINAL FUNCTION WENT BACKWARDS
// THE MODIFIED FUNCTION SENDS WAVES OUT FROM FIRST LED
// https://github.com/NeverPlayLegit/Rainbow-Fader-FastLED/blob/master/rainbow.ino
void rainbow()
{
  for (int i = NUM_LEDS - 1; i >= 0; i--) {
    if (i < react)
      leds[i] = Scroll((i * 256 / 50 + k) % 256);
    else
      leds[i] = CRGB(0, 0, 0);
  }
  FastLED.show();
}

void loop()
{
  // Message handling
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

  if (!buzz)
    analogWrite (buzzer, 0);
  if (!activity)
    digitalWrite (relay, HIGH);

  int sig_manivelle = analogRead(pin_manivelle); // ADD x2 HERE FOR MORE SENSITIVITY

  if (sig_manivelle > 100)
  {
    digitalWrite (relay, HIGH);
    analogWrite (buzzer, 0);
    pre_react = ((long)NUM_LEDS * (long)sig_manivelle) / 1023L; // TRANSLATE AUDIO LEVEL TO NUMBER OF LEDs

    if (pre_react > react) // ONLY ADJUST LEVEL OF LED IF LEVEL HIGHER THAN CURRENT LEVEL
      react = pre_react;

    //Serial.print(sig_manivelle);
    //Serial.print(" -> ");
    //Serial.println(pre_react);
  }
  else
  {
    if (buzz)
      analogWrite (buzzer, 600);
    if (activity)
      digitalWrite (relay, LOW);
  }


  rainbow(); // APPLY COLOR

  k = k - wheel_speed; // SPEED OF COLOR WHEEL
  if (k < 0) // RESET COLOR WHEEL
    k = 255;

  // REMOVE LEDs
  decay_check++;
  if (decay_check > decay)
  {
    decay_check = 0;
    if (react > 0)
      react--;
  }

  //delay(1);
}

void serialEvent() {
  message.receive();
}
