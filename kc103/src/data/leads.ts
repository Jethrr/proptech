export type LeadStatus = "Cold" | "Warm" | "Hot" | "Reactivated";
export type IntentLevel = "High" | "Medium" | "Low";

export interface Lead {
  id: string;
  name: string;
  contact: string;
  email: string;
  source: string;
  status: LeadStatus;
  sentimentScore: number; // 0-100
  lastInteraction: string; // ISO date string
  notes?: string;
}

export interface Opportunity {
  id: string;
  postContent: string;
  platform: "Facebook" | "Instagram" | "Twitter";
  intentLevel: IntentLevel;
  linkedLeadId?: string;
  timestamp: string; // ISO date string
  author: string;
  authorProfile?: string;
  keywords?: string[];
}

// Mock data for leads
export const mockLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Maria Santos",
    contact: "+63 917 123 4567",
    email: "maria.santos@email.com",
    source: "Website Inquiry",
    status: "Cold",
    sentimentScore: 45,
    lastInteraction: "2023-08-15T10:00:00Z",
    notes: "Interested in 2BR condo in Makati"
  },
  {
    id: "lead-2",
    name: "Juan Dela Cruz",
    contact: "+63 918 234 5678",
    email: "juan.dc@email.com",
    source: "Facebook Ad",
    status: "Warm",
    sentimentScore: 72,
    lastInteraction: "2024-01-20T14:30:00Z",
    notes: "Looking for house & lot in Cebu"
  },
  {
    id: "lead-3",
    name: "Ana Garcia",
    contact: "+63 919 345 6789",
    email: "ana.garcia@email.com",
    source: "Referral",
    status: "Hot",
    sentimentScore: 88,
    lastInteraction: "2024-12-10T09:15:00Z",
    notes: "Ready to purchase, budget 5M"
  },
  {
    id: "lead-4",
    name: "Carlos Rodriguez",
    contact: "+63 920 456 7890",
    email: "carlos.r@email.com",
    source: "CSV Import",
    status: "Cold",
    sentimentScore: 35,
    lastInteraction: "2022-11-05T16:45:00Z",
    notes: "Old lead from previous campaign"
  },
  {
    id: "lead-5",
    name: "Lisa Tan",
    contact: "+63 921 567 8901",
    email: "lisa.tan@email.com",
    source: "Website Inquiry",
    status: "Warm",
    sentimentScore: 65,
    lastInteraction: "2024-11-28T11:20:00Z",
    notes: "Pre-selling condo interest"
  }
];

// Mock data for opportunities
export const mockOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    postContent: "Looking for a 3BR house in Davao. Budget is around 8M. Any recommendations? Moving there next year.",
    platform: "Facebook",
    intentLevel: "High",
    timestamp: "2024-12-15T08:30:00Z",
    author: "Michael Chen",
    authorProfile: "https://facebook.com/michael.chen",
    keywords: ["looking for", "budget", "moving"]
  },
  {
    id: "opp-2",
    postContent: "Anyone know good real estate agents in Cebu? Planning to buy a condo soon.",
    platform: "Facebook",
    intentLevel: "High",
    timestamp: "2024-12-14T15:45:00Z",
    author: "Sarah Lim",
    authorProfile: "https://facebook.com/sarah.lim",
    keywords: ["real estate agents", "buy", "planning"]
  },
  {
    id: "opp-3",
    postContent: "Just visited a property in BGC. The prices are crazy! Still thinking about it though.",
    platform: "Facebook",
    intentLevel: "Medium",
    timestamp: "2024-12-13T20:10:00Z",
    author: "Robert Kim",
    authorProfile: "https://facebook.com/robert.kim",
    keywords: ["visited", "property", "thinking"]
  },
  {
    id: "opp-4",
    postContent: "Need advice: Should I invest in a pre-selling condo or wait for RFO?",
    platform: "Facebook",
    intentLevel: "Medium",
    timestamp: "2024-12-12T12:00:00Z",
    author: "Jennifer Wong",
    authorProfile: "https://facebook.com/jennifer.wong",
    keywords: ["invest", "pre-selling", "advice"]
  },
  {
    id: "opp-5",
    postContent: "Dreaming of owning a house in Tagaytay one day. Maybe in 5 years!",
    platform: "Facebook",
    intentLevel: "Low",
    timestamp: "2024-12-11T09:25:00Z",
    author: "David Martinez",
    authorProfile: "https://facebook.com/david.martinez",
    keywords: ["dreaming", "one day", "maybe"]
  },
  {
    id: "opp-6",
    postContent: "URGENT: Need to find a 2BR condo in Makati ASAP. Budget 6M. Please help!",
    platform: "Facebook",
    intentLevel: "High",
    timestamp: "2024-12-16T07:00:00Z",
    author: "Patricia Cruz",
    authorProfile: "https://facebook.com/patricia.cruz",
    keywords: ["urgent", "need", "asap", "budget"]
  }
];

