#!/bin/bash
# Eviter la mise en veille eet l'hibernation des servers
# Ce script termine la configuration des ervices systemd 
# il est a executer une seule fois.
#
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
