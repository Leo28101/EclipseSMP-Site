-- A exécuter dans le SQL Editor Supabase (projet EclipseSMP).
-- Indépendant des comptes : permet d'afficher aussi les joueurs hors ligne.
CREATE TABLE IF NOT EXISTS public.minecraft_stats (
 minecraft_uuid UUID PRIMARY KEY,
 minecraft_username VARCHAR(16) NOT NULL,
 rank_name VARCHAR(32) NOT NULL DEFAULT 'default',
 money NUMERIC(20,2) NOT NULL DEFAULT 0,
 shards BIGINT NOT NULL DEFAULT 0,
 kills BIGINT NOT NULL DEFAULT 0,
 playtime_seconds BIGINT NOT NULL DEFAULT 0,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS minecraft_stats_money_idx ON public.minecraft_stats (money DESC);
CREATE INDEX IF NOT EXISTS minecraft_stats_shards_idx ON public.minecraft_stats (shards DESC);
CREATE INDEX IF NOT EXISTS minecraft_stats_kills_idx ON public.minecraft_stats (kills DESC);
CREATE INDEX IF NOT EXISTS minecraft_stats_playtime_idx ON public.minecraft_stats (playtime_seconds DESC);
ALTER TABLE public.minecraft_stats ENABLE ROW LEVEL SECURITY;
-- Aucun accès direct du navigateur : seule l'API backend avec identifiants DB peut lire/écrire.
