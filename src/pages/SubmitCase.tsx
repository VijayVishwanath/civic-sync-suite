import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, MapPin, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LocationAutocomplete from "@/components/LocationAutocomplete";

export default function SubmitCase() {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [preview, setPreview] = useState<string>("");
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);

  const mockAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const results = [
        { type: "Pothole", confidence: 0.94, severity: "High", affected: 2400 },
        { type: "Garbage Dumping", confidence: 0.89, severity: "Medium", affected: 850 },
        { type: "Broken Streetlight", confidence: 0.87, severity: "Medium", affected: 1200 },
        { type: "Road Damage", confidence: 0.91, severity: "High", affected: 3100 },
      ];
      const result = results[Math.floor(Math.random() * results.length)];
      setAnalysis(result);
      setAnalyzing(false);
      toast({
        title: "AI Analysis Complete",
        description: `Detected: ${result.type} (${Math.round(result.confidence * 100)}% confidence)`,
      });
    }, 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        mockAnalyze();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Case Submitted Successfully",
      description: "Your report has been prioritized and assigned to the relevant department.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit New Case</h1>
        <p className="text-muted-foreground">Report civic issues with AI-powered analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo Upload & AI Analysis */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              AI Photo Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  {analyzing && (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                      <span>AI Analyzing Image...</span>
                    </div>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {analysis && (
              <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Detected Issue:</span>
                  <Badge variant="default">{analysis.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Confidence:</span>
                  <span className="text-sm">{Math.round(analysis.confidence * 100)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Auto Severity:</span>
                  <Badge variant={analysis.severity === "High" ? "destructive" : "warning"}>
                    {analysis.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Est. Citizens Affected:</span>
                  <span className="text-sm font-bold text-primary">{analysis.affected.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Case Details Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Case Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Location / Ward</label>
              <LocationAutocomplete
                placeholder="Search for a location..."
                onLocationSelect={(place) => {
                  setLocation(place);
                  toast({
                    title: "Location Selected",
                    description: `${place.address}`,
                  });
                }}
              />
              {location && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {location.address}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input 
                value={analysis?.type || ""} 
                placeholder="Will auto-fill from AI analysis"
                disabled={!!analysis}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Describe the issue in detail..."
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Your Phone (Optional)</label>
              <Input placeholder="+91 98765 43210" type="tel" />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Community Impact Score: {analysis?.affected ? "High" : "Pending"}
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  {analysis?.affected 
                    ? `${analysis.affected.toLocaleString()} citizens in this area may be affected`
                    : "Upload photo for impact assessment"}
                </p>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={!analysis}
            >
              Submit Case Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Similar Cases Alert */}
      {analysis && (
        <Card className="border-amber-500/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold">Similar Cases Detected</p>
                <p className="text-sm text-muted-foreground">
                  3 other citizens reported similar {analysis.type.toLowerCase()} issues in this ward in the last 48 hours. 
                  Your report will be aggregated for higher priority.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
