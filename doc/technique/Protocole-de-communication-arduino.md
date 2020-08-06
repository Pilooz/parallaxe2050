# Protocole de communication Arduino <-> Serveur Linux

## Préambule 
Les dispositifs électroniques sont tous connectés aux serveurs via USB. Nous utiliserons donc cette liaison Série pour communiquer.

Afin d'assurer une bonne communication entre les dispositifs électroniques et les serveurs linux, il nous faut définir un protocole de communication rapide, conscit et sûr.

Les intérêts sont multiples : 
- Messages incomplets difficilement interprétables
- Ignorance des caractères indésirables sur la liaison (messages incomplets, de debug).
- Assurer un handshake entre électronique et serveur et une cohérence des états entre dispositifs physiques et serveurs.

## Les besoins d'un protocole bi-directionnel
D'une par les seerveurs linux doivent recevoir des inforamtions des dispositifs physiques, d'autre part il doivent les piloter.
Du côté des dispositfs électroniques, il faut qu'ils puissent emettre des information, et recevoir des commandes.

## Début et fin de message
Le caractère "**<**" sera le début d'un message.
Les caractères "**/>**" seront la fin d'un message.
Plusieurs messages peuvent être envoyés les un à la suite des autres. 

Seuls seront interprétés les messages complets, les autres seront ignorés.

## Mots clé
Le début de transmission est suivi d'un mot clé caratérisant les données qui suivent. Les mots clé sont en majuscules, sans espace ni caractères spéciaux.

Après ce mot clé, un séparateur "**:**" permettra de distinguer les données du thésorus de mot clés.

Les données peuvent être alphanumériques.

#### Exemple
 - ***\<TAG:12345/\>***  : Le badge rfid "12345" vient d'être détecté.
 - ***\<TAG:12345/\>\<READER:1/\>***  : Le badge rfid "12345" vient d'être détecté, sur le lecteur 1.
 - ***\<CMD:RESET/\>***  : La commande reset est envoyée au dispositif électronique.

#### Liste des mots clé.

Cette liste, non exhaustive, est à compléter au fur et à mesure de l'avancement des développements.
Mot clé | Type | Ex de valeurs | Commentaires
|:- | :-: | :-: | :-
TAG | Alpha | DC8C2A33 | Ce message est suvi d'un identifiant de lecteur RFID.
READER | Num | 1| Identifiant d'un lecteur du lié à un dispositif
CMD | Alpha| ETAPE1, RESET, START, STOP | Ce type de message est plutôt en provenance d'un serveur et à destination d'un dispositif électronique
ACK | Alpha, num | OK, KO | Message envoyé pour handshake lors de la réception d'un message important pour l'avancement dans l'énigme, le pilotage d'un dispositif. OK est suivi d'un message expliquant la raison de l'erreur.
MSG | Alpha, Num | "Impossible de lire le Mp3", "Success" | Message générique

## Différents messages par dispositif
#### parallaxe2050-1 : Admin Réseau
#### parallaxe2050-2 : Base de données / DATA
#### parallaxe2050-3 : Code et Programmation
#### parallaxe2050-4 : Communication Digitale
#### parallaxe2050-5 : Hardware
