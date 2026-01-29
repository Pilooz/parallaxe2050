#include <Servo.h>

#define LED_PIN 5
#define pinYellowSharp 2
#define pinBlueExclamation 4
#define MSDELAY 10

/*
Command format : "X,Y,Z,R"
X,Y,Z
Z==1 lower pen, Z==0 raise pen
Y in [0, 250]
X in [-60, 60]
*/

Servo servo1;  
Servo servo2; 
Servo servoHead;  
double servo1Langle;
double servo2Langle;
double s1diff;
double s2diff;
double s1step;
double s2step;

int divby=50;

int pos;

//Variables for trignomentry
float baselen=4.5;
float arm1len=3.0;
float arm2len=6.0;
float selx;
float sely;
float pi=3.14159;

float baslenmid= baselen / 2;
float topstart= 3;
float arm3lens1;
float arm3lens2;

float S1angle;
float S2angle;

float C1angle;
float C2angle;

float S1Totangle;
float S2Totangle;
      
float initialangle=60;

bool pinState = false;

void go_to_home() {
  double servo1_home = 130;
  double servo2_home = 60;
  servo1.write(servo1_home); 
  servo2.write(servo2_home);
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  servo1.attach(10);
  servo2.attach(11);
  //servoHead.attach(9);
  delay(100);
  servo1Langle=130;
  servo2Langle=60;
  go_to_home();
  //servoHead.write(110);    
  Serial.begin(9600);
  pinMode(pinYellowSharp, INPUT);
  pinMode(pinBlueExclamation, INPUT_PULLUP);
  delay(100);
  //draw_interrogation_mark();
}

void loop() {
  Serial.write("Looping...\n");      
  if (digitalRead(pinBlueExclamation) && !pinState && (digitalRead(pinYellowSharp) == 0)) {
    Serial.write("Signal detected! Now drawing...\n");      
    pinState = true;
    draw_interrogation_mark();
    draw_interrogation_mark();
  }
  if ((digitalRead(pinYellowSharp) == 0) && (digitalRead(pinBlueExclamation) == 0)) {
    Serial.write("Signal lost!\n");    
    pinState = false;
  }
  delay(100);
}

void draw_interrogation_mark(){
  //servoHead.write(0);
  // delay(MSDELAY);
  //servoHead.write(180);
  // delay(MSDELAY);
  //servoHead.write(0);
  // delay(MSDELAY);  
  //servoHead.write(110);
  move(60,92);
  digitalWrite(LED_PIN, HIGH); 
  move(50,63);
  move(40,33);
  move(20,16);
  move(0,0);
  move(-20,16);
  move(-40,33);
  move(-50,59);
  move(-60,84);
  move(-56,109);
  move(-53,135);
  move(-39,143);
  move(0,151);
  move(0,185);
  move(0,219);
  move(0,244);
  digitalWrite(LED_PIN, LOW);
  delay(100);
  move(0,270);
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  move(0,0);
}


void move(int x, int y){
  Serial.println("Moving: " + String(x) + " " + String(y));

  double rotate1 = x;
  double rotate2 = y;
  selx=(rotate1/divby)+baslenmid;
  sely=(rotate2/divby)+topstart;
  anglecalc();
  S1Totangle=S1Totangle-initialangle;
  S2Totangle=180-(S2Totangle-initialangle);

  if(S1Totangle>=0 and S1Totangle<=180)
  {
    if(S2Totangle>=0 and S2Totangle<=180)
    {
      s1diff=servo1Langle-S1Totangle;
      s2diff=servo2Langle-S2Totangle;
      if(abs(s1diff)>abs(s2diff))
      {
        s1step=s1diff/abs(s1diff);
        s2step=s2diff/abs(s1diff);
        //Serial.print(s1step);
        //Serial.print("#####");
        //Serial.println(s2step);                                                          
        for (pos = 0; pos <= abs(s1diff); pos += 1) { 
          servo1Langle=servo1Langle-s1step;
          servo2Langle=servo2Langle-s2step;
          servo1.write(servo1Langle); 
          servo2.write(servo2Langle);                      
          //Serial.print(servo1Langle);
          //Serial.print("##");
          //Serial.println(servo2Langle);
          delay(MSDELAY);                       
        }            
        //Serial.print(S1Totangle);
        //Serial.print("##");
        //Serial.println(S2Totangle);            
        servo1.write(S1Totangle); 
        servo2.write(S2Totangle);                                  
      }
      else if(abs(s2diff)>0)
      {
        s1step=s1diff/abs(s2diff);
        s2step=s2diff/abs(s2diff);            
        //              Serial.print(s1step);
        //              Serial.print("*****");
        //              Serial.println(s2step);                                              
        for (pos = 0; pos <= abs(s2diff); pos += 1) { 
          servo1Langle=servo1Langle-s1step;
          servo2Langle=servo2Langle-s2step;
          servo1.write(servo1Langle); 
          servo2.write(servo2Langle);  
          //              Serial.print(servo1Langle);
          //              Serial.print("-");
          //              Serial.println(servo2Langle);                                  
          delay(MSDELAY);                       
        }                        
        //            Serial.print(S1Totangle);
        //            Serial.print("-");
        //            Serial.println(S2Totangle);                        
        servo1.write(S1Totangle); 
        servo2.write(S2Totangle); 
                                          
      }
      servo1Langle=S1Totangle;
      servo2Langle=S2Totangle;
    }
  }
  Serial.print("Move ends");
}

void anglecalc()
{
  arm3lens1 = sqrt((pow((selx - 0), 2)) + (pow((sely - 0), 2)));
  arm3lens2 = sqrt((pow((selx - baselen), 2)) + (pow((sely - 0), 2)));
  
  S1angle=findangle(arm1len, arm3lens1, arm2len);
  S2angle = findangle(arm1len, arm3lens2, arm2len);
  C1angle = findangle(baselen, arm3lens1, arm3lens2);
  C2angle = findangle(baselen, arm3lens2, arm3lens1);

  S1Totangle = round((S1angle + C1angle)*100)/100.00;
  S2Totangle = round((S2angle + C2angle)*100)/100.00;
  
}
float findangle(float opp,float adj,float hyp)
{
  float Scal;
  float Scal2;
  Scal2 = (pow(opp, 2) + pow(adj, 2) - pow(hyp, 2)) / (2.0 * opp * adj);
  Scal = acos(Scal2);
  Scal =findangle(Scal);
  return Scal;
}
float findangle(float radians)
{
  float degree;
  degree = radians * (180 / pi);
  return degree;
}

//void serialEvent() {
// while (Serial.available()) {
//    char inChar = (char)Serial.read();
//    if (inChar == 'R') {
//      Serial.println("Command: " + inputString);
//      stringComplete = true;
//      execute_move_command(inputString);
//      inputString = "";
//     }
//     else
//     {
//      inputString += inChar; 
//     }
//  }    
//}
