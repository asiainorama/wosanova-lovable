
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebappSuggestion {
  nombre: string;
  url: string;
  descripcion: string;
  usa_ia: boolean;
  categoria: string;
  etiquetas: string[];
}

interface ProductHuntItem {
  title: string;
  description: string;
  link: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting webapp suggestions process...')

    // 1. Fetch Product Hunt RSS feed
    const rssResponse = await fetch('https://www.producthunt.com/feed')
    const rssText = await rssResponse.text()
    
    // Parse RSS manually (basic XML parsing)
    const items = parseRSS(rssText)
    console.log(`Found ${items.length} items from RSS feed`)

    // 2. Filter items with valid URLs
    const validItems = items.filter(item => 
      item.link && 
      item.link.startsWith('http') && 
      !item.link.includes('producthunt.com')
    ).slice(0, 10) // Limit to 10 items per run

    console.log(`Processing ${validItems.length} valid items`)

    const suggestions: any[] = []

    // 3. Process each item with Groq API
    for (const item of validItems) {
      try {
        const suggestion = await processWithGroq(item)
        if (suggestion) {
          // Get icon from Clearbit
          const domain = new URL(suggestion.url).hostname
          const iconUrl = `https://logo.clearbit.com/${domain}`
          
          // Check if URL is accessible
          const urlCheck = await fetch(suggestion.url, { method: 'HEAD' })
          if (urlCheck.ok) {
            suggestions.push({
              ...suggestion,
              icono_url: iconUrl,
              estado: 'borrador'
            })
          }
        }
      } catch (error) {
        console.error('Error processing item:', error)
      }
    }

    console.log(`Generated ${suggestions.length} suggestions`)

    // 4. Save to Supabase
    if (suggestions.length > 0) {
      const { data, error } = await supabase
        .from('webapp_suggestions')
        .insert(suggestions)

      if (error) {
        console.error('Error saving suggestions:', error)
        throw error
      }

      console.log(`Saved ${suggestions.length} suggestions to database`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: validItems.length,
        saved: suggestions.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in webapp-suggestions function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function parseRSS(rssText: string): ProductHuntItem[] {
  const items: ProductHuntItem[] = []
  
  // Simple regex-based RSS parsing
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  
  while ((match = itemRegex.exec(rssText)) !== null) {
    const itemContent = match[1]
    
    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(itemContent)
    const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(itemContent)
    const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent)
    
    if (titleMatch && descMatch && linkMatch) {
      items.push({
        title: titleMatch[1].trim(),
        description: descMatch[1].trim(),
        link: linkMatch[1].trim()
      })
    }
  }
  
  return items
}

async function processWithGroq(item: ProductHuntItem): Promise<WebappSuggestion | null> {
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found')
      return null
    }

    const prompt = `Actúa como un clasificador de webapps. Te pasaré el título, descripción y URL de una app de Product Hunt. Devuélveme SOLO un JSON válido con los siguientes campos exactos:

{
  "nombre": "nombre corto de la webapp",
  "url": "URL original",
  "descripcion": "descripción en español máximo 200 caracteres",
  "usa_ia": true o false,
  "categoria": "una de: productividad, creatividad, educacion, entretenimiento, herramientas dev, negocio, otras",
  "etiquetas": ["etiqueta1", "etiqueta2", "etiqueta3"]
}

Título: ${item.title}
Descripción: ${item.description}
URL: ${item.link}

Responde SOLO con el JSON, sin texto adicional:`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      console.error('Groq API error:', response.status)
      return null
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error('No content from Groq API')
      return null
    }

    // Parse JSON from response
    const jsonStart = content.indexOf('{')
    const jsonEnd = content.lastIndexOf('}') + 1
    
    if (jsonStart === -1 || jsonEnd === 0) {
      console.error('No valid JSON found in response')
      return null
    }

    const jsonStr = content.substring(jsonStart, jsonEnd)
    const suggestion = JSON.parse(jsonStr)

    // Validate required fields
    if (!suggestion.nombre || !suggestion.url || !suggestion.descripcion || !suggestion.categoria) {
      console.error('Missing required fields in suggestion')
      return null
    }

    return suggestion

  } catch (error) {
    console.error('Error processing with Groq:', error)
    return null
  }
}
