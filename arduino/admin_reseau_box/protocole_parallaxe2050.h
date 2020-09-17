/*
 * 
 * Protocole de Communication entre micro-controlleurs et serveurs
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

//--------------------------------------------------------------------------------
// Message structure
//--------------------------------------------------------------------------------
struct ParallaxeMsg
{
    String keyword;
    String value;
    boolean processed;
};

//--------------------------------------------------------------------------------
// Class ParallaxeCom
//--------------------------------------------------------------------------------
class ParallaxeCom{
public:
    String serializedMessage = ""; // the list of received messages on Serial
    ParallaxeMsg received_msg; 
    // Counter for received and sent messaages
    int countRecieved;
    int countSent;

    ParallaxeCom();
    void send(String keyword, String value);
    boolean isKey(String keyword);
    String key();
    String val();
    boolean isProcessed();
    ParallaxeMsg receive();
    void ack_ok();
    void ack_ko(String reason);
 
private:
    boolean parseMessage();
};

//--------------------------------------------------------------------------------
// ParallaxeCom Constructor
//--------------------------------------------------------------------------------
ParallaxeCom::ParallaxeCom() {
    // Init counter of total messages sent
    this->countSent = 0;
    this->countRecieved = 0;
    // Init message structure
    this->received_msg.keyword = "";
    this->received_msg.value = "";
    this->received_msg.processed = true;
}

//--------------------------------------------------------------------------------
// Getter for the value of the message 
//--------------------------------------------------------------------------------
String ParallaxeCom::val() {
    return this->received_msg.value;
}

//--------------------------------------------------------------------------------
// Getter for the keyword of the message 
//--------------------------------------------------------------------------------
String ParallaxeCom::key() {
    return this->received_msg.keyword;
}

//--------------------------------------------------------------------------------
// Getter for the processed attribut of the message 
//--------------------------------------------------------------------------------
boolean ParallaxeCom::isProcessed() {
    return this->received_msg.processed;
}

//--------------------------------------------------------------------------------
// return true if the message keyword is identical to the parameter
// The message must be unprocessed yet.
//--------------------------------------------------------------------------------
boolean ParallaxeCom::isKey(String keyword) {
    if (!this->received_msg.processed) return (this->received_msg.keyword == keyword);
    return false;
}

//--------------------------------------------------------------------------------
// Receive and parse serialiezd messages from Serial.
// This function reads all the Serial data until a newline.
// It is possible that many messages are incomming, the parsing function treats 
// them one by one.
//--------------------------------------------------------------------------------
ParallaxeMsg ParallaxeCom::receive() {
    if (Serial.available()) {
        this->serializedMessage += Serial.readStringUntil(END_TRANSMISSION_CHAR);
    }
    if (this->parseMessage()) {
        return this->received_msg;
    } 
    return {"", ""};
}	

//--------------------------------------------------------------------------------
// Parsing function
// This function deserializes the String which arrives on serial 
// and parse the first message
//--------------------------------------------------------------------------------
boolean ParallaxeCom::parseMessage() {
    String k, v;
    int debIdx = this->serializedMessage.indexOf(BEGIN_ENCAPS_MSG);
    int sepIdx = this->serializedMessage.indexOf(KEYWORD_DATA_SEPARATOR);
    int endIdx = this->serializedMessage.indexOf(END_ENCAPS_MSG);

    // Syntax checking
    if ( debIdx > -1 &&  sepIdx > debIdx && endIdx > sepIdx ) {
        k = this->serializedMessage.substring(debIdx + 1, sepIdx);
        v = this->serializedMessage.substring(sepIdx + 1, endIdx);
        this->serializedMessage = this->serializedMessage.substring(endIdx + END_ENCAPS_MSG.length());
        // Error detections
        if (k == "") {
            this->send("ACK", "KO"); 
            this->send("MSG", "Keyword of message is null."); 
            return false;
        } else {
            this->received_msg.keyword = k;
            this->received_msg.value = v;
            this->received_msg.processed = false;
            this->countRecieved++;
            return true;
        }
    } else {
            this->send("ACK", "KO"); 
            this->send("MSG", "Unrecognized message format."); 
            return false;
    }
}

//--------------------------------------------------------------------------------
// Sends a message on Serial 
//--------------------------------------------------------------------------------
void ParallaxeCom::send(String keyword, String value) {
        // current_time = millis();
        // if (current_time - previous_time > TRANSMISSION_TIMEOUT) {
        //     Serial.print(END_TRANSMISSION_CHAR);
        //     previous_time = current_time;
        // }
        String message = BEGIN_ENCAPS_MSG + keyword + KEYWORD_DATA_SEPARATOR + value + END_ENCAPS_MSG;
        Serial.flush();
        Serial.print(message);
        Serial.print(END_TRANSMISSION_CHAR);
        this->countSent++;
}

//--------------------------------------------------------------------------------
// Send an 'OK' Acknoledgment message
// This allows to read the next message in the incoming string 
//--------------------------------------------------------------------------------
void ParallaxeCom::ack_ok() {
    this->received_msg.processed = true;
    this->send("ACK", "OK");
    // If the line had many messages, try to parse next
    if (this->serializedMessage.length() > 0) this->parseMessage();
}

//--------------------------------------------------------------------------------
// Send a 'KO' Acknoledgment message with a reason (dealing with errors)
// This allows to read the next message in the incoming string 
//--------------------------------------------------------------------------------
void ParallaxeCom::ack_ko(String reason) {
    this->received_msg.processed = true;
    this->send("ACK", "KO");
    this->send("MSG", reason);
    // If the line had many messages, try to parse next
    if (this->serializedMessage.length() > 0) this->parseMessage();
}

#endif
