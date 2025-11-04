import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Camera, MapPin, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockResolvedCases = [
  {
    id: "TC-2024-0847",
    location: "Linking Road, Bandra West",
    category: "Pothole Repair",
    resolvedAt: "2 hours ago",
    distance: "0.8 km from you",
    description: "Large pothole near Shoppers Stop junction filled and leveled",
  },
  {
    id: "TC-2024-0823",
    location: "SV Road, Andheri West",
    category: "Garbage Clearance",
    resolvedAt: "5 hours ago",
    distance: "1.2 km from you",
    description: "Illegal dumping site cleared and sanitized",
  },
  {
    id: "TC-2024-0799",
    location: "Perry Cross Road, Bandra",
    category: "Streetlight Repair",
    resolvedAt: "1 day ago",
    distance: "1.5 km from you",
    description: "3 non-functional streetlights replaced with LED fixtures",
  },
];

export default function Verification() {
  const { toast } = useToast();
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verified, setVerified] = useState<string[]>([]);
  const [badges, setBadges] = useState(12);

  const handleVerify = (caseId: string, status: "verified" | "rejected") => {
    setVerifying(caseId);
    setTimeout(() => {
      setVerified([...verified, caseId]);
      setVerifying(null);
      if (status === "verified") {
        setBadges(badges + 1);
      }
      toast({
        title: status === "verified" ? "Thank you!" : "Report Submitted",
        description:
          status === "verified"
            ? "You earned +1 verification badge. Your feedback helps ensure quality."
            : "Staff will re-inspect this case within 24 hours.",
      });
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Citizen Verification Portal</h1>
        <p className="text-muted-foreground">
          Verify resolved cases in your neighborhood and earn community badges
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Award className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{badges}</p>
              <p className="text-xs text-muted-foreground">Badges Earned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">47</p>
              <p className="text-xs text-muted-foreground">Cases Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">False Closures</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">94%</p>
              <p className="text-xs text-muted-foreground">Accuracy Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Queue */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Cases Pending Your Verification</h2>
        <div className="space-y-4">
          {mockResolvedCases.map((case_) => (
            <Card
              key={case_.id}
              className={verified.includes(case_.id) ? "opacity-50" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{case_.id}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {case_.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{case_.category}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {case_.distance}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm mb-2">
                    <span className="font-semibold">Staff Report: </span>
                    {case_.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Marked resolved {case_.resolvedAt}
                  </p>
                </div>

                {!verified.includes(case_.id) && (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Help verify this resolution:
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Visit the location or review the before/after photos to confirm
                        the issue is truly resolved. Your verification prevents fake
                        closures and builds community trust.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="default"
                        className="flex-1"
                        disabled={verifying === case_.id}
                        onClick={() => handleVerify(case_.id, "verified")}
                      >
                        {verifying === case_.id ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Verifying...
                          </span>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify as Resolved
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        disabled={verifying === case_.id}
                        onClick={() => handleVerify(case_.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Not Resolved
                      </Button>
                    </div>

                    <div className="pt-2 border-t">
                      <label className="text-xs font-semibold mb-1 block">
                        Optional: Add Photo Evidence
                      </label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                        <input type="file" accept="image/*" className="hidden" />
                      </div>
                    </div>
                  </>
                )}

                {verified.includes(case_.id) && (
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      Thank you for verifying!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      You earned +1 verification badge
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Gamification Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Top Verifiers This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "Raj P.", badges: 127, rank: 1 },
              { name: "Priya S.", badges: 94, rank: 2 },
              { name: "You", badges: badges, rank: 3 },
              { name: "Amit K.", badges: 68, rank: 4 },
              { name: "Sneha M.", badges: 52, rank: 5 },
            ].map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.name === "You"
                    ? "bg-primary/10 border border-primary"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg w-6">#{user.rank}</span>
                  <span className={user.name === "You" ? "font-semibold" : ""}>
                    {user.name}
                  </span>
                </div>
                <Badge variant={user.rank === 1 ? "default" : "secondary"}>
                  {user.badges} badges
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
