#include <FastLED.h>
#include "protocole_parallaxe2050.h"

#define NUM_LEDS      16
#define DATA_PIN      5
#define COLOR_ORDER   GRB
#define LED_TYPE      WS2811
#define BRIGHTNESS    100

// CABLES COLORS AND VALUES
#define WHITE_CABLE   860
#define YELLOW_CABLE  965
#define RED_CABLE     25
#define GREEN_CABLE   310
#define BLACK_CABLE   965

CRGB leds[NUM_LEDS];

ParallaxeCom message;

int bouton = 3;
int sortie01_sharp = 2;
int sortie02_point = 4;

bool activity = false;

void setup() {
  // put your setup code here, to run once:
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  turn_led_to_color_rgb(0, 0, 0);

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

  Serial.begin(9600);
  while (!Serial);
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

  serialEvent();
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

    if (test_val_sharp(valA0, valA1, valA2, valA3, valA4, valA5)) {
      message.send("SOLUTIONS", "TRUE");
      turn_led_to_color_rgb(0, 255, 0);
      digitalWrite (sortie01_sharp, HIGH);
      delay(100);
      digitalWrite (sortie01_sharp, LOW);
      delay(27250);
      turn_led_to_color_rgb(0, 0, 0);
    }
    else if (test_val_point(valA0, valA1, valA2, valA3, valA4, valA5)) {
      message.send("SOLUTIONS", "TRUE");
      turn_led_to_color_rgb(0, 255, 0);
      digitalWrite (sortie02_point, HIGH);
      delay(100);
      digitalWrite (sortie02_point, LOW);
      delay(16300);
      turn_led_to_color_rgb(0, 0, 0);
    }
    else {
      message.send("SOLUTIONS", "FALSE");
      digitalWrite (sortie01_sharp, LOW);
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
    digitalWrite (sortie01_sharp, LOW);
    digitalWrite (sortie02_point, LOW);
  }
}

void turn_led_to_color_rgb(int r, int g, int b) {
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB(r, g, b);
  }
  FastLED.show();
}

int test_val_sharp(int A0, int A1, int A2, int A3, int A4, int A5) {
  int result = 0;

  if ((A1 >= RED_CABLE - 5) && (A1 <= RED_CABLE + 5)) {
    //message.send("MSG", "RED_CABLE OK");
    result++;
  }
  if ((A2 >= BLACK_CABLE - 15) && (A2 <= BLACK_CABLE + 15)) {
    //message.send("MSG", "BLACK_CABLE OK");
    result++;
  }
  if ((A3 >= GREEN_CABLE - 5) && (A3 <= GREEN_CABLE + 5)) {
    //message.send("MSG", "GREEN_CABLE OK");
    result++;
  }
  if ((A4 >= YELLOW_CABLE - 15) && (A4 <= YELLOW_CABLE + 15)) {
    //message.send("MSG", "YELLOW_CABLE OK");
    result++;
  }
  if ((A5 >= WHITE_CABLE - 20) && (A5 <= WHITE_CABLE + 20)) {
    //message.send("MSG", "WHITE_CABLE OK");
    result++;
  }
  //Serial.println(result);
  if (result == 5)
    return 1;
  return 0;
}

int test_val_point(int A0, int A1, int A2, int A3, int A4, int A5) {
  int result = 0;

  if ((A0 >= RED_CABLE - 5) && (A0 <= RED_CABLE + 5)) {
    //message.send("MSG", "RED_CABLE OK");
    result++;
  }
  if ((A2 >= BLACK_CABLE - 15) && (A2 <= BLACK_CABLE + 15)) {
    //message.send("MSG", "BLACK_CABLE OK");
    result++;
  }
  if ((A3 >= WHITE_CABLE - 20) && (A3 <= WHITE_CABLE + 20)) {
    //message.send("MSG", "WHITE_CABLE OK");
    result++;
  }
  if ((A4 >= GREEN_CABLE - 5) && (A4 <= GREEN_CABLE + 5)) {
    //message.send("MSG", "GREEN_CABLE OK");
    result++;
  }
  if ((A5 >= YELLOW_CABLE - 15) && (A5 <= YELLOW_CABLE + 15)) {
    //message.send("MSG", "YELLOW_CABLE OK");
    result++;
  }
  //Serial.println(result);
  if (result == 5)
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

void serialEvent() {
  if (Serial.available()) {
    message.receive();
  }
}
