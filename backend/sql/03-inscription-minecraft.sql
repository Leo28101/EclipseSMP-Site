-- Executer une fois dans Supabase SQL Editor APRES INSTALLER.sql.
-- Stockage temporaire des preuves de validation /link avant inscription.
CREATE TABLE IF NOT EXISTS public.minecraft_signup_challenges (
 ticket_hash text PRIMARY KEY,
 code_hash text UNIQUE,
 minecraft_username text NOT NULL,
 verified_uuid uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 used_at timestamptz
);
ALTER TABLE public.minecraft_signup_challenges ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS minecraft_signup_expiry_idx ON public.minecraft_signup_challenges(expires_at);
-- Autoriser les pseudos Bedrock préfixés par Floodgate (pseudo exact visible en jeu).
ALTER TABLE public.minecraft_links DROP CONSTRAINT IF EXISTS minecraft_links_minecraft_username_check;
ALTER TABLE public.minecraft_links ADD CONSTRAINT minecraft_links_minecraft_username_check CHECK (length(minecraft_username) BETWEEN 3 AND 32);
