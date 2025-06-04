# CoinBreaker - NexusIA Edition

Mini-jeu de type **Breakout / Arkanoid** développé avec Phaser 3, intégrant une mécanique de bonus NexusCoins et une ambiance personnalisée.

---

## 📦 Structure du projet

Breaker-NexusIA/
│
├─ python/
│   ├─ python.exe
│   ├─ pythonw.exe
│   ├─ python312.dll
│   ├─ python3.dll
│   ├─ vcruntime140.dll
│   ├─ vcruntime140_1.dll
│   ├─ LICENSE.txt
│   ├─ pyexpat.pyd
│   ├─ select.pyd
│   ├─ unicodedata.pyd
│   ├─ winsound.pyd
│   ├─ _asyncio.pyd
│   ├─ _bz2.pyd
│   ├─ _ctypes.pyd
│   ├─ _decimal.pyd
│   ├─ _elementtree.pyd
│   ├─ _hashlib.pyd
│   ├─ _lzma.pyd
│   ├─ _msi.pyd
│   ├─ _multiprocessing.pyd
│   ├─ _overlapped.pyd
│   ├─ _queue.pyd
│   ├─ _socket.pyd
│   ├─ _sqlite3.pyd
│   ├─ _ssl.pyd
│   ├─ _uuid.pyd
│   ├─ _wmi.pyd
│   ├─ _zoneinfo.pyd
│   ├─ libcrypto-3.dll
│   ├─ libffi-8.dll
│   ├─ libssl-3.dll
│   ├─ sqlite3.dll
│   ├─ python312.zip
│   ├─ python312._pth
│   ├─ python.cat
├─ assets/
│ ├─ bonus_paddle_plus.png
│ ├─ bonus_paddle_minus.png
│ ├─ bonus_speed_up.png
│ ├─ bonus_speed_down.png
│ ├─ bonus_multi_ball.png
│ ├─ bonus_nexus.png
│ ├─ NexusIA logo2.png
│ └─ sounds/
│ ├─ paddle.wav
│ ├─ paddleRetreci.wav
│ ├─ lvlSuivant.wav
│ ├─ GameOver.wav
│ ├─ briqueArgent.wav
│ ├─ brique.wav
│ ├─ bonus_nexuscoin.wav
│ └─ lib/
│ ├─ phaser.min.js
│
├─ breakout.js # Code principal du jeu (Phaser 3)
├─ levels.js # Fichier de configuration des niveaux (tableaux de briques)
├─ index.html # Page web principale (lance le jeu)
├─ lance serveur.bat # Script Windows pour lancer le serveur local
├─ CoinBreaker - NexusIA.url # Raccourci web vers le jeu en local
└─ README.md # Ce fichier

---

## 🚀 Lancer le jeu en local

- Ouvre le dossier **Breaker-NexusIA** sur ton PC (Windows).
- Double-clique sur `lance serveur.bat` pour lancer un serveur local (Python requis).
- Ouvre le raccourci `CoinBreaker - NexusIA.url` ou va sur [http://localhost:8000/](http://localhost:8000/) dans ton navigateur.
- Joue ! (Utilise la souris pour déplacer le paddle, clique pour lancer la balle.)

---

## 🎨 Crédits & Ressources

- **Images** : Créées par Amakir1337 / NexusIA pour ce projet, libres d’utilisation.
- **Sons** : Effets sonores originaux extraits du jeu NES Arkanoid ([The Sounds Resource - Arkanoid NES](https://www.sounds-resource.com/nes/arkanoid/sound/3698/)), pour usage non-commercial et projets personnels/fan games.
- **Base technique** : Projet inspiré d’un exemple Phaser 3 Breakout, largement modifié et enrichi (gameplay, interface, bonus, son).
- **Développement & Design** : Amakir1337 (NexusIA).

---

## 🛠 Fonctionnalités

- Bonus variés (agrandir/rétrécir le paddle, multi-balles, accélération, etc.)
- Ambiance sonore rétro avec option de mute
- Interface personnalisable (cacher la souris, sons activables)

---

## 📝 Licence

- **Code source & images NexusIA** : Distribués sous licence MIT (voir le fichier LICENSE).
- **Effets sonores** : Les fichiers audio utilisés dans ce projet proviennent du jeu NES Arkanoid, extraits depuis [The Sounds Resource - Arkanoid NES](https://www.sounds-resource.com/nes/arkanoid/sound/3698/).
  - Ces sons sont proposés uniquement pour usage personnel, non commercial, projets fan-games ou tests.
  - Pour toute utilisation commerciale, il est de votre responsabilité d’utiliser des sons libres de droits ou de créer vos propres effets sonores.

---

## ✨ À propos

Projet créé pour accompagner le dashboard NexusIA, peut être utilisé comme mini-jeu bonus pour animer une communauté Discord, ou comme base pour vos propres expérimentations Phaser 3.

**Amusez-vous bien !**
