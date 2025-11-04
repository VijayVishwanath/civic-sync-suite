import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, Flame, Users } from "lucide-react";

// Mock data for heatmap
const mockHotspots = [
  { ward: "Andheri West", lat: 19.1358, lng: 72.8269, issues: 47, severity: "high" },
  { ward: "Bandra East", lat: 19.0596, lng: 72.8656, issues: 34, severity: "high" },
  { ward: "Kurla West", lat: 19.0728, lng: 72.8826, issues: 28, severity: "medium" },
  { ward: "Dadar East", lat: 19.0176, lng: 72.8561, issues: 19, severity: "medium" },
  { ward: "Borivali West", lat: 19.2403, lng: 72.8563, issues: 15, severity: "low" },
  { ward: "Malad East", lat: 19.1868, lng: 72.8490, issues: 23, severity: "medium" },
  { ward: "Ghatkopar West", lat: 19.0861, lng: 72.9081, issues: 31, severity: "high" },
];

export default function IssueMap() {
  const [selectedWard, setSelectedWard] = useState<any>(null);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Issue Heatmap</h1>
        <p className="text-muted-foreground">Real-time geospatial visualization of civic issues</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full relative">
              {/* Mock Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-20 left-20 w-32 h-32 bg-red-500 rounded-full blur-3xl" />
                  <div className="absolute top-40 right-32 w-40 h-40 bg-orange-500 rounded-full blur-3xl" />
                  <div className="absolute bottom-32 left-40 w-36 h-36 bg-red-500 rounded-full blur-3xl" />
                  <div className="absolute bottom-20 right-20 w-24 h-24 bg-yellow-500 rounded-full blur-3xl" />
                </div>
              </div>

              {/* Mock Markers */}
              <div className="absolute inset-0 p-8">
                {mockHotspots.map((spot, idx) => (
                  <div
                    key={idx}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                    style={{
                      left: `${20 + (idx * 12)}%`,
                      top: `${30 + Math.sin(idx) * 30}%`,
                    }}
                    onClick={() => setSelectedWard(spot)}
                  >
                    <div className={`relative ${
                      spot.severity === "high" ? "text-red-600" : 
                      spot.severity === "medium" ? "text-orange-500" : "text-yellow-500"
                    }`}>
                      <MapPin className="h-8 w-8 drop-shadow-lg" fill="currentColor" />
                      <Badge 
                        variant={spot.severity === "high" ? "destructive" : "warning"}
                        className="absolute -top-2 -right-2 text-xs"
                      >
                        {spot.issues}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 rounded-lg shadow-lg">
                <p className="text-sm font-semibold mb-2">Severity Level</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-600" />
                    <span>High (30+ cases)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Medium (15-30 cases)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Low (&lt;15 cases)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ward Details Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                Top Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockHotspots
                .sort((a, b) => b.issues - a.issues)
                .slice(0, 5)
                .map((spot, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedWard(spot)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{spot.ward}</span>
                      <Badge variant={spot.severity === "high" ? "destructive" : "warning"}>
                        {spot.issues} cases
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Priority: {spot.severity.toUpperCase()}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>

          {selectedWard && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">{selectedWard.ward}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Cases:</span>
                  <span className="font-bold">{selectedWard.issues}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Severity:</span>
                  <Badge variant={selectedWard.severity === "high" ? "destructive" : "warning"}>
                    {selectedWard.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Est. Affected:</span>
                  <span className="font-bold text-primary">
                    {(selectedWard.issues * 87).toLocaleString()} citizens
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs font-semibold mb-2">Top Issue Types:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Potholes</span>
                      <span className="text-muted-foreground">
                        {Math.round(selectedWard.issues * 0.4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Garbage</span>
                      <span className="text-muted-foreground">
                        {Math.round(selectedWard.issues * 0.35)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Streetlights</span>
                      <span className="text-muted-foreground">
                        {Math.round(selectedWard.issues * 0.25)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                City-Wide Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Active Cases:</span>
                <span className="font-bold">{mockHotspots.reduce((a, b) => a + b.issues, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Citizens Affected:</span>
                <span className="font-bold text-primary">
                  {(mockHotspots.reduce((a, b) => a + b.issues, 0) * 87).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Response Time:</span>
                <span className="font-bold">18.4 hrs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
