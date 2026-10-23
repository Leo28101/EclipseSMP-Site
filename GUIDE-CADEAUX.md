# EclipseSMP — Acheter ou Offrir (version privée)

Le panier affiche maintenant « Acheter pour moi » et « Offrir ». Le mode Offrir demande un pseudo Minecraft. Aucune vérification de destinataire ni aucun paiement n’est encore actif : les deux parcours sont des interfaces uniquement.

## Connexion réelle au serveur
1. Configurer Supabase Auth et associer un utilisateur du site à son UUID Minecraft avec un code à usage unique `/link CODE`.
2. Installer un plugin Paper 1.21.11 de liaison disposant d’une authentification machine vers un backend HTTPS (aucune clé Supabase secrète dans les pages GitHub).
3. Le backend valide le pseudo/UUID du destinataire lors d’un cadeau ; l’acheteur doit être connecté, le destinataire doit exister et être admissible.
4. Après un webhook signé du prestataire de paiement, le serveur enregistre l’achat, assure la livraison *une seule fois* et remonte le statut.
5. Empêcher les doublons de Premium **côté serveur** par saison, et vérifier les grades temporaires même en cas d’achat cadeau. Prévoir les remboursements et l’échec de livraison.
6. Lire les statistiques EconomyModern en lecture seule et publier une API de classements (Money, Shards, Kills et Playtime).

Ne pas mettre de base SQLite, clés secrètes, token admin ou `.env` sensible dans GitHub Pages.
