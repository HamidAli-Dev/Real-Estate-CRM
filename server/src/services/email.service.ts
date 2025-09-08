import nodemailer from "nodemailer";

import { APP_CONFIG } from "../config/app.config";
import { BadRequestException } from "../utils/AppError";
import { getInvitationEmailTemplate } from "../utils/EmailTemplate";

// Email configuration
const createTransporter = () => {
  const emailConfig = {
    host: APP_CONFIG.SMTP_HOST,
    port: parseInt(APP_CONFIG.SMTP_PORT),
    secure: APP_CONFIG.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: APP_CONFIG.SMTP_USER,
      pass: APP_CONFIG.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(emailConfig);
};

// Email service functions
export const sendInvitationEmail = async (
  to: string,
  inviteeName: string,
  inviterName: string,
  workspaceName: string,
  role: string,
  invitationLink: string
) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = getInvitationEmailTemplate(
      inviteeName,
      inviterName,
      workspaceName,
      role,
      invitationLink
    );

    const mailOptions = {
      from: {
        name: "Estate Elite CRM",
        address: `${APP_CONFIG.SMTP_FROM}, ${APP_CONFIG.SMTP_USER}`,
      },
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send invitation email:", error);
    throw new BadRequestException("Failed to send invitation email");
  }
};
