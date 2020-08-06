/*
 
 // capteurs :

- Capteur 01 : 2
- Capteur 02 : 3
- Capteur 03 : 4
- Capteur 04 : 5
- Capteur 05 : 6
- Capteur 06 : 7
- Capteur 07 : 8
- Capteur 08 : 9
- Capteur 09 : 10
- Capteur 10 : 11
- Capteur alliés 1 : 12
- Capteur alliés 2 : 13
- Capteur base : (pas de capteur, base = 5v)


///relais (aimants):

- Relais 01 : 40         ----- port relais A : 4
- Relais 02 : 41         ----- port relais A : 5
- Relais 03 : 42         ----- port relais A : 6
- Relais 04 : 43         ----- port relais A : 7
- Relais 05 : 44         ----- port relais A : 8
- Relais 06 : 45         ----- port relais B : 2
- Relais 07 : 46         ----- port relais B : 3
- Relais 08 : 47         ----- port relais B : 4
- Relais 09 : 48         ----- port relais B : 5
- Relais 10 : 49         ----- port relais B : 6
- Relais alliés 1 : 51   ----- port relais B : 7
- Relais alliés 2 : 52   ----- port relais B : 8
- Relais base : 50       ----- port relais A : 1 (attention, relais A)


// LEDs :

- LED 01 : 18
- LED 02 : 19
- LED 03 : 20
- LED 04 : 21
- LED 05 : 22
- LED 06 : 23
- LED 07 : 24
- LED 08 : 25
- LED 09 : 26
- LED 10 : 27
- LED alliés 1 : 28
- LED alliés 2 : 29
- LED base : 30

// bouton principal : 35

*/
int C01 = 2;
int C02 = 3;
int C03 = 4;
int C04 = 5;
int C05 = 6;
int C06 = 7;
int C07 = 8;
int C08 = 9;
int C09 = 10;
int C10 = 11;
int C_A01 = 12;
int C_A02 = 13;

int LED01 = 18;
int LED02 = 19;
int LED03 = 20;
int LED04 = 21;
int LED05 = 22;
int LED06 = 23;
int LED07 = 24;
int LED08 = 25;
int LED09 = 26;
int LED10 = 27;
int LED_A01 = 28;
int LED_A02 = 29;
int LED_Base = 30;


int R_01 = 40;
int R_02 = 41;
int R_03 = 42;
int R_04 = 43;
int R_05 = 44;
int R_06 = 45;
int R_07 = 46;
int R_08 = 47;
int R_09 = 48;
int R_10 = 49;
int R_A01 = 51;
int R_A02 = 52; 
int R_Base = 50; 

void setup() {

Serial.begin(9600);

pinMode (LED01,OUTPUT);
pinMode (LED02,OUTPUT);
pinMode (LED02,OUTPUT);
pinMode (LED03,OUTPUT);
pinMode (LED04,OUTPUT);
pinMode (LED05,OUTPUT);
pinMode (LED06,OUTPUT);
pinMode (LED07,OUTPUT);
pinMode (LED08,OUTPUT);
pinMode (LED09,OUTPUT);
pinMode (LED10,OUTPUT);
pinMode (LED_A01,OUTPUT);
pinMode (LED_A02,OUTPUT);
pinMode (LED_Base,OUTPUT);

pinMode (R_01,OUTPUT);
pinMode (R_02,OUTPUT);
pinMode (R_03,OUTPUT);
pinMode (R_04,OUTPUT);
pinMode (R_05,OUTPUT);
pinMode (R_06,OUTPUT);
pinMode (R_07,OUTPUT);
pinMode (R_08,OUTPUT);
pinMode (R_09,OUTPUT);
pinMode (R_10,OUTPUT);
pinMode (R_A01,OUTPUT);
pinMode (R_A02,OUTPUT);
pinMode (R_Base,OUTPUT);

pinMode (C01,INPUT);
pinMode (C02,INPUT);
pinMode (C03,INPUT);
pinMode (C04,INPUT);
pinMode (C05,INPUT);
pinMode (C06,INPUT);
pinMode (C07,INPUT);
pinMode (C08,INPUT);
pinMode (C09,INPUT);
pinMode (C10,INPUT);
pinMode (C_A01,INPUT);
pinMode (C_A02,INPUT);

digitalWrite (R_01,HIGH);
digitalWrite (R_02,HIGH);
digitalWrite (R_03,HIGH);
digitalWrite (R_04,HIGH);
digitalWrite (R_05,LOW);
digitalWrite (R_06,LOW);
digitalWrite (R_07,LOW);
digitalWrite (R_08,LOW);
digitalWrite (R_09,LOW);
digitalWrite (R_10,LOW);
digitalWrite (R_A01,LOW);
digitalWrite (R_A02,LOW);
digitalWrite (R_Base,HIGH);
}

void loop() {

int val_C01 = digitalRead (C01);
int val_C02 = digitalRead (C02);
int val_C03 = digitalRead (C03);
int val_C04 = digitalRead (C04);
int val_C05 = digitalRead (C05);
int val_C06 = digitalRead (C06);
int val_C07 = digitalRead (C07);
int val_C08 = digitalRead (C08);
int val_C09 = digitalRead (C09);
int val_C10 = digitalRead (C10);
int val_C_A01 = digitalRead (C_A01);
int val_C_A02 = digitalRead (C_A02);
Serial.print ("C01 :");
Serial.println (val_C01);
Serial.print ("C02 :");
Serial.println (val_C02);
Serial.print ("C03 :");
Serial.println (val_C03);
Serial.print ("C04 :");
Serial.println (val_C04);
Serial.print ("C05 :");
Serial.println (val_C05);
Serial.print ("C06 :");
Serial.println (val_C06);
Serial.print ("C07 :");
Serial.println (val_C07);
Serial.print ("C08 :");
Serial.println (val_C08);
Serial.print ("C09 :");
Serial.println (val_C09);
Serial.print ("C10 :");
Serial.println (val_C10);
Serial.print ("C_A01 :");
Serial.println (val_C_A01);
Serial.print ("C_A02 :");
Serial.println (val_C_A02);

  delay(500);
/*
digitalWrite (LED01,HIGH);
digitalWrite (LED02,HIGH);
digitalWrite (LED03,HIGH);
digitalWrite (LED04,HIGH);
digitalWrite (LED05,HIGH);
digitalWrite (LED06,HIGH);
digitalWrite (LED07,HIGH);
digitalWrite (LED08,HIGH);
digitalWrite (LED09,HIGH);
digitalWrite (LED10,HIGH);
digitalWrite (LED_A01,HIGH);
digitalWrite (LED_A02,HIGH);
digitalWrite (LED_Base,HIGH);
delay(2000);
digitalWrite (LED01,LOW);
digitalWrite (LED02,LOW);
digitalWrite (LED03,LOW);
digitalWrite (LED04,LOW);
digitalWrite (LED05,LOW);
digitalWrite (LED06,LOW);
digitalWrite (LED07,LOW);
digitalWrite (LED08,LOW);
digitalWrite (LED09,LOW);
digitalWrite (LED10,LOW);
digitalWrite (LED_A01,LOW);
digitalWrite (LED_A02,LOW);
digitalWrite (LED_Base,LOW);
delay(2000);
*/

digitalWrite (R_01,LOW);
digitalWrite (R_02,LOW);
digitalWrite (R_03,LOW);
digitalWrite (R_04,LOW);
digitalWrite (R_05,LOW);
digitalWrite (R_06,HIGH);
digitalWrite (R_07,HIGH);
digitalWrite (R_08,HIGH);
digitalWrite (R_09,HIGH);
digitalWrite (R_10,HIGH);
digitalWrite (R_A01,HIGH);
digitalWrite (R_A02,HIGH);
digitalWrite (R_Base,LOW);

digitalWrite (LED01,HIGH);
digitalWrite (LED02,HIGH);
digitalWrite (LED03,HIGH);
digitalWrite (LED04,HIGH);
digitalWrite (LED05,HIGH);
digitalWrite (LED_Base,HIGH);
/*
if (val_C01 == 1)
{
  digitalWrite (LED01,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C01 == 0)
{
  digitalWrite (LED01,LOW);
  }

else if (val_C02 == 1)
{
  digitalWrite (LED02,HIGH);
  }
else if (val_C02 == 0)
{
  digitalWrite (LED02,LOW);
  }

else if (val_C03 == 1)
{
  digitalWrite (LED03,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C03 == 0)
{
  digitalWrite (LED03,LOW);
  }

else if (val_C04 == 1)
{
  digitalWrite (LED04,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C04 == 0)
{
  digitalWrite (LED04,LOW);
  }

  
else if (val_C05 == 1)
{
  digitalWrite (LED05,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C05 == 0)
{
  digitalWrite (LED05,LOW);
  }
  
else if (val_C06 == 1)
{
  digitalWrite (LED06,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C06 == 0)
{
  digitalWrite (LED06,LOW);
  }
  
else if (val_C07 == 1)
{
  digitalWrite (LED07,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C07 == 0)
{
  digitalWrite (LED07,LOW);
  }
  
else if (val_C08 == 1)
{
  digitalWrite (LED08,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C08 == 0)
{
  digitalWrite (LED08,LOW);
  }
  
else if (val_C09 == 1)
{
  digitalWrite (LED09,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C09 == 0)
{
  digitalWrite (LED09,LOW);
  }
  
else if (val_C10 == 1)
{
  digitalWrite (LED10,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C10 == 0)
{
  digitalWrite (LED10,LOW);
  }
  
else if (val_C_A01 == 1)
{
  digitalWrite (LED_A01,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C_A01 == 0)
{
  digitalWrite (LED_A01,LOW);
  }

else  if (val_C_A02 == 1)
{
  digitalWrite (LED_A02,HIGH);
  digitalWrite (LED_Base,HIGH);
}
else if (val_C_A02 == 0)
{
  digitalWrite (LED_A02,LOW);
  }
*/

}
