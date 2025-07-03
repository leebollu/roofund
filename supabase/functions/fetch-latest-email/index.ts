// Supabase Edge Function for fetching latest email from IMAP
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

interface EmailMessage {
  uid: number
  subject: string
  from: string
  date: Date
  snippet: string
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

    console.log(`Fetching latest email for: ${credentials.email}`)

    // Create IMAP connection
    const imap = new ImapClient({
      hostname: credentials.imapHost,
      port: credentials.imapPort,
      username: credentials.email,
      password: credentials.password,
      secure: credentials.imapSecurity === 'ssl',
    })

    try {
      // Connect with timeout
      const connectionPromise = imap.connect()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 60 seconds')), 60000)
      )

      await Promise.race([connectionPromise, timeoutPromise])
      console.log('IMAP connection successful')

      // Open INBOX
      const mailbox = await imap.selectMailbox('INBOX')
      console.log(`INBOX opened, ${mailbox.exists} messages`)

      if (mailbox.exists === 0) {
        await imap.disconnect()
        return new Response(
          JSON.stringify({ 
            success: true, 
            email: null,
            message: 'No emails found in inbox'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Search for all messages and get the latest one
      const messages = await imap.search(['ALL'])
      console.log(`Found ${messages.length} messages`)

      if (messages.length === 0) {
        await imap.disconnect()
        return new Response(
          JSON.stringify({ 
            success: true, 
            email: null,
            message: 'No emails found'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Get the latest message (highest sequence number)
      const latestSeqNo = Math.max(...messages)
      console.log(`Fetching message ${latestSeqNo}`)

      // Fetch message details
      const messageData = await imap.fetch([latestSeqNo], {
        envelope: true,
        bodyStructure: true,
        uid: true
      })

      let latestEmail: EmailMessage | null = null

      if (messageData.length > 0) {
        const msg = messageData[0]
        const envelope = msg.envelope

        latestEmail = {
          uid: msg.uid || latestSeqNo,
          subject: envelope?.subject || 'No Subject',
          from: envelope?.from?.[0]?.mailbox && envelope?.from?.[0]?.host 
            ? `${envelope.from[0].mailbox}@${envelope.from[0].host}`
            : 'Unknown Sender',
          date: envelope?.date ? new Date(envelope.date) : new Date(),
          snippet: `Latest email from ${envelope?.from?.[0]?.mailbox || 'unknown'}`
        }

        console.log('Email fetched successfully:', latestEmail.subject)
      }

      await imap.disconnect()

      return new Response(
        JSON.stringify({ 
          success: true, 
          email: latestEmail
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (imapError) {
      console.error('IMAP fetch error:', imapError)
      
      let errorMessage = 'Failed to fetch emails'
      
      if (imapError.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (imapError.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your IMAP settings.'
      } else if (imapError.message.includes('ENOTFOUND')) {
        errorMessage = 'IMAP host not found. Please check the server address.'
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