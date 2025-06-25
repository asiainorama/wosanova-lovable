
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
  websiteUrl: string;
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

    // Check for Groq API key
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      console.error('❌ GROQ_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'GROQ_API_KEY no configurada',
          processed: 0,
          saved: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('✅ Groq API key found, length:', groqApiKey.length)

    // Get existing apps to avoid duplicates
    const { data: existingApps, error: appsError } = await supabase
      .from('apps')
      .select('url, name')

    if (appsError) {
      console.error('❌ Error fetching existing apps:', appsError)
      throw appsError
    }

    const existingUrls = new Set(existingApps?.map(app => new URL(app.url).hostname.replace('www.', '')) || [])
    const existingNames = new Set(existingApps?.map(app => app.name.toLowerCase()) || [])
    
    console.log(`📋 Found ${existingUrls.size} existing apps to filter out`)

    // Use dynamic products with more variety
    const products = getDynamicProducts()
    console.log(`📋 Using ${products.length} dynamic products`)

    const suggestions: any[] = []

    // Process each product with Groq API
    console.log('🤖 Processing products with Groq API...')
    for (const [index, product] of products.entries()) {
      console.log(`🔄 Processing product ${index + 1}/${products.length}: "${product.title}"`)
      
      try {
        const suggestion = await processWithGroq(product, groqApiKey)
        if (suggestion) {
          // Check if this app already exists
          const suggestionDomain = extractDomain(suggestion.url).replace('www.', '')
          const suggestionName = suggestion.nombre.toLowerCase()
          
          if (existingUrls.has(suggestionDomain) || existingNames.has(suggestionName)) {
            console.log(`⚠️ Skipping duplicate: "${suggestion.nombre}" (already exists)`)
            continue
          }

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

    console.log(`📊 Generated ${suggestions.length} unique suggestions total`)

    // Save to Supabase
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
      console.log('📝 No new suggestions to save (all were duplicates or failed)')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: products.length,
        saved: suggestions.length,
        filtered: products.length - suggestions.length,
        debug: {
          productsUsed: products.length,
          suggestionsGenerated: suggestions.length,
          existingAppsCount: existingUrls.size,
          groqApiKey: groqApiKey ? 'Present' : 'Missing',
          groqKeyLength: groqApiKey?.length || 0
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
        processed: 0,
        saved: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function getDynamicProducts(): ProductItem[] {
  // Create pools of different types of products for variety
  const aiTools = [
    {
      title: "Claude AI",
      description: "Advanced conversational AI assistant for complex reasoning and creative tasks",
      websiteUrl: "https://claude.ai"
    },
    {
      title: "Perplexity AI",
      description: "AI-powered search engine that provides accurate, real-time answers with sources",
      websiteUrl: "https://perplexity.ai"
    },
    {
      title: "Runway ML",
      description: "AI-powered creative tools for video generation, image editing, and more",
      websiteUrl: "https://runwayml.com"
    },
    {
      title: "Midjourney",
      description: "AI image generation tool that creates stunning artwork from text prompts",
      websiteUrl: "https://midjourney.com"
    }
  ]

  const devTools = [
    {
      title: "Supabase",
      description: "Open source Firebase alternative with PostgreSQL database and real-time features",
      websiteUrl: "https://supabase.com"
    },
    {
      title: "Railway",
      description: "Modern deployment platform for developers to build and ship applications easily",
      websiteUrl: "https://railway.app"
    },
    {
      title: "PlanetScale",
      description: "Serverless MySQL database platform with branching and scaling capabilities",
      websiteUrl: "https://planetscale.com"
    },
    {
      title: "Neon",
      description: "Serverless PostgreSQL with branching, autoscaling, and modern developer experience",
      websiteUrl: "https://neon.tech"
    }
  ]

  const designTools = [
    {
      title: "Framer",
      description: "Advanced design and prototyping tool with powerful animation capabilities",
      websiteUrl: "https://framer.com"
    },
    {
      title: "Webflow",
      description: "Visual web development platform that generates clean, semantic code",
      websiteUrl: "https://webflow.com"
    },
    {
      title: "Spline",
      description: "3D design tool for creating interactive web experiences and animations",
      websiteUrl: "https://spline.design"
    }
  ]

  const productivityTools = [
    {
      title: "Arc Browser",
      description: "Modern web browser with innovative tab management and productivity features",
      websiteUrl: "https://arc.net"
    },
    {
      title: "Raycast",
      description: "Extensible launcher and productivity tool for macOS power users",
      websiteUrl: "https://raycast.com"
    },
    {
      title: "Codeshot",
      description: "Beautiful code screenshot generator with customizable themes and styles",
      websiteUrl: "https://codeshot.app"
    }
  ]

  // Randomly select from different categories to ensure variety
  const allCategories = [aiTools, devTools, designTools, productivityTools]
  const selectedProducts: ProductItem[] = []
  
  // Select 2 random products from each category
  allCategories.forEach(category => {
    const shuffled = category.sort(() => 0.5 - Math.random())
    selectedProducts.push(...shuffled.slice(0, 2))
  })

  // Shuffle the final selection
  return selectedProducts.sort(() => 0.5 - Math.random()).slice(0, 6)
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return 'unknown'
  }
}

async function processWithGroq(product: ProductItem, apiKey: string): Promise<WebappSuggestion | null> {
  try {
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

    console.log('🔑 Making request to Groq API...')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
      console.error('❌ Groq API error:', response.status, response.statusText, errorText)
      return null
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error('❌ No content from Groq API')
      return null
    }

    console.log(`🤖 Groq response: ${content}`)

    // Extract JSON from response
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

    // Validate category
    const validCategories = ['productividad', 'creatividad', 'educacion', 'entretenimiento', 'herramientas dev', 'negocio', 'otras']
    if (!validCategories.includes(suggestion.categoria)) {
      suggestion.categoria = 'otras'
    }

    // Ensure etiquetas is an array
    if (!Array.isArray(suggestion.etiquetas)) {
      suggestion.etiquetas = []
    }

    // Ensure usa_ia is boolean
    if (typeof suggestion.usa_ia !== 'boolean') {
      suggestion.usa_ia = false
    }

    // Ensure correct URL
    suggestion.url = product.websiteUrl

    return suggestion

  } catch (error) {
    console.error('💥 Error processing with Groq:', error)
    return null
  }
}
