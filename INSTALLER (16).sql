-- Execute in Supabase SQL Editor. No pre-existing tables are dropped.
CREATE TABLE IF NOT EXISTS public.minecraft_links (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 minecraft_uuid uuid UNIQUE NOT NULL,
 minecraft_username text NOT NULL CHECK(length(minecraft_username) BETWEEN 3 AND 16),
 linked_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.minecraft_link_codes (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 code_hash text UNIQUE NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS public.minecraft_stats (
 minecraft_uuid uuid PRIMARY KEY,
 minecraft_username text NOT NULL,
 rank_name text NOT NULL DEFAULT 'default',
 money numeric(20,2) NOT NULL DEFAULT 0,
 shards bigint NOT NULL DEFAULT 0,
 kills bigint NOT NULL DEFAULT 0,
 deaths bigint NOT NULL DEFAULT 0,
 playtime_seconds bigint NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.shop_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 buyer_id uuid NOT NULL REFERENCES auth.users(id),
 recipient_uuid uuid NOT NULL,
 items jsonb NOT NULL,
 total_eur numeric(12,2) NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','delivered','failed','refunded')),
 payment_provider_id text UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.delivery_events (
 id bigserial PRIMARY KEY, order_id uuid REFERENCES public.shop_orders(id),
 event_type text NOT NULL, details jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.minecraft_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minecraft_link_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minecraft_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_events ENABLE ROW LEVEL SECURITY;
-- No public access policies: only the trusted backend database role accesses data.
CREATE INDEX IF NOT EXISTS minecraft_stats_money_idx ON public.minecraft_stats(money DESC);
CREATE INDEX IF NOT EXISTS minecraft_stats_shards_idx ON public.minecraft_stats(shards DESC);
CREATE INDEX IF NOT EXISTS minecraft_stats_kills_idx ON public.minecraft_stats(kills DESC);
CREATE INDEX IF NOT EXISTS minecraft_stats_playtime_idx ON public.minecraft_stats(playtime_seconds DESC);
