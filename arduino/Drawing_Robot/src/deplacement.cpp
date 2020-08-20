#include <MKRMotorCarrier.h>
#include "deplacement.h"

void print_value() {
  Serial.print("\n");
  Serial.print("---------------------------------\n");
  Serial.print("\n");
  Serial.print("First encoder : ");
  Serial.print(encoder1.getRawCount());
  Serial.print("\nSecond encoder : ");
  Serial.print(encoder2.getRawCount());
  Serial.print("\n");
  Serial.print("\n");
  Serial.print("---------------------------------\n");
  Serial.print("\n");
}

void up(long tick) {
    Serial.print("UP\n");
    bool motor_1 = true;
    bool motor_2 = true;
    long before_1 = encoder1.getRawCount();
    long before_2 = encoder2.getRawCount();
    if (tick + before_1 >= 0) {
        M1.setDuty(DUTY * 1.5);
    }
    if (tick + before_2 >= 0) {
        M2.setDuty(DUTY);
    }
    while (motor_1 || motor_2) {
        if (tick + before_1 <= encoder1.getRawCount()) {
            M1.setDuty(0);
            motor_1 = false;
        }
        if (tick + before_2 <= encoder2.getRawCount()) {
            M2.setDuty(0);
            motor_2 = false;
        }
        delay(10);
        controller.ping();
    }
    M2.setDuty(-20);
    delay(5);
    M2.setDuty(0);
}

void down(long tick) {
    tick *= -1;
    Serial.print("DOWN\n");
    bool motor_1 = true;
    bool motor_2 = true;
    long before_1 = encoder1.getRawCount();
    long before_2 = encoder2.getRawCount();
    if (tick + before_1 >= 0) {
        M1.setDuty(-DUTY / 1.25);
    } else {
        M1.setDuty(-15);
    }
    if (tick + before_2 >= 0) {
        M2.setDuty(-DUTY / 1.25);
    } else {
        M2.setDuty(-15);
    }
    while (motor_1 || motor_2) {
        if (tick + before_1 >= encoder1.getRawCount() + 200)
            M1.setDuty(10);
        if (tick + before_2 >= encoder1.getRawCount() + 200)
            M2.setDuty(10);
        if (tick + before_1 >= encoder1.getRawCount() || encoder1.getRawCount() <= 100) {
            M1.setDuty(0);
            motor_1 = false;
        }
        if (tick + before_2 >= encoder2.getRawCount() || encoder1.getRawCount() <= 100) {
            M2.setDuty(0);
            motor_2 = false;
        }
        delay(10);
        controller.ping();
    }
}

void horizontal_left(long tick) {
    Serial.print("H_LEFT\n");
    bool motor_1 = true;
    bool motor_2 = true;
    float coef_1 = 0.8;
    float coef_2 = 1;
    long before_1 = encoder1.getRawCount();
    long before_2 = encoder2.getRawCount();
    M1.setDuty(-DUTY * coef_1);
    M2.setDuty(DUTY * coef_2);
    while (motor_1 || motor_2) {
        if (coef_1 < 1)
            coef_1 += 0.01;
        if (coef_2 > 0.8 && (tick + before_2 <= encoder2.getRawCount() + 750))
            coef_2 -= 0.01;
        if (((tick * -1) / 2.25) + before_1 >= encoder1.getRawCount()) {
            M1.setDuty(0);
            motor_1 = false;
        }
        if (tick + before_2 <= encoder2.getRawCount()) {
            M2.setDuty(0);
            motor_2 = false;
        }
        M1.setDuty(-DUTY * coef_1);
        M2.setDuty(DUTY * coef_2);
        delay(10);
        controller.ping();
    }
}

void horizontal_right(long tick) {
    Serial.print("H_RIGHT\n");
    bool motor_1 = true;
    bool motor_2 = true;
    float coef_1 = 1;
    float coef_2 = 0.8;
    long before_1 = encoder1.getRawCount();
    long before_2 = encoder2.getRawCount();
    M1.setDuty(DUTY * coef_1);
    M2.setDuty(-DUTY * coef_2);
    while (motor_1 || motor_2) {
        if (coef_1 > 0.8 && (tick + before_1<= encoder1.getRawCount() + 750))
            coef_1 -= 0.01;
        if (coef_2 < 1)
            coef_2 += 0.01;
        if (tick + before_1 <= encoder1.getRawCount()) {
            M1.setDuty(0);
            motor_1 = false;
        }
        if ((tick / 2.25) + before_2 >= encoder2.getRawCount()) {
            M2.setDuty(0);
            motor_2 = false;
        }
        M1.setDuty(DUTY * coef_1);
        M2.setDuty(-DUTY * coef_2);
        delay(10);
        controller.ping();
    }
}

void diag_down_left(long tick, int strength) {
    tick *= -1;

    Serial.print("DIAG_DOWN_LEFT\n");
    bool motor_1 = true;
    bool motor_2 = true;
    float divider = 1.1;
    long before_1 = encoder1.getRawCount();
    long before_2 = encoder2.getRawCount();
    M1.setDuty(-DUTY * strength);
    M2.setDuty(-DUTY / divider);
    while (motor_1 || motor_2) {
        M2.setDuty(DUTY / divider);
        divider += 0.000001;
        if (tick + before_1 >= encoder1.getRawCount()) {
            M1.setDuty(0);
            motor_1 = false;
        }
        if (tick / 5 + before_2 >= encoder2.getRawCount()) {
            M2.setDuty(DUTY / 2);
            motor_2 = false;
        }
        controller.ping();
    }
}

void diag_up_right(long tick, int strength) {
    Serial.print("DIAG_UP_RIGHT\n");
    float divider = 1.1;
    bool motor_1 = true;
    bool motor_2 = true;
    long before_1 = encoder1.getRawCount();
    long before_2 = encoder2.getRawCount();
    M1.setDuty(DUTY * strength);
    M2.setDuty(DUTY / divider);
    while (motor_1 || motor_2) {
        M2.setDuty(DUTY / divider);
        divider += 0.0001;
        if (tick + before_1 <= encoder1.getRawCount()) {
            M1.setDuty(0);
            motor_1 = false;
        }
        if (tick / 5 + before_2 <= encoder2.getRawCount()) {
            M2.setDuty(0);
            motor_2 = false;
        }
        controller.ping();
    }
}

void diag_down_right(long tick, int strength) {
    Serial.print("DIAG_DOWN_RIGHT\n");
    M2.setDuty(-DUTY);
    M1.setDuty(-DUTY / strength);
}

void diag_up_left(long tick, int strength) {
    Serial.print("DIAG_UP_LEFT\n");
    M1.setDuty(DUTY);
    M2.setDuty(DUTY / strength);
}

void r_up(long tick) {
    Serial.print("RIGHT_UP\n");
    M1.setDuty(100);
    delay(3000);
}

void r_down(long tick) {
    Serial.print("RIGHT_DOWN\n");
    M1.setDuty(-100);
    delay(3000);
}

void l_up(long tick) {
    Serial.print("LEFT_UP\n");
    M2.setDuty(100);
    delay(3000);
}

void l_down(long tick) {
    Serial.print("LEFT_DOWN\n");
    M2.setDuty(-100);
    delay(3000);
}

void draw_sharp() {
    int i = 0;

    up(5000);
    i++;
    Serial.print("Deplacement : ");
    Serial.print(i);
    Serial.print("\n");

    print_value();

    diag_up_right(17500, 4);
    i++;
    Serial.print("Deplacement : ");
    Serial.print(i);
    Serial.print("\n");

    print_value();

    horizontal_left(10000);
    i++;
    Serial.print("Deplacement : ");
    Serial.print(i);
    Serial.print("\n");

    print_value();

    diag_down_left(17500, 3);
    i++;
    Serial.print("Deplacement : ");
    Serial.print(i);
    Serial.print("\n");

    print_value();

    up(5000);
    i++;
    Serial.print("Deplacement : ");
    Serial.print(i);
    Serial.print("\n");

    print_value();

    horizontal_right(10000);
    i++;
    Serial.print("Deplacement : ");
    Serial.print(i);
    Serial.print("\n");

    print_value();

    up(4000);
    i++;
    Serial.print("Deplacement : ");
    Serial.print(i);
    Serial.print("\n");

    print_value();

    horizontal_left(10000);
    i++;
    Serial.print("Deplacement : ");
    Serial.print(i);
    Serial.print("\n");

    print_value();

   reset_pos();
}

void reset_pos() {
    for (int i = 1; i < 10; i++) {
        while ((encoder1.getRawCount() > 20 || encoder1.getRawCount() < 0) && (encoder2.getRawCount() > 20 || encoder2.getRawCount() < 0)) {
            if (encoder1.getRawCount() > 20) {
                while (encoder1.getRawCount() > 20)
                    M1.setDuty(-50/i);
                M1.setDuty(0);
            }
            if (encoder1.getRawCount() < 0) {
                while (encoder1.getRawCount() < 0)
                    M1.setDuty(50/i);
                M1.setDuty(0);
            }
            if (encoder2.getRawCount() > 20) {
                while (encoder2.getRawCount() > 20)
                    M2.setDuty(-50/i);
                M2.setDuty(0);
            }
            if (encoder2.getRawCount() < 0) {
                while (encoder2.getRawCount() < 0)
                    M2.setDuty(50/i);
                M2.setDuty(0);
            }
            controller.ping();
        }
    }
}