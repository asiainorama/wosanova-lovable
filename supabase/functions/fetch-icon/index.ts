import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== 'string' || domain.length > 253) {
      return new Response(JSON.stringify({ error: 'Invalid domain' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return new Response(JSON.stringify({ icon_url: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('BRANDFETCH_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ icon_url: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ icon_url: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let iconUrl: string | null = null;

    // Try logos first (prefer SVG)
    if (data.logos?.length > 0) {
      for (const logo of data.logos) {
        const svgFormat = logo.formats?.find((f: any) => f.format === 'svg');
        if (svgFormat?.src) { iconUrl = svgFormat.src; break; }
        if (!iconUrl && logo.formats?.[0]?.src) { iconUrl = logo.formats[0].src; }
      }
    }

    // Try icons if no logo found
    if (!iconUrl && data.icons?.length > 0) {
      for (const icon of data.icons) {
        if (icon.formats?.[0]?.src) { iconUrl = icon.formats[0].src; break; }
      }
    }

    return new Response(JSON.stringify({ icon_url: iconUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ icon_url: null }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
