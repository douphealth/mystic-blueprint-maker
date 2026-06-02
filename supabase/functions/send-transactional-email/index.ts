import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
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
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
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

  const html = await renderAsync(React.createElement(template.component, templateData))
  const text = await renderAsync(React.createElement(template.component, templateData), { plainText: true })
  const subject = typeof template.subject === 'function' ? template.subject(templateData) : template.subject

  try {
    await sendLovableEmail(
      {
        run_id: crypto.randomUUID(),
        to,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        idempotency_key: `${idempotencyKey}-${templateName}`,
      },
      { apiKey, apiBaseUrl: 'https://api.lovable.dev' },
    )
  } catch (error) {
    console.error('Failed to send transactional email', { error, templateName, to })
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('Transactional email sent', { templateName, to })
  return new Response(JSON.stringify({ success: true, sent: true }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
