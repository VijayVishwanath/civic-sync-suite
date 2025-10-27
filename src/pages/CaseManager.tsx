import { useEffect, useState } from "react";
import { getPrioritizedCases, assignCase, Case } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { AlertCircle, MapPin, Calendar, CheckCircle } from "lucide-react";

export default function CaseManager() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrioritizedCases().then((data) => {
      setCases(data);
      setLoading(false);
    });
  }, []);

  const handleAssign = async (caseId: string) => {
    try {
      await assignCase(caseId, "Current User");
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: "assigned" as const } : c))
      );
      toast.success("Case assigned successfully", {
        description: `Case ${caseId} has been assigned to you`,
      });
      setSelectedCase(null);
    } catch (error) {
      toast.error("Failed to assign case", {
        description: "Please try again later",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-destructive";
    if (score >= 0.6) return "text-warning";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-muted rounded-lg w-1/3" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Case Manager</h1>
        <p className="text-muted-foreground">
          AI-prioritized cases with automated triage recommendations
        </p>
      </div>

      <div className="space-y-3">
        {cases.map((caseItem) => (
          <Card
            key={caseItem.id}
            className="data-row cursor-pointer transition-all hover:border-primary"
            onClick={() => setSelectedCase(caseItem)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{caseItem.id}</span>
                    <Badge variant={getPriorityColor(caseItem.priority)}>
                      {caseItem.priority.toUpperCase()}
                    </Badge>
                    {caseItem.status === "assigned" && (
                      <Badge variant="outline" className="text-success">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Assigned
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {caseItem.location}
                    </span>
                    <span className="font-medium">{caseItem.category}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(caseItem.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm line-clamp-2">{caseItem.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {caseItem.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-md bg-accent/10 text-accent-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(caseItem.score)}`}>
                      {(caseItem.score * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">AI Score</div>
                  </div>
                  <Button
                    size="sm"
                    disabled={caseItem.status === "assigned"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssign(caseItem.id);
                    }}
                  >
                    {caseItem.status === "assigned" ? "Assigned" : "Assign"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedCase && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedCase.id}
                  <Badge variant={getPriorityColor(selectedCase.priority)}>
                    {selectedCase.priority.toUpperCase()}
                  </Badge>
                </SheetTitle>
                <SheetDescription>{selectedCase.category}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Location</h3>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {selectedCase.location}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm">{selectedCase.description}</p>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Model Rationale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">AI Priority Score</span>
                        <span className={`text-lg font-bold ${getScoreColor(selectedCase.score)}`}>
                          {(selectedCase.score * 100).toFixed(0)}/100
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${selectedCase.score * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Top Contributing Factors:</h4>
                      <ul className="space-y-2">
                        {selectedCase.features.map((feature, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-medium mb-1">Recommended Action:</h4>
                      <p className="text-sm text-foreground">{selectedCase.recommendedAction}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={selectedCase.status === "assigned"}
                    onClick={() => handleAssign(selectedCase.id)}
                  >
                    {selectedCase.status === "assigned" ? "Already Assigned" : "Assign to Me"}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Mark Resolved
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
