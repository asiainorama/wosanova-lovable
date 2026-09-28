import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const BRANDFETCH_KEY = Deno.env.get('BRANDFETCH_API_KEY');
const WEEK = 7 * 24 * 3600 * 1000;

async function fetchImage(url: string): Promise<{ bytes: Uint8Array; type: string } | null> {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'Mozilla/5.0 WosaNovaIconBot' } });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    // Reject tiny images (generic placeholders / 16px favicons)
    if (bytes.length < 600) return null;
    return { bytes, type };
  } catch { return null; }
}

async function brandfetchUrl(domain: string): Promise<string | null> {
  if (!BRANDFETCH_KEY) return null;
  try {
    const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, { headers: { Authorization: `Bearer ${BRANDFETCH_KEY}` }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const pick = (types: string[]) => {
      for (const t of types) for (const logo of data.logos || []) if (logo.type === t) {
        const f = (logo.formats || []).find((x: any) => x.format === 'png') || logo.formats?.[0];
        if (f?.src) return f.src as string;
      }
      return null;
    };
    return pick(['icon', 'symbol', 'logo']);
  } catch { return null; }
}

async function candidates(appUrl: string, current: string): Promise<{ url: string; source: string }[]> {
  let u: URL;
  try { u = new URL(appUrl); } catch { return current ? [{ url: current, source: 'app' }] : []; }
  const d = u.hostname;
  const list: { url: string; source: string }[] = [];
  if (current) list.push({ url: current, source: 'app' });
  const bf = await brandfetchUrl(d);
  if (bf) list.push({ url: bf, source: 'brandfetch' });
  list.push({ url: `${u.origin}/apple-touch-icon.png`, source: 'site' });
  list.push({ url: `https://www.google.com/s2/favicons?domain=${d}&sz=256`, source: 'google' });
  list.push({ url: `https://icons.duckduckgo.com/ip3/${d}.ico`, source: 'duckduckgo' });
  list.push({ url: `${u.origin}/favicon.ico`, source: 'site' });
  return list;
}

async function refreshApp(app: { id: string; url: string; icon: string }, existing?: any) {
  // If the stored copy still works, only update the timestamp
  if (existing?.icon_url && (await fetchImage(existing.icon_url))) {
    await admin.from('app_icons').update({ last_checked_at: new Date().toISOString(), status: 'ok' }).eq('app_id', app.id);
    return 'ok';
  }
  for (const c of await candidates(app.url, app.icon)) {
    const img = await fetchImage(c.url);
    if (!img) continue;
    const ext = img.type.includes('svg') ? 'svg' : img.type.includes('png') ? 'png' : img.type.includes('ico') ? 'ico' : 'img';
    const path = `auto/${app.id}.${ext}`;
    const { error } = await admin.storage.from('app-logos').upload(path, img.bytes, { contentType: img.type, upsert: true });
    if (error) continue;
    const { data } = admin.storage.from('app-logos').getPublicUrl(path);
    const row = { app_id: app.id, icon_url: `${data.publicUrl}?v=${Date.now()}`, storage_path: path, source: c.source, status: 'ok', last_checked_at: new Date().toISOString() };
    if (existing) await admin.from('app_icons').update(row).eq('app_id', app.id);
    else await admin.from('app_icons').insert(row);
    return 'replaced';
  }
  if (existing) await admin.from('app_icons').update({ status: 'broken', last_checked_at: new Date().toISOString() }).eq('app_id', app.id);
  return 'broken';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  try {
    const body = await req.json().catch(() => ({}));
    const appId = typeof body.appId === 'string' && body.appId.length < 200 ? body.appId : null;

    if (appId) {
      const { data: app } = await admin.from('apps').select('id,url,icon').eq('id', appId).maybeSingle();
      if (!app) return json({ error: 'App not found' }, 404);
      const { data: existing } = await admin.from('app_icons').select('*').eq('app_id', appId).maybeSingle();
      // Throttle public reports: at most once a day per app
      if (existing?.last_checked_at && Date.now() - new Date(existing.last_checked_at).getTime() < 24 * 3600 * 1000) return json({ status: 'recently-checked' });
      return json({ status: await refreshApp(app, existing) });
    }

    // Batch mode: check apps not reviewed in the last week
    const limit = Math.min(Number(body.limit) || 40, 100);
    const [{ data: apps }, { data: icons }] = await Promise.all([
      admin.from('apps').select('id,url,icon'),
      admin.from('app_icons').select('*'),
    ]);
    const byApp = new Map((icons || []).map((i: any) => [i.app_id, i]));
    const due = (apps || []).filter(a => { const i: any = byApp.get(a.id); return !i?.last_checked_at || Date.now() - new Date(i.last_checked_at).getTime() > WEEK; }).slice(0, limit);
    const results: Record<string, number> = {};
    for (const a of due) { const r = await refreshApp(a, byApp.get(a.id)); results[r] = (results[r] || 0) + 1; }
    return json({ checked: due.length, results });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
