#!/bin/bash
# Deployer tous les repos git sur toutes les machines

# parallaxe2050-1
sudo /home/parallaxe2050/projets/parallaxe2050/scripts/update-p2050.sh
# parallaxe2050-2
ssh -t parallaxe2050@parallaxe2050-2.local sudo /home/parallaxe2050/projets/parallaxe2050/scripts/update-p2050.sh
# parallaxe2050-3
ssh -t parallaxe2050@parallaxe2050-3.local sudo /home/parallaxe2050/projets/parallaxe2050/scripts/update-p2050.sh
# parallaxe2050-4
ssh -t parallaxe2050@parallaxe2050-4.local sudo /home/parallaxe2050/projets/parallaxe2050/scripts/update-p2050.sh
# parallaxe2050-5
ssh -t parallaxe2050@parallaxe2050-5.local sudo /home/parallaxe2050/projets/parallaxe2050/scripts/update-p2050.sh

