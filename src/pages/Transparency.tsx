import { useEffect, useState } from "react";
import { getAuditLogs, AuditLog } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Database, BarChart3, Shield, Clock } from "lucide-react";

interface ModelMetrics {
  auc: number;
  precision: number;
  recall: number;
  lastUpdated: string;
}

interface DataSource {
  name: string;
  records: number;
  lastUpdated: string;
  status: "active" | "syncing" | "error";
}

export default function Transparency() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const modelMetrics: ModelMetrics = {
    auc: 0.89,
    precision: 0.84,
    recall: 0.81,
    lastUpdated: "2024-01-15T08:00:00Z",
  };

  const dataSources: DataSource[] = [
    { name: "Citizen Complaints Database", records: 125847, lastUpdated: "2024-01-15T10:30:00Z", status: "active" },
    { name: "Historical Case Records", records: 45623, lastUpdated: "2024-01-15T10:15:00Z", status: "active" },
    { name: "Location Demographics", records: 8934, lastUpdated: "2024-01-14T23:00:00Z", status: "active" },
    { name: "Response Time Data", records: 98234, lastUpdated: "2024-01-15T10:45:00Z", status: "syncing" },
  ];

  useEffect(() => {
    getAuditLogs().then((data) => {
      setAuditLogs(data);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "syncing":
        return "warning";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transparency Panel</h1>
        <p className="text-muted-foreground">
          Model performance, data lineage, and complete audit trail
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AUC Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="kpi-number text-success">{modelMetrics.auc.toFixed(2)}</div>
            <p className="small-muted">Model accuracy</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precision</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="kpi-number">{modelMetrics.precision.toFixed(2)}</div>
            <p className="small-muted">@k=10</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recall</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="kpi-number">{modelMetrics.recall.toFixed(2)}</div>
            <p className="small-muted">High priority cases</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="small-muted">
              {new Date(modelMetrics.lastUpdated).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Lineage
          </CardTitle>
          <CardDescription>Source datasets powering the AI model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataSources.map((source, idx) => (
              <div key={idx} className="data-row flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{source.name}</span>
                    <Badge variant={getStatusColor(source.status)}>
                      {source.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {source.records.toLocaleString()} records • Last updated{" "}
                    {new Date(source.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>
            Complete trail of AI decisions and model predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <Collapsible
                key={log.id}
                open={expandedLog === log.id}
                onOpenChange={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div>
                          <div className="font-mono text-sm font-semibold">{log.caseId}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant="outline">{log.action}</Badge>
                        <Badge
                          variant={log.modelScore >= 0.8 ? "destructive" : "secondary"}
                        >
                          Score: {log.modelScore.toFixed(2)}
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform" />
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 px-4 pb-4 space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground">User:</span>{" "}
                          <span className="font-medium">{log.user}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Input Hash:</span>{" "}
                          <span className="font-mono text-xs">{log.inputHash}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground mb-1">Model Explanation:</div>
                        <div className="p-3 bg-muted rounded-md">{log.explanation}</div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
