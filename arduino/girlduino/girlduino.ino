#include <FastLED.h>
#include "protocole_parallaxe2050.h"

#define NUM_LEDS      16
#define DATA_PIN      5
#define COLOR_ORDER   GRB
#define LED_TYPE      WS2811
#define BRIGHTNESS    100

#define OUT_1 8
#define OUT_2 9
#define OUT_3 10
#define IN_1  6
#define IN_2  7

// CABLES COLORS AND VALUES
const int WHITE_CABLE   = 915;
const int YELLOW_CABLE  = 1010;
const int RED_CABLE     = 25;
const int GREEN_CABLE   = 325;
const int BLACK_CABLE   = 1010;


int tolerance = 25;

CRGB leds[NUM_LEDS];

ParallaxeCom message;

int bouton = 3;
int sortie01_sharp = 2;
int sortie02_point = 4;

bool activity = false;

void turn_led_to_color_rgb(int r, int g, int b) {
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB(r, g, b);
  }
  FastLED.show();
}


int V_IN_1 = LOW;
int V_IN_2 = LOW;

int test_val_point() {

  pinMode(OUT_1, OUTPUT);
  pinMode(OUT_2, OUTPUT);
  pinMode(OUT_3, INPUT);
  pinMode(IN_1, INPUT);
  pinMode(IN_2, INPUT);
  
  digitalWrite(OUT_1, HIGH);
  digitalWrite(OUT_2, LOW);
  
  V_IN_1 = digitalRead(IN_1);
  V_IN_2 = digitalRead(IN_2);
  
  Serial.print(V_IN_1);
  Serial.print(V_IN_2);
  Serial.println();
  
  if(V_IN_1 != HIGH){ return 0; }
  if(V_IN_2 != LOW){ return 0; }
  
  
  
  pinMode(OUT_1, OUTPUT);
  pinMode(OUT_2, OUTPUT);
  pinMode(OUT_3, INPUT);
  pinMode(IN_1, INPUT);
  pinMode(IN_2, INPUT);
  digitalWrite(OUT_1, LOW);
  digitalWrite(OUT_2, HIGH);
  V_IN_1 = digitalRead(IN_1);
  V_IN_2 = digitalRead(IN_2);

  Serial.print(V_IN_1);
  Serial.print(V_IN_2);
  Serial.println();
  
  if(V_IN_1 != LOW){ return 0; }
  if(V_IN_2 != HIGH){ return 0; }
  
  
  pinMode(OUT_1, INPUT);
  pinMode(OUT_2, OUTPUT);
  pinMode(OUT_3, OUTPUT);
  pinMode(IN_1, INPUT);
  pinMode(IN_2, INPUT);
  digitalWrite(OUT_2, LOW);
  digitalWrite(OUT_3, HIGH);
  V_IN_1 = digitalRead(IN_1);
  V_IN_2 = digitalRead(IN_2);

  Serial.print(V_IN_1);
  Serial.print(V_IN_2);
  Serial.println();
  
  if(V_IN_1 != HIGH){ return 0; }
  if(V_IN_2 != LOW){ return 0; }
  
  

  return 1;
  
}
  

void sparkle(int time) {
  int num_led = 0;

  for (int i = 0; i < time / 10; i++) {
    num_led = random(NUM_LEDS);
    leds[num_led] = CRGB(255, 255, 255);
    FastLED.show();
    delay(9);
    turn_led_to_color_rgb(0, 0, 0);
  }
}

void setup() {
  // put your setup code here, to run once:
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  turn_led_to_color_rgb(0, 0, 0);

  analogReference(DEFAULT);
  
  pinMode       (bouton, INPUT);

  pinMode       (sortie01_sharp, OUTPUT);
  digitalWrite  (sortie01_sharp, LOW);
  pinMode       (sortie02_point, OUTPUT);
  digitalWrite  (sortie02_point, LOW);

  pinMode       (13, OUTPUT);
  digitalWrite  (13, HIGH);

  Serial.begin(9600);
  while (!Serial);
  message.send("NAME", "GIRLDUINO");
  delay(2000);
  message.send("MSG", "READY");
}

void loop() {
  int valBouton = digitalRead(bouton);

  //serialEvent();
  if (message.isKey("CMD")) {
    if (message.val() == "START") {
      message.send("MSG", "START");
      message.ack_ok();
      activity = true;
    }
    if (message.val() == "STOP") {
      message.send("MSG", "STOP");
      message.ack_ok();
      activity = false;
    }
  }
  if (valBouton == 1 && activity) {

    if (test_val_point()) {
      message.send("SOLUTIONS", "TRUE");
      turn_led_to_color_rgb(0, 255, 0);
      digitalWrite (sortie02_point, HIGH);
      delay(100);
      digitalWrite (sortie02_point, LOW);
      delay(16300);
      message.send("MSG", "FINISHED");
      turn_led_to_color_rgb(0, 0, 0);
    }
    else {
      message.send("SOLUTIONS", "FALSE");
      //digitalWrite (sortie01_sharp, LOW);
      digitalWrite (sortie02_point, LOW);
      for (int r = 0; r < 255; r++) {
        turn_led_to_color_rgb(r, 0, 0);
        delay(2);
      }
      turn_led_to_color_rgb(255, 0, 0);
      delay(500);
      turn_led_to_color_rgb(0, 0, 0);
      sparkle(1000);
      turn_led_to_color_rgb(0, 0, 0);
    }

  } else {
    //digitalWrite (sortie01_sharp, LOW);
    digitalWrite (sortie02_point, LOW);
  }
}

void serialEvent() {
  if (Serial.available()) {
    message.receive();
  }
}
