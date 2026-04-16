import { Resend } from "resend";
import { env } from "./env";

let client: Resend | null = null;

function resend(): Resend {
  if (!client) client = new Resend(env.email().RESEND_API_KEY);
  return client;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput) {
  const { FROM_EMAIL, FROM_NAME } = env.email();
  const from = `${FROM_NAME} <${FROM_EMAIL}>`;
  const { data, error } = await resend().emails.send({
    from,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    react: input.react,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message ?? String(error)}`);
  }
  return data;
}
