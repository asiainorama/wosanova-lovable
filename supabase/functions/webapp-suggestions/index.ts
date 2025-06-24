
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

interface ProductItem {
  title: string;
  description: string;
  productHuntUrl: string;
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

    // 1. Obtener productos de múltiples fuentes
    const allProducts = await getAllProductSources()
    console.log(`📋 Found ${allProducts.length} products from all sources`)

    if (allProducts.length === 0) {
      console.log('⚠️ No products found from any source')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No products found from any source',
        processed: 0,
        saved: 0 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Filtrar productos válidos con URLs de sitio web
    const validProducts = await getValidProducts(allProducts.slice(0, 10))
    console.log(`✅ Found ${validProducts.length} valid products with website URLs`)

    if (validProducts.length === 0) {
      console.log('⚠️ No valid products with website URLs found')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No valid products with website URLs found',
        processed: allProducts.length,
        saved: 0 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const suggestions: any[] = []

    // 3. Procesar cada producto con Groq API
    console.log('🤖 Processing products with Groq API...')
    for (const [index, product] of validProducts.entries()) {
      console.log(`🔄 Processing product ${index + 1}/${validProducts.length}: "${product.title}"`)
      
      try {
        const suggestion = await processWithGroq(product)
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
          console.log(`❌ Failed to process: "${product.title}"`)
        }
      } catch (error) {
        console.error(`💥 Error processing "${product.title}":`, error.message)
      }
    }

    console.log(`📊 Generated ${suggestions.length} suggestions total`)

    // 4. Guardar en Supabase
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
        processed: validProducts.length,
        saved: suggestions.length,
        debug: {
          totalProductsFound: allProducts.length,
          validProductsWithUrls: validProducts.length,
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

async function getAllProductSources(): Promise<ProductItem[]> {
  const products: ProductItem[] = []
  
  try {
    // Fuente 1: Product Hunt API (simulada con datos de ejemplo)
    console.log('📡 Getting products from Product Hunt...')
    const phProducts = await getProductHuntProducts()
    products.push(...phProducts)
    
    // Fuente 2: Agregar productos de ejemplo si no hay suficientes
    if (products.length < 5) {
      console.log('📝 Adding example products for testing...')
      const exampleProducts = getExampleProducts()
      products.push(...exampleProducts)
    }
    
  } catch (error) {
    console.error('Error getting products from sources:', error)
    // En caso de error, usar productos de ejemplo
    console.log('📝 Using example products as fallback...')
    products.push(...getExampleProducts())
  }
  
  return products
}

async function getProductHuntProducts(): Promise<ProductItem[]> {
  try {
    // Intentar obtener del feed RSS de Product Hunt
    const feedResponse = await fetch('https://www.producthunt.com/feed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebappSuggestionsBot/1.0)',
        'Accept': 'application/atom+xml, application/xml, text/xml'
      }
    })
    
    if (!feedResponse.ok) {
      console.log(`Product Hunt feed failed: ${feedResponse.status}`)
      return []
    }
    
    const feedText = await feedResponse.text()
    console.log(`📝 Product Hunt feed response length: ${feedText.length} characters`)
    
    // Parse simple del feed
    const products: ProductItem[] = []
    const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi
    let match
    let count = 0
    
    while ((match = entryRegex.exec(feedText)) !== null && count < 5) {
      const entryContent = match[1]
      
      // Extraer título
      const titleMatch = /<title[^>]*>(.*?)<\/title>/i.exec(entryContent)
      if (!titleMatch) continue
      
      const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim()
      
      // Extraer enlace de ProductHunt
      const linkMatch = /<link[^>]*href=["'](.*?)["'][^>]*>/i.exec(entryContent)
      if (!linkMatch) continue
      
      const productHuntUrl = linkMatch[1].trim()
      
      // Extraer descripción básica
      const contentMatch = /<content[^>]*>(.*?)<\/content>/i.exec(entryContent)
      let description = ''
      if (contentMatch) {
        description = contentMatch[1]
          .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 200)
      }
      
      if (title && productHuntUrl && productHuntUrl.includes('producthunt.com')) {
        products.push({
          title: title.substring(0, 100),
          description: description || `Innovative web application: ${title}`,
          productHuntUrl
        })
        count++
      }
    }
    
    console.log(`📋 Parsed ${products.length} products from Product Hunt feed`)
    return products
    
  } catch (error) {
    console.error('Error fetching Product Hunt products:', error)
    return []
  }
}

function getExampleProducts(): ProductItem[] {
  return [
    {
      title: "NotionAI Assistant",
      description: "AI-powered workspace that helps you write, plan, and get organized with intelligent automation",
      productHuntUrl: "https://www.producthunt.com/posts/notion-ai",
      websiteUrl: "https://notion.so"
    },
    {
      title: "Figma Auto Layout",
      description: "Advanced design tool with AI-powered layout suggestions and collaborative features for modern design teams",
      productHuntUrl: "https://www.producthunt.com/posts/figma-autolayout",
      websiteUrl: "https://figma.com"
    },
    {
      title: "Linear Project Manager",
      description: "Streamlined project management tool designed for modern software teams with intelligent tracking",
      productHuntUrl: "https://www.producthunt.com/posts/linear",
      websiteUrl: "https://linear.app"
    },
    {
      title: "Vercel Analytics",
      description: "Real-time web analytics platform with privacy-first approach and lightning-fast insights",
      productHuntUrl: "https://www.producthunt.com/posts/vercel-analytics",
      websiteUrl: "https://vercel.com/analytics"
    },
    {
      title: "Supabase Studio",
      description: "Open-source Firebase alternative with built-in authentication, real-time subscriptions, and more",
      productHuntUrl: "https://www.producthunt.com/posts/supabase",
      websiteUrl: "https://supabase.io"
    }
  ]
}

async function getValidProducts(products: ProductItem[]): Promise<ProductItem[]> {
  const validProducts: ProductItem[] = []
  
  for (const product of products) {
    try {
      console.log(`🔗 Processing product: "${product.title}"`)
      
      // Si ya tiene websiteUrl, usarla
      if (product.websiteUrl && isValidWebsiteUrl(product.websiteUrl)) {
        console.log(`✅ Product already has valid website URL: ${product.websiteUrl}`)
        validProducts.push(product)
        continue
      }
      
      // Si tiene URL de ProductHunt, intentar extraer la URL real
      if (product.productHuntUrl && product.productHuntUrl.includes('producthunt.com')) {
        console.log(`🔗 Extracting website URL from: ${product.productHuntUrl}`)
        
        try {
          const websiteUrl = await extractWebsiteFromProductHunt(product.productHuntUrl)
          if (websiteUrl) {
            console.log(`✅ Found website URL: ${websiteUrl}`)
            validProducts.push({
              ...product,
              websiteUrl
            })
          } else {
            console.log(`❌ No website URL found for: "${product.title}"`)
          }
        } catch (error) {
          console.log(`💥 Error extracting URL for "${product.title}":`, error.message)
        }
      } else {
        console.log(`⚠️ Invalid ProductHunt URL: ${product.productHuntUrl}`)
      }
      
    } catch (error) {
      console.log(`💥 Error processing "${product.title}":`, error.message)
    }
  }
  
  return validProducts
}

async function extractWebsiteFromProductHunt(productHuntUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 segundos timeout
    
    const pageResponse = await fetch(productHuntUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebappSuggestionsBot/1.0)'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!pageResponse.ok) {
      console.log(`⚠️ Failed to fetch ProductHunt page: ${pageResponse.status}`)
      return null
    }
    
    const pageHtml = await pageResponse.text()
    
    // Múltiples patrones para encontrar la URL del sitio web
    const patterns = [
      // Buscar enlaces "Visit" o "Website"
      /href=["'](https?:\/\/(?!.*producthunt\.com)[^"']+)["'][^>]*(?:visit|website|go\s+to|launch)/i,
      // Buscar en secciones específicas
      /class=["'][^"']*(?:website|external|visit)[^"']*["'][^>]*href=["'](https?:\/\/(?!.*producthunt\.com)[^"']+)["']/i,
      // Buscar atributos data-url
      /data-url=["'](https?:\/\/(?!.*producthunt\.com)[^"']+)["']/i,
      // Patrón genérico de enlaces externos
      /href=["'](https?:\/\/(?!.*(?:producthunt\.com|twitter\.com|facebook\.com|linkedin\.com|instagram\.com|youtube\.com|github\.com))[^"']+)["']/i
    ]
    
    for (const pattern of patterns) {
      const match = pattern.exec(pageHtml)
      if (match && match[1]) {
        const url = match[1].trim()
        if (isValidWebsiteUrl(url)) {
          return url
        }
      }
    }
    
    return null
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request timed out')
    } else {
      console.log('Error fetching ProductHunt page:', error.message)
    }
    return null
  }
}

function isValidWebsiteUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Excluir dominios de redes sociales y otros no-sitios web
    const excludedDomains = [
      'producthunt.com', 'twitter.com', 'facebook.com', 'linkedin.com',
      'instagram.com', 'youtube.com', 'github.com', 'medium.com',
      'discord.com', 'telegram.org', 'reddit.com', 'tiktok.com'
    ]
    
    return !excludedDomains.some(domain => hostname.includes(domain)) &&
           urlObj.protocol.startsWith('http') &&
           hostname.includes('.') &&
           hostname.length > 3
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

async function processWithGroq(product: ProductItem): Promise<WebappSuggestion | null> {
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      console.error('❌ GROQ_API_KEY not found')
      return null
    }

    console.log(`🤖 Processing with Groq: "${product.title}"`)

    const prompt = `Analiza esta aplicación web y devuelve SOLO un JSON válido con la información solicitada.

INFORMACIÓN DE LA APP:
- Título: ${product.title}
- Descripción: ${product.description}
- URL del sitio web: ${product.websiteUrl}

RESPONDE SOLO CON ESTE JSON (sin texto adicional ni explicaciones):
{
  "nombre": "nombre descriptivo en español (máximo 50 caracteres)",
  "url": "${product.websiteUrl}",
  "descripcion": "descripción clara y útil en español que explique qué hace la app (máximo 200 caracteres)",
  "usa_ia": true o false (determina si la aplicación usa inteligencia artificial o machine learning),
  "categoria": "una de estas opciones exactas: productividad, creatividad, educacion, entretenimiento, herramientas dev, negocio, otras",
  "etiquetas": ["máximo 3 etiquetas relevantes en español"]
}

REGLAS IMPORTANTES:
- El nombre debe ser claro y en español
- La descripción debe ser útil y explicar la funcionalidad principal
- Usa exactamente la URL proporcionada
- Solo marca usa_ia como true si realmente usa IA/ML
- Usa exactamente una de las categorías listadas
- Máximo 3 etiquetas relevantes en español`

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
        max_tokens: 400
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

    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('❌ No valid JSON found in response')
      return null
    }

    const suggestion = JSON.parse(jsonMatch[0])

    // Validar campos requeridos
    if (!suggestion.nombre || !suggestion.url || !suggestion.descripcion || !suggestion.categoria) {
      console.error('❌ Missing required fields in suggestion:', suggestion)
      return null
    }

    // Validar categoría
    const validCategories = ['productividad', 'creatividad', 'educacion', 'entretenimiento', 'herramientas dev', 'negocio', 'otras']
    if (!validCategories.includes(suggestion.categoria)) {
      suggestion.categoria = 'otras'
    }

    // Asegurar que etiquetas es un array
    if (!Array.isArray(suggestion.etiquetas)) {
      suggestion.etiquetas = []
    }

    // Asegurar que usa_ia es boolean
    if (typeof suggestion.usa_ia !== 'boolean') {
      suggestion.usa_ia = false
    }

    // Asegurar URL correcta
    suggestion.url = product.websiteUrl

    return suggestion

  } catch (error) {
    console.error('💥 Error processing with Groq:', error)
    return null
  }
}
