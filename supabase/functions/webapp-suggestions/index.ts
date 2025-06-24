
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
  productHuntUrl?: string;
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

    // Usar productos de ejemplo que sabemos que funcionan
    const products = getExampleProducts()
    console.log(`📋 Using ${products.length} example products`)

    const suggestions: any[] = []

    // Procesar cada producto con Groq API
    console.log('🤖 Processing products with Groq API...')
    for (const [index, product] of products.entries()) {
      console.log(`🔄 Processing product ${index + 1}/${products.length}: "${product.title}"`)
      
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

    // Guardar en Supabase
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
        processed: products.length,
        saved: suggestions.length,
        debug: {
          productsUsed: products.length,
          suggestionsGenerated: suggestions.length,
          groqApiKey: Deno.env.get('GROQ_API_KEY') ? 'Present' : 'Missing'
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

function getExampleProducts(): ProductItem[] {
  return [
    {
      title: "Notion AI",
      description: "AI-powered workspace for writing, planning, and getting organized with intelligent automation",
      websiteUrl: "https://notion.so"
    },
    {
      title: "Figma",
      description: "Collaborative design tool with real-time editing and prototyping capabilities",
      websiteUrl: "https://figma.com"
    },
    {
      title: "Linear",
      description: "Streamlined project management tool designed for modern software teams",
      websiteUrl: "https://linear.app"
    },
    {
      title: "Vercel",
      description: "Frontend cloud platform for building and deploying modern web applications",
      websiteUrl: "https://vercel.com"
    },
    {
      title: "Supabase",
      description: "Open-source Firebase alternative with authentication, real-time database, and more",
      websiteUrl: "https://supabase.io"
    },
    {
      title: "ChatGPT",
      description: "Advanced AI chatbot for conversations, writing assistance, and problem-solving",
      websiteUrl: "https://chat.openai.com"
    },
    {
      title: "Claude",
      description: "AI assistant by Anthropic for helpful, harmless, and honest conversations",
      websiteUrl: "https://claude.ai"
    },
    {
      title: "GitHub Copilot",
      description: "AI programming assistant that helps write code faster and more efficiently",
      websiteUrl: "https://github.com/features/copilot"
    }
  ]
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
