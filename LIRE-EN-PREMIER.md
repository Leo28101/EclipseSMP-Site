# EclipseSMP — version de test privée

Cette archive inclut le **site original avec sa boutique**, un backend Node.js, un script SQL de Supabase et le **code source** du plugin EclipseLink `/link` pour Paper 1.21.11.

## Ce qui est développé
- Authentification via **Supabase Auth** (confirmation de l'e-mail, connexion, renouvellement de session prévu côté API, mot de passe oublié et nouveau mot de passe par lien).
- Génération d'un code `/link` valable 10 minutes, utilisable une seule fois, associé à l'UUID vérifié du joueur qui tape la commande.
- TOP 10 Argent, Shards, Kills, Playtime lu depuis les tables Supabase ; `Rip282528` et `David7277219` sont exclus.
- Plugin Java source Paper `/link`, synchronisation pour joueurs **en ligne uniquement** quand les placeholders Money/Shards exacts auront été validés. Les statistiques précédemment synchronisées des joueurs hors ligne restent dans la base.
- Boutique existante, panier Acheter / Offrir. Aucun achat ne peut être facturé par ce code : endpoint checkout retourne 501.

## Ce qui n'est PAS terminé / pas à publier comme opérationnel
- Le plugin EclipseLink est livré **en code source Maven, pas en JAR précompilé**, parce qu'il faut compiler contre Paper 1.21.11 puis le tester.
- Il faut confirmer les **placeholders exacts EconomyModern/CuyModern** pour Money et Shards. Ils sont laissés vides par sécurité : aucun chiffre n'est inventé.
- Les achats et cadeaux nécessitent **un vrai prestataire de paiement**, webhook vérifié, contrôles de propriété côté backend et livraison idempotente dans le plugin : non inclus.
- Le Battle Pass ne sera attribué automatiquement qu'après validation d'une commande administrateur réelle de ton plugin actuel.
- Les grades 30 jours, unban, unmute ne sont pas attribués tant que la livraison n'a pas été testée.
- Les e-mails Supabase destinés au public nécessitent un SMTP adapté et les Redirect URLs doivent être configurées.
- Le plugin n'a pas été testé sur ton serveur Paper ni compilé dans cet environnement. Vérifie également que ta version Paper reconnaît la constante `PLAY_ONE_MINUTE` (ancien nom Bukkit).

## Installation — D'ABORD sur une version de test
1. Dans **Supabase → SQL Editor**, exécuter `backend/sql/INSTALLER.sql`. Cela ne supprime rien. Les tables du schéma public sont RLS activées, sans politique publique.
2. Dans Render (backend racine `backend`, `npm install`, `npm start`), définir **sans les partager** : `FRONTEND_URL`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MINECRAFT_SYNC_SECRET` (secret aléatoire >=32 caractères). Supprimer l'ancien `JWT_SECRET` après déploiement de cette version seulement, car Supabase Auth le remplace.
3. Corriger si nécessaire l'encodage URL du mot de passe PostgreSQL et tester `https://eclipsesmp-site.onrender.com/api/health` : attendre `database:true`.
4. Configurer Supabase **Authentication → URL Configuration** avec l'URL publique existante, puis redirection vers celle-ci pour le lien de récupération. Les inscriptions peuvent nécessiter le SMTP Supabase configuré.
5. Compiler `minecraft-plugin-source` avec Java 21 et Maven : `mvn package` (nécessite accès aux dépendances Paper et PlaceholderAPI). Récupérer `target/EclipseLink-1.0.0.jar`. Installation et tests sur serveur de développement uniquement.
6. Dans `plugins/EclipseLink/config.yml`, renseigner l'URL Render et le **même** `MINECRAFT_SYNC_SECRET`, sans publier le fichier. Puis vérifier les placeholders Money et Shards et les définir dans `money-placeholder` / `shards-placeholder` uniquement après validation.
7. Sur le site test, créer un compte, confirmer l'e-mail, se connecter, puis « Lier mon compte Minecraft ». Dans Minecraft : `/link 123456` (avec le code réel). Retourner sur le site pour voir l'UUID lié.
8. Tester les statistiques avec 2 comptes joueurs. Les joueurs déconnectés restent dans le TOP après leur dernière synchronisation ; les chiffres ne sont pas mis à jour pendant leur absence.
9. Vérifier tout cela **avant** de remplacer les fichiers sur GitHub. Le dossier du plugin et le `.env` contenant des secrets doivent rester privés.

## Sécurité
- Le mot de passe de la base de données et `JWT_SECRET` ont figuré dans des captures précédentes. Leur rotation reste recommandée. Ne les place jamais dans le dépôt public GitHub.
- `SUPABASE_ANON_KEY` est une clé publique prévue pour les opérations client, mais `DATABASE_URL` et `MINECRAFT_SYNC_SECRET` sont secrets.
- Le backend actuel a été refait : **ne déploie pas ce ZIP directement sur le site public** avant d'avoir exécuté la migration SQL et les tests du login.
