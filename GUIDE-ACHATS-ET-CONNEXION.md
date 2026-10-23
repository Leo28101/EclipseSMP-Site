# EclipseSMP — Boutique de test et intégration serveur

## Boutique livrée
- VIP, Eclipse, Nova : **un seul grade à la fois** dans le panier; changer de grade remplace l’ancien. Une seule unité de grade par panier.
- Battle Pass Premium : **une seule unité dans le panier**. Prix en euros non défini, donc paiement désactivé.
- Clés : quantités cumulables.
- Unban **7 €** et Unmute **2 €** : ajoutables au panier, quantités cumulables pour le moment, mais la validation et les règles d’éligibilité devront être vérifiées côté serveur.
- Le panier n’est pas un système de paiement. Les achats ne sont pas délivrés.

## Bloquer les rachats du Battle Pass Premium
Impossible de le garantir par `localStorage`. Après une liaison Minecraft `/link` : vérifier sur le backend le `uuid` du joueur et son droit Premium **pour la saison active** avant de créer une commande. Refaire impérativement la vérification à la confirmation du paiement. Bloquer le Premium si déjà détenu. Pour les grades, vérifier la politique de renouvellement/upgrade sur le backend. Pour les services Unban et Unmute, contrôler sanction active et éligibilité selon les conditions validées.

## Connexion Minecraft recommandée
1. Supabase Auth : comptes vérifiés et e-mails de récupération.
2. Backend HTTPS : générer un code de liaison aléatoire à usage unique, avec expiration (par ex. 10 minutes), stocker uniquement son empreinte côté serveur.
3. Plugin Paper `EclipseLink` : `/link CODE` depuis le compte Minecraft concerné. Authentifier l'appel du plugin vers le backend, vérifier le code puis associer `UUID Minecraft` et `user_id` Supabase dans une transaction unique.
4. Exposer un endpoint public en lecture seule qui restitue les 4 classements Money, Shards, Kills, Playtime. Le plugin doit lire les données EconomyModern en lecture seule et synchroniser périodiquement les joueurs hors ligne. Exclure Rip282528 et David7277219 du TOP public.
5. Paiements : prestataire de paiement, webhook authentifié, commande persistante, attribution idempotente côté serveur, remboursement/échec gérés. Aucune clé secrète dans le navigateur ou sur GitHub Pages.

Ne PAS déployer le backend SQL ou les secrets GitHub Pages sans configuration sécurisée. Ne pas publier `economy.db`.
