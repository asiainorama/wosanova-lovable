ALTER TABLE public.app_icons ADD COLUMN IF NOT EXISTS source text, ADD COLUMN IF NOT EXISTS status text DEFAULT 'ok', ADD COLUMN IF NOT EXISTS last_checked_at timestamptz;
GRANT SELECT ON public.app_icons TO anon, authenticated;
GRANT ALL ON public.app_icons TO service_role;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
SELECT cron.schedule('refresh-app-icons-weekly', '0 4 * * *', $$
  SELECT net.http_post(
    url := 'https://cpjnuasoahkwcirpssxt.supabase.co/functions/v1/refresh-app-icons',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwam51YXNvYWhrd2NpcnBzc3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODMwNDksImV4cCI6MjA2MTM1OTA0OX0.suD62tmRnTxoaMG0xRAdOAHEBNW2LkaM7OmwS5xfATY"}'::jsonb,
    body := '{"limit":40}'::jsonb
  );
$$);