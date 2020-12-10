#include <Servo.h>
#include "BraccioRobot.h"

#define pinYellowSharp 2
#define pinBlueExclamation 4
#define pinLed 8

Position armPosition;

bool pinState = false;

void setup() {
  BraccioRobot.init();
  delay(1000);
  home_pos();
  pinMode(pinLed, OUTPUT);
  digitalWrite(pinLed, LOW);
  pinMode(pinYellowSharp, INPUT);
  pinMode(pinBlueExclamation, INPUT_PULLUP);
  digitalWrite(pinBlueExclamation, LOW);
}

void loop() {
  //if (digitalRead(pinYellowSharp) && !pinState && !digitalRead(pinBlueExclamation)) {
  //  pinState = true;13m2pg#
  
  //  sharp();
  //}
  if (digitalRead(pinBlueExclamation) && !pinState && (digitalRead(pinYellowSharp) == 0)) {
    pinState = true;
    exclamation();
  }
  if ((digitalRead(pinYellowSharp) == 0) && (digitalRead(pinBlueExclamation) == 0)) {
    pinState = false;
  }
}

/*
void sharp() {
  write_pos();
  delay(100);
  BraccioRobot.moveToPosition(armPosition.set(82, 175, 150, 70, 10, 73), 20);
  delay(200);
  write_led(); // start of draw first line
  BraccioRobot.moveToPosition(armPosition.set(82, 130, 170, 160, 10, 73), 20);
  delay(100);
  write_led(); // end of draw first line

  BraccioRobot.moveToPosition(armPosition.set(70, 140, 160, 150, 0, 73), 20);
  delay(100);
  write_led(); // start of draw second line
  BraccioRobot.moveToPosition(armPosition.set(92, 132, 165, 150, 10, 73), 20);
  delay(50);
  BraccioRobot.moveToPosition(armPosition.set(110, 137, 160, 150, 20, 73), 20);
  delay(100);
  write_led(); // end of draw second line

  BraccioRobot.moveToPosition(armPosition.set(98, 135, 170, 160, 20, 73), 20);
  delay(100);
  write_led(); // start of draw third line
  BraccioRobot.moveToPosition(armPosition.set(98, 173, 150, 70, 10, 73), 20);
  delay(100);
  write_led(); // end of draw third line

  BraccioRobot.moveToPosition(armPosition.set(110, 160, 170, 60, 10, 73), 20);
  delay(100);
  write_led(); // start of draw fourth line
  BraccioRobot.moveToPosition(armPosition.set(92, 155, 175, 60, 10, 73), 20);
  delay(50);
  BraccioRobot.moveToPosition(armPosition.set(70, 160, 170, 60, 10, 73), 20);
  delay(100);
  write_led(); // end of draw fourth line
  home_pos();
}
*/

void exclamation () {
  write_pos();
  write_led();
  BraccioRobot.moveToPosition(armPosition.set(92, 145, 150, 150, 10, 73), 20);
  write_led();
  BraccioRobot.moveToPosition(armPosition.set(92, 135, 160, 160, 10, 73), 20);
  write_led();
  delay(100);
  write_led();
  home_pos();
}

void home_pos() {
  BraccioRobot.moveToPosition(armPosition.set(92, 150, 150, 70, 10, 73), 100);
  BraccioRobot.moveToPosition(armPosition.set(102, 175, 150, 0, 10, 73), 150);
  BraccioRobot.moveToPosition(armPosition.set(102, 175, 30, 0, 10, 73), 150);
  BraccioRobot.moveToPosition(armPosition.set(92, 90, 170, 90, 10, 73), 150);
  BraccioRobot.moveToPosition(armPosition.set(92, 55, 170, 150, 0, 73), 100);
}

void write_pos() {
  BraccioRobot.moveToPosition(armPosition.set(92, 175, 165, 55, 10, 73), 20);
}

void write_led() {
  digitalWrite(pinLed, !digitalRead(pinLed));
}
