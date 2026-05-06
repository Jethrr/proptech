import { Lead, Opportunity, LeadStatus } from "@/data/leads";
import { Property } from "@/data/properties";

// Generate mock leads from CSV data
export const generateLeadsFromCSV = (csvData: string[][]): Lead[] => {
  // Assume first row is headers
  const headers = csvData[0]?.map(h => h.toLowerCase().trim()) || [];
  
  // Find column indices
  const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("full name"));
  const emailIdx = headers.findIndex(h => h.includes("email"));
  const phoneIdx = headers.findIndex(h => h.includes("phone") || h.includes("contact") || h.includes("mobile"));
  const dateIdx = headers.findIndex(h => h.includes("date") || h.includes("last contact") || h.includes("interaction"));
  const sourceIdx = headers.findIndex(h => h.includes("source") || h.includes("origin"));
  const notesIdx = headers.findIndex(h => h.includes("note") || h.includes("comment") || h.includes("remark"));

  const leads: Lead[] = [];
  
  // Process data rows
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    if (!row || row.length === 0) continue;

    const name = nameIdx >= 0 ? row[nameIdx]?.trim() : `Lead ${i}`;
    const email = emailIdx >= 0 ? row[emailIdx]?.trim() : `lead${i}@email.com`;
    const contact = phoneIdx >= 0 ? row[phoneIdx]?.trim() : `+63 9XX XXX XXXX`;
    const lastInteraction = dateIdx >= 0 ? row[dateIdx]?.trim() : new Date().toISOString();
    const source = sourceIdx >= 0 ? row[sourceIdx]?.trim() : "CSV Import";
    const notes = notesIdx >= 0 ? row[notesIdx]?.trim() : undefined;

    // Calculate sentiment score based on how recent the interaction is
    const daysSinceInteraction = Math.floor(
      (Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
    );
    let sentimentScore = 100 - Math.min(daysSinceInteraction * 2, 70);
    sentimentScore = Math.max(sentimentScore, 20);

    // Determine status based on sentiment and recency
    let status: LeadStatus = "Cold";
    if (sentimentScore >= 75) status = "Hot";
    else if (sentimentScore >= 55) status = "Warm";

    leads.push({
      id: `csv-lead-${i}`,
      name,
      email,
      contact,
      source,
      status,
      sentimentScore: Math.round(sentimentScore),
      lastInteraction,
      notes
    });
  }

  return leads;
};

// Generate mock AI message
export const generateAIMessage = (
  lead: Lead,
  messageType: "SMS" | "Email"
): string => {
  const daysSince = Math.floor(
    (Date.now() - new Date(lead.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
  );
  const monthsSince = Math.floor(daysSince / 30);
  
  const firstName = lead.name.split(" ")[0];
  
  if (messageType === "SMS") {
    return `Hi ${firstName}! It's been a while since we last connected. I have some exciting property opportunities that might interest you. Would you like to schedule a quick call this week?`;
  } else {
    return `Subject: Reconnecting - New Property Opportunities for You

Hi ${firstName},

I hope this message finds you well. It's been ${monthsSince > 0 ? `${monthsSince} month${monthsSince > 1 ? 's' : ''}` : 'a few weeks'} since we last spoke, and I wanted to reach out with some exciting property opportunities that might align with your interests.

Based on our previous conversation${lead.notes ? ` about ${lead.notes.toLowerCase()}` : ''}, I believe these properties could be a great fit for you.

Would you be available for a quick call this week to discuss? I'm happy to work around your schedule.

Looking forward to reconnecting!

Best regards,
[Your Name]
Real Estate Agent`;
  }
};

// Generate mock Facebook opportunities
export const generateMockOpportunities = (count: number = 10): Opportunity[] => {
  const templates = [
    {
      content: "Looking for a {type} in {location}. Budget is around {budget}. Any recommendations?",
      intent: "High" as const,
      keywords: ["looking for", "budget"]
    },
    {
      content: "Anyone know good real estate agents in {location}? Planning to buy a {type} soon.",
      intent: "High" as const,
      keywords: ["real estate agents", "buy", "planning"]
    },
    {
      content: "Just visited a property in {location}. The prices are {sentiment}! Still thinking about it though.",
      intent: "Medium" as const,
      keywords: ["visited", "property", "thinking"]
    },
    {
      content: "Need advice: Should I invest in a pre-selling {type} or wait for RFO?",
      intent: "Medium" as const,
      keywords: ["invest", "pre-selling", "advice"]
    },
    {
      content: "Dreaming of owning a {type} in {location} one day. Maybe in 5 years!",
      intent: "Low" as const,
      keywords: ["dreaming", "one day", "maybe"]
    }
  ];

  const locations = ["Makati", "BGC", "Cebu", "Davao", "Iloilo", "Bacolod"];
  const types = ["condo", "house", "townhouse", "villa"];
  const budgets = ["5M", "8M", "10M", "12M", "15M"];
  const sentiments = ["crazy", "reasonable", "affordable", "expensive"];

  const opportunities: Opportunity[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const budget = budgets[Math.floor(Math.random() * budgets.length)];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    let content = template.content
      .replace("{location}", location)
      .replace("{type}", type)
      .replace("{budget}", budget)
      .replace("{sentiment}", sentiment);

    // Add some variation
    if (Math.random() > 0.7) {
      content = content.replace("?", "!");
    }

    const daysAgo = Math.floor(Math.random() * 7);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);

    opportunities.push({
      id: `mock-opp-${i + 1}`,
      postContent: content,
      platform: "Facebook",
      intentLevel: template.intent,
      timestamp: timestamp.toISOString(),
      author: `User ${i + 1}`,
      authorProfile: `https://facebook.com/user${i + 1}`,
      keywords: template.keywords
    });
  }

  return opportunities;
};

// Save to localStorage (mock persistence)
export const saveLeadsToStorage = (leads: Lead[]): void => {
  try {
    localStorage.setItem("revenue_recovery_leads", JSON.stringify(leads));
  } catch (error) {
    console.error("Failed to save leads to storage:", error);
  }
};

export const loadLeadsFromStorage = (): Lead[] => {
  try {
    const stored = localStorage.getItem("revenue_recovery_leads");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load leads from storage:", error);
  }
  return [];
};

export const saveOpportunitiesToStorage = (opportunities: Opportunity[]): void => {
  try {
    localStorage.setItem("revenue_recovery_opportunities", JSON.stringify(opportunities));
  } catch (error) {
    console.error("Failed to save opportunities to storage:", error);
  }
};

export const loadOpportunitiesFromStorage = (): Opportunity[] => {
  try {
    const stored = localStorage.getItem("revenue_recovery_opportunities");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load opportunities from storage:", error);
  }
  return [];
};

// Property storage functions
export const savePropertiesToStorage = (properties: Property[]): void => {
  try {
    localStorage.setItem("properties", JSON.stringify(properties));
  } catch (error) {
    console.error("Failed to save properties to storage:", error);
  }
};

export const loadPropertiesFromStorage = (): Property[] | null => {
  try {
    const stored = localStorage.getItem("properties");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load properties from storage:", error);
  }
  return null;
};

