
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
  websiteUrl?: string;
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

    console.log('🚀 Starting webapp suggestions process...')

    // 1. Fetch Product Hunt Atom feed
    console.log('📡 Fetching Product Hunt Atom feed...')
    const feedResponse = await fetch('https://www.producthunt.com/feed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebappSuggestionsBot/1.0)',
        'Accept': 'application/atom+xml, application/xml, text/xml'
      }
    })
    
    if (!feedResponse.ok) {
      throw new Error(`Failed to fetch feed: ${feedResponse.status} ${feedResponse.statusText}`)
    }
    
    const feedText = await feedResponse.text()
    console.log(`📝 Feed response length: ${feedText.length} characters`)
    
    // 2. Parse Atom feed
    console.log('🔍 Parsing Atom feed...')
    const items = parseAtomFeed(feedText)
    console.log(`📋 Found ${items.length} items from Atom feed`)

    if (items.length === 0) {
      console.log('⚠️ No items found in feed')
      console.log('📄 Feed sample:', feedText.substring(0, 500))
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No items found in feed',
        processed: 0,
        saved: 0 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 3. Extract real website URLs from ProductHunt pages
    console.log('🔗 Extracting website URLs...')
    const itemsWithUrls = await extractWebsiteUrls(items.slice(0, 10)) // Process first 10 items
    console.log(`✅ Found ${itemsWithUrls.length} items with valid website URLs`)

    if (itemsWithUrls.length === 0) {
      console.log('⚠️ No valid website URLs found')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No valid website URLs found',
        processed: items.length,
        saved: 0 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const suggestions: any[] = []

    // 4. Process each item with Groq API
    console.log('🤖 Processing items with Groq API...')
    for (const [index, item] of itemsWithUrls.entries()) {
      console.log(`🔄 Processing item ${index + 1}/${itemsWithUrls.length}: "${item.title}"`)
      
      try {
        const suggestion = await processWithGroq(item)
        if (suggestion) {
          // Get icon from Clearbit
          const domain = extractDomain(suggestion.url)
          const iconUrl = `https://logo.clearbit.com/${domain}`
          
          suggestions.push({
            ...suggestion,
            icono_url: iconUrl,
            estado: 'borrador'
          })
          
          console.log(`✅ Successfully processed: "${suggestion.nombre}"`)
        } else {
          console.log(`❌ Failed to process: "${item.title}"`)
        }
      } catch (error) {
        console.error(`💥 Error processing "${item.title}":`, error.message)
      }
    }

    console.log(`📊 Generated ${suggestions.length} suggestions total`)

    // 5. Save to Supabase
    if (suggestions.length > 0) {
      console.log('💾 Saving suggestions to database...')
      const { data, error } = await supabase
        .from('webapp_suggestions')
        .insert(suggestions)

      if (error) {
        console.error('❌ Error saving suggestions:', error)
        throw error
      }

      console.log(`🎉 Successfully saved ${suggestions.length} suggestions to database`)
    } else {
      console.log('📝 No suggestions to save')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: itemsWithUrls.length,
        saved: suggestions.length,
        debug: {
          feedItemsFound: items.length,
          itemsWithUrls: itemsWithUrls.length,
          suggestionsGenerated: suggestions.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error in webapp-suggestions function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function parseAtomFeed(feedText: string): ProductHuntItem[] {
  const items: ProductHuntItem[] = []
  
  try {
    console.log('🔍 Starting Atom feed parsing...')
    
    // Parse Atom entries (not RSS items)
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi
    let match
    let entryCount = 0
    
    while ((match = entryRegex.exec(feedText)) !== null && entryCount < 20) {
      const entryContent = match[1]
      entryCount++
      
      // Extract title
      let title = ''
      const titleMatch = /<title[^>]*>(.*?)<\/title>/i.exec(entryContent)
      if (titleMatch) {
        title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim()
      }
      
      // Extract content/description
      let description = ''
      const contentMatch = /<content[^>]*>(.*?)<\/content>/i.exec(entryContent) ||
                         /<summary[^>]*>(.*?)<\/summary>/i.exec(entryContent)
      if (contentMatch) {
        description = contentMatch[1]
          .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
      
      // Extract ProductHunt link
      let productHuntLink = ''
      const linkMatch = /<link[^>]*href=["'](.*?)["'][^>]*>/i.exec(entryContent) ||
                       /<id[^>]*>(.*?)<\/id>/i.exec(entryContent)
      if (linkMatch) {
        productHuntLink = linkMatch[1].trim()
      }
      
      // Only add if we have minimum required data
      if (title && description && productHuntLink) {
        items.push({
          title: title.substring(0, 200),
          description: description.substring(0, 500),
          link: productHuntLink,
          websiteUrl: '' // Will be extracted later
        })
        
        console.log(`📝 Parsed entry: "${title.substring(0, 50)}..."`)
      }
    }
    
    console.log(`✅ Successfully parsed ${items.length} entries from Atom feed`)
    
  } catch (error) {
    console.error('💥 Error parsing Atom feed:', error)
  }
  
  return items
}

async function extractWebsiteUrls(items: ProductHuntItem[]): Promise<ProductHuntItem[]> {
  const validItems: ProductHuntItem[] = []
  
  for (const item of items) {
    try {
      console.log(`🔗 Extracting website URL for: "${item.title}"`)
      
      if (!item.link || !item.link.includes('producthunt.com')) {
        console.log(`⚠️ Invalid ProductHunt link: ${item.link}`)
        continue
      }
      
      // Fetch the ProductHunt page
      const pageResponse = await fetch(item.link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebappSuggestionsBot/1.0)'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (!pageResponse.ok) {
        console.log(`⚠️ Failed to fetch ProductHunt page: ${pageResponse.status}`)
        continue
      }
      
      const pageHtml = await pageResponse.text()
      
      // Extract website URL from ProductHunt page
      const websiteUrl = extractWebsiteFromProductHuntPage(pageHtml)
      
      if (websiteUrl) {
        console.log(`✅ Found website URL: ${websiteUrl}`)
        validItems.push({
          ...item,
          websiteUrl
        })
      } else {
        console.log(`❌ No website URL found for: "${item.title}"`)
      }
      
    } catch (error) {
      console.log(`💥 Error extracting URL for "${item.title}":`, error.message)
    }
  }
  
  return validItems
}

function extractWebsiteFromProductHuntPage(html: string): string | null {
  // Try multiple patterns to find the website URL
  const patterns = [
    // Look for "Visit" or "Website" buttons/links
    /href=["'](https?:\/\/(?!.*producthunt\.com)[^"']+)["'][^>]*(?:visit|website|go\s+to)/i,
    // Look for external links in specific sections
    /class=["'][^"']*(?:website|external|visit)[^"']*["'][^>]*href=["'](https?:\/\/(?!.*producthunt\.com)[^"']+)["']/i,
    // Look for data attributes with URLs
    /data-url=["'](https?:\/\/(?!.*producthunt\.com)[^"']+)["']/i,
    // Generic external link pattern
    /href=["'](https?:\/\/(?!.*(?:producthunt\.com|twitter\.com|facebook\.com|linkedin\.com|instagram\.com|youtube\.com|github\.com))[^"']+)["']/i
  ]
  
  for (const pattern of patterns) {
    const match = pattern.exec(html)
    if (match && match[1]) {
      const url = match[1].trim()
      if (isValidWebsiteUrl(url)) {
        return url
      }
    }
  }
  
  return null
}

function isValidWebsiteUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Exclude social media and other non-website URLs
    const excludedDomains = [
      'producthunt.com', 'twitter.com', 'facebook.com', 'linkedin.com',
      'instagram.com', 'youtube.com', 'github.com', 'medium.com',
      'discord.com', 'telegram.org', 'reddit.com'
    ]
    
    return !excludedDomains.some(domain => hostname.includes(domain)) &&
           urlObj.protocol.startsWith('http') &&
           hostname.includes('.')
  } catch {
    return false
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return 'unknown'
  }
}

async function processWithGroq(item: ProductHuntItem): Promise<WebappSuggestion | null> {
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      console.error('❌ GROQ_API_KEY not found')
      return null
    }

    console.log(`🤖 Processing with Groq: "${item.title}"`)

    const prompt = `Analiza esta aplicación web y devuelve SOLO un JSON válido con la información solicitada.

INFORMACIÓN DE LA APP:
- Título: ${item.title}
- Descripción: ${item.description}
- URL: ${item.websiteUrl}

RESPONDE SOLO CON ESTE JSON (sin texto adicional):
{
  "nombre": "nombre descriptivo en español (máximo 50 caracteres)",
  "url": "${item.websiteUrl}",
  "descripcion": "descripción clara y útil en español (máximo 200 caracteres)",
  "usa_ia": true o false (determina si usa inteligencia artificial),
  "categoria": "una de: productividad, creatividad, educacion, entretenimiento, herramientas dev, negocio, otras",
  "etiquetas": ["etiqueta1", "etiqueta2", "etiqueta3"]
}

IMPORTANTE:
- El nombre debe ser claro y descriptivo
- La descripción debe explicar qué hace la app de forma útil
- Usa la URL exacta proporcionada
- Determina correctamente si usa IA
- Máximo 3 etiquetas relevantes`

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
      const errorText = await response.text()
      console.error('❌ Groq API error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error('❌ No content from Groq API')
      return null
    }

    console.log(`🤖 Groq response: ${content}`)

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('❌ No valid JSON found in response')
      return null
    }

    const suggestion = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!suggestion.nombre || !suggestion.url || !suggestion.descripcion || !suggestion.categoria) {
      console.error('❌ Missing required fields in suggestion:', suggestion)
      return null
    }

    // Validate categoria
    const validCategories = ['productividad', 'creatividad', 'educacion', 'entretenimiento', 'herramientas dev', 'negocio', 'otras']
    if (!validCategories.includes(suggestion.categoria)) {
      suggestion.categoria = 'otras'
    }

    // Ensure etiquetas is an array
    if (!Array.isArray(suggestion.etiquetas)) {
      suggestion.etiquetas = []
    }

    // Ensure URL is correct
    suggestion.url = item.websiteUrl

    return suggestion

  } catch (error) {
    console.error('💥 Error processing with Groq:', error)
    return null
  }
}
