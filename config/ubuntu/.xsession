#!/bin/bash
# 
# Session kiosk pour parallaxe2050
#
# Ce fichier est à installer dans home de l'utilisateur
#
log="/home/parallaxe2050/projets/xsession.log"
# See if the server was shutdown gracefully.
cnt=`last -Fxn2 shutdown reboot | grep "still running" | wc -l`;
echo `date "+%d/%m/%Y %T.%N:"` "--------------------------------------------" >> $log
if [ $cnt -eq 2 ]; then
	echo "Le serveur n'a pas été éteint correctement. Redémarrage..."
	echo `date "+%d/%m/%Y %T.%N:"` "Le serveur n'a pas été éteint correctement." >> $log
	echo `date "+%d/%m/%Y %T.%N:"` "Redémarrage" >> $log
	reboot
else 
	echo `date "+%d/%m/%Y %T.%N:"` "Demarrage normal" >> $log
fi;
echo `date "+%d/%m/%Y %T.%N:"` "--------------------------------------------" >> $log

# Set really full screen and lock some keyboard keys
ratpoison &

setterm --powersave off
setterm --powerdown 0

sleep 3s; #Wait until the node.js server is fully operational
# Launch firefox for ever
while true; do 
	/usr/bin/firefox --kiosk http://192.168.10.??:3000 #Put the right ip adress at the place of '??'
	sleep 2s; 
done
