#include <SPI.h>
#include <MFRC522.h>
#include "protocole_parallaxe2050.h"

#define SS_PIN 10
#define RST_PIN 9
#define GLed 4
#define RLed 3

MFRC522 rfid(SS_PIN, RST_PIN); // Instance of the class

MFRC522::MIFARE_Key key;

ParallaxeCom message;

// Init array that will store new NUID
byte nuidPICC[4];

void setup() {
  Serial.begin(9600);
  SPI.begin(); // Init SPI bus
  rfid.PCD_Init(); // Init MFRC522

  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  pinMode(GLed, OUTPUT);
  digitalWrite(GLed, LOW);
  pinMode(RLed, OUTPUT);
  digitalWrite(RLed, LOW);
  message.send("NAME", "CODE");
  delay(5000);
  message.send("MSG", "READY");
}

void loop() {

  // Message handling
  if (message.isKey("CMD")) {
    if (message.val() == "G_LED") {
      digitalWrite(GLed, HIGH);
      delay(500);
      digitalWrite(GLed, LOW);
      message.send("MSG", "Green Led blink");
      message.ack_ok();
    }
    if (message.val() == "R_LED") {
      digitalWrite(RLed, HIGH);
      delay(500);
      digitalWrite(RLed, LOW);
      message.send("MSG", "Red Led blink");
      message.ack_ok();
    }
    if (!message.isProcessed()) {
      message.ack_ko("The command <CMD:" + message.val() + "/> is not recognized !");
    }
  }

  // Reset the loop if no new card present on the sensor/reader. This saves the entire process when idle.
  if ( ! rfid.PICC_IsNewCardPresent())
    return;

  // Verify if the NUID has been readed
  if ( ! rfid.PICC_ReadCardSerial())
    return;

  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);

  // Check is the PICC of Classic MIFARE type
  if (piccType != MFRC522::PICC_TYPE_MIFARE_MINI &&
      piccType != MFRC522::PICC_TYPE_MIFARE_1K &&
      piccType != MFRC522::PICC_TYPE_MIFARE_4K) {
    Serial.println(F("Your tag is not of type MIFARE Classic."));
    return;
  }

  // Store NUID into nuidPICC array
  for (byte i = 0; i < 4; i++) {
    nuidPICC[i] = rfid.uid.uidByte[i];
  }

  Serial.print(F("<CODE:"));
  printHex(rfid.uid.uidByte, rfid.uid.size);
  Serial.println("/>");

  // Halt PICC
  rfid.PICC_HaltA();

  // Stop encryption on PCD
  rfid.PCD_StopCrypto1();
}


/**
   Helper routine to dump a byte array as hex values to Serial.
*/
void printHex(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(buffer[i] < 0x10 ? "0" : "");
    Serial.print(buffer[i], HEX);
  }
}

void serialEvent() {
  message.receive();
}
