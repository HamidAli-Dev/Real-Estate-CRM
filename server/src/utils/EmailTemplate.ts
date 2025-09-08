export const getInvitationEmailTemplate = (
  inviteeName: string,
  inviterName: string,
  workspaceName: string,
  role: string,
  invitationLink: string
) => {
  return {
    subject: `You've been invited to join ${workspaceName} on Estate Elite CRM`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workspace Invitation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .invitation-details {
            background-color: #f3f4f6;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .detail-label {
            font-weight: 600;
            color: #374151;
          }
          .detail-value {
            color: #6b7280;
          }
          .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
          }
          .cta-button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Estate Elite CRM</div>
            <h1 class="title">You're Invited!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${inviteeName},</p>
            
            <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on Estate Elite CRM as a <strong>${role}</strong>.</p>
            
            <div class="invitation-details">
              <div class="detail-row">
                <span class="detail-label">Workspace:</span>
                <span class="detail-value">${workspaceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Role:</span>
                <span class="detail-value">${role}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invited by:</span>
                <span class="detail-value">${inviterName}</span>
              </div>
            </div>
            
            <p>Click the button below to accept the invitation and set up your account:</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="cta-button">Accept Invitation</a>
            </div>
            
            <div class="warning">
              <strong>⏰ Important:</strong> This invitation link will expire in 30 minutes for security reasons. If you don't accept it in time, you'll need to request a new invitation.
            </div>
            
            <p>If you have any questions or didn't expect this invitation, please contact ${inviterName} or your workspace administrator.</p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent by Estate Elite CRM</p>
            <p>If you can't click the button above, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${invitationLink}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      You've been invited to join ${workspaceName} on Estate Elite CRM
      
      Hi ${inviteeName},
      
      ${inviterName} has invited you to join ${workspaceName} on Estate Elite CRM as a ${role}.
      
      Workspace: ${workspaceName}
      Role: ${role}
      Invited by: ${inviterName}
      
      To accept this invitation, click the link below:
      ${invitationLink}
      
      ⏰ Important: This invitation link will expire in 30 minutes for security reasons.
      
      If you have any questions or didn't expect this invitation, please contact ${inviterName} or your workspace administrator.
      
      This invitation was sent by Estate Elite CRM
    `,
  };
};
