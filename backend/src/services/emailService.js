import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();
  if (!transport) {
    console.log('Email not configured. Would send to:', to, subject);
    return { success: false, message: 'Email not configured' };
  }

  try {
    const info = await transport.sendMail({
      from: `"AI Agency CRM" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error.message);
    return { success: false, message: error.message };
  }
};

export const sendLeadEmail = async (lead, template) => {
  const templates = {
    welcome: {
      subject: `Welcome ${lead.contactPerson}!`,
      html: `<p>Hi ${lead.contactPerson},</p><p>Thank you for your interest in our AI automation services.</p>`,
    },
    followUp: {
      subject: `Following up - ${lead.companyName}`,
      html: `<p>Hi ${lead.contactPerson},</p><p>Just following up on our previous conversation.</p>`,
    },
    proposal: {
      subject: `Proposal for ${lead.companyName}`,
      html: `<p>Hi ${lead.contactPerson},</p><p>Please find our proposal attached.</p>`,
    },
  };

  const t = templates[template] || templates.followUp;
  return sendEmail({ to: lead.email, ...t });
};
