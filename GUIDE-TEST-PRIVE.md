# EclipseSMP — environnement de test privé

Le site GitHub Pages actuel n’a pas été modifié. Ce ZIP est une copie séparée du dernier site avec panier flottant.

## Ce qui est prêt dans ce paquet
- 4 onglets Money / Playtime / Shards / Kills, dont Money par défaut.
- API `/api/leaderboard?type=money|playtime|shards|kills` lisant une table indépendante des comptes du site : joueurs hors ligne inclus.
- Exclusion publique de `Rip282528` et `David7277219`.
- Pas de faux résultats et aucune modification du scoreboard Minecraft.
- Réception protégée des statistiques : `POST /api/internal/stats`, header `x-sync-secret`, JSON `{ "players": [{"uuid":"...", "username":"...", "money":0, "shards":0, "kills":0, "playtime_seconds":0}] }`.

## Ce qu'il reste à faire avant d'afficher des statistiques réelles
1. Configurer un backend **privé** avec une connexion PostgreSQL sécurisée (`DATABASE_URL`) et un secret `STATS_SYNC_SECRET` jamais publié dans GitHub.
2. Exécuter `backend/sql/02-minecraft-stats.sql` dans Supabase SQL Editor, avec un utilisateur autorisé.
3. Créer un pont de lecture **en lecture seule** pour `plugins/EconomyModern/data/economy.db` ; **le schéma SQLite n'a pas été fourni**, donc les noms exacts des tables et colonnes ne sont pas encore connus. Ne pas deviner.
4. Installer ce pont seulement après vérification, et l'autoriser à envoyer les données au backend. Ne pas exposer SQLite publiquement.
5. Configurer `API_BASE` dans `script.js` vers l'URL HTTPS de ton backend, puis tester en privé. Ce n'est qu'après validation que tu publierais le nouveau site sur GitHub.

## Important
- Le JAR CuyModern indique `DATABASE: SQLITE` et `SQLITE.FILE: plugins/EconomyModern/data/economy.db`, mais il ne contient pas tes données ni la structure réelle de la base.
- Les comptes du vieux backend utilisent JWT/bcrypt. La bascule vers Supabase Auth, les emails et la liaison Minecraft sont à réaliser/tester séparément. Ne pas mélanger les deux systèmes de comptes sans migration.
- Aucun paiement n'est actif : on n'encaisse pas d'argent tant que la livraison n'est pas vérifiée.
- Ne pas déployer ce backend en production sans compléter les protections (limitation de débit, HTTPS, journalisation, sauvegardes).
