# You want to install the kiosk mode ? Follow these steps
## To make installation :
### Use sudo of course !
##### In the folder xsessions :
- go to /usr/share/xsessions
- rename ubuntu.desktop to ubuntu.desktop.origin with mv
- create a symbolic link named ubuntu.desktop to ubuntu.desktop.origin with ln -s
- put the file kiosk.desktop in this folder
- and that's it (for this folder ^^) !

##### In the folder parallaxe2050 :
- go to /home/parallaxe2050
- put the file .xsession
- change the ip adress in the file .xsession at the line 14
- put the file switch_mode_kiosk.sh
- put the file .ratpoisonrc
- and that's it ! 

### CONGRATULATIONS !
