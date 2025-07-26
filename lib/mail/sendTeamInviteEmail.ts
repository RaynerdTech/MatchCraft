import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTeamInviteEmail = async ({
  to,
  inviterName,
  teamName,
  eventTitle,
}: {
  to: string;
  inviterName: string;
  teamName: string;
  eventTitle: string;
}) => {
  await resend.emails.send({
    from: "SoccerHub <noreply@raynerd.com.ng>",
    to,
    subject: `⚽ You've been invited to Team ${teamName} for ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          body { margin: 0; padding: 0; font-family: 'Poppins', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 30px 0; text-align: center; }
          .header img { height: 60px; }
          .content { padding: 30px; background: #ffffff; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 0; }
          .divider { height: 1px; background: linear-gradient(to right, transparent, #e5e7eb, transparent); margin: 25px 0; }
          .highlight-box { background: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚽ SoccerHub Team Invitation</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #111827; margin-top: 0;">Hello Future Teammate!</h2>
            <p><strong style="color: #4f46e5;">${inviterName}</strong> has invited you to join their team for an upcoming match!</p>
            
            <div class="highlight-box">
              <h3 style="margin-top: 0;">Team: <span style="color: #4f46e5;">${teamName}</span></h3>
              <h3 style="margin-bottom: 0;">Event: <span style="color: #4f46e5;">${eventTitle}</span></h3>
            </div>
            
            <p>This is your official invitation to join the squad. Here's what you need to do next:</p>
            
            <ol>
              <li>Log in to your SoccerHub account</li>
              <li>Accept the team invitation</li>
              <li>Complete your payment to secure your spot</li>
            </ol>
            
            <div style="text-align: center;">
              <a href="https://match-craft-six.vercel.app/dashboard/teams/invites" class="button">Accept Invitation</a>
            </div>
            
            <div class="divider"></div>
            <p style="text-align: center; font-size: 15px;">
              <em>"Great things in soccer are never done by one player. They're done by a team of players."</em>
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SoccerHub. All rights reserved.</p>
            <p>If you didn't request this invitation, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};
