#!/bin/bash
# 
# Session kiosk pour parallaxe2050
#
# Ce fichier est à installer dans home de l'utilisateur
#

# Set really full screen and lock some keyboard keys
ratpoison &

setterm --powersave off
# Launch firefox for ever
sleep 3s; #Wait until the node.js server is fully operational
while true; do 
	/usr/bin/firefox --kiosk http://192.168.10.??:3000 #Put the right ip adress at the place of '??'
	sleep 2s; 
done
