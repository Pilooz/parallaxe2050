#!/bin/bash
# 
# Session kiosk pour l'application Quai des Energies
#
# ce fichier est à installer dans home de l'utuilisateur
#

# Set really full screen and lock some keyboard keys
#ratpoison &

# hide mouse
# unclutter -idle 1 &

# Minimize TeamViewer Window
#/home/cnr/minimize_teamviewer.sh &
#winTV=`xdotool search --name "TeamViewer"`
#echo $winTV > /tmp/tv-id.log
#xdotool windowfocus $winTV
#xdotool windowminimize $winTV

# Launch firefox for ever
sleep 3s; #Wait until the node.js server is fully operational
while true; do 
	/usr/bin/firefox --kiosk http://192.168.10.??:3000 #Put the right ip adress at the place of '??'
	sleep 2s; 
done
