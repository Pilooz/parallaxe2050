#include <FastLED.h>
#include "protocole_parallaxe2050.h"

#define NUM_LEDS      16
#define DATA_PIN      5
#define COLOR_ORDER   GRB
#define LED_TYPE      WS2811
#define BRIGHTNESS    100

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

int test_val_point(int v0, int v1, int v2, int v3, int v4, int v5) {
  int result = 0;
  String red="\"red\":", black="}, {\"black\":", yellow="}, {\"yellow\":", white="}, {\"white\":", green="}, {\"green\":";
  
  Serial.println("-----------------------------------------------");
  Serial.print("Tolerance + ou - "); Serial.print(tolerance);
  Serial.println("\nRED\tBLACK\tYELLOW\tWHITE\tGREEN");
  Serial.print(RED_CABLE);
  Serial.print("\t");
  Serial.print(BLACK_CABLE);
  Serial.print("\t");
  Serial.print(YELLOW_CABLE);
  Serial.print("\t");
  Serial.print(WHITE_CABLE);
  Serial.print("\t");
  Serial.println(GREEN_CABLE);

  Serial.print(""); Serial.print(v0);
  if ((v0 >= RED_CABLE - tolerance) && (v0 <= RED_CABLE + tolerance)) { //5
    Serial.print("*");
    red += "1";
    result++;
  } else {
    red+="0";
  }
  
  Serial.print("\t"); Serial.print(v2);
  if ((v2 >= BLACK_CABLE - tolerance) && (v2 <= BLACK_CABLE + tolerance)) { //10
    Serial.print("*");
    black+="1";
    result++;
  } else {
    black+="0";
  }
  
  Serial.print("\t"); Serial.print(v3);
  if ((v3 >= YELLOW_CABLE - tolerance) && (v3 <= YELLOW_CABLE + tolerance)) { //10
    Serial.print("*");
    yellow+="1";
    result++;
  } else {
    yellow+="0";
  }
  
  Serial.print("\t"); Serial.print(v4);
  if ((v4 >= WHITE_CABLE - tolerance) && (v4 <= WHITE_CABLE + tolerance)) { //10
    Serial.print("*");
    white+="1";
    result++;
  } else {
    white+="0";
  }
  
  Serial.print("\t"); Serial.print(v5);
  if ((v5 >= GREEN_CABLE - tolerance) && (v5 <= GREEN_CABLE + tolerance)) { //10
    Serial.print("*");
    green+="1";
    result++;
  } else {
    green+="0";
  }
  
  Serial.print("\nResult is "); Serial.println(result);
  Serial.println("-----------------------------------------------");

  message.send("VALUES", "[ {" + red + black + yellow + white + green + "} ]");
  if (result >= 4)
    return 1;
  return 0;
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

  pinMode       (A0, INPUT);
  pinMode       (A1, INPUT);
  pinMode       (A2, INPUT);
  pinMode       (A3, INPUT);
  pinMode       (A4, INPUT);
  pinMode       (A5, INPUT);

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
  int valA0 = analogRead (A0);
  int valA1 = analogRead (A1);
  int valA2 = analogRead (A2);
  int valA3 = analogRead (A3);
  int valA4 = analogRead (A4);
  int valA5 = analogRead (A5);

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

    if (test_val_point(valA0, valA1, valA2, valA3, valA4, valA5)) {
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
