# EclipseSMP — Refonte basée sur le VRAI site GitHub

Cette version conserve l'intro fusée, les étoiles, l'ambiance sonore `ambient.mp3`, les fichiers d'origine et le backend existant. Elle met à jour le contenu, la boutique, les règles, le Battle Pass et les seuls classements Playtime/Shards/Kills.

## Mise en ligne
Sauvegarder la branche GitHub actuelle; déposer les fichiers à la racine du dépôt (avec le dossier backend). Ne jamais publier `.env`, mots de passe, tokens ou secrets.

## Limitations IMPORTANTES
- Le panier est une interface locale : aucun paiement n'est activé et aucune commande n'est exécutée sur le serveur.
- Les comptes d'origine utilisent une API backend non configurée (`API_BASE` dans `script.js`). Les formulaires ne marcheront pas sans la base et le déploiement. Le parcours « mot de passe oublié » explique que l'envoi d'e-mail reste à brancher, au lieu de faire croire à un envoi.
- Le classement n'invente plus aucun chiffre; le backend `/api/leaderboard?type=playtime|shards|kills` doit être branché aux vraies données de CuyModern.
- Les prix non confirmés (Spawner et Premium Battle Pass en euros) restent désactivés.
- La liaison Minecraft, les paiements et les rôles Discord nécessitent encore une intégration sûre côté serveur.
- Les règles proposées doivent être validées par le staff avant publication.

## Contrôles
Lancer `node --check script.js` et tester localement le site dans un navigateur.
