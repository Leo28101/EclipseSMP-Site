# EclipseSMP — Nouvelle inscription vérifiée Minecraft

## Ce qui change

La création de compte exige maintenant un pseudo, un code `/link` confirmé par le serveur Minecraft, puis l’e-mail et le mot de passe. L’ancien formulaire est remplacé. Les codes sont aléatoires, à usage unique et expirent après 10 minutes.

## À faire avant de tester

1. Dans **Supabase SQL Editor**, exécuter le nouveau fichier `backend/sql/03-inscription-minecraft.sql` après `INSTALLER.sql`.
2. Sur **Render**, les variables `DATABASE_URL`, `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `MINECRAFT_SYNC_SECRET` doivent être définies. Ne jamais mettre de secrets dans GitHub. `JWT_SECRET` seul ne remplace pas les variables Supabase Auth.
3. Téléverser les fichiers modifiés `index.html`, `script.js`, `style.css`, `backend/src/server.js` sur GitHub et redéployer Render.
4. Compiler `minecraft-plugin-source` en `.jar` puis installer EclipseLink dans `/plugins` du Paper 1.21.11. Configurer `backend-url` et le `secret` identique à la variable `MINECRAFT_SYNC_SECRET` sur Render.
5. Protéger les comptes Java non-premium avec une authentification serveur; pour Bedrock utiliser une configuration Geyser/Floodgate sécurisée.
6. Tester : pseudo → commande `/link 123456` dans Minecraft → bouton « Vérifier » → e-mail et mot de passe → confirmation e-mail.

**Important** : les étapes 1 à 5 sont indispensables. Le fichier ZIP ne déploie pas automatiquement sur GitHub, Render ou Minecraft. Le plugin fourni est le **code source Java**, pas un `.jar` compilé. Les TOP et le vote ne sont pas ajoutés dans cette mise à jour.
