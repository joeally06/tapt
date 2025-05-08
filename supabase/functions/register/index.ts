import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { firstName, lastName, email, organization, dietary } = await req.json()

    // Create user if doesn't exist
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
        organization,
        dietary
      }
    })

    if (authError) throw authError

    // Get latest conference
    const { data: conference, error: confError } = await supabase
      .from('conferences')
      .select('*')
      .order('start_date', { ascending: true })
      .limit(1)
      .single()

    if (confError) throw confError

    // Create registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        user_id: user.id,
        conference_id: conference.id,
        amount: conference.price
      })
      .select()
      .single()

    if (regError) throw regError

    return new Response(
      JSON.stringify({ success: true, data: registration }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})