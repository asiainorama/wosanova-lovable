import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Categorías principales que usa el catálogo
const MAIN_CATEGORIES = [
  'Comercio electrónico',
  'Comunicación', 
  'Creatividad',
  'Educación',
  'Entretenimiento',
  'Finanzas',
  'Noticias e información',
  'Productividad',
  'Redes sociales',
  'Utilidades'
];

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
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin access
    if (!user.email?.endsWith('@wosanova.com') && user.email !== 'asiainorama@gmail.com') {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role for admin operations
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
        const suggestion = await processWithGroq(product, groqApiKey, MAIN_CATEGORIES)
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
          mainCategories: MAIN_CATEGORIES.length,
          groqApiKey: groqApiKey ? 'Configured' : 'Not configured'
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
  // Crear pools de diferentes tipos de productos con más variedad
  const currentTime = Date.now()
  const pools = [
    // Pool 1: AI y herramientas modernas
    [
      { title: "v0.dev", description: "AI-powered interface design tool by Vercel", websiteUrl: "https://v0.dev" },
      { title: "Cursor", description: "AI-powered code editor", websiteUrl: "https://cursor.sh" },
      { title: "Windsurf", description: "AI-powered development environment", websiteUrl: "https://codeium.com/windsurf" },
      { title: "Bolt.new", description: "AI-powered web development platform", websiteUrl: "https://bolt.new" },
      { title: "Replit Agent", description: "AI coding assistant for collaborative programming", websiteUrl: "https://replit.com/agent" },
      { title: "Claude Computer Use", description: "AI assistant that can interact with computer interfaces", websiteUrl: "https://claude.ai" },
    ],
    
    // Pool 2: Herramientas de desarrollo
    [
      { title: "Vercel", description: "Frontend cloud platform for static sites and serverless functions", websiteUrl: "https://vercel.com" },
      { title: "Netlify", description: "Platform for automating modern web projects", websiteUrl: "https://netlify.com" },
      { title: "Render", description: "Cloud platform for building and running apps", websiteUrl: "https://render.com" },
      { title: "Fly.io", description: "Platform for running applications globally", websiteUrl: "https://fly.io" },
      { title: "Upstash", description: "Serverless data platform", websiteUrl: "https://upstash.com" },
      { title: "Convex", description: "Backend application platform with real-time sync", websiteUrl: "https://convex.dev" },
    ],
    
    // Pool 3: Herramientas de diseño
    [
      { title: "Linear", description: "Issue tracking and project management for modern teams", websiteUrl: "https://linear.app" },
      { title: "Notion", description: "All-in-one workspace for notes, tasks, wikis, and databases", websiteUrl: "https://notion.so" },
      { title: "Obsidian", description: "Knowledge management app for networked thought", websiteUrl: "https://obsidian.md" },
      { title: "Tldraw", description: "Collaborative digital whiteboard", websiteUrl: "https://tldraw.com" },
      { title: "Excalidraw", description: "Virtual collaborative whiteboard for sketching hand-drawn diagrams", websiteUrl: "https://excalidraw.com" },
      { title: "Rive", description: "Real-time interactive design and animation tool", websiteUrl: "https://rive.app" },
    ],
    
    // Pool 4: Productividad y comunicación
    [
      { title: "Discord", description: "Voice, video and text communication platform", websiteUrl: "https://discord.com" },
      { title: "Slack", description: "Business communication platform", websiteUrl: "https://slack.com" },
      { title: "Telegram", description: "Cloud-based instant messaging service", websiteUrl: "https://telegram.org" },
      { title: "Zoom", description: "Video conferencing and communication platform", websiteUrl: "https://zoom.us" },
      { title: "Loom", description: "Screen recording and video messaging tool", websiteUrl: "https://loom.com" },
      { title: "Cal.com", description: "Open source scheduling platform", websiteUrl: "https://cal.com" },
    ]
  ]

  // Seleccionar productos de forma más dinámica basada en el tiempo
  const selectedProducts: ProductItem[] = []
  const timeBasedSeed = Math.floor(currentTime / (1000 * 60 * 30)) // Cambia cada 30 minutos
  
  pools.forEach((pool, poolIndex) => {
    // Mezclar cada pool usando el seed temporal
    const shuffled = pool.sort(() => {
      const seed = (timeBasedSeed + poolIndex) % 1000
      return (seed % 2) - 0.5
    })
    // Tomar 1-2 elementos de cada pool
    const count = 1 + (timeBasedSeed + poolIndex) % 2
    selectedProducts.push(...shuffled.slice(0, count))
  })

  // Mezclar la selección final
  return selectedProducts.sort(() => {
    const seed = timeBasedSeed % 1000
    return (seed % 2) - 0.5
  }).slice(0, 8) // Aumentar a 8 productos para más variedad
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return 'unknown'
  }
}

async function processWithGroq(product: ProductItem, apiKey: string, validCategories: string[]): Promise<WebappSuggestion | null> {
  try {
    console.log(`🤖 Processing with Groq: "${product.title}"`)

    const categoriesStr = validCategories.join(', ')
    
    const prompt = `Analiza esta aplicación web y devuelve SOLO un JSON válido con la información solicitada.

INFORMACIÓN DE LA APP:
- Título: ${product.title}
- Descripción: ${product.description}
- URL del sitio web: ${product.websiteUrl}

CATEGORÍAS VÁLIDAS: ${categoriesStr}

RESPONDE SOLO CON ESTE JSON (sin texto adicional ni explicaciones):
{
  "nombre": "nombre comercial EXACTO de la aplicación (NO descripción, máximo 25 caracteres)",
  "url": "${product.websiteUrl}",
  "descripcion": "descripción clara y útil en español que explique qué hace la app (máximo 150 caracteres)",
  "usa_ia": true o false (determina si la aplicación usa inteligencia artificial como característica principal),
  "categoria": "una de las categorías válidas proporcionadas arriba que mejor describa la app",
  "etiquetas": ["máximo 3 etiquetas relevantes en español"]
}

REGLAS IMPORTANTES:
- El nombre debe ser EXACTAMENTE el nombre comercial de la aplicación tal como aparece en su web
- Ejemplo correcto: "Figma" NO "Herramienta de diseño colaborativo"
- Ejemplo correcto: "Notion" NO "App de productividad"
- La descripción debe explicar qué hace la aplicación de forma clara
- Solo marca usa_ia como true si la IA es una característica central y prominente
- Elige la categoría que mejor describa la función principal de la app
- Máximo 3 etiquetas relevantes y descriptivas`

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
        temperature: 0.1,
        max_tokens: 300
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

    // Validate category against valid categories
    if (!validCategories.includes(suggestion.categoria)) {
      console.log(`⚠️ Invalid category "${suggestion.categoria}", using default`)
      suggestion.categoria = validCategories[0] || 'Utilidades'
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
