import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendLovableEmail } from 'npm:@lovable.dev/email-js'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const SITE_NAME = 'Mystical Digits'
const SENDER_DOMAIN = 'notify.mysticaldigits.com'
const FROM_DOMAIN = 'notify.mysticaldigits.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: any
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const templateName: string = body.templateName || body.template_name
  const recipientEmail: string = body.recipientEmail || body.recipient_email
  const templateData: Record<string, any> = (body.templateData && typeof body.templateData === 'object') ? body.templateData : {}
  const idempotencyKey: string = body.idempotencyKey || body.idempotency_key || crypto.randomUUID()

  const template = TEMPLATES[templateName]
  if (!template) {
    return new Response(JSON.stringify({ error: `Template '${templateName}' not found` }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const to = template.to || recipientEmail
  if (!to) {
    return new Response(JSON.stringify({ error: 'recipientEmail is required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const normalizedEmail = to.trim().toLowerCase()
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: suppression, error: suppressionError } = await supabase
    .from('suppressed_emails')
    .select('reason')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (suppressionError) {
    console.error('Failed to check email suppression', { error: suppressionError, templateName })
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (suppression) {
    return new Response(JSON.stringify({ error: 'Email is unsubscribed' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: existingToken, error: tokenLookupError } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (tokenLookupError) {
    console.error('Failed to look up unsubscribe token', { error: tokenLookupError, templateName })
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let unsubscribeToken = existingToken?.token
  if (!unsubscribeToken) {
    const newToken = crypto.randomUUID()
    const { data: insertedToken, error: insertTokenError } = await supabase
      .from('email_unsubscribe_tokens')
      .insert({ email: normalizedEmail, token: newToken })
      .select('token')
      .single()

    if (insertTokenError) {
      console.error('Failed to create unsubscribe token', { error: insertTokenError, templateName })
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    unsubscribeToken = insertedToken.token
  }

  const html = await renderAsync(React.createElement(template.component, templateData))
  const text = await renderAsync(React.createElement(template.component, templateData), { plainText: true })
  const subject = typeof template.subject === 'function' ? template.subject(templateData) : template.subject

  try {
    await sendLovableEmail(
      {
        to: normalizedEmail,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        unsubscribe_token: unsubscribeToken,
        idempotency_key: `${idempotencyKey}-${templateName}`,
      },
      { apiKey, apiBaseUrl: 'https://api.lovable.dev' },
    )
  } catch (error) {
    console.error('Failed to send transactional email', { error, templateName, to: normalizedEmail })
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  await supabase.from('email_send_log').insert({
    template_name: templateName,
    recipient_email: normalizedEmail,
    status: 'sent',
    metadata: { idempotencyKey },
  })

  console.log('Transactional email sent', { templateName, to: normalizedEmail })
  return new Response(JSON.stringify({ success: true, sent: true }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
