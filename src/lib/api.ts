// Mock API client - Toggle USE_MOCK for real backend
const USE_MOCK = true;

export interface DashboardMetrics {
  predictedEscalations: number;
  avgTriageTime: number;
  autoTriagedPct: number;
  totalCases: number;
  pendingCases: number;
  resolvedToday: number;
}

export interface Case {
  id: string;
  location: string;
  category: string;
  score: number;
  priority: "high" | "medium" | "low";
  features: string[];
  recommendedAction: string;
  description: string;
  submittedAt: string;
  status: "pending" | "assigned" | "resolved";
  affectedCitizens?: number;
  duplicateReports?: number;
}

export interface ChatResponse {
  message: string;
  sources: string[];
}

export interface AuditLog {
  id: string;
  caseId: string;
  action: string;
  user: string;
  timestamp: string;
  inputHash: string;
  modelScore: number;
  explanation: string;
}

// Mock data
const mockMetrics: DashboardMetrics = {
  predictedEscalations: 23,
  avgTriageTime: 4.2,
  autoTriagedPct: 78,
  totalCases: 1247,
  pendingCases: 89,
  resolvedToday: 34,
};

const mockCases: Case[] = [
  {
    id: "CASE-2024-0847",
    location: "Dharavi, Mumbai",
    category: "Sanitation",
    score: 0.92,
    priority: "high",
    features: ["High population density", "Previous escalations", "Media attention"],
    recommendedAction: "Immediate field inspection",
    description: "Severe drainage blockage affecting 200+ households. Third complaint in 2 weeks.",
    submittedAt: "2024-01-15T09:23:00Z",
    status: "pending",
  },
  {
    id: "CASE-2024-0848",
    location: "Bandra West, Mumbai",
    category: "Road Maintenance",
    score: 0.85,
    priority: "high",
    features: ["Main thoroughfare", "Safety risk", "Peak hours impact"],
    recommendedAction: "Schedule urgent repair",
    description: "Large pothole on Linking Road causing traffic congestion and accidents.",
    submittedAt: "2024-01-15T10:15:00Z",
    status: "pending",
  },
  {
    id: "CASE-2024-0849",
    location: "Andheri East, Mumbai",
    category: "Street Lighting",
    score: 0.68,
    priority: "medium",
    features: ["Residential area", "Safety concern", "Night visibility"],
    recommendedAction: "Add to weekly maintenance",
    description: "Multiple street lights not working on JP Road for past 5 days.",
    submittedAt: "2024-01-15T11:45:00Z",
    status: "pending",
  },
  {
    id: "CASE-2024-0850",
    location: "Colaba, Mumbai",
    category: "Waste Collection",
    score: 0.52,
    priority: "medium",
    features: ["Tourist area", "Regular route", "Missed collection"],
    recommendedAction: "Contact collection team",
    description: "Garbage not collected for 2 days near Gateway of India.",
    submittedAt: "2024-01-15T13:20:00Z",
    status: "pending",
  },
  {
    id: "CASE-2024-0851",
    location: "Powai, Mumbai",
    category: "Parks & Gardens",
    score: 0.34,
    priority: "low",
    features: ["Maintenance request", "Non-urgent", "Scheduled area"],
    recommendedAction: "Add to monthly schedule",
    description: "Request for additional benches in Powai Garden.",
    submittedAt: "2024-01-15T14:30:00Z",
    status: "pending",
  },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: "AUDIT-001",
    caseId: "CASE-2024-0847",
    action: "AI_PRIORITIZATION",
    user: "system",
    timestamp: "2024-01-15T09:23:15Z",
    inputHash: "a3f8d9e2...",
    modelScore: 0.92,
    explanation: "High priority due to population impact (0.45), escalation history (0.28), media risk (0.19)",
  },
  {
    id: "AUDIT-002",
    caseId: "CASE-2024-0848",
    action: "AI_PRIORITIZATION",
    user: "system",
    timestamp: "2024-01-15T10:15:08Z",
    inputHash: "b7e4c1a9...",
    modelScore: 0.85,
    explanation: "High priority due to safety risk (0.52), traffic impact (0.23), main road location (0.10)",
  },
];

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(mockMetrics), 300));
  }
  const response = await fetch("/api/metrics");
  return response.json();
}

export async function getPrioritizedCases(): Promise<Case[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(mockCases), 400));
  }
  const response = await fetch("/api/cases");
  return response.json();
}

export async function postScoreCase(caseId: string): Promise<Case> {
  if (USE_MOCK) {
    const caseItem = mockCases.find((c) => c.id === caseId);
    if (!caseItem) throw new Error("Case not found");
    return new Promise((resolve) => setTimeout(() => resolve(caseItem), 200));
  }
  const response = await fetch(`/api/case/${caseId}/score`, {
    method: "POST",
  });
  return response.json();
}

export async function assignCase(caseId: string, assignee: string): Promise<Case> {
  if (USE_MOCK) {
    const caseItem = mockCases.find((c) => c.id === caseId);
    if (!caseItem) throw new Error("Case not found");
    return new Promise((resolve) =>
      setTimeout(() => resolve({ ...caseItem, status: "assigned" as const }), 300)
    );
  }
  const response = await fetch(`/api/case/${caseId}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignee }),
  });
  return response.json();
}

export async function queryCitizenChat(
  prompt: string,
  language: string = "en"
): Promise<ChatResponse> {
  if (USE_MOCK) {
    const responses: Record<string, ChatResponse> = {
      default: {
        message: "I found information about your query. The average response time for sanitation complaints is 48 hours. You can track your complaint status using your case ID.",
        sources: ["Municipal Guidelines 2024", "Case Database Record #847"],
      },
      marathi: {
        message: "मला तुमच्या प्रश्नाबद्दल माहिती सापडली. स्वच्छता तक्रारींसाठी सरासरी प्रतिसाद वेळ 48 तास आहे.",
        sources: ["नगरपालिका मार्गदर्शक तत्त्वे 2024", "केस डेटाबेस रेकॉर्ड #847"],
      },
    };
    const response = language === "mr" ? responses.marathi : responses.default;
    return new Promise((resolve) => setTimeout(() => resolve(response), 500));
  }
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, language }),
  });
  return response.json();
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(mockAuditLogs), 300));
  }
  const response = await fetch("/api/audit");
  return response.json();
}
