import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Phone, CheckCheck, Clock, Mic, MicOff } from "lucide-react";
import { VoiceAssistant } from "@/utils/voiceAssistant";
import { useToast } from "@/hooks/use-toast";

const mockConversation = [
  {
    sender: "bot",
    text: "नमस्कार! 🙏 मुंबई महापालिका सेवा में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूं?",
    time: "10:30 AM",
  },
  {
    sender: "bot",
    text: "Hello! Welcome to Municipal Services. How can I help you today?",
    time: "10:30 AM",
  },
];

export default function WhatsAppBot() {
  const [messages, setMessages] = useState(mockConversation);
  const [input, setInput] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showApiInput, setShowApiInput] = useState(true);
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);
  const { toast } = useToast();

  const quickActions = [
    "Report Pothole",
    "Garbage Complaint",
    "Track My Case",
    "Pay Property Tax",
    "Water Bill",
    "Birth Certificate",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, userMsg]);
    setInput("");

    // Mock bot response
    setTimeout(() => {
      let botResponse = "";
      if (input.toLowerCase().includes("pothole")) {
        botResponse =
          "I can help you report a pothole. Please share: 1) Your location/ward, 2) A photo (optional). I'll create a priority case with AI analysis.";
      } else if (input.toLowerCase().includes("track")) {
        botResponse =
          "To track your case, please share your Case ID (e.g., TC-2024-1234) or phone number.";
      } else {
        botResponse =
          "I understand you need assistance. Please select from the quick actions below or describe your issue.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botResponse,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1000);
  };

  const startVoiceAssistant = async () => {
    try {
      voiceAssistantRef.current = new VoiceAssistant({
        onTranscript: (text) => {
          // Add user's spoken text
          setMessages((prev) => [
            ...prev,
            {
              sender: "user",
              text: text,
              time: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);

          // Generate bot response
          setTimeout(() => {
            let botResponse = "";
            if (text.toLowerCase().includes("pothole")) {
              botResponse =
                "I can help you report a pothole. Please share: 1) Your location/ward, 2) A photo (optional). I'll create a priority case with AI analysis.";
            } else if (text.toLowerCase().includes("track")) {
              botResponse =
                "To track your case, please share your Case ID (e.g., TC-2024-1234) or phone number.";
            } else if (text.toLowerCase().includes("garbage")) {
              botResponse =
                "I'll help you with a garbage complaint. Please tell me your area or ward number.";
            } else {
              botResponse =
                "I understand you need assistance. Please provide more details about your complaint.";
            }

            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: botResponse,
                time: new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
          }, 1000);
        },
        onError: (error) => {
          toast({
            title: "Voice Assistant Error",
            description: error,
            variant: "destructive",
          });
          setIsVoiceActive(false);
        },
        onListening: (listening) => {
          setIsVoiceActive(listening);
        }
      });

      voiceAssistantRef.current.startListening();
      setIsVoiceActive(true);
      setShowApiInput(false);
      
      toast({
        title: "Voice Assistant Active",
        description: "Start speaking to register your complaint",
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "🎤 Voice assistant activated! Please describe your complaint.",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("Failed to start voice assistant:", error);
      toast({
        title: "Failed to Start",
        description: "Could not start voice assistant. Check browser support.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceAssistant = async () => {
    if (voiceAssistantRef.current) {
      voiceAssistantRef.current.stopListening();
      voiceAssistantRef.current = null;
    }
    setIsVoiceActive(false);
    
    toast({
      title: "Voice Assistant Stopped",
      description: "Voice recording has been stopped",
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "Voice assistant deactivated. You can continue typing or restart voice mode.",
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">WhatsApp Bot Interface</h1>
        <p className="text-muted-foreground">
          24/7 citizen service bot with AI Voice Assistant - bilingual support (English + Marathi)
        </p>
      </div>

      {showApiInput && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-1">🎤 Enable Voice Assistant</p>
                <p className="text-xs text-muted-foreground">
                  Click the button below to activate voice-based complaint registration using your browser's speech recognition
                </p>
              </div>
              <Button onClick={startVoiceAssistant} className="w-full">
                <Mic className="h-4 w-4 mr-2" />
                Activate Voice Assistant
              </Button>
              <p className="text-xs text-muted-foreground">
                Note: Requires microphone access. Works best in Chrome, Edge, or Safari.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Municipal Bot</CardTitle>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                      Online • Typically replies instantly
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Phone className="h-3 w-3" />
                  +91 98765 43210
                </Badge>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5] dark:bg-gray-900">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender === "user"
                        ? "bg-[#dcf8c6] dark:bg-green-900/40 text-gray-900 dark:text-gray-100"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <span className="text-[10px] text-gray-500">
                        {msg.time}
                      </span>
                      {msg.sender === "user" && (
                        <CheckCheck className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Action Buttons */}
              <div className="flex justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 max-w-md">
                  <p className="text-xs text-center text-muted-foreground mb-2">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setInput(action);
                          setTimeout(() => handleSend(), 100);
                        }}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Chat Input */}
            <div className="border-t p-4 bg-gray-100 dark:bg-gray-800">
              <div className="flex gap-2">
                {isVoiceActive ? (
                  <Button 
                    onClick={stopVoiceAssistant} 
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Voice Recording
                  </Button>
                ) : (
                  <>
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1"
                      disabled={isVoiceActive}
                    />
                    <Button onClick={handleSend} disabled={!input.trim() || isVoiceActive}>
                      <Send className="h-4 w-4" />
                    </Button>
                    {!showApiInput && (
                      <Button 
                        onClick={startVoiceAssistant} 
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
              {isVoiceActive && (
                <p className="text-xs text-center text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
                  Recording... Speak your complaint
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Stats & Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Messages Today:
                </span>
                <span className="font-bold">2,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Cases Created:
                </span>
                <span className="font-bold">431</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Avg Response:
                </span>
                <span className="font-bold">1.2s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  User Satisfaction:
                </span>
                <span className="font-bold text-green-600">94%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Why WhatsApp?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCheck className="h-4 w-4 text-green-600 mt-0.5" />
                <span>500M+ users in India</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCheck className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Works on 2G networks</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCheck className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Bilingual support (EN + MR)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCheck className="h-4 w-4 text-green-600 mt-0.5" />
                <span>24/7 availability</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCheck className="h-4 w-4 text-green-600 mt-0.5" />
                <span>AI-powered responses</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCheck className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Photo upload support</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Coming Soon</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Voice messages, payment integration, and real-time case
                    tracking via WhatsApp status updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Popular Queries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { query: "Pothole reports", count: 847 },
                { query: "Garbage complaints", count: 623 },
                { query: "Case tracking", count: 512 },
                { query: "Water issues", count: 384 },
                { query: "Property tax", count: 291 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-muted-foreground">{item.query}</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
