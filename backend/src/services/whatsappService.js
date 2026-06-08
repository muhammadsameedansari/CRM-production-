export const sendWhatsAppMessage = async (to, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    console.log('WhatsApp not configured. Would send to:', to, message);
    return { success: false, message: 'WhatsApp not configured' };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${from}`,
          To: `whatsapp:${to}`,
          Body: message,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return { success: true, sid: data.sid };
  } catch (error) {
    console.error('WhatsApp error:', error.message);
    return { success: false, message: error.message };
  }
};

export const sendLeadWhatsApp = async (lead, template) => {
  if (!lead.phone) return { success: false, message: 'No phone number' };

  const templates = {
    intro: `Hi ${lead.contactPerson}! This is from AI Automation Agency. We'd love to discuss how we can help ${lead.companyName}.`,
    followUp: `Hi ${lead.contactPerson}, following up on our conversation about AI automation for ${lead.companyName}.`,
    meeting: `Hi ${lead.contactPerson}, reminder about our upcoming meeting regarding ${lead.companyName}.`,
  };

  const message = templates[template] || templates.followUp;
  return sendWhatsAppMessage(lead.phone, message);
};
