# EclipseSMP V3.4 — installation

1. GitHub : remplacer `index.html`, `style.css`, `script.js`.
2. Supabase SQL Editor : exécuter `backend/sql/04-admin-account-controls.sql`.
3. GitHub : remplacer `backend/src/server.js` (Render se redéploie automatiquement).
4. Render Environment : ajouter `FRONTEND_SITE_URL=https://leo28101.github.io/EclipseSMP-Site/` (sans mot de passe).
5. Supabase Auth -> URL Configuration : définir Site URL `https://leo28101.github.io/EclipseSMP-Site/`, ajouter la même adresse dans Redirect URLs.
6. Supabase Auth -> Providers -> Email : vérifier Confirm email, et configurer un SMTP pour la délivrabilité réelle (le SMTP intégré est limité).
7. Pour activer le panneau Admin, récupérer votre propre UUID Supabase Auth (Dashboard -> Authentication -> Users), puis ajouter `ADMIN_USER_IDS=<votre-uuid>` dans Render. Ne donnez les UUID admins qu'aux fondateurs autorisés.
8. Les suspensions sont appliquées par l'API EclipseSMP, pas par le serveur Minecraft : pour empêcher l'accès en jeu il faut aussi protéger l'authentification Minecraft.
9. Les achats réels restent désactivés (API renvoie 501). Le tableau Achats affichera donc seulement les éventuelles commandes enregistrées en base.
10. Pour le lien de confirmation e-mail, la création renvoie un e-mail ; ouvrir le lien puis revenir sur le site et se connecter. La récupération de mot de passe reste distincte.

Note : ne jamais stocker ni afficher les mots de passe des joueurs. Les hachages sont gérés par Supabase Auth.
