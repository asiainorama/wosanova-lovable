
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

    console.log('Starting webapp suggestions process...')

    // 1. Fetch Product Hunt RSS feed
    console.log('Fetching Product Hunt RSS feed...')
    const rssResponse = await fetch('https://www.producthunt.com/feed')
    
    if (!rssResponse.ok) {
      throw new Error(`Failed to fetch RSS: ${rssResponse.status} ${rssResponse.statusText}`)
    }
    
    const rssText = await rssResponse.text()
    console.log('RSS response length:', rssText.length)
    
    // Parse RSS with improved parsing
    const items = parseRSS(rssText)
    console.log(`Found ${items.length} items from RSS feed`)

    if (items.length === 0) {
      console.log('No items found in RSS feed, checking feed content sample:', rssText.substring(0, 1000))
    }

    // 2. Filter items and extract real website URLs
    const validItems = items.filter(item => {
      const hasTitle = item.title && item.title.trim().length > 0
      const hasDescription = item.description && item.description.trim().length > 0
      const hasWebsiteUrl = item.websiteUrl && item.websiteUrl.startsWith('http') && !item.websiteUrl.includes('producthunt.com')
      
      if (!hasTitle) console.log('No title:', item.title)
      if (!hasDescription) console.log('No description for:', item.title)
      if (!hasWebsiteUrl) console.log('No valid website URL for:', item.title, 'URL:', item.websiteUrl)
      
      return hasTitle && hasDescription && hasWebsiteUrl
    }).slice(0, 10) // Process more items for better results

    console.log(`Processing ${validItems.length} valid items`)
    
    if (validItems.length === 0) {
      console.log('No valid items after filtering. Sample of all items:')
      items.slice(0, 5).forEach((item, i) => {
        console.log(`Item ${i + 1}:`, {
          title: item.title?.substring(0, 50),
          description: item.description?.substring(0, 100),
          websiteUrl: item.websiteUrl?.substring(0, 100)
        })
      })
    }

    const suggestions: any[] = []

    // 3. Process each item with Groq API
    for (const [index, item] of validItems.entries()) {
      console.log(`Processing item ${index + 1}/${validItems.length}: ${item.title}`)
      
      try {
        // Use the website URL instead of ProductHunt URL
        const websiteUrl = item.websiteUrl!
        
        // Check if URL is accessible with timeout
        console.log(`Checking URL accessibility: ${websiteUrl}`)
        const urlCheckController = new AbortController()
        const timeoutId = setTimeout(() => urlCheckController.abort(), 8000) // 8 second timeout
        
        try {
          const urlCheck = await fetch(websiteUrl, { 
            method: 'HEAD',
            signal: urlCheckController.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; WebappSuggestionsBot/1.0)'
            }
          })
          clearTimeout(timeoutId)
          
          if (!urlCheck.ok && urlCheck.status !== 403) { // 403 might be ok for some sites
            console.log(`URL not accessible: ${websiteUrl} - Status: ${urlCheck.status}`)
            continue
          }
        } catch (urlError) {
          clearTimeout(timeoutId)
          console.log(`URL check failed for ${websiteUrl}:`, urlError.message)
          continue
        }

        const suggestion = await processWithGroq(item)
        if (suggestion) {
          // Get icon from Clearbit using the website domain
          const domain = new URL(suggestion.url).hostname
          const iconUrl = `https://logo.clearbit.com/${domain}`
          
          suggestions.push({
            ...suggestion,
            icono_url: iconUrl,
            estado: 'borrador'
          })
          
          console.log(`Successfully processed: ${suggestion.nombre}`)
        } else {
          console.log(`Failed to process with Groq: ${item.title}`)
        }
      } catch (error) {
        console.error(`Error processing item "${item.title}":`, error.message)
      }
    }

    console.log(`Generated ${suggestions.length} suggestions`)

    // 4. Save to Supabase
    if (suggestions.length > 0) {
      console.log('Saving suggestions to database...')
      const { data, error } = await supabase
        .from('webapp_suggestions')
        .insert(suggestions)

      if (error) {
        console.error('Error saving suggestions:', error)
        throw error
      }

      console.log(`Successfully saved ${suggestions.length} suggestions to database`)
    } else {
      console.log('No suggestions to save')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: validItems.length,
        saved: suggestions.length,
        debug: {
          rssItemsFound: items.length,
          validItemsAfterFilter: validItems.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in webapp-suggestions function:', error)
    return new Response(
      JSON.stringify({ 
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

function parseRSS(rssText: string): ProductHuntItem[] {
  const items: ProductHuntItem[] = []
  
  try {
    console.log('Starting improved RSS parsing...')
    
    // Use DOMParser-like approach for better parsing
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
    let match
    let itemCount = 0
    
    while ((match = itemRegex.exec(rssText)) !== null && itemCount < 50) {
      const itemContent = match[1]
      itemCount++
      
      // Extract title
      let title = ''
      const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/i.exec(itemContent) ||
                        /<title>(.*?)<\/title>/i.exec(itemContent)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }
      
      // Extract description - try multiple approaches
      let description = ''
      const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>/i.exec(itemContent) ||
                       /<description>(.*?)<\/description>/i.exec(itemContent)
      if (descMatch) {
        description = descMatch[1].trim()
        // Clean HTML tags and get meaningful text
        description = description.replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
      
      // Extract ProductHunt link
      let productHuntLink = ''
      const linkMatch = /<link><!\[CDATA\[(.*?)\]\]><\/link>/i.exec(itemContent) ||
                       /<link>(.*?)<\/link>/i.exec(itemContent) ||
                       /<guid[^>]*>(.*?)<\/guid>/i.exec(itemContent)
      if (linkMatch) {
        productHuntLink = linkMatch[1].trim()
      }
      
      // Try to extract the actual website URL from the description or content
      let websiteUrl = ''
      
      // Look for URL patterns in the description
      const urlPatterns = [
        /https?:\/\/(?!www\.producthunt\.com)[^\s<>"']+/gi,
        /(?:Visit|Website|Link|URL):\s*(https?:\/\/[^\s<>"']+)/gi,
        /href=["'](https?:\/\/(?!www\.producthunt\.com)[^"']+)["']/gi
      ]
      
      for (const pattern of urlPatterns) {
        const urlMatches = [...itemContent.matchAll(pattern)]
        for (const urlMatch of urlMatches) {
          const foundUrl = urlMatch[1] || urlMatch[0]
          if (foundUrl && !foundUrl.includes('producthunt.com') && foundUrl.includes('.')) {
            websiteUrl = foundUrl.trim()
            break
          }
        }
        if (websiteUrl) break
      }
      
      // If no website URL found, try to fetch it from ProductHunt page (fallback)
      if (!websiteUrl && productHuntLink) {
        // For now, skip items without direct website URLs
        // In a production system, you might scrape the ProductHunt page
        continue
      }
      
      // Only add if we have minimum required data including website URL
      if (title && description && websiteUrl) {
        items.push({
          title: title.substring(0, 200),
          description: description.substring(0, 1000),
          link: productHuntLink,
          websiteUrl: websiteUrl
        })
      }
    }
    
    console.log(`Successfully parsed ${items.length} items with website URLs`)
    
  } catch (error) {
    console.error('Error parsing RSS:', error)
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

    console.log(`Processing with Groq: ${item.title}`)

    const prompt = `Actúa como un clasificador de webapps. Te pasaré el título, descripción y URL de una app. Devuélveme SOLO un JSON válido con los siguientes campos exactos:

{
  "nombre": "nombre corto y descriptivo de la webapp en español",
  "url": "URL original de la webapp",
  "descripcion": "descripción clara y útil en español, máximo 200 caracteres",
  "usa_ia": true o false (determina si la app usa inteligencia artificial),
  "categoria": "una de: productividad, creatividad, educacion, entretenimiento, herramientas dev, negocio, otras",
  "etiquetas": ["etiqueta1", "etiqueta2", "etiqueta3"] (máximo 3 etiquetas relevantes en español)
}

Información de la app:
Título: ${item.title}
Descripción: ${item.description}
URL: ${item.websiteUrl}

IMPORTANTE: 
- Usa la URL de la webapp, no la de ProductHunt
- La descripción debe ser clara y útil para usuarios españoles
- Determina correctamente si usa IA basándote en el título y descripción
- Clasifica en la categoría más apropiada

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
        temperature: 0.2,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error('No content from Groq API')
      return null
    }

    console.log('Groq response:', content)

    // Parse JSON from response
    const jsonStart = content.indexOf('{')
    const jsonEnd = content.lastIndexOf('}') + 1
    
    if (jsonStart === -1 || jsonEnd === 0) {
      console.error('No valid JSON found in response:', content)
      return null
    }

    const jsonStr = content.substring(jsonStart, jsonEnd)
    const suggestion = JSON.parse(jsonStr)

    // Validate required fields
    if (!suggestion.nombre || !suggestion.url || !suggestion.descripcion || !suggestion.categoria) {
      console.error('Missing required fields in suggestion:', suggestion)
      return null
    }

    // Ensure URL is the website URL, not ProductHunt URL
    suggestion.url = item.websiteUrl

    // Validate categoria
    const validCategories = ['productividad', 'creatividad', 'educacion', 'entretenimiento', 'herramientas dev', 'negocio', 'otras']
    if (!validCategories.includes(suggestion.categoria)) {
      suggestion.categoria = 'otras'
    }

    // Ensure etiquetas is an array
    if (!Array.isArray(suggestion.etiquetas)) {
      suggestion.etiquetas = []
    }

    return suggestion

  } catch (error) {
    console.error('Error processing with Groq:', error)
    return null
  }
}
