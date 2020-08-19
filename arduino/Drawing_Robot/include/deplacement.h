#ifndef DEPLACEMENT_H
#define DEPLACEMENT_H

#define DUTY 50

void print_value();

void up(long tick);
void down(long tick);
void horizontal_left(long tick);
void horizontal_right(long tick);

void diag_down_left(long tick, int strength);
void diag_up_right(long tick, int strength);
void diag_down_right(long tick, int strength);
void diag_up_left(long tick, int strength);

void r_up(long tick);
void r_down(long tick);
void l_up(long tick);
void l_down(long tick);

void draw_sharp();
void reset_pos();

#endif