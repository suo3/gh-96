import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name: string;
  subject: string;
  message: string;
  inquiryId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, subject, message, inquiryId }: EmailRequest = await req.json();

    // Validate and choose a safe From address. Fall back to a Resend test domain if invalid/missing
    const rawFrom = (Deno.env.get("RESEND_FROM_ADDRESS") || "").trim();
    const defaultFrom = "KenteKart <onboarding@resend.dev>";
    const simpleEmail = /^[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$/;
    const nameAddress = /^.+\s<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/;
    const fromAddress = rawFrom && (simpleEmail.test(rawFrom) || nameAddress.test(rawFrom))
      ? rawFrom
      : defaultFrom;

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: `Re: ${subject}`,
      html: `
        <h2>Response to your inquiry</h2>
        <p>Hello ${name},</p>
        <p>We have responded to your inquiry. Here's our response:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p>You can also view this response and continue the conversation in your account messages page.</p>
        <p>Best regards,<br>KenteKart Support Team</p>
      `,
    });

    // If Resend returned an error object, treat it as a failure
    if ((emailResponse as any)?.error) {
      console.error("Resend error while sending inquiry response:", (emailResponse as any).error);
      return new Response(
        JSON.stringify({ error: (emailResponse as any).error }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Inquiry response email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending inquiry response email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);