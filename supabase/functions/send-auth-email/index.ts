import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'
import { RecoveryEmail } from './_templates/recovery-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') as string
const fromAddress = Deno.env.get('RESEND_FROM_ADDRESS') || 'KenteKart <onboarding@resend.dev>'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)
  
  try {
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    console.log('Processing auth email:', { email_action_type, email: user.email })

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

    let html: string
    let subject: string

    // Generate appropriate email based on type
    if (email_action_type === 'signup') {
      html = await renderAsync(
        React.createElement(ConfirmationEmail, {
          confirmation_url: confirmationUrl,
          token,
        })
      )
      subject = 'Welcome to KenteKart - Confirm your email'
    } else if (email_action_type === 'recovery') {
      html = await renderAsync(
        React.createElement(RecoveryEmail, {
          confirmation_url: confirmationUrl,
          token,
        })
      )
      subject = 'KenteKart - Reset your password'
    } else if (email_action_type === 'email_change') {
      html = await renderAsync(
        React.createElement(ConfirmationEmail, {
          confirmation_url: confirmationUrl,
          token,
        })
      )
      subject = 'KenteKart - Confirm your new email'
    } else {
      // Default fallback
      html = await renderAsync(
        React.createElement(ConfirmationEmail, {
          confirmation_url: confirmationUrl,
          token,
        })
      )
      subject = 'KenteKart - Email confirmation'
    }

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [user.email],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Auth email sent successfully to:', user.email)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in send-auth-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code,
          message: error.message,
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
