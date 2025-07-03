
// Supabase Edge Function for testing IMAP email connections
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// IMAP client for Deno
import { ImapClient } from "https://deno.land/x/imap@v0.0.8/mod.ts"

interface EmailCredentials {
  email: string
  password: string
  imapHost: string
  imapPort: number
  imapSecurity: string
}

serve(async (req) => {
  // Handle CORS for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const credentials: EmailCredentials = await req.json()

    // Validate input
    if (!credentials.email || !credentials.password || !credentials.imapHost || !credentials.imapPort) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required credentials' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Testing IMAP connection for: ${credentials.email}`)

    // Create IMAP connection
    const imap = new ImapClient({
      hostname: credentials.imapHost,
      port: credentials.imapPort,
      username: credentials.email,
      password: credentials.password,
      secure: credentials.imapSecurity === 'ssl',
    })

    try {
      // Test connection with timeout
      const connectionPromise = imap.connect()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
      )

      await Promise.race([connectionPromise, timeoutPromise])
      console.log('IMAP connection successful')

      // Test opening INBOX
      await imap.selectMailbox('INBOX')
      console.log('INBOX opened successfully')

      // Close connection
      await imap.disconnect()

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email connection successful' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (imapError) {
      console.error('IMAP connection error:', imapError)
      
      let errorMessage = 'Failed to connect to email server'
      
      if (imapError.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (imapError.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your IMAP settings.'
      } else if (imapError.message.includes('ENOTFOUND')) {
        errorMessage = 'IMAP host not found. Please check the server address.'
      } else if (imapError.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Please check the port and security settings.'
      }

      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
