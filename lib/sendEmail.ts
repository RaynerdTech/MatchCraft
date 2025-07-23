import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailProps = {
  to: string;
  subject: string;
  html: string;
};

export default async function sendEmail({ to, subject, html }: SendEmailProps) {
  try {
    const response = await resend.emails.send({
      from: "SoccerHub <noreply@raynerd.com.ng>", 
      to,
      subject,
      html: `${html}
        <br /><br />
        <p style="font-size: 0.9rem; color: #666;">
          Didn’t request this? No worries, just ignore it.
        </p>`,
    });

    console.log("Email sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
