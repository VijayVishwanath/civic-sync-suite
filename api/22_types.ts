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
}

export interface PrioritizeResponse {
  ticket_id: string;
  priority_score: number;
  priority: "high" | "medium" | "low";
  will_escalate: boolean;
  recommended_action: string;
  features: string[];
  explanation: Array<{feature: string; contribution: number}>;
}

export interface ChatResponse {
  message: string;
  sources: string[];
  language: string;
}
