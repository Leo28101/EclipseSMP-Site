-- Exécuter après INSTALLER.sql et 03-inscription-minecraft.sql.
-- Ne stocke aucun mot de passe, ni IP.
CREATE TABLE IF NOT EXISTS public.eclipse_account_controls (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 suspended boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.eclipse_account_controls ENABLE ROW LEVEL SECURITY;
-- Pas de politiques publiques : accès uniquement via backend PostgreSQL autorisé.
