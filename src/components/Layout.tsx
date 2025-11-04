import { Link, useLocation } from "react-router-dom";
import { BarChart3, FolderKanban, MessageSquare, Shield, Upload, Map, CheckCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", path: "/", icon: BarChart3 },
  { name: "Case Manager", path: "/cases", icon: FolderKanban },
  { name: "Submit Case", path: "/submit", icon: Upload },
  { name: "Issue Map", path: "/map", icon: Map },
  { name: "Verification", path: "/verification", icon: CheckCircle },
  { name: "Citizen Chat", path: "/chat", icon: MessageSquare },
  { name: "WhatsApp Bot", path: "/whatsapp", icon: MessageCircle },
  { name: "Transparency", path: "/transparency", icon: Shield },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center">
          <div className="mr-8 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CivicAI</span>
          </div>
          <nav className="flex items-center space-x-1 text-sm font-medium overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  );
};
