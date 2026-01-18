# Projet de Gestion de Tâches

## Auteurs
- **Paul GODEK**
- **Luca FILIOL**

---

## Description
Ce projet est une application de gestion de tâches permettant de créer, lire, mettre à jour et supprimer des tâches. Il utilise Node.js pour le backend, MongoDB pour la base de données, et Docker pour simplifier le déploiement.

---

## Prérequis
### Environnement local
- **npm** : Versions testées : `11.6.2`, `11.3.0`
- **Node.js** : Versions testées : `24.13.0`, `22.14.0`
- **MongoDB** : Version testée : `8.2.0`

### Avec Docker
- **Docker** : Assurez-vous que Docker est installé et configuré sur votre machine.

---

## Installation et Lancement

### Lancer avec Docker
1. Assurez-vous que Docker est installé et en cours d'exécution.
2. Dans le répertoire du projet, exécutez la commande suivante :
   ```bash
   docker-compose up --build
   ```
3. Accédez à l'application via votre navigateur à l'adresse : `http://localhost:9000`

### Lancer en local
1. Clonez le dépôt du projet :
   ```bash
   git clone https://github.com/PaulGodek/Francois
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Assurez-vous que MongoDB est en cours d'exécution sur votre machine.
4. Copiez le fichier `.env.example` avec le nom `.env` et modifiez-le à votre guise pour connecter votre MongoDB correctement à l'application.
5. Démarrez l'application :
   ```bash
   npm start
   ```
6. Accédez à l'application via votre navigateur à l'adresse : `http://localhost:PORT`, ou `PORT` est le port que vous avez mentionné dans le fichier `.env`.

---

## Structure du Projet
- **src/** : Contient le code source de l'application.
  - **controllers/** : Logique métier.
  - **models/** : Modèles de données (MongoDB).
  - **routes/** : Définition des routes de l'application.
  - **views/** : Fichiers HTML pour le rendu côté client.
  - **public/** : Fichiers statiques (CSS, JS).
- **Dockerfile** : Instructions pour construire l'image Docker.
- **docker-compose.yml** : Configuration pour orchestrer les conteneurs Docker.

---

## Fonctionnalités
- **Créer** une tâche
- **Lire** les tâches existantes
- **Mettre à jour** une tâche
- **Supprimer** une tâche

---

## Remarques
- Vous pouvez essayer de faire fonctionner l'application sur d'autres versions des outils, nous n'avons pas testé extensivement sur quelles versions ça arrête de fonctionner, mais normalement il n'y a pas trop de risques.
- En cas de problème, vérifiez les logs de l'application ou du conteneur Docker pour diagnostiquer les erreurs.
