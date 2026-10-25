# EclipseSMP — Boutique & Intro V3

## Installation
1. Sauvegarder ton dépôt GitHub avant toute modification.
2. Dans le dossier principal du dépôt `EclipseSMP-Site`, remplacer uniquement les fichiers `index.html`, `script.js` et `style.css` du même nom.
3. Conserver le dossier `backend`, les fichiers SQL et les plugins existants.
4. GitHub Pages publiera ensuite cette version ; forcer le rafraîchissement avec Ctrl+F5.

## Ce qui change
- Intro enrichie : anneaux du portail d'éclipse animés, particules, pluie d'étoiles, marque graphique, progression et nouvelle présentation. L'option réduire les animations et Passer sont conservées.
- L'ajout au panier et l'ouverture du panier exigent une session validée par `/api/me` avec compte Minecraft lié. La présence d'un simple jeton dans le navigateur ne suffit pas.
- Une fenêtre de vérification de commande présente les articles, le destinataire, le total et une case de confirmation avant un éventuel paiement.
- Clé Spawner affichée à 1,99 € ; Eclipse 2,25 € ; Nova 2,99 €.

## Sécurité & statut réel
Le navigateur n'est jamais une barrière de sécurité suffisante : le backend doit continuer à vérifier la session, le compte lié, les prix, les articles et le destinataire lorsqu'un vrai paiement sera activé. Actuellement `/api/checkout` refuse les paiements (501), aucune commande ni aucun débit réel n'est déclenché. Les comptes nécessitent l'activation de Supabase Auth et de l'intégration `/link` déjà préparées séparément. Ne pas considérer la boutique comme ouverte.
