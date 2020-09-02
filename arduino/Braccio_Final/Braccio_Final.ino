/*
  File: serialBraccio.ino

  Copyright 2018 Stefan Strömberg, stefangs@nethome.nu

  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
  in compliance with the License. You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software distributed under the License
  is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
  either express or implied. See the License for the specific language governing permissions and
  limitations under the License.
*/

/*
  This example reads robot positions from the serial port and puts
  the Braccio in those positions. A position is formatted as:

  P90,90,90,90,90,73,100<NL>

  Where the numbers are the joint angels in the same order as in the Position class and the last
  number is the speed of the movement in degrees per second.
  When the arm has reached the specified position it will answer with the string:

  OK<NL>

  You can also issue the Home command (H), to put the robot in the home position, the Off command (0)
  to turn off the robot or the On command (1) to turn on the robot:

  H<NL>

  Note, that when opening the serial port to Arduino, the Arduino restarts, which causes
  it to become non responsive for serial input for a couple of seconds. Therefore a
  controller program should wait at least 3 seconds after opening the port before sending
  any commands. An example in Python:

  s = serial.Serial('COM4', 115200, timeout=5)
  time.sleep(3)
  s.write(b'P0,90,20,90,90,73,100\n')
  print(s.readline())
  s.write(b'P90,90,20,90,90,73,100\n')
  print(s.readline())

  You should also wait until you get an "OK" (or "E0") from the Arduino before sending the
  next position, like in the above example using readline().
*/

#include <Servo.h>
#include "BraccioRobot.h"
#include "protocole_parallaxe2050.h"

ParallaxeCom message;
Position armPosition;
static int pinLed = 8;

void serialEvent() {
  if (Serial.available()) {
    message.receive();
  }
}

void setup() {
  Serial.begin(9600);
  while (!Serial);
  BraccioRobot.init();
  delay(1000);
  home_pos();
  pinMode(pinLed, OUTPUT);
  digitalWrite(pinLed, LOW);
  message.send("MSG", "READY");
}

void loop() {
  serialEvent();
  if (message.isKey("CMD")) {
    if (message.val() == "#") {
      sharp();
      message.send("MSG", "ARM HAS JUST FINISHED DRAWING THE SHARP");
    }
    if (message.val() == "!") {
      exclamation();
      message.send("MSG", "ARM HAS JUST FINISHED DRAWING THE EXCLAMATION POINT");
    }
    message.ack_ok();
  }
}

void sharp() {
  message.send("MSG", "ARM IS DRAWING THE SHARP");
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
  BraccioRobot.moveToPosition(armPosition.set(90, 135, 165, 150, 10, 73), 20);
  delay(50);
  BraccioRobot.moveToPosition(armPosition.set(110, 140, 160, 150, 20, 73), 20);
  delay(100);
  write_led(); // end of draw second line

  BraccioRobot.moveToPosition(armPosition.set(98, 130, 170, 160, 20, 73), 20);
  delay(100);
  write_led(); // start of draw third line
  BraccioRobot.moveToPosition(armPosition.set(98, 170, 150, 70, 10, 73), 20);
  delay(100);
  write_led(); // end of draw third line

  BraccioRobot.moveToPosition(armPosition.set(110, 155, 170, 60, 10, 73), 20);
  delay(100);
  write_led(); // start of draw fourth line
  BraccioRobot.moveToPosition(armPosition.set(90, 150, 175, 60, 10, 73), 20);
  delay(50);
  BraccioRobot.moveToPosition(armPosition.set(70, 155, 170, 60, 10, 73), 20);
  delay(100);
  write_led(); // end of draw fourth line
  home_pos();
}

void exclamation () {
  message.send("MSG", "ARM IS DRAWING THE EXCLAMATION POINT");
  write_pos();
  write_led();
  BraccioRobot.moveToPosition(armPosition.set(90, 145, 150, 150, 10, 73), 20);
  write_led();
  BraccioRobot.moveToPosition(armPosition.set(90, 135, 160, 160, 10, 73), 20);
  write_led();
  delay(100);
  write_led();
  home_pos();
}

void home_pos() {
  BraccioRobot.moveToPosition(armPosition.set(90, 175, 150, 70, 10, 73), 20);
  delay(500);
  BraccioRobot.moveToPosition(armPosition.set(180, 175, 150, 0, 10, 73), 50);
  delay(200);
  BraccioRobot.moveToPosition(armPosition.set(180, 175, 0, 0, 10, 73), 50);
  delay(200);
  BraccioRobot.moveToPosition(armPosition.set(90, 90, 90, 90, 10, 73), 50);
  delay(100);
  BraccioRobot.moveToPosition(armPosition.set(90, 30, 170, 170, 0, 73), 50);
}

void write_pos() {
  BraccioRobot.moveToPosition(armPosition.set(90, 175, 150, 70, 10, 73), 20);
}

void write_led() {
  digitalWrite(pinLed, !digitalRead(pinLed));
}
