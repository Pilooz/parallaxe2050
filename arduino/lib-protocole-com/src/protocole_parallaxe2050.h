/*
 * 
 * Protocole de Serialmunication entre micro-controlleurs et SERIALveurs
 * Projet : Parallaxe2050 
 * Auteur : Pierre-Gilles Levallois - PGL CODING & MAKING - 2020
 *
 * Définition du protocole dans
 * parallaxe2050/doc/technique/Protocole-de-Serialmunication-arduino.md
 * 
 */

#include <Arduino.h>

#ifndef protocole_parallaxe2050_h
#define protocole_parallaxe2050_h

#define BEGIN_ENCAPS_MSG '<'
#define KEYWORD_DATA_SEPARATOR ':'
#define TRANSMISSION_TIMEOUT 50 // ms
#define END_TRANSMISSION_CHAR '\n'
#define TRANSMISSION_SPEED 9600
String END_ENCAPS_MSG="/>";

long current_time = 0;
long previous_time = 0;

struct ParallaxeMsg
{
    String keyword;
    String value;
    boolean treated;
};

class ParalaxeCom{
public:
    ParallaxeMsg received_msg;
    int countRecieved;
    int countSent;

    ParalaxeCom();
    void send(String keyword, String value);
    boolean isKey(String keyword);
    String key();
    String val();
    ParallaxeMsg receive();
    void ack_ok();
    void ack_ko(String reason);
 
private:
    boolean parseMessage(String str);
};

/**
 * Connstructor
 */
ParalaxeCom::ParalaxeCom() {
    // Init counter of total messages sent
    this->countSent = 0;
    this->countRecieved = 0;
    // Init message structure
    this->received_msg.keyword = "";
    this->received_msg.value = "";
    this->received_msg.treated = true;
}

String ParalaxeCom::val() {
    return this->received_msg.value;
}

String ParalaxeCom::key() {
    return this->received_msg.keyword;
}

boolean ParalaxeCom::isKey(String keyword) {
    if (!this->received_msg.treated) return (this->received_msg.keyword == keyword);
    return false;
}

ParallaxeMsg ParalaxeCom::receive() {
    String serializedMessage = "";
    if (Serial.available()) {
        serializedMessage = Serial.readStringUntil(END_TRANSMISSION_CHAR);
    }
    if (this->parseMessage(serializedMessage)) {
        return this->received_msg;
    } 
    return {"", ""};
}	

boolean ParalaxeCom::parseMessage( String str) {
    String k, v;
    int debIdx = str.indexOf(BEGIN_ENCAPS_MSG);
    int sepIdx = str.indexOf(KEYWORD_DATA_SEPARATOR);
    int endIdx = str.indexOf(END_ENCAPS_MSG);

    // Syntax checking
    if ( debIdx > -1 &&  sepIdx > debIdx && endIdx > sepIdx ) {
        k = str.substring(str.indexOf(BEGIN_ENCAPS_MSG)+1, str.indexOf(KEYWORD_DATA_SEPARATOR));
        v = str.substring(str.indexOf(KEYWORD_DATA_SEPARATOR)+1, str.indexOf(END_ENCAPS_MSG));
        // Error detections
        if (k == "") {
            this->send("ACK", "KO"); 
            this->send("MSG", "Keyword of message is null."); 
            return false;
        } else {
            this->received_msg.keyword = k;
            this->received_msg.value = v;
            this->received_msg.treated = false;
            this->countRecieved++;
            return true;
        }
    } else {
            this->send("ACK", "KO"); 
            this->send("MSG", "Unrecognized message format."); 
            return false;
    }
}

void ParalaxeCom::send(String keyword, String value) {
        current_time = millis();
        if (current_time - previous_time > TRANSMISSION_TIMEOUT) {
            Serial.print(END_TRANSMISSION_CHAR);
            previous_time = current_time;
        }
        String message = BEGIN_ENCAPS_MSG + keyword + KEYWORD_DATA_SEPARATOR + value + END_ENCAPS_MSG;
        Serial.flush();
        Serial.print(message);
        this->countSent++;
}

void ParalaxeCom::ack_ok() {
    this->received_msg.treated = true;
    this->send("ACK", "OK");
}

void ParalaxeCom::ack_ko(String reason) {
    this->received_msg.treated = true;
    this->send("ACK", "KO");
    this->send("MSG", reason);
}

#endif