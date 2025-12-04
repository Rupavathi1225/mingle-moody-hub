import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Grid3x3, LayoutDashboard, Palette, BarChart3, Mail } from "lucide-react";

const tabs = [
  { title: "Landing Page", url: "/admin", icon: FileText },
  { title: "Categories", url: "/admin/categories", icon: Grid3x3 },
  { title: "Web Results", url: "/admin/webresults", icon: LayoutDashboard },
  { title: "Prelander Builder", url: "/admin/prelander-builder", icon: Palette },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Email Captures", url: "/admin/emails", icon: Mail },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-primary mb-4">Admin Panel</h1>
        <Tabs value={location.pathname} onValueChange={(value) => navigate(value)}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.url}
                value={tab.url}
                className="flex items-center gap-2 px-4 py-2"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      <main className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">{title}</h2>
        {children}
      </main>
    </div>
  );
}
