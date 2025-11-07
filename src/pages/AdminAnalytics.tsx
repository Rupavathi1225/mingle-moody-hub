import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Analytics } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { MousePointer, Eye, Grid3x3, ExternalLink } from "lucide-react";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [stats, setStats] = useState({
    totalPageViews: 0,
    totalClicks: 0,
    totalRelatedSearches: 0,
    totalResultClicks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await supabase
        .from("analytics")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (data) {
        setAnalytics(data);
        
        // Calculate stats
        const stats = data.reduce(
          (acc, item) => ({
            totalPageViews: acc.totalPageViews + (item.page_views || 0),
            totalClicks: acc.totalClicks + (item.clicks || 0),
            totalRelatedSearches: acc.totalRelatedSearches + (item.related_searches || 0),
            totalResultClicks: acc.totalResultClicks + (item.result_clicks || 0),
          }),
          { totalPageViews: 0, totalClicks: 0, totalRelatedSearches: 0, totalResultClicks: 0 }
        );
        
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1">
          <header className="h-12 flex items-center border-b border-border px-4">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-bold text-primary">Analytics Dashboard</h1>
          </header>

          <div className="p-8">
            <div className="max-w-7xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">Click Tracking & Analytics</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Eye} label="Page Views" value={stats.totalPageViews} />
                <StatCard icon={MousePointer} label="Total Clicks" value={stats.totalClicks} />
                <StatCard icon={Grid3x3} label="Related Searches" value={stats.totalRelatedSearches} />
                <StatCard icon={ExternalLink} label="Result Clicks" value={stats.totalResultClicks} />
              </div>

              {/* Session Analytics Table */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Session Analytics</h3>
                </div>
                {loading ? (
                  <div className="p-8 text-center text-primary">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead>Session ID</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead className="text-right">Page Views</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                          <TableHead className="text-right">Related Searches</TableHead>
                          <TableHead className="text-right">Result Clicks</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.map((item) => (
                          <TableRow key={item.id} className="border-border">
                            <TableCell className="font-mono text-xs">{item.session_id}</TableCell>
                            <TableCell className="font-mono text-xs">{item.ip_address}</TableCell>
                            <TableCell>{item.country || "-"}</TableCell>
                            <TableCell className="text-xs">{item.source || "-"}</TableCell>
                            <TableCell>{item.device || "-"}</TableCell>
                            <TableCell className="text-right">{item.page_views}</TableCell>
                            <TableCell className="text-right">{item.clicks}</TableCell>
                            <TableCell className="text-right">{item.related_searches}</TableCell>
                            <TableCell className="text-right">{item.result_clicks}</TableCell>
                            <TableCell className="text-xs">
                              {new Date(item.timestamp).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminAnalytics;
