
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
      console.log('No items found in RSS feed, checking feed content sample:', rssText.substring(0, 500))
    }

    // 2. Filter items with valid URLs - less restrictive filtering
    const validItems = items.filter(item => {
      const hasValidUrl = item.link && item.link.startsWith('http')
      const isNotProductHunt = !item.link.includes('producthunt.com')
      const hasTitle = item.title && item.title.trim().length > 0
      const hasDescription = item.description && item.description.trim().length > 0
      
      if (!hasValidUrl) console.log('Invalid URL:', item.link)
      if (!isNotProductHunt) console.log('ProductHunt URL filtered:', item.link)
      if (!hasTitle) console.log('No title:', item.title)
      if (!hasDescription) console.log('No description:', item.description)
      
      return hasValidUrl && isNotProductHunt && hasTitle && hasDescription
    }).slice(0, 5) // Reduce to 5 items for testing

    console.log(`Processing ${validItems.length} valid items`)
    
    if (validItems.length === 0) {
      console.log('No valid items after filtering. Sample of all items:')
      items.slice(0, 3).forEach((item, i) => {
        console.log(`Item ${i + 1}:`, {
          title: item.title?.substring(0, 50),
          link: item.link?.substring(0, 100),
          description: item.description?.substring(0, 50)
        })
      })
    }

    const suggestions: any[] = []

    // 3. Process each item with Groq API
    for (const [index, item] of validItems.entries()) {
      console.log(`Processing item ${index + 1}/${validItems.length}: ${item.title}`)
      
      try {
        // Check if URL is accessible with timeout
        console.log(`Checking URL accessibility: ${item.link}`)
        const urlCheckController = new AbortController()
        const timeoutId = setTimeout(() => urlCheckController.abort(), 5000) // 5 second timeout
        
        try {
          const urlCheck = await fetch(item.link, { 
            method: 'HEAD',
            signal: urlCheckController.signal
          })
          clearTimeout(timeoutId)
          
          if (!urlCheck.ok) {
            console.log(`URL not accessible: ${item.link} - Status: ${urlCheck.status}`)
            continue
          }
        } catch (urlError) {
          clearTimeout(timeoutId)
          console.log(`URL check failed for ${item.link}:`, urlError.message)
          continue
        }

        const suggestion = await processWithGroq(item)
        if (suggestion) {
          // Get icon from Clearbit
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
    console.log('Starting RSS parsing...')
    
    // Improved RSS parsing with multiple approaches
    
    // Method 1: Try standard RSS item parsing
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
    let match
    let itemCount = 0
    
    while ((match = itemRegex.exec(rssText)) !== null && itemCount < 20) {
      const itemContent = match[1]
      itemCount++
      
      // Extract title - try multiple patterns
      let title = ''
      const titlePatterns = [
        /<title><!\[CDATA\[(.*?)\]\]><\/title>/i,
        /<title>(.*?)<\/title>/i
      ]
      
      for (const pattern of titlePatterns) {
        const titleMatch = pattern.exec(itemContent)
        if (titleMatch) {
          title = titleMatch[1].trim()
          break
        }
      }
      
      // Extract description - try multiple patterns
      let description = ''
      const descPatterns = [
        /<description><!\[CDATA\[(.*?)\]\]><\/description>/i,
        /<description>(.*?)<\/description>/i
      ]
      
      for (const pattern of descPatterns) {
        const descMatch = pattern.exec(itemContent)
        if (descMatch) {
          description = descMatch[1].trim()
          // Clean HTML tags from description
          description = description.replace(/<[^>]*>/g, '').trim()
          break
        }
      }
      
      // Extract link - try multiple patterns
      let link = ''
      const linkPatterns = [
        /<link><!\[CDATA\[(.*?)\]\]><\/link>/i,
        /<link>(.*?)<\/link>/i,
        /<guid[^>]*>(.*?)<\/guid>/i
      ]
      
      for (const pattern of linkPatterns) {
        const linkMatch = pattern.exec(itemContent)
        if (linkMatch) {
          link = linkMatch[1].trim()
          break
        }
      }
      
      // Only add if we have minimum required data
      if (title && link) {
        items.push({
          title: title.substring(0, 200), // Limit title length
          description: description.substring(0, 500), // Limit description length
          link: link
        })
      }
    }
    
    console.log(`Parsed ${items.length} items using standard RSS parsing`)
    
    // Method 2: If no items found, try alternative parsing
    if (items.length === 0) {
      console.log('Trying alternative RSS parsing methods...')
      
      // Look for entry elements (Atom format)
      const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi
      let entryMatch
      
      while ((entryMatch = entryRegex.exec(rssText)) !== null && items.length < 20) {
        const entryContent = entryMatch[1]
        
        const titleMatch = /<title[^>]*>(.*?)<\/title>/i.exec(entryContent)
        const linkMatch = /<link[^>]*href=["'](.*?)["'][^>]*>/i.exec(entryContent)
        const summaryMatch = /<summary[^>]*>(.*?)<\/summary>/i.exec(entryContent)
        
        if (titleMatch && linkMatch) {
          items.push({
            title: titleMatch[1].trim().substring(0, 200),
            description: summaryMatch ? summaryMatch[1].trim().replace(/<[^>]*>/g, '').substring(0, 500) : '',
            link: linkMatch[1].trim()
          })
        }
      }
      
      console.log(`Found ${items.length} items using Atom parsing`)
    }
    
  } catch (error) {
    console.error('Error parsing RSS:', error)
  }
  
  console.log(`Total items parsed: ${items.length}`)
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
      console.error('Groq API error:', response.status, await response.text())
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

    // Ensure URL is the original one
    suggestion.url = item.link

    return suggestion

  } catch (error) {
    console.error('Error processing with Groq:', error)
    return null
  }
}
