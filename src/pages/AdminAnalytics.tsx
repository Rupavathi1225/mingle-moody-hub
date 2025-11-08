import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Analytics, ClickEvent } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MousePointer, Eye, Grid3x3, ExternalLink } from "lucide-react";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([]);
  const [stats, setStats] = useState({
    totalPageViews: 0,
    totalClicks: 0,
    uniqueClicks: 0,
    totalRelatedSearches: 0,
    totalResultClicks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchClickEvents();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await supabase
        .from("analytics")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);

      if (data) {
        setAnalytics(data);

        const stats = data.reduce(
          (acc, item: any) => ({
            totalPageViews: acc.totalPageViews + (item.page_views || 0),
            totalClicks: acc.totalClicks + (item.clicks || 0),
            uniqueClicks: acc.uniqueClicks + (item.unique_clicks || 0),
            totalRelatedSearches:
              acc.totalRelatedSearches + (item.related_searches || 0),
            totalResultClicks:
              acc.totalResultClicks + (item.result_clicks || 0),
          }),
          {
            totalPageViews: 0,
            totalClicks: 0,
            uniqueClicks: 0,
            totalRelatedSearches: 0,
            totalResultClicks: 0,
          }
        );

        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClickEvents = async () => {
    try {
      const { data } = await (supabase as any)
        .from("click_events")
        .select("*")
        .order("timestamp", { ascending: false})
        .limit(100);

      if (data) {
        setClickEvents(data as ClickEvent[]);
      }
    } catch (error) {
      console.error("Error fetching click events:", error);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: number;
  }) => (
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
            <h1 className="text-xl font-bold text-primary">
              Analytics Dashboard
            </h1>
          </header>

          <div className="p-8">
            <div className="max-w-7xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Click Tracking & Analytics
              </h2>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard
                  icon={Eye}
                  label="Page Views"
                  value={stats.totalPageViews}
                />
                <StatCard
                  icon={MousePointer}
                  label="Total Clicks"
                  value={stats.totalClicks}
                />
                <StatCard
                  icon={MousePointer}
                  label="Unique Clicks"
                  value={stats.uniqueClicks}
                />
                <StatCard
                  icon={Grid3x3}
                  label="Related Searches"
                  value={stats.totalRelatedSearches}
                />
                <StatCard
                  icon={ExternalLink}
                  label="Result Clicks"
                  value={stats.totalResultClicks}
                />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="clicks" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="clicks">Click Events</TabsTrigger>
                  <TabsTrigger value="sessions">Session Analytics</TabsTrigger>
                </TabsList>

                {/* Click Events Tab */}
                <TabsContent value="clicks">
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold text-foreground">
                        Individual Click Tracking
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Detailed view of each user interaction
                      </p>
                    </div>

                    {loading ? (
                      <div className="p-8 text-center text-primary">
                        Loading...
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border">
                              <TableHead>Event Type</TableHead>
                              <TableHead>Search Term / Query</TableHead>
                              <TableHead>Target URL</TableHead>
                              <TableHead>Session ID</TableHead>
                              <TableHead>IP Address</TableHead>
                              <TableHead>Country</TableHead>
                              <TableHead>Device</TableHead>
                              <TableHead>Timestamp</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {clickEvents.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={8}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  No click events yet
                                </TableCell>
                              </TableRow>
                            ) : (
                              clickEvents.map((event) => (
                                <TableRow key={event.id} className="border-border">
                                  <TableCell>
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        event.event_type === "related_search"
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      }`}
                                     >
                                       {event.event_type === "related_search"
                                         ? "Related Search"
                                         : "Result Click"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {event.search_term || "-"}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs max-w-xs truncate">
                                    {event.target_url || "-"}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    {event.session_id.substring(0, 25)}...
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    {event.ip_address}
                                  </TableCell>
                                  <TableCell>{event.country || "-"}</TableCell>
                                  <TableCell>{event.device || "-"}</TableCell>
                                  <TableCell className="text-xs">
                                    {new Date(event.timestamp).toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Session Analytics Tab */}
                <TabsContent value="sessions">
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold text-foreground">
                        Session Analytics
                      </h3>
                    </div>

                    {loading ? (
                      <div className="p-8 text-center text-primary">
                        Loading...
                      </div>
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
                              <TableHead className="text-right">
                                Page Views
                              </TableHead>
                              <TableHead className="text-right">
                                Total Clicks
                              </TableHead>
                              <TableHead className="text-right">
                                Unique Clicks
                              </TableHead>
                              <TableHead className="text-right">
                                Related Searches
                              </TableHead>
                              <TableHead className="text-right">
                                Result Clicks
                              </TableHead>
                              <TableHead className="text-right">
                                Time Spent
                              </TableHead>
                              <TableHead>Timestamp</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {analytics.map((item) => (
                              <TableRow key={item.id} className="border-border">
                                <TableCell className="font-mono text-xs">
                                  {item.session_id}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {item.ip_address}
                                </TableCell>
                                <TableCell>{item.country || "-"}</TableCell>
                                <TableCell className="text-xs">
                                  {item.source || "-"}
                                </TableCell>
                                <TableCell>{item.device || "-"}</TableCell>
                                <TableCell className="text-right">
                                  {item.page_views}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.clicks}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="font-semibold text-primary">
                                    {item.unique_clicks || 0}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.related_searches}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.result_clicks}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.time_spent ? `${item.time_spent}s` : "0s"}
                                </TableCell>
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminAnalytics;