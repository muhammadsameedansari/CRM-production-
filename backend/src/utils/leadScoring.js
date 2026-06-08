export const calculateLeadScore = (lead) => {
  let score = 50;

  if (lead.email) score += 5;
  if (lead.phone) score += 5;
  if (lead.website) score += 10;
  if (lead.industry) score += 5;

  const statusScores = {
    New: 0,
    Contacted: 5,
    Interested: 15,
    'Meeting Scheduled': 25,
    'Proposal Sent': 20,
    Negotiation: 15,
    Won: 0,
    Lost: -50,
  };
  score += statusScores[lead.status] || 0;

  const sourceScores = {
    Referral: 15,
    Website: 10,
    LinkedIn: 8,
    'Cold Outreach': 3,
    WhatsApp: 7,
    Email: 5,
    Other: 0,
  };
  score += sourceScores[lead.source] || 0;

  if (lead.estimatedValue > 10000) score += 15;
  else if (lead.estimatedValue > 5000) score += 10;
  else if (lead.estimatedValue > 1000) score += 5;

  return Math.min(100, Math.max(0, score));
};
