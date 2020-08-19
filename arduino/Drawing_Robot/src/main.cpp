#include "protocole_parallaxe2050.h"
#include <MKRMotorCarrier.h>
#include "deplacement.h"

ParallaxeCom message;

#define INTERRUPT_PIN 6

void put_in(char* tab, String str) {
  for (int j = 0; str[j] != '\0'; j++)
    tab[j] = str[j];
}

void serialEvent() {
  if (Serial.available()) {
    message.receive();
  }
}

void setup() {
  Serial.begin(9600);
  while (!Serial);
  if (controller.begin())
  {
    Serial.print("MKR Motor Shield connected, firmware version ");
    Serial.println(controller.getFWVersion());
  }
  else
  {
    Serial.println("Couldn't connect! Is the red led blinking? You may need to update the firmware with FWUpdater sketch");
    while (1);
  }
  //Serial.println("reboot");
  //controller.reboot();
  delay(500);
  float batteryVoltage = (float)battery.getConverted();
  Serial.print("Battery voltage: ");
  Serial.print(batteryVoltage);
  Serial.print("V, Raw ");
  Serial.println(battery.getRaw());
  message.send("MSG", "READY");
}

void loop() {
  serialEvent();
  int i = 0;
  char tab [100][3];

  if (message.isKey("CMD")) {
    if (message.val() == "UP") {
      up(1000);
      put_in(tab[i], "up\0");
    }
    if (message.val() == "DOWN") {
      down(1000);
      put_in(tab[i], "dw\0");
    }
    if (message.val() == "H_LEFT") {
      horizontal_left(1000);
      put_in(tab[i], "hl\0");
    }
    if (message.val() == "H_RIGHT") {
      horizontal_right(1000);
      put_in(tab[i], "hr\0");
    }
    if (message.val() == "DIAG_UP_LEFT") {
      diag_up_left(1000, 3);
      put_in(tab[i], "ul\0");
    }
    if (message.val() == "DIAG_UP_RIGHT") {
      diag_up_right(20000, 3);
      put_in(tab[i], "ur\0");
    }
    if (message.val() == "RIGHT_UP") {
      r_up(1000);
      put_in(tab[i], "ru\0");
    }
    if (message.val() == "LEFT_UP") {
      l_up(1000);
      put_in(tab[i], "lu\0");
    }
    if (message.val() == "RIGHT_DOWN") {
      r_down(1000);
      put_in(tab[i], "rd\0");
    }
    if (message.val() == "LEFT_DOWN") {
      l_down(1000);
      put_in(tab[i], "ld\0");
    }
    if (message.val() == "RESET") {
      encoder1.resetCounter(0);
      encoder2.resetCounter(0);
      Serial.print("RESETED\n");
    }
    if (message.val() == "RESET_10000") {
      encoder1.resetCounter(10000);
      encoder2.resetCounter(10000);
      Serial.print("RESETED to 10000\n");
    }
    if (message.val() == "VALUE") {
      print_value();
    }
    if (message.val() == "RESET_POS") {
      reset_pos();
      Serial.print("RESETED POS\n");
    }
    if (message.val() == "DRAW_#") {
      draw_sharp();
      Serial.print("Sharp Drawn\n");
    }
    i++;
    message.ack_ok();
  }
  controller.ping();
  M1.setDuty(0);
  M2.setDuty(0);
  delay(10);
}