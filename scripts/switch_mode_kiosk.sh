#!/bin/bash
#
# Switch between dafaut ubuntu session and kiosk mode
#

usage() {
  echo "Usage : $0 [ON/OFF]"
  exit 1
}

cd /usr/share/xsessions
if [ $# -eq 0 ]; then
  usage
fi

if [ $1 == "ON" ]; then
  echo "Kiosk Mode Activated."
  sudo rm -f ubuntu.desktop
  sudo ln -s kiosk.desktop ubuntu.desktop
else  
  echo "Default mode activated !"
  sudo rm -f ubuntu.desktop
  sudo ln -s ubuntu.desktop.origin ubuntu.desktop
fi

reboot
