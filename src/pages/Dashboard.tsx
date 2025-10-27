import { useEffect, useState } from "react";
import { getDashboardMetrics, DashboardMetrics } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, Users, FileText } from "lucide-react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [staffCount, setStaffCount] = useState([10]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const projectedEscalations = metrics
    ? Math.max(0, Math.round(metrics.predictedEscalations - (staffCount[0] - 10) * 0.8))
    : 0;

  if (loading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-muted rounded-lg w-1/3" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of case management and AI predictions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="metric-card border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Escalations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="kpi-number">{metrics.predictedEscalations}</div>
            <p className="small-muted">Next 48 hours</p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Triage Time</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="kpi-number">{metrics.avgTriageTime}h</div>
            <p className="small-muted">
              <TrendingUp className="inline h-3 w-3 text-success" /> 12% faster
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Triaged</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="kpi-number">{metrics.autoTriagedPct}%</div>
            <p className="small-muted">AI-assisted decisions</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="kpi-number">{metrics.totalCases}</div>
            <p className="small-muted">All time</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="kpi-number text-warning">{metrics.pendingCases}</div>
            <p className="small-muted">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="kpi-number text-success">{metrics.resolvedToday}</div>
            <p className="small-muted">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What-If Analysis</CardTitle>
          <CardDescription>
            Simulate impact of resource allocation on predicted escalations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Field Staff Count</label>
              <span className="text-sm font-bold text-primary">{staffCount[0]} staff</span>
            </div>
            <Slider
              value={staffCount}
              onValueChange={setStaffCount}
              min={5}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projected Escalations</p>
                <p className="text-2xl font-bold text-primary">{projectedEscalations}</p>
              </div>
              <div className="text-right">
                {projectedEscalations < metrics.predictedEscalations ? (
                  <div className="text-success">
                    <TrendingUp className="inline h-5 w-5" />
                    <p className="text-sm font-medium">
                      -{metrics.predictedEscalations - projectedEscalations} cases
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No change</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${Math.max(10, 100 - (projectedEscalations / metrics.predictedEscalations) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Resource efficiency indicator
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
